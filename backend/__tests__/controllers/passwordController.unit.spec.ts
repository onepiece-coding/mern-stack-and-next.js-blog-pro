import { jest } from '@jest/globals';
import httpMocks from 'node-mocks-http';

describe('passwordController', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  /***********************
   * sendResetPasswordLinkCtrl
   ***********************/
  test('sendResetPasswordLinkCtrl -> user not found -> next called with 404', async () => {
    await Promise.all([
      jest.unstable_mockModule('../../src/models/User.js', () => ({
        __esModule: true,
        default: { findOne: (jest.fn() as any).mockResolvedValue(null) },
      })),
      jest.unstable_mockModule('../../src/models/VerificationToken.js', () => ({
        __esModule: true,
        default: Object.assign(jest.fn(), {
          findOne: jest.fn(),
          deleteOne: jest.fn(),
        }),
      })),
      jest.unstable_mockModule('../../src/utils/sendEmail.js', () => ({
        __esModule: true,
        default: jest.fn(),
      })),
      jest.unstable_mockModule('../../src/env.js', () => ({
        __esModule: true,
        env: { CLIENT_DOMAIN: 'https://example.test' } as any,
      }))
    ]);

    const mod = await import('../../src/controllers/passwordController.js');
    const { sendResetPasswordLinkCtrl } = mod;

    const req: any = httpMocks.createRequest({
      method: 'POST',
      body: { email: 'notfound@example.com' },
    });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await sendResetPasswordLinkCtrl(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0] as { status: number, statusCode: number, message: string};
    expect(err).toBeDefined();
    expect(err.status || err.statusCode).toBe(404);
    expect(String(err.message)).toMatch(/does not exist/);
  });

  test('sendResetPasswordLinkCtrl -> existing verification token -> sends email and returns 200', async () => {
    const fakeUser = { _id: 'u1', email: 'me@test' };
    const fakeToken = { token: 'tok123', _id: 't1' };

    const VT: any = Object.assign(
      jest.fn().mockImplementation((data: any) => ({ ...data, save: (jest.fn() as any).mockResolvedValue(undefined) })),
      {
        findOne: (jest.fn() as any).mockResolvedValue(fakeToken),
        deleteOne: (jest.fn() as any).mockResolvedValue(undefined),
      },
    );
    
    const sendEmailMock = (jest.fn() as any).mockResolvedValue(undefined);

    await Promise.all([
      jest.unstable_mockModule('../../src/models/User.js', () => ({
        __esModule: true,
        default: { findOne: (jest.fn() as any).mockResolvedValue(fakeUser) },
      })),
      jest.unstable_mockModule('../../src/models/VerificationToken.js', () => ({
        __esModule: true,
        default: VT,
      })),
      jest.unstable_mockModule('../../src/utils/sendEmail.js', () => ({
        __esModule: true,
        default: sendEmailMock,
      })),
      jest.unstable_mockModule('../../src/env.js', () => ({
        __esModule: true,
        env: { CLIENT_DOMAIN: 'https://example.test' } as any,
      }))
    ]);

    const mod = await import('../../src/controllers/passwordController.js');
    const { sendResetPasswordLinkCtrl } = mod;

    const req: any = httpMocks.createRequest({
      method: 'POST',
      body: { email: 'me@test' },
    });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await sendResetPasswordLinkCtrl(req, res, next);

    expect(sendEmailMock).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(200);
    const json = res._getJSONData();
    expect(json).toHaveProperty('message');
    expect(String(json.message)).toMatch(/Password reset link has been sent/);
  });

  test('sendResetPasswordLinkCtrl -> no existing token -> creates one, saves, sends email', async () => {
    const fakeUser = { _id: 'u2', email: 'you@test' };

    const VTConstructor = jest.fn().mockImplementation((data: any) => {
      return Object.assign({ ...data, _id: 'new-t', save: (jest.fn() as any).mockResolvedValue(undefined) });
    });
    (VTConstructor as any).findOne = (jest.fn() as any).mockResolvedValue(null);
    (VTConstructor as any).deleteOne = (jest.fn() as any).mockResolvedValue(undefined);

    const sendEmailMock = (jest.fn() as any).mockResolvedValue(undefined);

    await Promise.all([
      jest.unstable_mockModule('../../src/models/User.js', () => ({
        __esModule: true,
        default: { findOne: (jest.fn() as any).mockResolvedValue(fakeUser) },
      })),
      jest.unstable_mockModule('../../src/models/VerificationToken.js', () => ({
        __esModule: true,
        default: VTConstructor,
      })),
      jest.unstable_mockModule('../../src/utils/sendEmail.js', () => ({
        __esModule: true,
        default: sendEmailMock,
      })),
      jest.unstable_mockModule('../../src/env.js', () => ({
        __esModule: true,
        env: { CLIENT_DOMAIN: 'https://example.test' } as any,
      }))
    ]);

    const mod = await import('../../src/controllers/passwordController.js');
    const { sendResetPasswordLinkCtrl } = mod;

    const req: any = httpMocks.createRequest({
      method: 'POST',
      body: { email: 'you@test' },
    });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await sendResetPasswordLinkCtrl(req, res, next);

    expect(VTConstructor).toHaveBeenCalledTimes(1);
    expect(sendEmailMock).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toHaveProperty('message');
  });

  /***********************
   * getResetPasswordLinkCtrl
   ***********************/
  test('getResetPasswordLinkCtrl -> user not found -> 400', async () => {
    const VT: any = Object.assign(jest.fn(), { findOne: jest.fn() });

    await Promise.all([
      jest.unstable_mockModule('../../src/models/User.js', () => ({
        __esModule: true,
        default: { findById: (jest.fn() as any).mockResolvedValue(null) },
      })),
      jest.unstable_mockModule('../../src/models/VerificationToken.js', () => ({
        __esModule: true,
        default: VT,
      })),
      jest.unstable_mockModule('../../src/env.js', () => ({ __esModule: true, env: {} as any }))
    ]);

    const mod = await import('../../src/controllers/passwordController.js');
    const { getResetPasswordLinkCtrl } = mod;

    const req: any = httpMocks.createRequest({ method: 'GET', params: { userId: 'u-x', token: 't' } });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await getResetPasswordLinkCtrl(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0] as { status: number, statusCode: number, message: string};
    expect(err.status || err.statusCode).toBe(400);
    expect(String(err.message)).toMatch(/Invalid link/);
  });

  test('getResetPasswordLinkCtrl -> token missing -> 400', async () => {
    const fakeUser = { _id: 'u3' };
    const VT: any = Object.assign(jest.fn(), { findOne: (jest.fn() as any).mockResolvedValue(null) });

    await Promise.all([
      jest.unstable_mockModule('../../src/models/User.js', () => ({
        __esModule: true,
        default: { findById: (jest.fn() as any).mockResolvedValue(fakeUser) },
      })),
      jest.unstable_mockModule('../../src/models/VerificationToken.js', () => ({
        __esModule: true,
        default: VT,
      })),
      jest.unstable_mockModule('../../src/env.js', () => ({ __esModule: true, env: {} as any }))
    ]);

    const mod = await import('../../src/controllers/passwordController.js');
    const { getResetPasswordLinkCtrl } = mod;

    const req: any = httpMocks.createRequest({ method: 'GET', params: { userId: 'u3', token: 'nope' } });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await getResetPasswordLinkCtrl(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0] as { status: number, statusCode: number};
    expect(err.status || err.statusCode).toBe(400);
  });

  test('getResetPasswordLinkCtrl -> valid -> 200 "Valid url"', async () => {
    const fakeUser = { _id: 'u4' };
    const VT: any = Object.assign(jest.fn(), { findOne: (jest.fn() as any).mockResolvedValue({ token: 'ok' }) });

    await Promise.all([
      jest.unstable_mockModule('../../src/models/User.js', () => ({
        __esModule: true,
        default: { findById: (jest.fn() as any).mockResolvedValue(fakeUser) },
      })),
      jest.unstable_mockModule('../../src/models/VerificationToken.js', () => ({
        __esModule: true,
        default: VT,
      })),
      jest.unstable_mockModule('../../src/env.js', () => ({ __esModule: true, env: {} as any }))
    ]);

    const mod = await import('../../src/controllers/passwordController.js');
    const { getResetPasswordLinkCtrl } = mod;

    const req: any = httpMocks.createRequest({ method: 'GET', params: { userId: 'u4', token: 'ok' } });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await getResetPasswordLinkCtrl(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({ message: 'Valid url' });
  });

  /***********************
   * resetPasswordCtrl
   ***********************/
  test('resetPasswordCtrl -> user not found -> 400', async () => {
    const VT: any = Object.assign(jest.fn(), { findOne: jest.fn() });

    await Promise.all([
      jest.unstable_mockModule('../../src/models/User.js', () => ({
        __esModule: true,
        default: { findById: (jest.fn() as any).mockResolvedValue(null) },
      })),
      jest.unstable_mockModule('../../src/models/VerificationToken.js', () => ({
        __esModule: true,
        default: VT,
      })),
      jest.unstable_mockModule('../../src/env.js', () => ({ __esModule: true, env: {} as any }))
    ]);

    const mod = await import('../../src/controllers/passwordController.js');
    const { resetPasswordCtrl } = mod;

    const req: any = httpMocks.createRequest({ method: 'POST', params: { userId: 'u-n', token: 't' }, body: { password: 'P@ss1' } });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await resetPasswordCtrl(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0] as { status: number, statusCode: number};
    expect(err.status || err.statusCode).toBe(400);
  });

  test('resetPasswordCtrl -> missing token -> 400', async () => {
    const fakeUser: any = { _id: 'u5', isAccountVerified: false, save: (jest.fn() as any).mockResolvedValue(undefined) };
    const VT: any = Object.assign(jest.fn(), { findOne: (jest.fn() as any).mockResolvedValue(null) });
    (VT as any).deleteOne = jest.fn();

    await Promise.all([
      jest.unstable_mockModule('../../src/models/User.js', () => ({
        __esModule: true,
        default: { findById: (jest.fn() as any).mockResolvedValue(fakeUser) },
      })),
      jest.unstable_mockModule('../../src/models/VerificationToken.js', () => ({
        __esModule: true,
        default: VT,
      })),
      jest.unstable_mockModule('../../src/env.js', () => ({ __esModule: true, env: {} as any }))
    ]);

    const mod = await import('../../src/controllers/passwordController.js');
    const { resetPasswordCtrl } = mod;

    const req: any = httpMocks.createRequest({ method: 'POST', params: { userId: 'u5', token: 'nope' }, body: { password: 'New1!' } });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await resetPasswordCtrl(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0] as { status: number, statusCode: number};
    expect(err.status || err.statusCode).toBe(400);
  });

  test('resetPasswordCtrl -> valid reset: sets verified if needed, updates password, deletes token, returns 200', async () => {
    const foundToken = { _id: 't-deleted', token: 'tok' };
    const fakeUser: any = {
      _id: 'u6',
      isAccountVerified: false,
      save: (jest.fn() as any).mockResolvedValue(undefined),
    };
    
    const VTConstructor = jest.fn();
    (VTConstructor as any).findOne = (jest.fn() as any).mockResolvedValue(foundToken);
    (VTConstructor as any).deleteOne = (jest.fn() as any).mockResolvedValue(undefined);

    await Promise.all([
      jest.unstable_mockModule('../../src/models/User.js', () => ({
        __esModule: true,
        default: { findById: (jest.fn() as any).mockResolvedValue(fakeUser) },
      })),
      jest.unstable_mockModule('../../src/models/VerificationToken.js', () => ({
        __esModule: true,
        default: VTConstructor,
      })),
      jest.unstable_mockModule('../../src/env.js', () => ({ __esModule: true, env: {} as any }))
    ]);

    const mod = await import('../../src/controllers/passwordController.js');
    const { resetPasswordCtrl } = mod;

    const req: any = httpMocks.createRequest({
      method: 'POST',
      params: { userId: 'u6', token: 'tok' },
      body: { password: 'Strong1!' },
    });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await resetPasswordCtrl(req, res, next);

    expect(fakeUser.isAccountVerified).toBe(true);
    expect(fakeUser.password).toBe('Strong1!');
    expect(fakeUser.save).toHaveBeenCalled();
    expect((VTConstructor as any).deleteOne).toHaveBeenCalledWith({ _id: foundToken._id });
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({
      success: true,
      message: 'Passsword has been reset successfully, please log in',
    });
  });
});