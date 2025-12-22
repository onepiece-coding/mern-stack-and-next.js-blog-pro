import { jest } from '@jest/globals';

describe('src/server.ts (coverage additions)', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.resetModules();
    delete process.env.NODE_ENV;
    delete process.env.PORT;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    jest.restoreAllMocks();

    process.removeAllListeners('uncaughtException');
    process.removeAllListeners('unhandledRejection');
    process.removeAllListeners('SIGINT');
    process.removeAllListeners('SIGTERM');
  });

  test('top-level uncaughtException handler logs and calls process.exit(1)', async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'x'.repeat(32);

    const loggerErrorMock = jest.fn();

    await Promise.all([
      jest.unstable_mockModule('../src/env', () => ({ __esModule: true, env: { NODE_ENV: 'test', PORT: 1234 } as any })),
      jest.unstable_mockModule('../src/config/connectToDb', () => ({ __esModule: true, default: jest.fn() })),
      jest.unstable_mockModule('../src/app', () => ({ __esModule: true, default: { listen: jest.fn() } })),
      jest.unstable_mockModule('../src/utils/logger', () => ({
        __esModule: true,
        default: { info: jest.fn(), error: loggerErrorMock, warn: jest.fn(), debug: jest.fn() },
      })),
      jest.unstable_mockModule('mongoose', () => ({ __esModule: true, default: { disconnect: jest.fn() } })),
    ]);

    await import('../src/server.js');

    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(((_code?: string | number | null) => undefined) as any);

    const err = new Error('boom uncaught');
    (process as any).emit('uncaughtException', err);

    expect(loggerErrorMock).toHaveBeenCalledWith('Uncaught Exception', err);
    expect(exitSpy).toHaveBeenCalledWith(1);

    exitSpy.mockRestore();
  });

  test('top-level unhandledRejection handler logs and calls process.exit(1)', async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'x'.repeat(32);

    const loggerErrorMock = jest.fn();

    await Promise.all([
      jest.unstable_mockModule('../src/env', () => ({ __esModule: true, env: { NODE_ENV: 'test', PORT: 1234 } as any })),
      jest.unstable_mockModule('../src/config/connectToDb', () => ({ __esModule: true, default: jest.fn() })),
      jest.unstable_mockModule('../src/app', () => ({ __esModule: true, default: { listen: jest.fn() } })),
      jest.unstable_mockModule('../src/utils/logger', () => ({
        __esModule: true,
        default: { info: jest.fn(), error: loggerErrorMock, warn: jest.fn(), debug: jest.fn() },
      })),
      jest.unstable_mockModule('mongoose', () => ({ __esModule: true, default: { disconnect: jest.fn() } })),
    ]);

    await import('../src/server.js');

    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(((_code?: string | number | null) => undefined) as any);

    const rej = new Error('promise rejected');
    (process as any).emit('unhandledRejection', rej);

    expect(loggerErrorMock).toHaveBeenCalledWith('Unhandled Rejection', rej);
    expect(exitSpy).toHaveBeenCalledWith(1);

    exitSpy.mockRestore();
  });

  test('graceful shutdown: when mongoose.disconnect rejects, logger.error("Error disconnecting MongoDB", ...) is called and process.exit(0) still called', async () => {
    process.env.NODE_ENV = 'development';
    process.env.PORT = '4242';
    const fakeMongoUri = 'mongodb://127.0.0.1:27017/mydb';

    const loggerInfoMock = jest.fn();
    const loggerErrorMock = jest.fn();

    const serverCloseMock = (jest.fn() as any).mockImplementation((cb: (err?: Error) => void) => cb());

    const mongooseDisconnectMock = (jest.fn() as any).mockRejectedValue(new Error('disconnect fail'));

    const connectToDBMock = (jest.fn() as any).mockResolvedValue(undefined);

    const appListenMock = (jest.fn() as any).mockImplementation((_port: number, cb?: () => void) => {
      if (cb) cb();
      return { close: serverCloseMock };
    });

    await Promise.all([
      jest.unstable_mockModule('../src/env', () => ({
        __esModule: true,
        env: { NODE_ENV: 'development', PORT: Number(process.env.PORT), MONGO_URI: fakeMongoUri } as any,
      })),
      jest.unstable_mockModule('../src/config/connectToDb', () => ({ __esModule: true, default: connectToDBMock })),
      jest.unstable_mockModule('../src/app', () => ({ __esModule: true, default: { listen: appListenMock } })),
      jest.unstable_mockModule('../src/utils/logger', () => ({
        __esModule: true,
        default: { info: loggerInfoMock, error: loggerErrorMock, warn: jest.fn(), debug: jest.fn() },
      })),
      jest.unstable_mockModule('mongoose', () => ({ __esModule: true, default: { disconnect: mongooseDisconnectMock } })),
    ]);

    await import('../src/server.js');

    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(((_code?: string | number | null) => undefined) as any);

    const listeners = process.listeners('SIGINT');
    expect(listeners.length).toBeGreaterThanOrEqual(1);
    const sigHandler = listeners[listeners.length - 1];
    await Promise.resolve((sigHandler as any)());

    expect(serverCloseMock).toHaveBeenCalled();
    expect(mongooseDisconnectMock).toHaveBeenCalled();
    expect(loggerErrorMock.mock.calls.some((args) => String(args[0]).includes('Error disconnecting MongoDB'))).toBeTruthy();
    expect(exitSpy).toHaveBeenCalledWith(0);

    exitSpy.mockRestore();
  });
});