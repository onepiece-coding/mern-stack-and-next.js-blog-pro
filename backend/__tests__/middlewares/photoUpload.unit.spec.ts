import { jest } from '@jest/globals';
import type { Request } from 'express';
import {
  imageFileFilter,
  DEFAULT_LIMITS,
  photoUpload,
  singleImage,
  multipleImages,
} from '../../src/middlewares/photoUpload.js';

describe('photoUpload middleware file', () => {
  test('imageFileFilter accepts image mimetypes and calls cb(null, true)', () => {
    const req = {} as Request;
    const file = { mimetype: 'image/png' } as Express.Multer.File;
    const cb = jest.fn();

    imageFileFilter(req, file, cb);

    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb.mock.calls[0][0]).toBeNull();
    expect(cb.mock.calls[0][1]).toBe(true);
  });

  test('imageFileFilter rejects non-image mimetypes with an Error', () => {
    const req = {} as Request;
    const file = { mimetype: 'text/plain' } as Express.Multer.File;
    const cb = jest.fn();

    imageFileFilter(req, file, cb);

    expect(cb).toHaveBeenCalledTimes(1);
    const arg0 = cb.mock.calls[0][0];
    expect(arg0).toBeInstanceOf(Error);
    expect((arg0 as Error).message).toBe(
      'Unsupported file format. Only images are allowed.',
    );
  });

  test('imageFileFilter tolerates missing mimetype (treat as non-image)', () => {
    const req = {} as Request;
    const file = ({ } as unknown) as Express.Multer.File;
    const cb = jest.fn();

    imageFileFilter(req, file, cb);

    expect(cb).toHaveBeenCalledTimes(1);
    const arg0 = cb.mock.calls[0][0];
    expect(arg0).toBeInstanceOf(Error);
  });

  test('DEFAULT_LIMITS is 1MB fileSize', () => {
    expect(DEFAULT_LIMITS).toEqual({ fileSize: 1 * 1024 * 1024 });
  });

  test('photoUpload instance exposes .single and .array functions', () => {
    expect(typeof (photoUpload as any).single).toBe('function');
    expect(typeof (photoUpload as any).array).toBe('function');
  });

  test('singleImage and multipleImages return middleware functions', () => {
    const singleMw = singleImage('image');
    const multiMw = multipleImages('images', 3);

    expect(typeof singleMw).toBe('function');
    expect(typeof multiMw).toBe('function');
  });

  test('default export object contains expected properties', async () => {
    const module = await import('../../src/middlewares/photoUpload.js');
    const def = module.default;
    expect(def).toHaveProperty('photoUpload');
    expect(def).toHaveProperty('singleImage');
    expect(def).toHaveProperty('multipleImages');
    expect(typeof def.singleImage).toBe('function');
    expect(typeof def.multipleImages).toBe('function');
  });
});