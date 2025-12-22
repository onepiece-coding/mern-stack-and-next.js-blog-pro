import { jest } from '@jest/globals';
import type { Request, Response, NextFunction } from 'express';

// Import the real models and controller.
// We'll spy on model methods (find) and mock their resolved values per-test.
import User from '../../src/models/User.js';
import Post from '../../src/models/Post.js';
import Category from '../../src/models/Category.js';
import Comment from '../../src/models/Comment.js';
import { getAllInfo } from '../../src/controllers/adminController.js';

describe('adminController.getAllInfo', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    // don't resetModules here — we use real imports and spy on them

    // default request (not used by this controller, but keep shape)
    req = {};

    // simple mock response that supports .status().json()
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    res = {
      status: statusMock as any,
      json: jsonMock as any,
    };

    next = jest.fn() as NextFunction;
  });

  afterEach(() => {
    // restore any spies created by jest.spyOn(...)
    jest.restoreAllMocks();
  });

  test('returns counts when models return arrays (non-empty)', async () => {
    // Arrange: spy on each model.find and make them resolve to arrays
    jest.spyOn(User, 'find').mockResolvedValueOnce([{}, {}, {}] as any); // 3
    jest.spyOn(Post, 'find').mockResolvedValueOnce([{}, {}] as any); // 2
    jest.spyOn(Category, 'find').mockResolvedValueOnce([{}] as any); // 1
    jest.spyOn(Comment, 'find').mockResolvedValueOnce([{}, {}, {}, {}] as any); // 4

    // Act: call the express handler
    await (getAllInfo as any)(req, res, next);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      users: 3,
      posts: 2,
      categories: 1,
      comments: 4,
    });

    expect(User.find).toHaveBeenCalled();
    expect(Post.find).toHaveBeenCalled();
    expect(Category.find).toHaveBeenCalled();
    expect(Comment.find).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  test('returns zeros when models return undefined / emptyish results', async () => {
    jest.spyOn(User, 'find').mockResolvedValueOnce(undefined as any);
    jest.spyOn(Post, 'find').mockResolvedValueOnce([] as any);
    jest.spyOn(Category, 'find').mockResolvedValueOnce(null as any);
    jest.spyOn(Comment, 'find').mockResolvedValueOnce([] as any);

    await (getAllInfo as any)(req, res, next);

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      users: 0,
      posts: 0,
      categories: 0,
      comments: 0,
    });

    expect(next).not.toHaveBeenCalled();
  });

  test('forwards error to next when a model throws', async () => {
    const boom = new Error('db fail');
    jest.spyOn(User, 'find').mockRejectedValueOnce(boom);
    // other models not required to be called, but mock them to avoid unexpected calls
    jest.spyOn(Post, 'find').mockResolvedValueOnce([] as any);
    jest.spyOn(Category, 'find').mockResolvedValueOnce([] as any);
    jest.spyOn(Comment, 'find').mockResolvedValueOnce([] as any);

    await (getAllInfo as any)(req, res, next);

    // asyncHandler wrapper should catch and forward error to next
    expect((next as jest.Mock).mock.calls.length).toBeGreaterThanOrEqual(1);
    const calledWith = (next as jest.Mock).mock.calls[0][0];
    expect(calledWith).toBeInstanceOf(Error);
    expect(String(calledWith)).toContain('db fail');

    // ensure no response was sent when error occurs
    expect(statusMock).not.toHaveBeenCalled();
    expect(jsonMock).not.toHaveBeenCalled();
  });
});