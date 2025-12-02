import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongod.getUri();
  process.env.NODE_ENV = 'test';
  await mongoose.connect(process.env.MONGO_URI as string);
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    const coll = collections[key];
    if (!coll) continue;
    try { await coll.deleteMany({}); } catch {}
  }
});

afterAll(async () => {
  try { await mongoose.disconnect(); } catch {}
  if (mongod) await mongod.stop();
});