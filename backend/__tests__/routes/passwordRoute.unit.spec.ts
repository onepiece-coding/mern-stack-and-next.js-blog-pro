import { jest } from '@jest/globals';
import express from 'express';
import request from 'supertest';

describe('passwordRoute', () => {
  beforeAll(async () => {
    jest.resetModules();

    // mock controllers
    await Promise.all([
      jest.unstable_mockModule('../../src/controllers/passwordController.js', () => {
        const sendResetPasswordLinkCtrl = (req: any, res: any) => res.status(200).json({ called: 'sendReset', validated: !!req.validated });
  
        const getResetPasswordLinkCtrl = (req: any, res: any) => res.status(200).json({ called: 'getReset', validatedIdParam: req._validatedIdParam ?? null });
  
        const resetPasswordCtrl = (req: any, res: any) => res.status(200).json({
          called: 'resetPassword',
          validated: !!req.validated,
          validatedIdParam: req._validatedIdParam ?? null,
        });
  
        return {
          __esModule: true,
          sendResetPasswordLinkCtrl,
          getResetPasswordLinkCtrl,
          resetPasswordCtrl,
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

  test('POST /reset-password-link uses validate() and calls sendResetPasswordLinkCtrl', async () => {
    const mod = await import('../../src/routes/passwordRoute.js');
    const router = mod.default;

    const app = express();
    app.use(express.json());
    app.use('/api/v1/password', router);

    const res = await request(app)
      .post('/api/v1/password/reset-password-link')
      .send({ email: 'me@example.com' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('called', 'sendReset');
    expect(res.body).toHaveProperty('validated', true);
  });

  test('GET /reset-password/:userId/:token runs validateObjectIdParam and calls getResetPasswordLinkCtrl', async () => {
    const mod = await import('../../src/routes/passwordRoute.js');
    const router = mod.default;

    const app = express();
    app.use(express.json());
    app.use('/api/v1/password', router);

    const userId = '507f1f77bcf86cd799439011';
    const token = 'sometoken';

    const res = await request(app).get(`/api/v1/password/reset-password/${userId}/${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('called', 'getReset');
    expect(res.body).toHaveProperty('validatedIdParam', 'userId');
  });

  test('POST /reset-password/:userId/:token runs validateObjectIdParam + validate(newPassword) and calls resetPasswordCtrl', async () => {
    const mod = await import('../../src/routes/passwordRoute.js');
    const router = mod.default;

    const app = express();
    app.use(express.json());
    app.use('/api/v1/password', router);

    const userId = '507f1f77bcf86cd799439011';
    const token = 'sometoken';

    const res = await request(app)
      .post(`/api/v1/password/reset-password/${userId}/${token}`)
      .send({ password: 'Strong1!' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('called', 'resetPassword');
    expect(res.body).toHaveProperty('validated', true);
    expect(res.body).toHaveProperty('validatedIdParam', 'userId');
  });
});