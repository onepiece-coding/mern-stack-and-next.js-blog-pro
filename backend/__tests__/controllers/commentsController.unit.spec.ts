import { jest } from '@jest/globals';
import httpMocks from 'node-mocks-http';

describe('commentsController', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  /*********************************************************
   * createCommentCtrl
   *********************************************************/
  test('createCommentCtrl -> post not found -> next called with 404', async () => {
    await Promise.all([
      jest.unstable_mockModule('../../src/models/Post.js', () => ({
        __esModule: true,
        default: { findById: (jest.fn() as any).mockResolvedValue(null) },
      })),
      jest.unstable_mockModule('../../src/models/Comment.js', () => ({
        __esModule: true,
        default: { create: jest.fn() },
      })),
      jest.unstable_mockModule('../../src/models/User.js', () => ({
        __esModule: true,
        default: { findById: jest.fn() },
      }))
    ]);

    const mod = await import('../../src/controllers/commentsController.js');
    const { createCommentCtrl } = mod;

    const req: any = httpMocks.createRequest({
      method: 'POST',
      body: { postId: '507f1f77bcf86cd799439011', text: 'hello' },
      user: { id: 'u1' },
    });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await createCommentCtrl(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0] as { status: number, statusCode: number, message: string};
    expect(err).toBeDefined();
    expect(err.status || err.statusCode).toBe(404);
    expect(String(err.message)).toMatch(/Post not found/);
  });

  test('createCommentCtrl -> success -> creates comment and returns 201', async () => {
    const fakePost = { _id: 'p1' };
    const fakeProfile = { username: 'alice' };
    const createdComment = { _id: 'c1', text: 'hello', username: 'alice' };

    await Promise.all([
      jest.unstable_mockModule('../../src/models/Post.js', () => ({
        __esModule: true,
        default: { findById: (jest.fn() as any).mockResolvedValue(fakePost) },
      })),
      jest.unstable_mockModule('../../src/models/User.js', () => ({
        __esModule: true,
        default: { findById: (jest.fn() as any).mockResolvedValue(fakeProfile) },
      })),
      jest.unstable_mockModule('../../src/models/Comment.js', () => ({
        __esModule: true,
        default: { create: (jest.fn() as any).mockResolvedValue(createdComment) },
      }))
    ]);

    const mod = await import('../../src/controllers/commentsController.js');
    const { createCommentCtrl } = mod;

    const req: any = httpMocks.createRequest({
      method: 'POST',
      body: { postId: 'p1', text: 'hello' },
      user: { id: 'u1' },
    });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await createCommentCtrl(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(201);
    const data = res._getJSONData();
    expect(data).toEqual(createdComment);
  });

  /*********************************************************
   * getAllCommentsCtrl
   *********************************************************/
  test('getAllCommentsCtrl -> returns comments with populated "user"', async () => {
    const populatedComments = [{ _id: 'c1', text: 'x', user: { username: 'bob' } }];

    const findReturn = {
      populate: (jest.fn() as any).mockResolvedValue(populatedComments),
    };
    const findMock = jest.fn().mockReturnValue(findReturn);

    await Promise.all([
      jest.unstable_mockModule('../../src/models/Comment.js', () => ({
        __esModule: true,
        default: { find: findMock },
      }))
    ]);

    const mod = await import('../../src/controllers/commentsController.js');
    const { getAllCommentsCtrl } = mod;

    const req: any = httpMocks.createRequest({ method: 'GET' });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await getAllCommentsCtrl(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(findMock).toHaveBeenCalledWith();
    expect(findReturn.populate).toHaveBeenCalledWith('user');

    expect(res.statusCode).toBe(200);
    const data = res._getJSONData();
    expect(data).toEqual(populatedComments);
  });

  /*********************************************************
   * deleteCommentCtrl
   *********************************************************/
  test('deleteCommentCtrl -> comment not found -> next with 404', async () => {
    await Promise.all([
      jest.unstable_mockModule('../../src/models/Comment.js', () => ({
        __esModule: true,
        default: { findById: (jest.fn() as any).mockResolvedValue(null) },
      }))
    ]);

    const mod = await import('../../src/controllers/commentsController.js');
    const { deleteCommentCtrl } = mod;

    const req: any = httpMocks.createRequest({
      method: 'DELETE',
      params: { id: 'nope' },
      user: { id: 'u1', isAdmin: false },
    });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await deleteCommentCtrl(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0] as { status: number, statusCode: number, message: string};
    expect(err).toBeDefined();
    expect(err.status || err.statusCode).toBe(404);
    expect(String(err.message)).toMatch(/Comment not found/);
  });

  test('deleteCommentCtrl -> admin can delete -> returns 200', async () => {
    const found = { _id: 'c1', user: 'u-other' };
    const findByIdMock = (jest.fn() as any).mockResolvedValue(found);
    const findByIdAndDeleteMock = (jest.fn() as any).mockResolvedValue(found);

    await Promise.all([
      jest.unstable_mockModule('../../src/models/Comment.js', () => ({
        __esModule: true,
        default: { findById: findByIdMock, findByIdAndDelete: findByIdAndDeleteMock },
      }))
    ]);

    const mod = await import('../../src/controllers/commentsController.js');
    const { deleteCommentCtrl } = mod;

    const req: any = httpMocks.createRequest({
      method: 'DELETE',
      params: { id: 'c1' },
      user: { id: 'admin', isAdmin: true },
    });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await deleteCommentCtrl(req, res, next);

    expect(findByIdMock).toHaveBeenCalledWith('c1');
    expect(findByIdAndDeleteMock).toHaveBeenCalledWith('c1');
    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({ message: 'comment has been deleted' });
  });

  test('deleteCommentCtrl -> owner can delete -> returns 200', async () => {
    const found = { _id: 'c2', user: { toString: () => 'owner-id' } };
    const findByIdMock = (jest.fn() as any).mockResolvedValue(found);
    const findByIdAndDeleteMock = (jest.fn() as any).mockResolvedValue(found);

    await Promise.all([
      jest.unstable_mockModule('../../src/models/Comment.js', () => ({
        __esModule: true,
        default: { findById: findByIdMock, findByIdAndDelete: findByIdAndDeleteMock },
      }))
    ]);

    const mod = await import('../../src/controllers/commentsController.js');
    const { deleteCommentCtrl } = mod;

    const req: any = httpMocks.createRequest({
      method: 'DELETE',
      params: { id: 'c2' },
      user: { id: 'owner-id', isAdmin: false },
    });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await deleteCommentCtrl(req, res, next);

    expect(findByIdMock).toHaveBeenCalledWith('c2');
    expect(findByIdAndDeleteMock).toHaveBeenCalledWith('c2');
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({ message: 'comment has been deleted' });
  });

  test('deleteCommentCtrl -> forbidden when not admin or owner -> next with 403', async () => {
    const found = { _id: 'c3', user: { toString: () => 'someone-else' } };
    await Promise.all([
      jest.unstable_mockModule('../../src/models/Comment.js', () => ({
        __esModule: true,
        default: { findById: (jest.fn() as any).mockResolvedValue(found) },
      }))
    ]);

    const mod = await import('../../src/controllers/commentsController.js');
    const { deleteCommentCtrl } = mod;

    const req: any = httpMocks.createRequest({
      method: 'DELETE',
      params: { id: 'c3' },
      user: { id: 'not-owner', isAdmin: false },
    });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await deleteCommentCtrl(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0] as { status: number, statusCode: number, message: string};
    expect(err).toBeDefined();
    expect(err.status || err.statusCode).toBe(403);
    expect(String(err.message)).toMatch(/Access denied/i);
  });

  /*********************************************************
   * updateCommentCtrl
   *********************************************************/
  test('updateCommentCtrl -> comment not found -> next with 404', async () => {
    await Promise.all([
      jest.unstable_mockModule('../../src/models/Comment.js', () => ({
        __esModule: true,
        default: { findById: (jest.fn() as any).mockResolvedValue(null) },
      }))
    ]);

    const mod = await import('../../src/controllers/commentsController.js');
    const { updateCommentCtrl } = mod;

    const req: any = httpMocks.createRequest({
      method: 'PATCH',
      params: { id: 'no-comment' },
      body: { text: 'new' },
      user: { id: 'u1' },
    });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await updateCommentCtrl(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0] as { status: number, statusCode: number, message: string};
    expect(err).toBeDefined();
    expect(err.status || err.statusCode).toBe(404);
    expect(String(err.message)).toMatch(/Comment not found/);
  });

  test('updateCommentCtrl -> not owner -> returns error (404 per code) ', async () => {
    const found = { _id: 'c4', user: { toString: () => 'other-user' } };
    await Promise.all([
      jest.unstable_mockModule('../../src/models/Comment.js', () => ({
        __esModule: true,
        default: { findById: (jest.fn() as any).mockResolvedValue(found) },
      }))
    ]);

    const mod = await import('../../src/controllers/commentsController.js');
    const { updateCommentCtrl } = mod;

    const req: any = httpMocks.createRequest({
      method: 'PATCH',
      params: { id: 'c4' },
      body: { text: 'new' },
      user: { id: 'not-owner' },
    });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await updateCommentCtrl(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0] as { status: number, statusCode: number, message: string};
    expect(err).toBeDefined();
    expect(err.status || err.statusCode).toBe(404);
    expect(String(err.message)).toMatch(/Access denied/);
  });

  test('updateCommentCtrl -> owner updates -> returns updated comment (201)', async () => {
    const found = { _id: 'c5', user: { toString: () => 'owner' } };
    const updated = { _id: 'c5', text: 'updated' };
    const findByIdMock = (jest.fn() as any).mockResolvedValue(found);
    const findByIdAndUpdateMock = (jest.fn() as any).mockResolvedValue(updated);

    await Promise.all([
      jest.unstable_mockModule('../../src/models/Comment.js', () => ({
        __esModule: true,
        default: { findById: findByIdMock, findByIdAndUpdate: findByIdAndUpdateMock },
      }))
    ]);

    const mod = await import('../../src/controllers/commentsController.js');
    const { updateCommentCtrl } = mod;

    const req: any = httpMocks.createRequest({
      method: 'PATCH',
      params: { id: 'c5' },
      body: { text: 'updated' },
      user: { id: 'owner' },
    });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await updateCommentCtrl(req, res, next);

    expect(findByIdMock).toHaveBeenCalledWith('c5');
    expect(findByIdAndUpdateMock).toHaveBeenCalledWith(
      'c5',
      { $set: { text: 'updated' } },
      { new: true },
    );

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(201);
    expect(res._getJSONData()).toEqual(updated);
  });
});