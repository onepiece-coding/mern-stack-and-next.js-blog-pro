import { jest } from '@jest/globals';
import { PassThrough } from 'stream';
import { uploadBufferToCloudinary, removeImage, removeMultipleImages } from '../../src/utils/cloudinary.js';

describe('cloudinary utils', () => {
  const exampleBuffer = Buffer.from('hello world');

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  test('uploadBufferToCloudinary - resolves with upload result on success', async () => {
    const fakeResult = { secure_url: 'https://example.com/img.jpg', public_id: 'pid' };

    const uploaderFactory = (_opts: any, cb: (err?: any, res?: any) => void) => {
      const writable = new PassThrough();
      writable.on('finish', () => {
        cb(undefined, fakeResult);
      });
      return writable;
    };

    const res = await uploadBufferToCloudinary(exampleBuffer, { folder: 'posts' }, {} as any, uploaderFactory);
    expect(res).toEqual(fakeResult);
  });

  test('uploadBufferToCloudinary - rejects when uploader reports error', async () => {
    const uploaderErr = new Error('uploader failed');
    const uploaderFactory = (_opts: any, cb: (err?: any, res?: any) => void) => {
      const writable = new PassThrough();
      writable.on('finish', () => {
        cb(uploaderErr);
      });
      return writable;
    };

    await expect(uploadBufferToCloudinary(exampleBuffer, undefined, {} as any, uploaderFactory)).rejects.toThrow(uploaderErr);
  });

  test('uploadBufferToCloudinary - rejects when uploader returns empty result', async () => {
    const uploaderFactory = (_opts: any, cb: (err?: any, res?: any) => void) => {
      const writable = new PassThrough();
      writable.on('finish', () => {
        cb(undefined, undefined as any);
      });
      return writable;
    };

    await expect(uploadBufferToCloudinary(exampleBuffer, undefined, {} as any, uploaderFactory)).rejects.toThrow('Empty response from Cloudinary');
  });

  test('removeImage - returns client.uploader.destroy result on success', async () => {
    const fakeClient = {
      uploader: {
        destroy: (jest.fn() as any).mockResolvedValue({ result: 'ok', public_id: 'pid' }),
      },
    } as any;

    const out = await removeImage('pid', fakeClient);
    expect(out).toEqual({ result: 'ok', public_id: 'pid' });
    expect(fakeClient.uploader.destroy).toHaveBeenCalledWith('pid');
  });

  test('removeImage - throws Internal Server Error when client.uploader.destroy rejects', async () => {
    const fakeClient = {
      uploader: {
        destroy: (jest.fn() as any).mockRejectedValue(new Error('boom')),
      },
    } as any;

    await expect(removeImage('pid', fakeClient)).rejects.toThrow('Internal Server Error (cloudinary removeImage)');
    expect(fakeClient.uploader.destroy).toHaveBeenCalledWith('pid');
  });

  test('removeMultipleImages - returns client.api.delete_resources result on success', async () => {
    const fakeClient = {
      api: {
        delete_resources: (jest.fn() as any).mockResolvedValue({ deleted: { a: 'deleted' } }),
      },
    } as any;

    const ids = ['a', 'b'];
    const out = await removeMultipleImages(ids, fakeClient);
    expect(out).toEqual({ deleted: { a: 'deleted' } });
    expect(fakeClient.api.delete_resources).toHaveBeenCalledWith(ids);
  });

  test('removeMultipleImages - throws Internal Server Error when client.api.delete_resources rejects', async () => {
    const fakeClient = {
      api: {
        delete_resources: (jest.fn() as any).mockRejectedValue(new Error('boom')),
      },
    } as any;

    await expect(removeMultipleImages(['a'], fakeClient)).rejects.toThrow(
      'Internal Server Error (cloudinary removeMultipleImages)',
    );
    expect(fakeClient.api.delete_resources).toHaveBeenCalledWith(['a']);
  });
});