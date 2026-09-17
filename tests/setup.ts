/**
 * Shared test helpers for dev-tinder-backend tests.
 *
 * Each test FILE is responsible for calling connectTestDB() in a beforeAll
 * and disconnectTestDB() in an afterAll so tests are fully isolated.
 */
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongod: MongoMemoryServer;

export async function connectTestDB(): Promise<void> {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
}

export async function disconnectTestDB(): Promise<void> {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
}

export async function clearDB(): Promise<void> {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key]?.deleteMany({});
  }
}

/** Build a signed JWT cookie header for a given user id */
import jwt from 'jsonwebtoken';

export function authCookieFor(userId: string): string {
  const secret = process.env['JWT_SECRET'] ?? 'test-secret';
  const token = jwt.sign({ _id: userId }, secret, { expiresIn: 86400 });
  return `token=${token}`;
}
