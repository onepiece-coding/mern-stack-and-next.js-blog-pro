import { jest } from '@jest/globals';

jest.mock('../../src/utils/logger.js', () => {
  return {
    __esModule: true,
    default: {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    },
  };
});

import connectToDB from '../../src/config/connectToDb.js';
import logger from '../../src/utils/logger.js';

describe('connectToDB', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('throws when no mongoUri and NODE_ENV is not test', async () => {
    const fakeEnv = { NODE_ENV: 'production' };
    const fakeClient = { connect: jest.fn() };

    await expect(
      connectToDB(undefined, { env: fakeEnv as any, mongooseClient: fakeClient as any }),
    ).rejects.toThrow('Missing MONGO_URI in environment variables');

    expect(fakeClient.connect).not.toHaveBeenCalled();
  });

  test('returns early (no connect) when NODE_ENV is test and no mongoUri', async () => {
    const fakeEnv = { NODE_ENV: 'test' };
    const fakeClient = { connect: jest.fn() };

    const res = await connectToDB(undefined, { env: fakeEnv as any, mongooseClient: fakeClient as any });

    expect(res).toBeUndefined();
    expect(fakeClient.connect).not.toHaveBeenCalled();
  });

  test('calls client.connect with provided uri and logs info on success', async () => {
    const fakeClient = { connect: (jest.fn() as any).mockResolvedValue(undefined) };

    const uri = 'mongodb://localhost:27017/mydb';
    await expect(connectToDB(uri, { env: { NODE_ENV: 'production' } as any, mongooseClient: fakeClient as any })).resolves.toBeUndefined();

    expect(fakeClient.connect).toHaveBeenCalledTimes(1);
    expect(fakeClient.connect).toHaveBeenCalledWith(uri);
    expect((logger.info as jest.Mock).mock.calls.length).toBeGreaterThanOrEqual(1);
    expect((logger.error as jest.Mock).mock.calls.length).toBe(0);
  });

  test('uses env.MONGO_URI when uri param omitted and logs on success', async () => {
    const fakeClient = { connect: (jest.fn() as any).mockResolvedValue(undefined) };

    const envObj = { NODE_ENV: 'production', MONGO_URI: 'mongodb://env-uri:27017/db' };
    await expect(connectToDB(undefined, { env: envObj as any, mongooseClient: fakeClient as any })).resolves.toBeUndefined();

    expect(fakeClient.connect).toHaveBeenCalledWith(envObj.MONGO_URI);
    expect((logger.info as jest.Mock).mock.calls.length).toBeGreaterThanOrEqual(1);
  });

  test('logs error and rethrows when client.connect throws', async () => {
    const err = new Error('connection failed');
    const fakeClient = { connect: (jest.fn() as any).mockRejectedValue(err) };
    const uri = 'mongodb://error:27017/db';

    await expect(connectToDB(uri, { env: { NODE_ENV: 'production' } as any, mongooseClient: fakeClient as any })).rejects.toThrow(err);

    expect((logger.error as jest.Mock).mock.calls.length).toBeGreaterThanOrEqual(1);
  });
});