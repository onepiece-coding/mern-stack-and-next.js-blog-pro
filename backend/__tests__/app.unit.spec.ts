import { jest } from '@jest/globals';
import request from 'supertest';

describe('src/app.ts', () => {
  let capturedCorsOptions: any = null;
  let capturedCookieSecret: any = null;
  let capturedRateLimitOptions: any = null;

  const KEYS_TO_CLEAR = ['TRUST_PROXY', 'NODE_ENV'];

  beforeEach(() => {
    jest.resetModules();
    capturedCorsOptions = null;
    capturedCookieSecret = null;
    capturedRateLimitOptions = null;
    for (const k of KEYS_TO_CLEAR) delete process.env[k];
  });

  async function registerCommonMocks(fakeEnv: Record<string, any>) {
    await Promise.all([
      jest.unstable_mockModule('../src/env', () => ({
        __esModule: true,
        env: fakeEnv,
      })),
      jest.unstable_mockModule('helmet', () => ({
        __esModule: true,
        default: () => (req: any, _res: any, next: any) => {
          req._helmet = true;
          next();
        },
      })),
      jest.unstable_mockModule('hpp', () => ({
        __esModule: true,
        default: () => (_req: any, _res: any, next: any) => next(),
      })),
      jest.unstable_mockModule('cors', () => ({
        __esModule: true,
        default: (opts: any) => {
          capturedCorsOptions = opts;
          return (_req: any, _res: any, next: any) => next();
        },
      })),
      jest.unstable_mockModule('express-rate-limit', () => ({
        __esModule: true,
        default: (opts: any) => {
          capturedRateLimitOptions = opts;
          return (_req: any, _res: any, next: any) => next();
        },
      })),
      jest.unstable_mockModule('cookie-parser', () => ({
        __esModule: true,
        default: (secret: any) => {
          capturedCookieSecret = secret;
          return (_req: any, _res: any, next: any) => next();
        },
      })),
      jest.unstable_mockModule('../src/routes/index', () => ({
        __esModule: true,
        default: (req: any, res: any, next: any) => {
          if (req.path === '/' || req.path === '') {
            return res.json({ mounted: 'root' });
          }
          return next();
        },
      })),
      jest.unstable_mockModule('../src/middlewares/error', () => ({
        __esModule: true,
        notFound: (_req: any, _res: any, next: any) => {
          const err: any = new Error('Not Found - example');
          err.statusCode = 404;
          return next(err);
        },
        errorHandler: (err: any, _req: any, res: any, _next: any) => {
          const status = err.statusCode ?? 500;
          return res.status(status).json({ message: err.message });
        },
      })),
    ]);
  }

  test('TRUST_PROXY="1" sets trust proxy to 1, cors/cookie/rateLimit configured, rootRouter mounted', async () => {
    process.env.TRUST_PROXY = '1';
    const fakeEnv = {
      CLIENT_DOMAIN: 'https://client.example',
      COOKIE_SECRET: 'my-secret',
    };

    await registerCommonMocks(fakeEnv);

    const { default: app } = await import('../src/app.js');

    expect(app.get('trust proxy')).toBe(1);

    expect(capturedCorsOptions).toBeDefined();
    expect(capturedCorsOptions.origin).toBe(fakeEnv.CLIENT_DOMAIN);

    expect(capturedCookieSecret).toBe(fakeEnv.COOKIE_SECRET);

    expect(capturedRateLimitOptions).toBeDefined();
    expect(typeof capturedRateLimitOptions.windowMs).toBe('number');

    const res = await request(app).get('/api/v1');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ mounted: 'root' });
  });

  test('TRUST_PROXY="true" sets trust proxy to true', async () => {
    process.env.TRUST_PROXY = 'true';
    const fakeEnv = { CLIENT_DOMAIN: undefined, COOKIE_SECRET: undefined };

    await registerCommonMocks(fakeEnv);
    const { default: app } = await import('../src/app.js');

    expect(app.get('trust proxy')).toBe(true);
  });

  test('TRUST_PROXY set to specific value used literally', async () => {
    process.env.TRUST_PROXY = '127.0.0.1';
    const fakeEnv = { CLIENT_DOMAIN: undefined, COOKIE_SECRET: undefined };

    await registerCommonMocks(fakeEnv);
    const { default: app } = await import('../src/app.js');

    expect(app.get('trust proxy')).toBe('127.0.0.1');
  });

  test('when TRUST_PROXY undefined and NODE_ENV=production, trust proxy defaults to 1', async () => {
    delete process.env.TRUST_PROXY;
    process.env.NODE_ENV = 'production';
    const fakeEnv = { CLIENT_DOMAIN: undefined, COOKIE_SECRET: undefined };

    await registerCommonMocks(fakeEnv);
    const { default: app } = await import('../src/app.js');

    expect(app.get('trust proxy')).toBe(1);
  });

  test('unknown path triggers notFound -> errorHandler and returns 404 JSON', async () => {
    const fakeEnv = { CLIENT_DOMAIN: undefined, COOKIE_SECRET: undefined };
    await registerCommonMocks(fakeEnv);
    const { default: app } = await import('../src/app.js');

    const res = await request(app).get('/api/v1/this-route-does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: 'Not Found - example' });
  });
});