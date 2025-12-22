import express from 'express';
import request from 'supertest';
import { jest } from '@jest/globals';

// Mocks
const mockCreateCategory = jest.fn((req: any, res: any) =>
  res.status(201).json({ created: true }),
);
const mockGetAllCategories = jest.fn((req: any, res: any) =>
  res.status(200).json({ categories: [], totalPages: 0 }),
);
const mockDeleteCategory = jest.fn((req: any, res: any) =>
  res.status(200).json({ message: 'deleted', categoryId: req.params.id }),
);

const mockVerifyTokenAndAdminPass = jest.fn((req: any, _res: any, next: any) =>
  next(),
);
const mockValidatePass = jest.fn((req: any, _res: any, next: any) => next());
const mockValidateObjectIdPass = jest.fn((req: any, _res: any, next: any) =>
  next(),
);

const mockVerifyTokenAndAdminFail = jest.fn((req: any, _res: any, next: any) =>
  next({ status: 403, message: 'Not allowed, only admin' }),
);
const mockValidateFail = jest.fn((req: any, _res: any, next: any) =>
  next({ status: 400, message: 'Validation failed' }),
);
const mockValidateObjectIdFail = jest.fn((req: any, _res: any, next: any) =>
  next({ status: 400, message: 'Invalid id' }),
);

function injectMocks(router: any) {
  const stack = router.stack || [];
  for (const layer of stack) {
    if (!layer || !layer.route) continue;
    const route = layer.route;
    const path = route.path;
    const handlers = route.stack || [];

    const byMethod: Record<string, any[]> = {};
    for (const entry of handlers) {
      const m = (entry.method || 'get').toLowerCase();
      byMethod[m] = byMethod[m] || [];
      byMethod[m].push(entry);
    }

    // POST '/'
    if (path === '/' && route.methods && route.methods.post) {
      const postEntries = byMethod['post'] || [];
      if (postEntries.length >= 1) postEntries[0].handle = mockVerifyTokenAndAdminPass;
      if (postEntries.length >= 2) postEntries[1].handle = mockValidatePass;
      if (postEntries.length >= 3) postEntries[2].handle = mockCreateCategory;
    }

    // GET '/'
    if (path === '/' && route.methods && route.methods.get) {
      const getEntries = byMethod['get'] || [];
      if (getEntries.length >= 1) getEntries[0].handle = mockGetAllCategories;
    }

    // DELETE '/:id'
    if (path === '/:id' && route.methods && route.methods.delete) {
      const delEntries = byMethod['delete'] || [];
      if (delEntries.length >= 1) delEntries[0].handle = mockValidateObjectIdPass;
      if (delEntries.length >= 2) delEntries[1].handle = mockVerifyTokenAndAdminPass;
      if (delEntries.length >= 3) delEntries[2].handle = mockDeleteCategory;
    }
  }
  return true;
}

describe('categoriesRoutes wiring (unit-style, robust)', () => {
  let app: express.Application;
  let categoriesRoutes: any;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetModules();
    const mod = await import('../../src/routes/categoriesRoute.js');
    categoriesRoutes = mod.default;

    const ok = injectMocks(categoriesRoutes);
    if (!ok) throw new Error('inject failed');

    app = express();
    app.use(express.json());
    app.use('/api/v1/categories', categoriesRoutes);

    app.use((err: any, _req: any, res: any, _next: any) => {
      res.status(err?.status || 500).json({ message: err?.message || 'error' });
    });
  });

  const reInject = () => injectMocks(categoriesRoutes);

  // ---------- POST / ----------
  test('POST / -> verify + validate pass -> create controller called', async () => {
    const res = await request(app).post('/api/v1/categories').send({ title: 'x' });

    expect(mockVerifyTokenAndAdminPass).toHaveBeenCalledTimes(1);
    expect(mockValidatePass).toHaveBeenCalledTimes(1);
    expect(mockCreateCategory).toHaveBeenCalledTimes(1);

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ created: true });
  });

  test('POST / -> verify fails -> short-circuit before validate/controller', async () => {
    for (const layer of (categoriesRoutes as any).stack || []) {
      if (layer?.route?.path === '/' && layer.route.methods.post) {
        const postEntries = (layer.route.stack || []).filter((e: any) => e.method === 'post');
        if (postEntries.length > 0) postEntries[0].handle = mockVerifyTokenAndAdminFail;
      }
    }

    const res = await request(app).post('/api/v1/categories').send({ title: 'x' });

    expect(mockValidatePass).not.toHaveBeenCalled();
    expect(mockCreateCategory).not.toHaveBeenCalled();
    expect(res.status).toBe(403);
    expect(res.body).toEqual({ message: 'Not allowed, only admin' });

    reInject();
  });

  test('POST / -> validate fails -> short-circuit before controller', async () => {
    for (const layer of (categoriesRoutes as any).stack || []) {
      if (layer?.route?.path === '/' && layer.route.methods.post) {
        const postEntries = (layer.route.stack || []).filter((e: any) => e.method === 'post');
        if (postEntries.length > 1) postEntries[1].handle = mockValidateFail;
      }
    }

    const res = await request(app).post('/api/v1/categories').send({ title: '' });

    expect(mockCreateCategory).not.toHaveBeenCalled();
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'Validation failed' });

    reInject();
  });

  // ---------- GET / ----------
  test('GET / -> returns categories via controller', async () => {
    const res = await request(app).get('/api/v1/categories');

    expect(mockGetAllCategories).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ categories: [], totalPages: 0 });
  });

  // ---------- DELETE /:id ----------
  test('DELETE /:id -> param validator + auth pass -> delete controller called', async () => {
    const id = '507f1f77bcf86cd799439011';
    const res = await request(app).delete(`/api/v1/categories/${id}`);

    expect(mockValidateObjectIdPass).toHaveBeenCalledTimes(1);
    expect(mockVerifyTokenAndAdminPass).toHaveBeenCalledTimes(1);
    expect(mockDeleteCategory).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'deleted', categoryId: id });
  });

  test('DELETE /:id -> param validator fails -> short-circuit', async () => {
    for (const layer of (categoriesRoutes as any).stack || []) {
      if (layer?.route?.path === '/:id' && layer.route.methods.delete) {
        const delEntries = (layer.route.stack || []).filter((e: any) => e.method === 'delete');
        if (delEntries.length > 0) delEntries[0].handle = mockValidateObjectIdFail;
      }
    }

    const res = await request(app).delete('/api/v1/categories/bad-id');

    expect(mockVerifyTokenAndAdminPass).not.toHaveBeenCalled();
    expect(mockDeleteCategory).not.toHaveBeenCalled();
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'Invalid id' });

    reInject();
  });

  test('DELETE /:id -> auth fails -> short-circuit', async () => {
    for (const layer of (categoriesRoutes as any).stack || []) {
      if (layer?.route?.path === '/:id' && layer.route.methods.delete) {
        const delEntries = (layer.route.stack || []).filter((e: any) => e.method === 'delete');
        if (delEntries.length > 1) delEntries[1].handle = mockVerifyTokenAndAdminFail;
      }
    }

    const res = await request(app).delete('/api/v1/categories/507f1f77bcf86cd799439011');

    expect(mockDeleteCategory).not.toHaveBeenCalled();
    expect(res.status).toBe(403);
    expect(res.body).toEqual({ message: 'Not allowed, only admin' });

    reInject();
  });
});