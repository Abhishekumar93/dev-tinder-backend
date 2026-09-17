import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { connectTestDB, disconnectTestDB, clearDB } from './setup';
import { User } from '../src/models';

const AUTH = '/api/auth';
const CONN = '/api/connection-requests';
const USER_API = '/api/user';

const password = 'Str0ng!Pass';

const makeUser = (suffix: string) => ({
  firstName: suffix,
  lastName: 'Test',
  email: `${suffix.toLowerCase()}@example.com`,
  password,
  age: 25,
  gender: 'other' as const,
});

/** Register a user and return their auth cookie + DB id */
async function registerAndLogin(suffix: string) {
  await request(app).post(`${AUTH}/signup`).send(makeUser(suffix));
  const loginRes = await request(app)
    .post(`${AUTH}/login`)
    .send({ email: makeUser(suffix).email, password });
  const rawCookie = loginRes.headers['set-cookie'];
  const cookie = Array.isArray(rawCookie) ? rawCookie[0]! : rawCookie!;
  const dbUser = await User.findOne({ email: makeUser(suffix).email });
  return { cookie, id: dbUser!._id.toString() };
}

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
// Send interest / ignored
// ---------------------------------------------------------------------------
describe('POST /api/connection-requests/send/:status/:receiverId', () => {
  it('sends an interested request successfully', async () => {
    const alice = await registerAndLogin('Alice');
    const bob = await registerAndLogin('Bob');

    const res = await request(app)
      .post(`${CONN}/send/interested/${bob.id}`)
      .set('Cookie', alice.cookie);

    expect(res.status).toBe(201);
    expect(res.body.message).toMatch(/sent/i);
  });

  it('sends an ignored request successfully', async () => {
    const alice = await registerAndLogin('Alice');
    const bob = await registerAndLogin('Bob');

    const res = await request(app)
      .post(`${CONN}/send/ignored/${bob.id}`)
      .set('Cookie', alice.cookie);

    expect(res.status).toBe(201);
  });

  it('prevents self-requests', async () => {
    const alice = await registerAndLogin('Alice');

    const res = await request(app)
      .post(`${CONN}/send/interested/${alice.id}`)
      .set('Cookie', alice.cookie);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/yourself/i);
  });

  it('prevents duplicate requests with the same status', async () => {
    const alice = await registerAndLogin('Alice');
    const bob = await registerAndLogin('Bob');

    await request(app)
      .post(`${CONN}/send/interested/${bob.id}`)
      .set('Cookie', alice.cookie);

    const res = await request(app)
      .post(`${CONN}/send/interested/${bob.id}`)
      .set('Cookie', alice.cookie);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });

  it('allows changing status from interested to ignored', async () => {
    const alice = await registerAndLogin('Alice');
    const bob = await registerAndLogin('Bob');

    await request(app)
      .post(`${CONN}/send/interested/${bob.id}`)
      .set('Cookie', alice.cookie);

    const res = await request(app)
      .post(`${CONN}/send/ignored/${bob.id}`)
      .set('Cookie', alice.cookie);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/updated/i);
  });

  it('returns 400 for a non-existent receiver', async () => {
    const alice = await registerAndLogin('Alice');
    const fakeId = '507f1f77bcf86cd799439011';

    const res = await request(app)
      .post(`${CONN}/send/interested/${fakeId}`)
      .set('Cookie', alice.cookie);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/not found/i);
  });

  it('rejects invalid MongoDB id in URL', async () => {
    const alice = await registerAndLogin('Alice');

    const res = await request(app)
      .post(`${CONN}/send/interested/not-a-valid-id`)
      .set('Cookie', alice.cookie);

    expect(res.status).toBe(400);
  });

  it('rejects invalid status in URL', async () => {
    const alice = await registerAndLogin('Alice');
    const bob = await registerAndLogin('Bob');

    const res = await request(app)
      .post(`${CONN}/send/accepted/${bob.id}`)
      .set('Cookie', alice.cookie);

    expect(res.status).toBe(400);
  });

  it('requires authentication', async () => {
    const bob = await registerAndLogin('Bob');

    const res = await request(app).post(
      `${CONN}/send/interested/${bob.id}`
    );

    expect(res.status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// Review interest (accept / reject)
// ---------------------------------------------------------------------------
describe('POST /api/connection-requests/review/:status/:senderId', () => {
  it('accepts a pending request', async () => {
    const alice = await registerAndLogin('Alice');
    const bob = await registerAndLogin('Bob');

    // Alice sends interest to Bob
    await request(app)
      .post(`${CONN}/send/interested/${bob.id}`)
      .set('Cookie', alice.cookie);

    // Bob accepts
    const res = await request(app)
      .post(`${CONN}/review/accepted/${alice.id}`)
      .set('Cookie', bob.cookie);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/reviewed/i);
  });

  it('rejects a pending request', async () => {
    const alice = await registerAndLogin('Alice');
    const bob = await registerAndLogin('Bob');

    await request(app)
      .post(`${CONN}/send/interested/${bob.id}`)
      .set('Cookie', alice.cookie);

    const res = await request(app)
      .post(`${CONN}/review/rejected/${alice.id}`)
      .set('Cookie', bob.cookie);

    expect(res.status).toBe(200);
  });

  it('prevents self-review', async () => {
    const alice = await registerAndLogin('Alice');

    const res = await request(app)
      .post(`${CONN}/review/accepted/${alice.id}`)
      .set('Cookie', alice.cookie);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/yourself/i);
  });

  it('returns 400 when no pending request exists', async () => {
    const alice = await registerAndLogin('Alice');
    const bob = await registerAndLogin('Bob');

    // Bob tries to review without Alice having sent a request
    const res = await request(app)
      .post(`${CONN}/review/accepted/${alice.id}`)
      .set('Cookie', bob.cookie);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/does not exist/i);
  });

  it('returns 400 when sender does not exist', async () => {
    const bob = await registerAndLogin('Bob');
    const fakeId = '507f1f77bcf86cd799439011';

    const res = await request(app)
      .post(`${CONN}/review/accepted/${fakeId}`)
      .set('Cookie', bob.cookie);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/not found/i);
  });

  it('rejects status other than accepted/rejected', async () => {
    const alice = await registerAndLogin('Alice');
    const bob = await registerAndLogin('Bob');

    const res = await request(app)
      .post(`${CONN}/review/interested/${alice.id}`)
      .set('Cookie', bob.cookie);

    expect(res.status).toBe(400);
  });

  it('requires authentication', async () => {
    const alice = await registerAndLogin('Alice');

    const res = await request(app).post(
      `${CONN}/review/accepted/${alice.id}`
    );

    expect(res.status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// Pending requests list
// ---------------------------------------------------------------------------
describe('GET /api/user/pending-requests', () => {
  it('returns requests sent to the authenticated user', async () => {
    const alice = await registerAndLogin('Alice');
    const bob = await registerAndLogin('Bob');

    await request(app)
      .post(`${CONN}/send/interested/${bob.id}`)
      .set('Cookie', alice.cookie);

    const res = await request(app)
      .get(`${USER_API}/pending-requests`)
      .set('Cookie', bob.cookie);

    expect(res.status).toBe(200);
    expect(res.body.data.count).toBe(1);
    expect(res.body.data.records[0].email).toBe(makeUser('Alice').email);
  });

  it('does not include ignored requests', async () => {
    const alice = await registerAndLogin('Alice');
    const bob = await registerAndLogin('Bob');

    await request(app)
      .post(`${CONN}/send/ignored/${bob.id}`)
      .set('Cookie', alice.cookie);

    const res = await request(app)
      .get(`${USER_API}/pending-requests`)
      .set('Cookie', bob.cookie);

    expect(res.status).toBe(200);
    expect(res.body.data.count).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Connections list
// ---------------------------------------------------------------------------
describe('GET /api/user/connections', () => {
  it('returns accepted connections for the authenticated user', async () => {
    const alice = await registerAndLogin('Alice');
    const bob = await registerAndLogin('Bob');

    // Alice → Bob interested, Bob accepts
    await request(app)
      .post(`${CONN}/send/interested/${bob.id}`)
      .set('Cookie', alice.cookie);
    await request(app)
      .post(`${CONN}/review/accepted/${alice.id}`)
      .set('Cookie', bob.cookie);

    const aliceConns = await request(app)
      .get(`${USER_API}/connections`)
      .set('Cookie', alice.cookie);
    const bobConns = await request(app)
      .get(`${USER_API}/connections`)
      .set('Cookie', bob.cookie);

    expect(aliceConns.status).toBe(200);
    expect(aliceConns.body.data.count).toBe(1);
    expect(aliceConns.body.data.records[0].email).toBe(makeUser('Bob').email);

    expect(bobConns.status).toBe(200);
    expect(bobConns.body.data.count).toBe(1);
    expect(bobConns.body.data.records[0].email).toBe(makeUser('Alice').email);
  });

  it('does not include rejected connections', async () => {
    const alice = await registerAndLogin('Alice');
    const bob = await registerAndLogin('Bob');

    await request(app)
      .post(`${CONN}/send/interested/${bob.id}`)
      .set('Cookie', alice.cookie);
    await request(app)
      .post(`${CONN}/review/rejected/${alice.id}`)
      .set('Cookie', bob.cookie);

    const res = await request(app)
      .get(`${USER_API}/connections`)
      .set('Cookie', alice.cookie);

    expect(res.body.data.count).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Feed excludes connected users
// ---------------------------------------------------------------------------
describe('GET /api/user/feed — connection exclusion', () => {
  it('excludes users with any connection status from the feed', async () => {
    const alice = await registerAndLogin('Alice');
    const bob = await registerAndLogin('Bob');

    // Alice sends interest to Bob
    await request(app)
      .post(`${CONN}/send/interested/${bob.id}`)
      .set('Cookie', alice.cookie);

    // Alice's feed should not contain Bob
    const res = await request(app)
      .get(`${USER_API}/feed`)
      .set('Cookie', alice.cookie);

    const emails = res.body.data.records.map((u: { email: string }) => u.email);
    expect(emails).not.toContain(makeUser('Bob').email);
  });
});
