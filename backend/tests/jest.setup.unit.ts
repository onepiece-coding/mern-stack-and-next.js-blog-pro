import logger from '../src/utils/logger.js';
import { jest } from "@jest/globals";

beforeAll(() => {
  jest.spyOn(logger, 'info').mockImplementation(() => {});
  jest.spyOn(logger, 'warn').mockImplementation(() => {});
  jest.spyOn(logger, 'error').mockImplementation(() => {});
  jest.spyOn(logger, 'debug').mockImplementation(() => {});
});

afterAll(() => {
  (logger.info as jest.Mock).mockRestore?.();
  (logger.warn as jest.Mock).mockRestore?.();
  (logger.error as jest.Mock).mockRestore?.();
  (logger.debug as jest.Mock).mockRestore?.();
});

// Only call jest helpers if they exist in this runtime.
if (typeof globalThis.jest !== 'undefined') {
  // jest.setTimeout is not necessary if you set testTimeout in jest config.
  // but if present we can set it:
  if (typeof globalThis.jest.setTimeout === 'function') {
    globalThis.jest.setTimeout(10000);
  }
}

// Reset mocks after each test, but guard against missing jest global.
if (typeof globalThis.afterEach !== 'undefined') {
  afterEach(() => {
    if (typeof globalThis.jest !== 'undefined') {
      globalThis.jest.resetAllMocks();
      globalThis.jest.restoreAllMocks();
    }
  });
}