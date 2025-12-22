import express from 'express';
import request from 'supertest';
import { jest } from '@jest/globals';

import adminRoutes from '../../src/routes/adminRoute.js';

const mockGetAllInfo = jest.fn((req: any, res: any) =>
  res.status(200).json({ users: 5 }),
);
const mockVerifyTokenAndAdmin = jest.fn((req: any, _res: any, next: any) =>
  next(),
);

function injectMocksIntoAdminRouter(router: any) {
  const stack = router.stack || [];
  for (const layer of stack) {
    if (!layer || !layer.route) continue;
    const route = layer.route;
    if (route.path === '/info' && route.methods && route.methods.get) {
      const handlers = route.stack || [];
      if (handlers.length >= 1) handlers[0].handle = mockVerifyTokenAndAdmin;
      if (handlers.length >= 2) handlers[1].handle = mockGetAllInfo;
      return true;
    }
  }
  return false;
}

describe('adminRoutes', () => {
  let app: express.Application;

  beforeEach(() => {
    jest.clearAllMocks();

    const injected = injectMocksIntoAdminRouter(adminRoutes as any);
    if (!injected) {
      throw new Error('Failed to inject mocks into adminRoutes router');
    }

    app = express();
    app.use(express.json());
    app.use('/api/v1/admin', adminRoutes);

    app.use((err: any, _req: any, res: any, _next: any) => {
      res.status(err?.status || 500).json({ message: err?.message || 'error' });
    });
  });

  test('GET /api/v1/admin/info -> runs middleware then controller and returns JSON', async () => {
    const res = await request(app).get('/api/v1/admin/info');

    expect(mockVerifyTokenAndAdmin).toHaveBeenCalledTimes(1);
    expect(mockGetAllInfo).toHaveBeenCalledTimes(1);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ users: 5 });
  });

  test('GET /api/v1/admin/info -> middleware error short-circuits and returns error', async () => {

    mockVerifyTokenAndAdmin.mockImplementationOnce((req: any, _res: any, next: any) =>
      next({ status: 403, message: 'Not allowed, only admin' }),
    );

    const res = await request(app).get('/api/v1/admin/info');

    expect(mockVerifyTokenAndAdmin).toHaveBeenCalledTimes(1);
    expect(mockGetAllInfo).not.toHaveBeenCalled();

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ message: 'Not allowed, only admin' });
  });
});