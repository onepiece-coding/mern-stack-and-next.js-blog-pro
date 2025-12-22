import { jest } from '@jest/globals';
import express from 'express';
import request from 'supertest';

describe('root router (src/routes/index.ts)', () => {
  beforeAll(async () => {
    jest.resetModules();

    await Promise.all([
      jest.unstable_mockModule('../../src/routes/adminRoute.js', () => ({
        __esModule: true,
        default: (req: any, res: any) => res.json({ mounted: 'admin' }),
      })),
      jest.unstable_mockModule('../../src/routes/authRoute.js', () => ({
        __esModule: true,
        default: (req: any, res: any) => res.json({ mounted: 'auth' }),
      })),
      jest.unstable_mockModule('../../src/routes/categoriesRoute.js', () => ({
        __esModule: true,
        default: (req: any, res: any) => res.json({ mounted: 'categories' }),
      })),
      jest.unstable_mockModule('../../src/routes/commentsRoute.js', () => ({
        __esModule: true,
        default: (req: any, res: any) => res.json({ mounted: 'comments' }),
      })),
      jest.unstable_mockModule('../../src/routes/passwordRoute.js', () => ({
        __esModule: true,
        default: (req: any, res: any) => res.json({ mounted: 'password' }),
      })),
      jest.unstable_mockModule('../../src/routes/postsRoute.js', () => ({
        __esModule: true,
        default: (req: any, res: any) => res.json({ mounted: 'posts' }),
      })),
      jest.unstable_mockModule('../../src/routes/usersRoute.js', () => ({
        __esModule: true,
        default: (req: any, res: any) => res.json({ mounted: 'users' }),
      }))
    ]);
  });

  async function makeApp() {
    const mod = await import('../../src/routes/index.js');
    const rootRouter = mod.default;
    const app = express();
    app.use('/api/v1', rootRouter);
    return app;
  }

  test('GET /api/v1/admin -> mounted admin router', async () => {
    const app = await makeApp();
    const res = await request(app).get('/api/v1/admin');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ mounted: 'admin' });
  });

  test('GET /api/v1/auth -> mounted auth router', async () => {
    const app = await makeApp();
    const res = await request(app).get('/api/v1/auth');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ mounted: 'auth' });
  });

  test('GET /api/v1/categories -> mounted categories router', async () => {
    const app = await makeApp();
    const res = await request(app).get('/api/v1/categories');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ mounted: 'categories' });
  });

  test('GET /api/v1/comments -> mounted comments router', async () => {
    const app = await makeApp();
    const res = await request(app).get('/api/v1/comments');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ mounted: 'comments' });
  });

  test('GET /api/v1/password -> mounted password router', async () => {
    const app = await makeApp();
    const res = await request(app).get('/api/v1/password');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ mounted: 'password' });
  });

  test('GET /api/v1/posts -> mounted posts router', async () => {
    const app = await makeApp();
    const res = await request(app).get('/api/v1/posts');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ mounted: 'posts' });
  });

  test('GET /api/v1/users -> mounted users router', async () => {
    const app = await makeApp();
    const res = await request(app).get('/api/v1/users');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ mounted: 'users' });
  });

  test('unknown path under /api/v1 returns 404 (not handled by any child)', async () => {
    const app = await makeApp();
    const res = await request(app).get('/api/v1/this-does-not-exist');
    expect(res.status).toBe(404);
  });
});