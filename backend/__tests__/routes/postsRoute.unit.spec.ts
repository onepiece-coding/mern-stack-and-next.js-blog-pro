import { jest } from '@jest/globals';
import express from 'express';
import request from 'supertest';

describe('postsRoute', () => {
  beforeAll(async () => {
    jest.resetModules();

    await Promise.all([
      
      jest.unstable_mockModule('../../src/controllers/postsController.js', () => {
        const createPostCtrl = (req: any, res: any) => res.status(201).json({
          called: 'createPost',
          validated: !!req.validated,
          gotImage: !!req._image,
          userId: req.user?.id ?? null,
        });
  
        const getAllPostsCtrl = (_req: any, res: any) => res.status(200).json({ called: 'getAllPosts' });
  
        const getSinglePostCtrl = (req: any, res: any) => res.status(200).json({ called: 'getSinglePost', validatedIdParam: req._validatedIdParam ?? null });
  
        const getPostCountCtrl = (req: any, res: any) => res.status(200).json({ called: 'getPostCount', admin: !!req.user?.isAdmin });
  
        const deletePostCtrl = (req: any, res: any) => res.status(200).json({ called: 'deletePost', userId: req.user?.id ?? null });
  
        const updatePostCtrl = (req: any, res: any) => res.status(200).json({ called: 'updatePost', validated: !!req.validated, userId: req.user?.id ?? null });
  
        const updatePostImageCtrl = (req: any, res: any) => res.status(200).json({
          called: 'updatePostImage',
          validatedIdParam: req._validatedIdParam ?? null,
          gotImage: !!req._image,
          userId: req.user?.id ?? null,
        });
        const toggleLikeCtrl = (req: any, res: any) => res.status(200).json({ called: 'toggleLike', validatedIdParam: req._validatedIdParam ?? null, userId: req.user?.id ?? null });
  
        return {
          __esModule: true,
          createPostCtrl,
          getAllPostsCtrl,
          getSinglePostCtrl,
          getPostCountCtrl,
          deletePostCtrl,
          updatePostCtrl,
          updatePostImageCtrl,
          toggleLikeCtrl,
        };
      }),
      jest.unstable_mockModule('../../src/middlewares/photoUpload.js', () => {
        const singleImage = (_fieldName = 'image') => (req: any, _res: any, next: any) => {
          req._image = true;
          next();
        };
        const multipleImages = (_f = 'images', _max = 5) => (_req: any, _res: any, next: any) => next();
  
        return { __esModule: true, singleImage, multipleImages };
      }),
      jest.unstable_mockModule('../../src/middlewares/verifyToken.js', () => {
        const verifyToken = (req: any, _res: any, next: any) => {
          req.user = { id: 'user-id', isAdmin: false };
          next();
        };
        const verifyTokenAndAdmin = (req: any, _res: any, next: any) => {
          req.user = { id: 'admin-id', isAdmin: true };
          next();
        };
  
        return { __esModule: true, verifyToken, verifyTokenAndAdmin };
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
      jest.unstable_mockModule('../../src/middlewares/validate.js', () => {
        const validate = (_schema: any) => {
          return (req: any, _res: any, next: any) => {
            req.validated = true;
            next();
          };
        };
        return { __esModule: true, validate };
      })
    ]);
  });

  test('POST / -> verifyToken, singleImage, validate, createPostCtrl', async () => {
    const mod = await import('../../src/routes/postsRoute.js');
    const router = mod.default;

    const app = express();
    app.use(express.json());
    app.use('/api/v1/posts', router);

    const res = await request(app)
      .post('/api/v1/posts')
      .send({ title: 't', description: 'long description ok', categoryId: '507f1f77bcf86cd799439011' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('called', 'createPost');
    expect(res.body).toHaveProperty('validated', true);
    expect(res.body).toHaveProperty('gotImage', true);
    expect(res.body).toHaveProperty('userId', 'user-id');
  });

  test('GET / -> getAllPostsCtrl', async () => {
    const mod = await import('../../src/routes/postsRoute.js');
    const router = mod.default;
    const app = express();
    app.use('/api/v1/posts', router);

    const res = await request(app).get('/api/v1/posts');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('called', 'getAllPosts');
  });

  test('GET /count -> verifyTokenAndAdmin + getPostCountCtrl', async () => {
    const mod = await import('../../src/routes/postsRoute.js');
    const router = mod.default;
    const app = express();
    app.use('/api/v1/posts', router);

    const res = await request(app).get('/api/v1/posts/count');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('called', 'getPostCount');
    expect(res.body).toHaveProperty('admin', true);
  });

  test('GET /:id -> validateObjectIdParam + getSinglePostCtrl', async () => {
    const mod = await import('../../src/routes/postsRoute.js');
    const router = mod.default;
    const app = express();
    app.use('/api/v1/posts', router);

    const id = '507f1f77bcf86cd799439011';
    const res = await request(app).get(`/api/v1/posts/${id}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('called', 'getSinglePost');
    expect(res.body).toHaveProperty('validatedIdParam', 'id');
  });

  test('DELETE /:id -> verifyToken + deletePostCtrl', async () => {
    const mod = await import('../../src/routes/postsRoute.js');
    const router = mod.default;
    const app = express();
    app.use(express.json());
    app.use('/api/v1/posts', router);

    const id = '507f1f77bcf86cd799439011';
    const res = await request(app).delete(`/api/v1/posts/${id}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('called', 'deletePost');
    expect(res.body).toHaveProperty('userId', 'user-id');
  });

  test('PATCH /:id -> verifyToken + validate + updatePostCtrl', async () => {
    const mod = await import('../../src/routes/postsRoute.js');
    const router = mod.default;
    const app = express();
    app.use(express.json());
    app.use('/api/v1/posts', router);

    const id = '507f1f77bcf86cd799439011';
    const res = await request(app)
      .patch(`/api/v1/posts/${id}`)
      .send({ title: 'New title' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('called', 'updatePost');
    expect(res.body).toHaveProperty('validated', true);
    expect(res.body).toHaveProperty('userId', 'user-id');
  });

  test('PATCH /update-image/:id -> validateObjectIdParam + verifyToken + singleImage + updatePostImageCtrl', async () => {
    const mod = await import('../../src/routes/postsRoute.js');
    const router = mod.default;
    const app = express();
    app.use(express.json());
    app.use('/api/v1/posts', router);

    const id = '507f1f77bcf86cd799439011';
    const res = await request(app).patch(`/api/v1/posts/update-image/${id}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('called', 'updatePostImage');
    expect(res.body).toHaveProperty('gotImage', true);
    expect(res.body).toHaveProperty('validatedIdParam', 'id');
    expect(res.body).toHaveProperty('userId', 'user-id');
  });

  test('PATCH /like/:id -> validateObjectIdParam + verifyToken + toggleLikeCtrl', async () => {
    const mod = await import('../../src/routes/postsRoute.js');
    const router = mod.default;
    const app = express();
    app.use('/api/v1/posts', router);

    const id = '507f1f77bcf86cd799439011';
    const res = await request(app).patch(`/api/v1/posts/like/${id}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('called', 'toggleLike');
    expect(res.body).toHaveProperty('validatedIdParam', 'id');
    expect(res.body).toHaveProperty('userId', 'user-id');
  });
});