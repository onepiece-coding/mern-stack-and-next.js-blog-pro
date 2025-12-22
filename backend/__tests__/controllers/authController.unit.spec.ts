import { jest } from '@jest/globals';
import httpMocks from 'node-mocks-http';

describe('authController', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  // ---------- Helpers to build mock model classes ----------
  function makeMockUserClass() {
    class MockUser {
      _id: string;
      username?: string;
      email?: string;
      password?: string;
      isAccountVerified?: boolean;
      isAdmin?: boolean;
      comparePassword = (jest.fn() as any).mockResolvedValue(true);
      constructor(data?: any) {
        Object.assign(this, data);
        this._id = (data && data._id) || 'mock-user-id';
      }
      save = jest.fn().mockImplementation(async function (this: any) {
        return this;
      });
      static findOne = jest.fn();
      static countDocuments = jest.fn();
      static findById = jest.fn();
    }
    return MockUser as any;
  }

  function makeMockVerificationTokenClass() {
    class MockToken {
      _id: string;
      userId: string;
      token: string;
      constructor(data?: any) {
        Object.assign(this, data);
        this._id = (data && data._id) || 'mock-token-id';
        this.userId = (data && data.userId) || '';
        this.token = (data && data.token) || '';
      }
      save = (jest.fn() as any).mockResolvedValue(undefined);
      static findOne = jest.fn();
      static deleteOne = (jest.fn() as any).mockResolvedValue(undefined);
    }
    return MockToken as any;
  }

  test('registerUserCtrl: existing user -> returns 400 "User already exists!"', async () => {
    const MockUser = makeMockUserClass();
    MockUser.findOne.mockResolvedValue({ _id: 'u1', email: 'x@x.com' });

    await Promise.all([
      jest.unstable_mockModule('../../src/models/User.js', () => ({
        __esModule: true,
        default: MockUser,
      })),
      jest.unstable_mockModule('../../src/models/VerificationToken.js', () => ({
        __esModule: true,
        default: makeMockVerificationTokenClass(),
      })),
      jest.unstable_mockModule('../../src/utils/sendEmail.js', () => ({
        __esModule: true,
        default: (jest.fn() as any).mockResolvedValue('ok'),
        sendEmail: (jest.fn() as any).mockResolvedValue('ok'),
      })),
      jest.unstable_mockModule('../../src/env.js', () => ({
        __esModule: true,
        env: { CLIENT_DOMAIN: 'https://example.test' } as any,
      }))
    ]);

    const mod = await import('../../src/controllers/authController.js');
    const { registerUserCtrl } = mod;

    const req: any = httpMocks.createRequest({
      method: 'POST',
      body: { username: 'u', email: 'x@x.com', password: 'P@ssw0rd' },
    });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await registerUserCtrl(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0] as { status: number, statusCode: number, message: string};
    expect(err).toBeDefined();
    expect(err.status || err.statusCode).toBe(400);
    expect(String(err.message)).toMatch(/User already exists/i);
  });

  test('registerUserCtrl: creates first user (isAdmin=true), saves token and calls sendEmail, returns 201', async () => {
    const MockUser = makeMockUserClass();
    MockUser.findOne.mockResolvedValue(null);
    MockUser.countDocuments.mockResolvedValue(0);

    const MockToken = makeMockVerificationTokenClass();

    const sendEmailMock = (jest.fn() as any).mockResolvedValue('preview-url');

    await Promise.all([
      jest.unstable_mockModule('../../src/models/User.js', () => ({
        __esModule: true,
        default: MockUser,
      })),
      jest.unstable_mockModule('../../src/models/VerificationToken.js', () => ({
        __esModule: true,
        default: MockToken,
      })),
      jest.unstable_mockModule('../../src/utils/sendEmail.js', () => ({
        __esModule: true,
        default: sendEmailMock,
        sendEmail: sendEmailMock,
      })),
      jest.unstable_mockModule('../../src/env.js', () => ({
        __esModule: true,
        env: { CLIENT_DOMAIN: 'https://example.test' } as any,
      }))
    ]);

    const mod = await import('../../src/controllers/authController.js');
    const { registerUserCtrl } = mod;

    const req: any = httpMocks.createRequest({
      method: 'POST',
      body: { username: 'alice', email: 'alice@example.com', password: 'Strong1!' },
    });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await registerUserCtrl(req, res, next);

    expect(next).not.toHaveBeenCalled();

    expect(res.statusCode).toBe(201);
    const data = res._getJSONData();
    expect(data).toHaveProperty('message');
    expect(data.message).toMatch(/verification link/i);
    expect(MockUser.countDocuments).toHaveBeenCalled();
    expect(sendEmailMock).toHaveBeenCalled();
  });

  test('loginUserCtrl: invalid credentials -> 400 "Invalid Credentials!"', async () => {
    const MockUser = makeMockUserClass();
    MockUser.findOne.mockResolvedValue(null);

    await Promise.all([
      jest.unstable_mockModule('../../src/models/User.js', () => ({
        __esModule: true,
        default: MockUser,
      })),
      jest.unstable_mockModule('../../src/models/VerificationToken.js', () => ({
        __esModule: true,
        default: makeMockVerificationTokenClass(),
      })),
      jest.unstable_mockModule('../../src/utils/sendEmail.js', () => ({
        __esModule: true,
        default: (jest.fn() as any).mockResolvedValue('ok'),
      })),
      jest.unstable_mockModule('../../src/env.js', () => ({
        __esModule: true,
        env: { JWT_SECRET: 'x'.repeat(32) } as any,
      }))
    ]);

    const mod = await import('../../src/controllers/authController.js');
    const { loginUserCtrl } = mod;

    const req: any = httpMocks.createRequest({
      method: 'POST',
      body: { email: 'noone@example.com', password: 'whatever' },
    });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await loginUserCtrl(req, res, next);

    expect(next).toHaveBeenCalled();
    const err = next.mock.calls[0][0] as { status: number, statusCode: number, message: string};
    expect(err).toBeDefined();
    expect(err.status || err.statusCode).toBe(400);
    expect(String(err.message)).toMatch(/Invalid Credentials/i);
  });

  test('loginUserCtrl: unverified user -> creates token if missing, calls sendEmail and returns 400', async () => {
    const MockUser = makeMockUserClass();
    const userInstance = new MockUser({ _id: 'u1', email: 'u1@example.com', isAccountVerified: false });
    userInstance.comparePassword = (jest.fn() as any).mockResolvedValue(true);
    MockUser.findOne.mockResolvedValue(userInstance);

    const MockToken = makeMockVerificationTokenClass();
    MockToken.findOne.mockResolvedValue(null);

    const sendEmailMock = (jest.fn() as any).mockResolvedValue('preview-url');

    await Promise.all([
      jest.unstable_mockModule('../../src/models/User.js', () => ({
        __esModule: true,
        default: MockUser,
      })),
      jest.unstable_mockModule('../../src/models/VerificationToken.js', () => ({
        __esModule: true,
        default: MockToken,
      })),
      jest.unstable_mockModule('../../src/utils/sendEmail.js', () => ({
        __esModule: true,
        default: sendEmailMock,
        sendEmail: sendEmailMock,
      })),
      jest.unstable_mockModule('../../src/env.js', () => ({
        __esModule: true,
        env: { CLIENT_DOMAIN: 'https://client.test', JWT_SECRET: 'x'.repeat(32) } as any,
      }))
    ]);

    const mod = await import('../../src/controllers/authController.js');
    const { loginUserCtrl } = mod;

    const req: any = httpMocks.createRequest({
      method: 'POST',
      body: { email: 'u1@example.com', password: 'Strong1!' },
    });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await loginUserCtrl(req, res, next);

    expect(res.statusCode).toBe(400);
    const data = res._getJSONData();
    expect(data).toHaveProperty('message');
    expect(String(data.message)).toMatch(/verification link/i);

    expect(sendEmailMock).toHaveBeenCalled();
    expect(MockToken.findOne).toHaveBeenCalled();
  });

  test('loginUserCtrl: verified user -> jwt.sign called and returns token + user', async () => {
    const MockUser = makeMockUserClass();
    const userInstance = new MockUser({ _id: 'u-verified', email: 'v@example.com', isAccountVerified: true, isAdmin: false });
    userInstance.comparePassword = (jest.fn() as any).mockResolvedValue(true);
    MockUser.findOne.mockResolvedValue(userInstance);

    const jwtSignMock = jest.fn().mockReturnValue('signed-token-123');

    await Promise.all([
      jest.unstable_mockModule('../../src/models/User.js', () => ({
        __esModule: true,
        default: MockUser,
      })),
      jest.unstable_mockModule('jsonwebtoken', () => ({
        __esModule: true,
        default: { sign: jwtSignMock },
        sign: jwtSignMock,
      })),
      jest.unstable_mockModule('../../src/env.js', () => ({
        __esModule: true,
        env: { JWT_SECRET: 'x'.repeat(32) } as any,
      }))
    ]);

    const mod = await import('../../src/controllers/authController.js');
    const { loginUserCtrl } = mod;

    const req: any = httpMocks.createRequest({
      method: 'POST',
      body: { email: 'v@example.com', password: 'Strong1!' },
    });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await loginUserCtrl(req, res, next);

    expect(res.statusCode).toBe(200);
    const data = res._getJSONData();
    expect(data).toHaveProperty('token', 'signed-token-123');
    expect(data).toHaveProperty('user');
    expect(data.user.email).toBe('v@example.com');
    expect(jwtSignMock).toHaveBeenCalled();
  });

  test('logoutUserCtrl: clears cookies and returns 200', async () => {
    await Promise.all([
      jest.unstable_mockModule('../../src/env.js', () => ({
        __esModule: true,
        env: { NODE_ENV: 'test' } as any,
      }))
    ]);
    const mod = await import('../../src/controllers/authController.js');
    const { logoutUserCtrl } = mod;

    const req: any = httpMocks.createRequest();
    const res: any = httpMocks.createResponse();
    res.clearCookie = jest.fn();

    const next = jest.fn();

    await logoutUserCtrl(req, res, next);

    expect(res.clearCookie).toHaveBeenCalled();
    expect(res._getJSONData()).toHaveProperty('message', 'Logged out successfully');
    expect(res.statusCode).toBe(200);
  });

  test('verifyUserAccountCtrl: user not found -> 400 "Invalid link"', async () => {
    const MockUser = makeMockUserClass();
    MockUser.findById.mockResolvedValue(null);

    await Promise.all([
      jest.unstable_mockModule('../../src/models/User.js', () => ({
        __esModule: true,
        default: MockUser,
      })),
      jest.unstable_mockModule('../../src/models/VerificationToken.js', () => ({
        __esModule: true,
        default: makeMockVerificationTokenClass(),
      })),
      jest.unstable_mockModule('../../src/env.js', () => ({
        __esModule: true,
        env: {} as any,
      }))
    ]);

    const mod = await import('../../src/controllers/authController.js');
    const { verifyUserAccountCtrl } = mod;

    const req: any = httpMocks.createRequest({
      method: 'GET',
      params: { userId: 'nonexistent', token: 'tok' },
    });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await verifyUserAccountCtrl(req, res, next);

    expect(next).toHaveBeenCalled();
    const err = next.mock.calls[0][0] as { message: string};
    expect(err).toBeDefined();
    expect(String(err.message)).toMatch(/Invalid link/);
  });

  test('verifyUserAccountCtrl: token not found -> 400 "Invalid link"', async () => {
    const MockUser = makeMockUserClass();
    MockUser.findById.mockResolvedValue({ _id: 'u1', email: 'u1@example.com', isAccountVerified: false });

    const MockToken = makeMockVerificationTokenClass();
    MockToken.findOne.mockResolvedValue(null);

    await Promise.all([
      jest.unstable_mockModule('../../src/models/User.js', () => ({
        __esModule: true,
        default: MockUser,
      })),
      jest.unstable_mockModule('../../src/models/VerificationToken.js', () => ({
        __esModule: true,
        default: MockToken,
      })),
      jest.unstable_mockModule('../../src/env.js', () => ({
        __esModule: true,
        env: {} as any,
      }))
    ]);

    const mod = await import('../../src/controllers/authController.js');
    const { verifyUserAccountCtrl } = mod;

    const req: any = httpMocks.createRequest({
      method: 'GET',
      params: { userId: 'u1', token: 'notfound' },
    });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await verifyUserAccountCtrl(req, res, next);

    expect(next).toHaveBeenCalled();
    const err = next.mock.calls[0][0] as { message: string};
    expect(err).toBeDefined();
    expect(String(err.message)).toMatch(/Invalid link/);
  });

  test('verifyUserAccountCtrl: success -> verifies account, deletes token, returns 200', async () => {
    const MockUser = makeMockUserClass();
    const userInstance = new MockUser({ _id: 'u-ok', isAccountVerified: false });
    userInstance.save = (jest.fn() as any).mockResolvedValue(userInstance);
    MockUser.findById.mockResolvedValue(userInstance);

    const MockToken = makeMockVerificationTokenClass();
    MockToken.findOne.mockResolvedValue({ _id: 'tok1', userId: 'u-ok', token: 'abc' });
    MockToken.deleteOne.mockResolvedValue({ deletedCount: 1 });

    await Promise.all([
      jest.unstable_mockModule('../../src/models/User.js', () => ({
        __esModule: true,
        default: MockUser,
      })),
      jest.unstable_mockModule('../../src/models/VerificationToken.js', () => ({
        __esModule: true,
        default: MockToken,
      })),
      jest.unstable_mockModule('../../src/env.js', () => ({
        __esModule: true,
        env: {} as any,
      }))
    ]);

    const mod = await import('../../src/controllers/authController.js');
    const { verifyUserAccountCtrl } = mod;

    const req: any = httpMocks.createRequest({
      method: 'GET',
      params: { userId: 'u-ok', token: 'abc' },
    });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await verifyUserAccountCtrl(req, res, next);

    expect(res.statusCode).toBe(200);
    const data = res._getJSONData();
    expect(data).toHaveProperty('success', true);
    expect(String(data.message)).toMatch(/verified/i);

    expect(userInstance.save).toHaveBeenCalled();
    expect(MockToken.deleteOne).toHaveBeenCalledWith({ _id: 'tok1' });
  });
});