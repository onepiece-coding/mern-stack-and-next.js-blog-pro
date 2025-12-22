import express from 'express';
import request from 'supertest';
import { jest } from '@jest/globals';

// --- mocks to inject ---
const mockCreateComment = jest.fn((req: any, res: any) =>
  res.status(201).json({ created: true }),
);
const mockGetAllComments = jest.fn((req: any, res: any) =>
  res.status(200).json([{ id: 'c1' }]),
);
const mockDeleteComment = jest.fn((req: any, res: any) =>
  res.status(200).json({ message: 'deleted', id: req.params.id }),
);
const mockUpdateComment = jest.fn((req: any, res: any) =>
  res.status(201).json({ updated: true }),
);

// middleware mocks
const mockVerifyToken = jest.fn((req: any, _res: any, next: any) => next());
const mockVerifyTokenAndAdmin = jest.fn((req: any, _res: any, next: any) =>
  next(),
);

const mockValidatePass = jest.fn((req: any, _res: any, next: any) => next());

const mockValidateObjectIdPass = jest.fn((req: any, _res: any, next: any) =>
  next(),
);

function injectMocksIntoRouter(router: any) {
  const stack = router.stack || [];
  for (const layer of stack) {
    if (!layer || !layer.route) continue;
    const route = layer.route;
    const path = route.path;
    const handlers = route.stack || [];

    const buildEntriesForMethod = (method: string) =>
      handlers.filter((entry: any) => !entry.method || entry.method === method);

    if (path === '/' && route.methods && route.methods.post) {
      const postEntries = buildEntriesForMethod('post');
      if (postEntries.length >= 1) postEntries[0].handle = mockVerifyToken;
      if (postEntries.length >= 2) postEntries[1].handle = mockValidatePass;
      if (postEntries.length >= 3) postEntries[2].handle = mockCreateComment;
    }

    if (path === '/' && route.methods && route.methods.get) {
      const getEntries = buildEntriesForMethod('get');
      if (getEntries.length >= 1) getEntries[0].handle = mockVerifyTokenAndAdmin;
      if (getEntries.length >= 2) getEntries[1].handle = mockGetAllComments;
      if (getEntries.length === 1) getEntries[0].handle = (req: any, res: any, next: any) =>
        mockVerifyTokenAndAdmin(req, res, (err?: any) => {
          if (err) return next(err);
          return mockGetAllComments(req, res);
        });
    }

    if (path === '/:id' && route.methods && (route.methods.delete || route.methods.patch)) {
      // DELETE entries
      if (route.methods.delete) {
        const delEntries = buildEntriesForMethod('delete');
        if (delEntries.length >= 1) delEntries[0].handle = mockValidateObjectIdPass;
        if (delEntries.length >= 2) delEntries[1].handle = mockVerifyToken;
        if (delEntries.length >= 3) delEntries[2].handle = mockDeleteComment;
      }

      // PATCH entries (update)
      if (route.methods.patch) {
        const patchEntries = buildEntriesForMethod('patch');
        if (patchEntries.length >= 1) patchEntries[0].handle = mockValidateObjectIdPass;
        if (patchEntries.length >= 2) patchEntries[1].handle = mockVerifyToken;
        if (patchEntries.length >= 3) patchEntries[2].handle = mockValidatePass;
        if (patchEntries.length >= 4) patchEntries[3].handle = mockUpdateComment;
      }
    }
  }

  return true;
}

