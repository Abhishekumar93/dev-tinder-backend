import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { connectTestDB, disconnectTestDB, clearDB, authCookieFor } from './setup';
import mongoose from 'mongoose';
import { User } from '../src/models';
import bcrypt from 'bcrypt';

const AUTH = '/api/auth';
const USER = '/api/user';

const rawPassword = 'Str0ng!Pass';

const userData = {
  firstName: 'Bob',
  lastName: 'Dev',
  email: 'bob@example.com',
  password: rawPassword,
  age: 28,
  gender: 'male',
};

let userId: string;
let cookie: string;

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await disconnectTestDB();
});

beforeEach(async () => {
  await clearDB();
  // Register a user and capture their ID and auth cookie for each test
  await request(app).post(`${AUTH}/signup`).send(userData);
  const loginRes = await request(app)
    .post(`${AUTH}/login`)
    .send({ email: userData.email, password: rawPassword });
  const rawCookie = loginRes.headers['set-cookie'];
  cookie = Array.isArray(rawCookie) ? rawCookie[0]! : rawCookie!;

  const dbUser = await User.findOne({ email: userData.email });
  userId = dbUser!._id.toString();
});

// ---------------------------------------------------------------------------
// Protected route guard
// ---------------------------------------------------------------------------
describe('Protected routes', () => {
  it('returns 401 when no token is provided', async () => {
    const res = await request(app).get(`${USER}/`);
    expect(res.status).toBe(401);
  });

  it('returns 401 when token is invalid', async () => {
    const res = await request(app)
      .get(`${USER}/`)
      .set('Cookie', 'token=invalid.jwt.token');
    expect(res.status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// GET /api/user/ — logged-in user profile
// ---------------------------------------------------------------------------
describe('GET /api/user/', () => {
  it('returns the authenticated user profile', async () => {
    const res = await request(app).get(`${USER}/`).set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(userData.email);
    expect(res.body.data.password).toBeUndefined();
    expect(res.body.data.otp).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// PATCH /api/user/ — update profile
// ---------------------------------------------------------------------------
describe('PATCH /api/user/', () => {
  it('updates allowed fields', async () => {
    const res = await request(app)
      .patch(`${USER}/`)
      .set('Cookie', cookie)
      .send({ firstName: 'Robert', about: 'Senior dev' });

    expect(res.status).toBe(200);
    expect(res.body.data.firstName).toBe('Robert');
    expect(res.body.data.about).toBe('Senior dev');
  });

  it('rejects unknown fields (strict schema)', async () => {
    const res = await request(app)
      .patch(`${USER}/`)
      .set('Cookie', cookie)
      .send({ role: 'admin' });

    expect(res.status).toBe(400);
  });

  it('rejects invalid gender', async () => {
    const res = await request(app)
      .patch(`${USER}/`)
      .set('Cookie', cookie)
      .send({ gender: 'martian' });

    expect(res.status).toBe(400);
  });

  it('does not expose password in update response', async () => {
    const res = await request(app)
      .patch(`${USER}/`)
      .set('Cookie', cookie)
      .send({ firstName: 'Robert' });

    expect(res.body.data?.password).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// PATCH /api/user/update-password
// ---------------------------------------------------------------------------
describe('PATCH /api/user/update-password', () => {
  it('updates the password and the new password works for login', async () => {
    const newPassword = 'N3wStr0ng!Pass';

    const updateRes = await request(app)
      .patch(`${USER}/update-password`)
      .set('Cookie', cookie)
      .send({ password: newPassword });

    expect(updateRes.status).toBe(200);

    // Old password should no longer work
    const oldLoginRes = await request(app)
      .post(`${AUTH}/login`)
      .send({ email: userData.email, password: rawPassword });
    expect(oldLoginRes.status).toBe(400);

    // New password should work
    const newLoginRes = await request(app)
      .post(`${AUTH}/login`)
      .send({ email: userData.email, password: newPassword });
    expect(newLoginRes.status).toBe(200);
  });

  it('rejects a weak new password', async () => {
    const res = await request(app)
      .patch(`${USER}/update-password`)
      .set('Cookie', cookie)
      .send({ password: 'weak' });
    expect(res.status).toBe(400);
  });

  it('stores the password as a bcrypt hash, never plain-text', async () => {
    const newPassword = 'N3wStr0ng!Pass';
    await request(app)
      .patch(`${USER}/update-password`)
      .set('Cookie', cookie)
      .send({ password: newPassword });

    const dbUser = await User.findById(userId).select('+password');
    expect(dbUser!.password).not.toBe(newPassword);
    const match = await bcrypt.compare(newPassword, dbUser!.password);
    expect(match).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// GET /api/user/feed
// ---------------------------------------------------------------------------
describe('GET /api/user/feed', () => {
  it('returns users excluding the authenticated user', async () => {
    // Create another user
    await request(app).post(`${AUTH}/signup`).send({
      ...userData,
      email: 'carol@example.com',
      firstName: 'Carol',
    });

    const res = await request(app)
      .get(`${USER}/feed`)
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    const emails = res.body.data.records.map((u: { email: string }) => u.email);
    expect(emails).not.toContain(userData.email);
    expect(emails).toContain('carol@example.com');
  });

  it('rejects invalid page query param', async () => {
    const res = await request(app)
      .get(`${USER}/feed?page=abc`)
      .set('Cookie', cookie);
    expect(res.status).toBe(400);
  });

  it('rejects invalid limit query param', async () => {
    const res = await request(app)
      .get(`${USER}/feed?limit=0`)
      .set('Cookie', cookie);
    expect(res.status).toBe(400);
  });

  it('does not expose password in feed results', async () => {
    await request(app).post(`${AUTH}/signup`).send({
      ...userData,
      email: 'dave@example.com',
      firstName: 'Dave',
    });

    const res = await request(app)
      .get(`${USER}/feed`)
      .set('Cookie', cookie);

    const records = res.body.data?.records ?? [];
    for (const user of records) {
      expect(user.password).toBeUndefined();
      expect(user.otp).toBeUndefined();
    }
  });
});

// ---------------------------------------------------------------------------
// GET /api/user/list
// ---------------------------------------------------------------------------
describe('GET /api/user/list', () => {
  it('returns all users without passwords', async () => {
    const res = await request(app)
      .get(`${USER}/list`)
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.records)).toBe(true);
    for (const user of res.body.data.records) {
      expect(user.password).toBeUndefined();
    }
  });
});

// ---------------------------------------------------------------------------
// DELETE /api/user/
// ---------------------------------------------------------------------------
describe('DELETE /api/user/', () => {
  it('deletes the authenticated user', async () => {
    const res = await request(app)
      .delete(`${USER}/`)
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);

    // User should no longer exist in DB
    const dbUser = await User.findById(userId);
    expect(dbUser).toBeNull();
  });

  it('uses the authenticated user ID, not a client-supplied one', async () => {
    // Create a second user
    await request(app).post(`${AUTH}/signup`).send({
      ...userData,
      email: 'victim@example.com',
      firstName: 'Victim',
    });
    const victim = await User.findOne({ email: 'victim@example.com' });

    // Even if we know the victim's ID, deleting with Bob's cookie should
    // only delete Bob — the controller reads from req.user, not req.body.
    await request(app).delete(`${USER}/`).set('Cookie', cookie);

    // Victim still exists
    const victimAfter = await User.findById(victim!._id);
    expect(victimAfter).not.toBeNull();

    // Bob is gone
    const bobAfter = await User.findById(userId);
    expect(bobAfter).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Token from helper matches real JWT verification
// ---------------------------------------------------------------------------
describe('authCookieFor helper', () => {
  it('generates a valid JWT that authenticates requests', async () => {
    const manualCookie = authCookieFor(userId);
    const res = await request(app)
      .get(`${USER}/`)
      .set('Cookie', manualCookie);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(userData.email);
  });
});

// ---------------------------------------------------------------------------
// Expired / tampered token
// ---------------------------------------------------------------------------
describe('Invalid JWT handling', () => {
  it('rejects a tampered token', async () => {
    const jwtToken = cookie.split(';')[0]!.split('=').slice(1).join('=');
    const tamperedJwt = jwtToken.replace(/\.[^.]+$/, '.tampered_signature');
    const res = await request(app)
      .get(`${USER}/`)
      .set('Cookie', `token=${tamperedJwt}`);
    expect(res.status).toBe(401);
  });

  it('returns 404 when a valid token references a deleted user', async () => {
    // Delete the user from DB while keeping the token
    await User.findByIdAndDelete(userId);

    const res = await request(app).get(`${USER}/`).set('Cookie', cookie);
    // authMiddleware finds no user → 404
    expect(res.status).toBe(404);
  });
});
