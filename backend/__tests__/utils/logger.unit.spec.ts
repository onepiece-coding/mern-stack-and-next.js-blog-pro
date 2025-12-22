import { jest } from '@jest/globals';
import defaultLogger, { logger as namedLogger } from '../../src/utils/logger.js';

afterEach(() => {
  if (typeof jest !== 'undefined' && typeof jest.restoreAllMocks === 'function') {
    jest.restoreAllMocks();
  }
});

describe('logger wrapper', () => {
  test('default export equals named export', () => {
    expect(defaultLogger).toBe(namedLogger);
  });

  test('info forwards arguments to console.info', () => {
    const spy = jest.spyOn(console, 'info').mockImplementation(() => {});
    defaultLogger.info('a', 123, { ok: true });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('a', 123, { ok: true });
  });

  test('warn forwards arguments to console.warn and works with no args', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    defaultLogger.warn('warning', { code: 42 });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('warning', { code: 42 });

    defaultLogger.warn();
    expect(spy).toHaveBeenCalledTimes(2);
  });

  test('error forwards arguments to console.error', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const err = new Error('boom');
    defaultLogger.error('err', err);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('err', err);
  });

  test('debug forwards arguments to console.debug', () => {
    const spy = jest.spyOn(console, 'debug').mockImplementation(() => {});
    defaultLogger.debug('d', 999);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('d', 999);
  });
});