describe('commentsRoutes wiring (unit-style)', () => {
  let app: express.Application;
  let commentsRoutes: any;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetModules();
    const mod = await import('../../src/routes/commentsRoute.js');
    commentsRoutes = mod.default;

    const ok = injectMocksIntoRouter(commentsRoutes);
    if (!ok) throw new Error('failed to inject mocks');

    app = express();
    app.use(express.json());
    app.use('/api/v1/comments', commentsRoutes);

    app.use((err: any, _req: any, res: any, _next: any) => {
      res.status(err?.status || 500).json({ message: err?.message || 'error' });
    });
  });

  const reInject = () => injectMocksIntoRouter(commentsRoutes);

  // ---------- POST / ----------
  test('POST / -> verify + validate pass -> createComment called', async () => {
    const res = await request(app).post('/api/v1/comments').send({
      postId: '507f1f77bcf86cd799439011',
      text: 'hello',
    });

    expect(mockVerifyToken).toHaveBeenCalledTimes(1);
    expect(mockValidatePass).toHaveBeenCalledTimes(1);
    expect(mockCreateComment).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ created: true });
  });

  test('POST / -> validate fails -> short-circuit 400', async () => {
    mockValidatePass.mockImplementationOnce((req: any, _res: any, next: any) =>
      next({ status: 400, message: 'Validation failed' }),
    );

    const res = await request(app).post('/api/v1/comments').send({});

    expect(mockCreateComment).not.toHaveBeenCalled();
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'Validation failed' });

    reInject();
  });

  // ---------- GET / ----------
  test('GET / -> verify admin then controller returns comments', async () => {
    const res = await request(app).get('/api/v1/comments');

    expect(mockVerifyTokenAndAdmin).toHaveBeenCalledTimes(1);
    expect(mockGetAllComments).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 'c1' }]);
  });

  test('GET / -> admin verify fails -> short-circuit 403', async () => {
    mockVerifyTokenAndAdmin.mockImplementationOnce((req: any, _res: any, next: any) =>
      next({ status: 403, message: 'Not allowed, only admin' }),
    );

    const res = await request(app).get('/api/v1/comments');

    expect(mockGetAllComments).not.toHaveBeenCalled();
    expect(res.status).toBe(403);
    expect(res.body).toEqual({ message: 'Not allowed, only admin' });

    reInject();
  });

  // ---------- DELETE /:id ----------
  test('DELETE /:id -> param validator + verify -> deleteComment called', async () => {
    const id = '507f1f77bcf86cd799439011';
    const res = await request(app).delete(`/api/v1/comments/${id}`);

    expect(mockValidateObjectIdPass).toHaveBeenCalledTimes(1);
    expect(mockVerifyToken).toHaveBeenCalledTimes(1);
    expect(mockDeleteComment).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'deleted', id });
  });

  test('DELETE /:id -> param validation fails -> 400', async () => {
    mockValidateObjectIdPass.mockImplementationOnce((req: any, _res: any, next: any) =>
      next({ status: 400, message: 'Invalid id' }),
    );

    const res = await request(app).delete('/api/v1/comments/bad-id');

    expect(mockVerifyToken).not.toHaveBeenCalled();
    expect(mockDeleteComment).not.toHaveBeenCalled();
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'Invalid id' });

    reInject();
  });

  test('DELETE /:id -> verify fails -> 401', async () => {
    mockVerifyToken.mockImplementationOnce((req: any, _res: any, next: any) =>
      next({ status: 401, message: 'Not authorized' }),
    );

    const res = await request(app).delete('/api/v1/comments/507f1f77bcf86cd799439011');

    expect(mockDeleteComment).not.toHaveBeenCalled();
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'Not authorized' });

    reInject();
  });

  // ---------- PATCH /:id ----------
  test('PATCH /:id -> param validator + verify + validate -> updateComment called', async () => {
    const id = '507f1f77bcf86cd799439011';
    const res = await request(app).patch(`/api/v1/comments/${id}`).send({ text: 'new' });

    expect(mockValidateObjectIdPass).toHaveBeenCalledTimes(1);
    expect(mockVerifyToken).toHaveBeenCalledTimes(1);
    expect(mockValidatePass).toHaveBeenCalledTimes(1);
    expect(mockUpdateComment).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ updated: true });
  });

  test('PATCH /:id -> validate fails -> 400', async () => {
    mockValidatePass.mockImplementationOnce((req: any, _res: any, next: any) =>
      next({ status: 400, message: 'Validation failed' }),
    );

    const res = await request(app).patch('/api/v1/comments/507f1f77bcf86cd799439011').send({});

    expect(mockUpdateComment).not.toHaveBeenCalled();
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'Validation failed' });

    reInject();
  });
});