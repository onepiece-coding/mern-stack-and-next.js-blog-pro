import { jest } from '@jest/globals';

describe('env.ts schema & behavior', () => {
  const loggerMock = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  };

  const KEYS = [
    'NODE_ENV',
    'PORT',
    'COOKIE_SECRET',
    'CLIENT_DOMAIN',
    'MONGO_URI',
    'JWT_SECRET',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'APP_EMAIL_ADDRESS',
    'APP_EMAIL_PASSWORD',
  ];

  beforeEach(() => {
    jest.resetModules();

    for (const k of KEYS) {
      delete process.env[k];
    }

    loggerMock.info.mockReset();
    loggerMock.warn.mockReset();
    loggerMock.error.mockReset();
    loggerMock.debug.mockReset();
  });

  afterAll(() => {
    for (const k of KEYS) delete process.env[k];
  });

  test('parses environment in NODE_ENV=test and applies defaults (PORT default)', async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'x'.repeat(32);

    await Promise.all([
      jest.unstable_mockModule('../src/utils/logger', () => ({
        __esModule: true,
        default: loggerMock,
      }))
    ]);

    const mod = await import('../src/env.js');
    const { env } = mod;

    expect(env.NODE_ENV).toBe('test');
    expect(env.PORT).toBe(8000);
    expect(typeof env.JWT_SECRET).toBe('string');
    expect(env.JWT_SECRET.length).toBeGreaterThanOrEqual(32);
    expect(loggerMock.error).not.toHaveBeenCalled();
  });

  test('parses a full non-test environment and coerces types', async () => {
    process.env.NODE_ENV = 'production';
    process.env.PORT = '3005';
    process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/testdb';
    process.env.JWT_SECRET = 's'.repeat(40);
    process.env.CLOUDINARY_CLOUD_NAME = 'my-cloud';
    process.env.CLOUDINARY_API_KEY = 'api-key';
    process.env.CLOUDINARY_API_SECRET = 'api-secret';
    process.env.APP_EMAIL_ADDRESS = 'me@example.com';
    process.env.APP_EMAIL_PASSWORD = 'emailpass';
    process.env.COOKIE_SECRET = 'cookie-secret';
    process.env.CLIENT_DOMAIN = 'https://example.com';

    await Promise.all([
      jest.unstable_mockModule('../src/utils/logger', () => ({
        __esModule: true,
        default: loggerMock,
      }))
    ]);

    const mod = await import('../src/env.js');
    const { env } = mod;

    expect(env.NODE_ENV).toBe('production');
    expect(env.PORT).toBe(3005);
    expect(env.MONGO_URI).toBe('mongodb://127.0.0.1:27017/testdb');
    expect(env.JWT_SECRET).toBe(process.env.JWT_SECRET);
    expect(env.CLOUDINARY_CLOUD_NAME).toBe('my-cloud');
    expect(env.APP_EMAIL_ADDRESS).toBe('me@example.com');
    expect(env.COOKIE_SECRET).toBe('cookie-secret');
    expect(env.CLIENT_DOMAIN).toBe('https://example.com');
    expect(loggerMock.error).not.toHaveBeenCalled();
  });

  test('throws and logs helpful errors for missing required non-test environment variables', async () => {
    process.env.NODE_ENV = 'development';
    process.env.JWT_SECRET = 'short-secret';

    await Promise.all([
      jest.unstable_mockModule('../src/utils/logger', () => ({
        __esModule: true,
        default: loggerMock,
      }))
    ]);

    await expect(import('../src/env.js')).rejects.toThrow('Invalid environment variables');

    expect(loggerMock.error).toHaveBeenCalled();
    const calledWith = loggerMock.error.mock.calls.map((c) => c.join(' ')).join(' ');
    expect(calledWith).toMatch(/Invalid environment variables|Missing required environment variables/);
  });
});