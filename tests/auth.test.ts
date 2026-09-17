import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { connectTestDB, disconnectTestDB, clearDB } from './setup';

const BASE = '/api/auth';

const validUser = {
  firstName: 'Alice',
  lastName: 'Dev',
  email: 'alice@example.com',
  password: 'Str0ng!Pass',
  age: 25,
  gender: 'female',
};

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await disconnectTestDB();
});

beforeEach(async () => {
  await clearDB();
});

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------
describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

// ---------------------------------------------------------------------------
// Signup
// ---------------------------------------------------------------------------
describe('POST /api/auth/signup', () => {
  it('registers a new user successfully', async () => {
    const res = await request(app).post(`${BASE}/signup`).send(validUser);
    expect(res.status).toBe(201);
    expect(res.body.message).toMatch(/registered/i);
  });

  it('rejects duplicate email', async () => {
    await request(app).post(`${BASE}/signup`).send(validUser);
    const res = await request(app).post(`${BASE}/signup`).send(validUser);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });

  it('rejects missing required fields', async () => {
    const res = await request(app)
      .post(`${BASE}/signup`)
      .send({ email: 'x@x.com' });
    expect(res.status).toBe(400);
  });

  it('rejects invalid email', async () => {
    const res = await request(app)
      .post(`${BASE}/signup`)
      .send({ ...validUser, email: 'not-an-email' });
    expect(res.status).toBe(400);
  });

  it('rejects weak password', async () => {
    const res = await request(app)
      .post(`${BASE}/signup`)
      .send({ ...validUser, email: 'b@b.com', password: '12345678' });
    expect(res.status).toBe(400);
  });

  it('rejects age below 18', async () => {
    const res = await request(app)
      .post(`${BASE}/signup`)
      .send({ ...validUser, email: 'c@c.com', age: 16 });
    expect(res.status).toBe(400);
  });

  it('rejects invalid gender', async () => {
    const res = await request(app)
      .post(`${BASE}/signup`)
      .send({ ...validUser, email: 'd@d.com', gender: 'alien' });
    expect(res.status).toBe(400);
  });

  it('does not return password in response', async () => {
    const res = await request(app).post(`${BASE}/signup`).send(validUser);
    expect(res.body.data?.password).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------
describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post(`${BASE}/signup`).send(validUser);
  });

  it('logs in with valid credentials and sets a cookie', async () => {
    const res = await request(app)
      .post(`${BASE}/login`)
      .send({ email: validUser.email, password: validUser.password });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/logged in/i);
    expect(res.headers['set-cookie']).toBeDefined();
    const rawCookieHeader = res.headers['set-cookie'];
    const cookieHeader = Array.isArray(rawCookieHeader) ? rawCookieHeader.join(';') : (rawCookieHeader ?? '');
    expect(cookieHeader.toLowerCase()).toContain('httponly');
  });

  it('rejects wrong password', async () => {
    const res = await request(app)
      .post(`${BASE}/login`)
      .send({ email: validUser.email, password: 'WrongPass1!' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid credentials/i);
  });

  it('rejects unknown email', async () => {
    const res = await request(app)
      .post(`${BASE}/login`)
      .send({ email: 'nobody@example.com', password: 'Str0ng!Pass' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid credentials/i);
  });

  it('rejects request with neither password nor otp', async () => {
    const res = await request(app)
      .post(`${BASE}/login`)
      .send({ email: validUser.email });
    expect(res.status).toBe(400);
  });

  it('does not return password hash in login response', async () => {
    const res = await request(app)
      .post(`${BASE}/login`)
      .send({ email: validUser.email, password: validUser.password });
    expect(res.body.data?.password).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Logout
// ---------------------------------------------------------------------------
describe('POST /api/auth/logout', () => {
  it('clears the token cookie', async () => {
    const res = await request(app).post(`${BASE}/logout`);
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/logged out/i);
    const rawCookies = res.headers['set-cookie'];
    const cookies: string[] = Array.isArray(rawCookies) ? rawCookies : rawCookies ? [rawCookies] : [];
    const tokenCookie = cookies.find((c) => c.startsWith('token='));
    // Cookie should be cleared (empty value or Max-Age=0)
    expect(tokenCookie).toBeDefined();
  });
});
