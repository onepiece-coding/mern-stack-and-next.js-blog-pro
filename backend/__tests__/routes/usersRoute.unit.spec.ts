import { jest } from '@jest/globals';
import express from 'express';
import request from 'supertest';

describe('usersRoute', () => {
  beforeAll(async () => {
    jest.resetModules();

    await Promise.all([
      // Mock controllers
      jest.unstable_mockModule('../../src/controllers/usersController.js', () => {
        const getAllUsersCtrl = (req: any, res: any) => res.status(200).json({ called: 'getAllUsers', admin: !!req.user?.isAdmin });
  
        const profilePhotoUploadCtrl = (req: any, res: any) => res.status(200).json({ called: 'profilePhotoUpload', gotImage: !!req._image, userId: req.user?.id ?? null });
  
        const getUserProfileCtrl = (req: any, res: any) => res.status(200).json({ called: 'getUserProfile', validatedIdParam: req._validatedIdParam ?? null });
  
        const updateUserProfileCtrl = (req: any, res: any) => res.status(200).json({ called: 'updateUserProfile', validated: !!req.validated, userId: req.user?.id ?? null });
  
        const deleteUserProfileCtrl = (req: any, res: any) => res.status(200).json({ called: 'deleteUserProfile', validatedIdParam: req._validatedIdParam ?? null, userId: req.user?.id ?? null });
  
        const getMe = (req: any, res: any) => res.status(200).json({ called: 'getMe', userId: req.user?.id ?? null });
  
        const getUsersCountCtrl = (req: any, res: any) => res.status(200).json({ called: 'getUsersCount', admin: !!req.user?.isAdmin });
  
        return {
          __esModule: true,
          getAllUsersCtrl,
          profilePhotoUploadCtrl,
          getUserProfileCtrl,
          updateUserProfileCtrl,
          deleteUserProfileCtrl,
          getMe,
          getUsersCountCtrl,
        };
      }),
      jest.unstable_mockModule('../../src/middlewares/verifyToken.js', () => {
        const verifyToken = (req: any, _res: any, next: any) => {
          req.user = { id: 'user-1', isAdmin: false };
          next();
        };

        const verifyTokenAndAdmin = (req: any, _res: any, next: any) => {
          req.user = { id: 'admin-1', isAdmin: true };
          next();
        };

        const verifyTokenAndOnlyUser = (req: any, _res: any, next: any) => {
          const id = req.params?.id ?? 'user-1';
          req.user = { id, isAdmin: false };
          next();
        };

        const verifyTokenAndAuthorization = (req: any, _res: any, next: any) => {
          req.user = { id: req.params?.id ?? 'user-1', isAdmin: false };
          next();
        };

        return {
          __esModule: true,
          verifyToken,
          verifyTokenAndAdmin,
          verifyTokenAndOnlyUser,
          verifyTokenAndAuthorization,
        };
      }),
      jest.unstable_mockModule('../../src/middlewares/validateObjectId.js', () => {
        const defaultExport = (paramName: string) => {
          return (req: any, _res: any, next: any) => {
            req._validatedIdParam = paramName;
            next();
          };
        };
        return { __esModule: true, default: defaultExport };
      }),
      jest.unstable_mockModule('../../src/middlewares/photoUpload.js', () => {
        const singleImage = (_field = 'image') => (req: any, _res: any, next: any) => {
          req._image = true;
          next();
        };
        const multipleImages = (_f = 'images', _max = 5) => (_req: any, _res: any, next: any) => next();
        return { __esModule: true, singleImage, multipleImages };
      }),
      jest.unstable_mockModule('../../src/middlewares/validate.js', () => {
        const validate = (_schema: any) => (req: any, _res: any, next: any) => {
          req.validated = true;
          next();
        };
        return { __esModule: true, validate };
      })
    ]);
  });
  
  async function mountRouter() {
    const mod = await import('../../src/routes/usersRoute.js');
    const router = mod.default;
    const app = express();
    app.use(express.json());
    app.use('/api/v1/users', router);
    return app;
  }
  
  test('GET /profile -> verifyTokenAndAdmin + getAllUsersCtrl', async () => {
    const app = await mountRouter();
    const res = await request(app).get('/api/v1/users/profile');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({ called: 'getAllUsers', admin: true }));
  });

  test('POST /profile/profile-photo-upload -> verifyToken + singleImage + profilePhotoUploadCtrl', async () => {
    const app = await mountRouter();
    const res = await request(app).post('/api/v1/users/profile/profile-photo-upload').send({});
    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({ called: 'profilePhotoUpload', gotImage: true, userId: 'user-1' }));
  });

  test('GET /profile/:id -> validateObjectIdParam + getUserProfileCtrl', async () => {
    const app = await mountRouter();
    const id = '507f1f77bcf86cd799439011';
    const res = await request(app).get(`/api/v1/users/profile/${id}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({ called: 'getUserProfile', validatedIdParam: 'id' }));
  });

  test('PATCH /profile/:id -> verifyTokenAndOnlyUser + validate + updateUserProfileCtrl', async () => {
    const app = await mountRouter();
    const id = '507f1f77bcf86cd799439011';
    const res = await request(app).patch(`/api/v1/users/profile/${id}`).send({ username: 'new' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({ called: 'updateUserProfile', validated: true, userId: id }));
  });

  test('DELETE /profile/:id -> verifyTokenAndAuthorization + deleteUserProfileCtrl', async () => {
    const app = await mountRouter();
    const id = '507f1f77bcf86cd799439011';
    const res = await request(app).delete(`/api/v1/users/profile/${id}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({ called: 'deleteUserProfile', validatedIdParam: 'id', userId: id }));
  });

  test('GET /me -> verifyToken + getMe', async () => {
    const app = await mountRouter();
    const res = await request(app).get('/api/v1/users/me');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({ called: 'getMe', userId: 'user-1' }));
  });

  test('GET /count -> verifyTokenAndAdmin + getUsersCountCtrl', async () => {
    const app = await mountRouter();
    const res = await request(app).get('/api/v1/users/count');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({ called: 'getUsersCount', admin: true }));
  });
});