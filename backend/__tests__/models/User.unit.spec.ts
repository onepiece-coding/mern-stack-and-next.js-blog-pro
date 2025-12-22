import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '../../src/models/User.js';

let mongod: MongoMemoryServer | undefined;
let startedLocalMongo = false;

describe('User model schema & hooks', () => {
  const baseValid = {
    username: 'tester',
    email: 't@example.com',
    password: 'P@ssw0rd1!',
  };

  beforeAll(async () => {
    if ((mongoose as any).connection && mongoose.connection.readyState === 0) {
      mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      await mongoose.connect(uri, {} as any);
      startedLocalMongo = true;
    } else {
      startedLocalMongo = false;
    }
  });

  afterAll(async () => {
    if (startedLocalMongo) {
      await mongoose.disconnect();
      if (mongod) await mongod.stop();
    }
  });

  beforeEach(async () => {
    jest.restoreAllMocks();
    if (mongoose.connection && mongoose.connection.db) {
      const collections = mongoose.connection.collections;
      for (const key of Object.keys(collections)) {
        await collections[key].deleteMany({});
      }
    }
  });

  test('model is registered with correct name', () => {
    expect(User.modelName).toBe('User');
  });

  test('schema has expected paths and options', () => {
    const schema = (User.schema as any);

    const usernamePath = schema.path('username') as any;
    expect(usernamePath).toBeDefined();
    expect(usernamePath.instance).toBe('String');
    expect(usernamePath.options.required).toBeTruthy();
    expect(usernamePath.options.minlength).toBe(2);
    expect(usernamePath.options.maxlength).toBe(100);

    const emailPath = schema.path('email') as any;
    expect(emailPath).toBeDefined();
    expect(emailPath.instance).toBe('String');
    expect(emailPath.options.required).toBeTruthy();
    expect(Boolean(emailPath.options.unique)).toBe(true);

    const passwordPath = schema.path('password') as any;
    expect(passwordPath).toBeDefined();
    expect(passwordPath.instance).toBe('String');
    expect(passwordPath.options.required).toBeTruthy();
    expect(passwordPath.options.minlength).toBe(8);

    const profilePhotoPath = schema.path('profilePhoto') as any;
    expect(profilePhotoPath).toBeDefined();

    expect(schema.options.timestamps).toBeTruthy();
    expect(schema.options.toJSON?.virtuals).toBeTruthy();
    expect(schema.options.toObject?.virtuals).toBeTruthy();
  });

  test('virtual "posts" exists and configured', () => {
    const schema = (User.schema as any);
    const virtuals = schema.virtuals as Record<string, any>;
    expect(Object.keys(virtuals)).toContain('posts');
    expect(virtuals.posts.options.ref).toBe('Post');
    expect(virtuals.posts.options.foreignField).toBe('user');
    expect(virtuals.posts.options.localField).toBe('_id');
  });

  test('validation fails when required fields are missing', async () => {
    const doc = new User({});
    await expect(doc.validate()).rejects.toThrow(mongoose.Error.ValidationError);

    try {
      await doc.validate();
    } catch (err: unknown) {
      if (err instanceof mongoose.Error.ValidationError) {
        const keys = Object.keys(err.errors);
        expect(keys).toEqual(expect.arrayContaining(['username', 'email', 'password']));
      } else {
        throw err;
      }
    }
  });

  test('valid document passes validation', async () => {
    const doc = new User({
      ...baseValid,
    });
    await expect(doc.validate()).resolves.toBeUndefined();
    expect(doc.isNew).toBe(true);
    expect(doc.username).toBe(baseValid.username);
    expect(doc.email).toBe(baseValid.email);
  });

  test('comparePassword calls bcrypt.compare and returns its result', async () => {
    const doc = new User({
      ...baseValid,
    });

    const compareSpy = (jest.spyOn(bcrypt, 'compare') as any).mockResolvedValue(true);

    const res = await (doc as any).comparePassword('candidate');
    expect(compareSpy).toHaveBeenCalledWith('candidate', doc.password);
    expect(res).toBe(true);
  });

  test('pre-save hashes password when modified (genSalt & hash called)', async () => {
    const doc = new User({
      ...baseValid,
    });

    const genSaltSpy = (jest.spyOn(bcrypt, 'genSalt') as any).mockResolvedValue('salted');
    const hashSpy = (jest.spyOn(bcrypt, 'hash') as any).mockResolvedValue('HASHED_PASSWORD');

    await expect(doc.save()).resolves.toBeDefined();

    expect(genSaltSpy).toHaveBeenCalledWith(10);
    expect(hashSpy).toHaveBeenCalledWith(baseValid.password, 'salted');

    expect(doc.password).toBe('HASHED_PASSWORD');
  }, 20000);

  test('pre-save does not hash when password not modified (isModified -> false)', async () => {
    const doc = new User({
      ...baseValid,
    });

    (doc as any).isModified = () => false;

    const genSaltSpy = (jest.spyOn(bcrypt, 'genSalt') as any).mockResolvedValue('salted');
    const hashSpy = (jest.spyOn(bcrypt, 'hash') as any).mockResolvedValue('HASHED_PASSWORD');

    await expect(doc.save()).resolves.toBeDefined();

    expect(genSaltSpy).not.toHaveBeenCalled();
    expect(hashSpy).not.toHaveBeenCalled();

    expect(doc.password).toBe(baseValid.password);
  }, 20000);
});