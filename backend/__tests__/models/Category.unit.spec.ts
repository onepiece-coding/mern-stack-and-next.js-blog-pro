import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer | undefined;
let Category: any;
let connectedByThisTest = false;

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri, {});
    connectedByThisTest = true;
  } else {
    connectedByThisTest = false;
  }

  const mod = await import('../../src/models/Category.js');
  Category = mod.default ?? mod;
});

afterAll(async () => {
  if (connectedByThisTest) {
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
  }
});

afterEach(async () => {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key of Object.keys(collections)) {
      const coll = collections[key];
      if (coll) await coll.deleteMany({});
    }
  }
});

describe('Category model', () => {
  test('can create and save a valid category; title is trimmed; timestamps exist', async () => {
    const userId = new mongoose.Types.ObjectId();
    const cat = new Category({
      user: userId,
      title: '   My Category Title   ',
    });

    const saved = await cat.save();

    expect(saved._id).toBeDefined();
    expect(saved.createdAt).toBeDefined();
    expect(saved.updatedAt).toBeDefined();
    expect(saved.title).toBe('My Category Title');
    expect(saved.user.toString()).toBe(userId.toString());
  });

  test('validation fails when required fields are missing (user & title)', async () => {
    const doc = new Category({});

    let caught: any = null;
    try {
      await doc.save();
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeTruthy();
    expect(caught.name).toBe('ValidationError');
    const messages = Object.values(caught.errors).map((e: any) => e.message);
    expect(messages.some((m: string) => /required/i.test(m))).toBe(true);
  });

  test('unique title enforcement: creating duplicate title throws duplicate key error', async () => {
    await Category.init();

    const userId = new mongoose.Types.ObjectId();
    const first = new Category({ user: userId, title: 'UniqueTitle' });
    await first.save();

    const second = new Category({ user: userId, title: 'UniqueTitle' });

    let caught: any = null;
    try {
      await second.save();
    } catch (err) {
      caught = err;
    }

    expect(caught).toBeTruthy();
    const msg = String((caught && (caught.message || caught)) ?? '');
    expect(msg.toLowerCase()).toMatch(/duplicate key|11000/);
  });
});