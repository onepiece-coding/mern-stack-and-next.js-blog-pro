import { jest } from '@jest/globals';

describe('sendEmail util (100% coverage)', () => {
  let createTestAccountMock: jest.Mock;
  let createTransportMock: jest.Mock;
  let getTestMessageUrlMock: jest.Mock;
  let transportSendMailMock: jest.Mock;
  let transportVerifyMock: jest.Mock;
  let loggerInfoMock: jest.Mock;
  let loggerErrorMock: jest.Mock;

  beforeEach(() => {
    jest.resetModules();

    createTestAccountMock = jest.fn();
    createTransportMock = jest.fn();
    getTestMessageUrlMock = jest.fn();
    transportSendMailMock = jest.fn();
    transportVerifyMock = jest.fn();
    loggerInfoMock = jest.fn();
    loggerErrorMock = jest.fn();

    delete process.env.APP_EMAIL_PASSWORD;
  });

  afterEach(() => {
    delete process.env.APP_EMAIL_PASSWORD;
  });

  test('test env: returns preview URL and caches transporter (createTestAccount/createTransport called once)', async () => {
    const fakeTestAccount = {
      smtp: { host: 'smtp.test', port: 587, secure: false },
      user: 'user',
      pass: 'pass',
    };
    createTestAccountMock = (jest.fn() as any).mockResolvedValue(fakeTestAccount);

    transportSendMailMock = (jest.fn() as any).mockResolvedValue({ messageId: 'msg-1' });
    const fakeTransporter = { sendMail: transportSendMailMock };
    createTransportMock.mockReturnValue(fakeTransporter);

    getTestMessageUrlMock.mockReturnValue('https://ethereal.mock/msg-1');

    await Promise.all([
      jest.unstable_mockModule('nodemailer', () => {
        const exported = {
          createTestAccount: createTestAccountMock,
          createTransport: createTransportMock,
          getTestMessageUrl: getTestMessageUrlMock,
        };
        return { __esModule: true, default: exported, ...exported };
      }),
      jest.unstable_mockModule('../../src/env.js', () => ({
        __esModule: true,
        env: { NODE_ENV: 'test', APP_EMAIL_ADDRESS: undefined } as any,
      })),
      jest.unstable_mockModule('../../src/utils/logger.js', () => ({
        __esModule: true,
        default: {
          info: loggerInfoMock,
          error: loggerErrorMock,
          warn: jest.fn(),
          debug: jest.fn(),
        },
      }))
    ]);

    const { default: sendEmail } = await import('../../src/utils/sendEmail.js');

    const payload = { to: 'a@b.com', subject: 's', html: '<p>x</p>' };

    const first = await sendEmail(payload);
    const second = await sendEmail(payload);

    expect(first).toBe('https://ethereal.mock/msg-1');
    expect(second).toBe('https://ethereal.mock/msg-1');

    expect(createTestAccountMock).toHaveBeenCalledTimes(1);
    expect(createTransportMock).toHaveBeenCalledTimes(1);

    expect(transportSendMailMock).toHaveBeenCalledTimes(2);

    expect(getTestMessageUrlMock).toHaveBeenCalledTimes(2);
  });

  test('non-test env with transporterOverride: uses override and returns SentMessageInfo; logs info', async () => {
    const transporterOverride = {
      sendMail: (jest.fn() as any).mockResolvedValue({
        messageId: 'override-1',
        accepted: ['ok'],
        rejected: [],
      }),
    }

    await Promise.all([
      jest.unstable_mockModule('nodemailer', () => {
        const exported = {
          createTransport: jest.fn(),
          createTestAccount: jest.fn(),
          getTestMessageUrl: jest.fn(),
        };
        return { __esModule: true, default: exported, ...exported };
      }),
      jest.unstable_mockModule('../../src/env.js', () => ({
        __esModule: true,
        env: { NODE_ENV: 'development', APP_EMAIL_ADDRESS: 'me@example.com' } as any,
      })),
      jest.unstable_mockModule('../../src/utils/logger.js', () => ({
        __esModule: true,
        default: {
          info: loggerInfoMock,
          error: loggerErrorMock,
          warn: jest.fn(),
          debug: jest.fn(),
        },
      }))
    ]);

    const { default: sendEmail } = await import('../../src/utils/sendEmail.js');

    const out = await sendEmail({ to: 'to@x.com', subject: 'hi', html: '<b>ok</b>' }, transporterOverride as any);

    expect(out).toEqual(expect.objectContaining({ messageId: 'override-1' }));
    expect(transporterOverride.sendMail).toHaveBeenCalledTimes(1);
    expect(loggerInfoMock).toHaveBeenCalled();
  });

  test('test env: when transporter.sendMail rejects -> logger.error called and new Error thrown', async () => {
    createTestAccountMock = (jest.fn() as any).mockResolvedValue({
      smtp: { host: 's', port: 587, secure: false },
      user: 'u',
      pass: 'p',
    });
    transportSendMailMock = (jest.fn() as any).mockRejectedValue(new Error('SMTP broken'));
    const failingTransporter = { sendMail: transportSendMailMock };
    createTransportMock.mockReturnValue(failingTransporter);
    getTestMessageUrlMock.mockReturnValue(null);

    await Promise.all([
      jest.unstable_mockModule('nodemailer', () => {
        const exported = {
          createTestAccount: createTestAccountMock,
          createTransport: createTransportMock,
          getTestMessageUrl: getTestMessageUrlMock,
        };
        return { __esModule: true, default: exported, ...exported };
      }),
      jest.unstable_mockModule('../../src/env.js', () => ({
        __esModule: true,
        env: { NODE_ENV: 'test' } as any,
      })),
      jest.unstable_mockModule('../../src/utils/logger.js', () => ({
        __esModule: true,
        default: {
          info: loggerInfoMock,
          error: loggerErrorMock,
          warn: jest.fn(),
          debug: jest.fn(),
        },
      }))
    ]);

    const { default: sendEmail } = await import('../../src/utils/sendEmail.js');

    await expect(sendEmail({ to: 'a@b.com', subject: 's', html: 'h' })).rejects.toThrow(
      'Internal Server Error (email send)',
    );
    expect(loggerErrorMock).toHaveBeenCalled();
  });

  test('non-test env: getTransporter throws when email config missing', async () => {
    await Promise.all([
      jest.unstable_mockModule('nodemailer', () => {
        const exported = {
          createTransport: jest.fn(),
          createTestAccount: jest.fn(),
          getTestMessageUrl: jest.fn(),
        };
        return { __esModule: true, default: exported, ...exported };
      }),
      jest.unstable_mockModule('../../src/env.js', () => ({
        __esModule: true,
        env: { NODE_ENV: 'development', APP_EMAIL_ADDRESS: undefined } as any,
      })),
      jest.unstable_mockModule('../../src/utils/logger.js', () => ({
        __esModule: true,
        default: {
          info: loggerInfoMock,
          error: loggerErrorMock,
          warn: jest.fn(),
          debug: jest.fn(),
        },
      }))
    ]);

    const { default: sendEmail } = await import('../../src/utils/sendEmail.js');

    await expect(sendEmail({ to: 'a@b.com', subject: 's', html: 'h' })).rejects.toThrow(
      'Email is not configured: set APP_EMAIL_ADDRESS and APP_EMAIL_PASSWORD',
    );
  });

  test('non-test env: getTransporter uses createTransport and verifies transporter (full non-test success path)', async () => {
    process.env.APP_EMAIL_PASSWORD = 'pw';

    transportVerifyMock = (jest.fn() as any).mockResolvedValue(true);
    transportSendMailMock = (jest.fn() as any).mockResolvedValue({ messageId: 'prod-msg', accepted: ['a'] });
    const prodTransporter = { verify: transportVerifyMock, sendMail: transportSendMailMock };

    await Promise.all([
      jest.unstable_mockModule('nodemailer', () => {
        const exported = {
          createTransport: createTransportMock.mockReturnValue(prodTransporter),
          createTestAccount: jest.fn(),
          getTestMessageUrl: jest.fn(),
        };
        return { __esModule: true, default: exported, ...exported };
      }),
      jest.unstable_mockModule('../../src/env.js', () => ({
        __esModule: true,
        env: { NODE_ENV: 'production', APP_EMAIL_ADDRESS: 'me@p.com' } as any,
      })),
      jest.unstable_mockModule('../../src/utils/logger.js', () => ({
        __esModule: true,
        default: {
          info: loggerInfoMock,
          error: loggerErrorMock,
          warn: jest.fn(),
          debug: jest.fn(),
        },
      }))
    ]);

    const { default: sendEmail } = await import('../../src/utils/sendEmail.js');

    const res = await sendEmail({ to: 'to@p.com', subject: 'hello', html: '<i>ok</i>' });

    expect(res).toEqual(expect.objectContaining({ messageId: 'prod-msg' }));
    expect(createTransportMock).toHaveBeenCalledTimes(1);
    expect(transportVerifyMock).toHaveBeenCalledTimes(1);
    expect(transportSendMailMock).toHaveBeenCalledTimes(1);
    expect(loggerInfoMock).toHaveBeenCalled();
  });
});