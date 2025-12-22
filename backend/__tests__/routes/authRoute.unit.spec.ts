import express from 'express';
import request from 'supertest';
import { jest } from '@jest/globals';

import authRoutes from '../../src/routes/authRoute.js';

const mockRegister = jest.fn((req: any, res: any) =>
  res.status(201).json({ message: 'registered' }),
);
const mockLogin = jest.fn((req: any, res: any) =>
  res.status(200).json({ token: 'tok' }),
);
const mockLogout = jest.fn((req: any, res: any) =>
  res.status(200).json({ message: 'logged out' }),
);
const mockVerifyUser = jest.fn((req: any, res: any) =>
  res.status(200).json({ success: true }),
);

const mockValidatePass = jest.fn((req: any, _res: any, next: any) => next());

const mockValidateObjectIdPass = jest.fn((req: any, _res: any, next: any) =>
  next(),
);

const mockVerifyOnlyUserPass = jest.fn((req: any, _res: any, next: any) => next());

function injectMocksIntoAuthRouter(router: any) {
  const stack = router.stack || [];
  for (const layer of stack) {
    if (!layer || !layer.route) continue;
    const route = layer.route;
    const path = route.path;

    if (path === '/register' && route.methods && route.methods.post) {
      const handlers = route.stack || [];
      if (handlers.length >= 1) handlers[0].handle = mockValidatePass;
      if (handlers.length >= 2) handlers[1].handle = mockRegister;
      continue;
    }

    if (path === '/login' && route.methods && route.methods.post) {
      const handlers = route.stack || [];
      if (handlers.length >= 1) handlers[0].handle = mockValidatePass;
      if (handlers.length >= 2) handlers[1].handle = mockLogin;
      continue;
    }

    if (path === '/logout/:id' && route.methods && route.methods.post) {
      const handlers = route.stack || [];
      if (handlers.length >= 1) handlers[0].handle = mockValidateObjectIdPass;
      if (handlers.length >= 2) handlers[1].handle = mockVerifyOnlyUserPass;
      if (handlers.length >= 3) handlers[2].handle = mockLogout;
      continue;
    }

    if (path === '/:userId/verify/:token' && route.methods && route.methods.get) {
      const handlers = route.stack || [];
      if (handlers.length >= 1) handlers[0].handle = mockValidateObjectIdPass;
      if (handlers.length >= 2) handlers[1].handle = mockVerifyUser;
      continue;
    }
  }
  return true;
}

describe('authRoutes wiring (unit-style)', () => {
  let app: express.Application;

  beforeEach(() => {
    jest.clearAllMocks();
    const ok = injectMocksIntoAuthRouter(authRoutes as any);
    if (!ok) throw new Error('failed to inject mocks into authRoutes');

    app = express();
    app.use(express.json());
    app.use('/api/v1/auth', authRoutes);
    app.use((err: any, _req: any, res: any, _next: any) => {
      res.status(err?.status || 500).json({ message: err?.message || 'error' });
    });
  });

  // ------- REGISTER ----------
  test('POST /register -> calls validation then controller and returns 201', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({});

    expect(mockValidatePass).toHaveBeenCalledTimes(1);
    expect(mockRegister).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ message: 'registered' });
  });

  test('POST /register -> validation fails -> short-circuits with 400', async () => {
    mockValidatePass.mockImplementationOnce((req: any, _res: any, next: any) =>
      next({ status: 400, message: 'Validation failed' }),
    );

    const res = await request(app).post('/api/v1/auth/register').send({});

    expect(mockRegister).not.toHaveBeenCalled();
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'Validation failed' });
  });

  // ------- LOGIN ----------
  test('POST /login -> validation then controller returns 200', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({});

    expect(mockValidatePass).toHaveBeenCalledTimes(1);
    expect(mockLogin).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ token: 'tok' });
  });

  test('POST /login -> validation error short-circuits with 400', async () => {
    mockValidatePass.mockImplementationOnce((req: any, _res: any, next: any) =>
      next({ status: 400, message: 'Validation failed' }),
    );

    const res = await request(app).post('/api/v1/auth/login').send({});

    expect(mockLogin).not.toHaveBeenCalled();
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'Validation failed' });
  });

  // ------- LOGOUT ----------
  test('POST /logout/:id -> runs param validator, auth middleware and controller', async () => {
    const res = await request(app).post('/api/v1/auth/logout/507f1f77bcf86cd799439011');

    expect(mockValidateObjectIdPass).toHaveBeenCalledTimes(1);
    expect(mockVerifyOnlyUserPass).toHaveBeenCalledTimes(1);
    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'logged out' });
  });

  test('POST /logout/:id -> param validation fails -> short-circuit', async () => {
    mockValidateObjectIdPass.mockImplementationOnce((req: any, _res: any, next: any) =>
      next({ status: 400, message: 'Invalid id' }),
    );

    const res = await request(app).post('/api/v1/auth/logout/bad-id');

    expect(mockVerifyOnlyUserPass).not.toHaveBeenCalled();
    expect(mockLogout).not.toHaveBeenCalled();
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'Invalid id' });
  });

  test('POST /logout/:id -> auth middleware rejects -> short-circuit 401', async () => {
    mockVerifyOnlyUserPass.mockImplementationOnce((req: any, _res: any, next: any) =>
      next({ status: 401, message: 'Not authorized' }),
    );

    const res = await request(app).post('/api/v1/auth/logout/507f1f77bcf86cd799439011');

    expect(mockLogout).not.toHaveBeenCalled();
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'Not authorized' });
  });

  // ------- VERIFY ----------
  test('GET /:userId/verify/:token -> runs param validator then controller', async () => {
    const res = await request(app).get('/api/v1/auth/507f1f77bcf86cd799439011/verify/abc123');

    expect(mockValidateObjectIdPass).toHaveBeenCalledTimes(1);
    expect(mockVerifyUser).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
  });

  test('GET /:userId/verify/:token -> param validator fails -> short-circuit', async () => {
    mockValidateObjectIdPass.mockImplementationOnce((req: any, _res: any, next: any) =>
      next({ status: 400, message: 'Invalid id' }),
    );

    const res = await request(app).get('/api/v1/auth/badid/verify/abc123');

    expect(mockVerifyUser).not.toHaveBeenCalled();
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'Invalid id' });
  });
});