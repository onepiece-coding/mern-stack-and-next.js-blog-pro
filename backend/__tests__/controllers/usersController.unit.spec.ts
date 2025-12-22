import { jest } from '@jest/globals';
import httpMocks from 'node-mocks-http';

function makeQuery(value: any) {
  const q: any = {
    populate: function () { return q; },
    skip: function () { return q; },
    limit: function () { return q; },
    sort: function () { return q; },
    select: function () { return q; },
    exec: (jest.fn() as any).mockResolvedValue(value),
    then: function (onFulfilled: any, onRejected: any) {
      return Promise.resolve(value).then(onFulfilled, onRejected);
    },
    catch: function (onRejected: any) {
      return Promise.resolve(value).catch(onRejected);
    },
  };
  return q;
}



describe('usersController', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('getAllUsersCtrl -> default page & empty results', async () => {
    const UserMock: any = {
      countDocuments: (jest.fn() as any).mockResolvedValue(0),
      find: jest.fn().mockReturnValue(makeQuery([])),
    };

    await Promise.all([
      jest.unstable_mockModule('../../src/models/User.js', () => ({
        __esModule: true,
        default: UserMock,
      }))
    ]);

    const mod = await import('../../src/controllers/usersController.js');
    const { getAllUsersCtrl } = mod;

    const req: any = httpMocks.createRequest({ method: 'GET', query: {} });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await getAllUsersCtrl(req, res, next);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({ users: [], totalPages: 0 });
    expect(UserMock.countDocuments).toHaveBeenCalledWith({});
    expect(UserMock.find).toHaveBeenCalledWith({});
  });

  test('getAllUsersCtrl -> with username filter calls find/count with that filter', async () => {
    const users = [{ _id: 'u1', username: 'bob' }];
    const UserMock: any = {
      countDocuments: (jest.fn() as any).mockResolvedValue(users.length),
      find: jest.fn().mockReturnValue(makeQuery(users)),
    };
    
    await Promise.all([
      jest.unstable_mockModule('../../src/models/User.js', () => ({
        __esModule: true,
        default: UserMock,
      }))
    ]);

    const mod = await import('../../src/controllers/usersController.js');
    const { getAllUsersCtrl } = mod;

    const req: any = httpMocks.createRequest({ method: 'GET', query: { username: 'bob', pageNumber: '1' } });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await getAllUsersCtrl(req, res, next);

    expect(UserMock.countDocuments).toHaveBeenCalledWith({ username: 'bob' });
    expect(UserMock.find).toHaveBeenCalledWith({ username: 'bob' });
    expect(res.statusCode).toBe(200);
    const body = res._getJSONData();
    expect(body.totalPages).toBe(Math.ceil(users.length / 10));
    expect(body.users).toEqual(users);
  });

  test('getUserProfileCtrl -> not found -> 404 forwarded', async () => {
    await Promise.all([
      jest.unstable_mockModule('../../src/models/User.js', () => ({
        __esModule: true,
        default: { findById: jest.fn().mockReturnValue(makeQuery(null)) },
      }))
    ]);

    const mod = await import('../../src/controllers/usersController.js');
    const { getUserProfileCtrl } = mod;

    const req: any = httpMocks.createRequest({ params: { id: 'no' } });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await getUserProfileCtrl(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0] as { status: number, statusCode: number};
    expect(err).toBeDefined();
    expect(err.status || err.statusCode).toBe(404);
  });

  test('getUserProfileCtrl -> found -> returns user', async () => {
    const user = { _id: 'u1', username: 'alice' };
    
    await Promise.all([
      jest.unstable_mockModule('../../src/models/User.js', () => ({
        __esModule: true,
        default: { findById: jest.fn().mockReturnValue(makeQuery(user)) },
      }))
    ]);

    const mod = await import('../../src/controllers/usersController.js');
    const { getUserProfileCtrl } = mod;

    const req: any = httpMocks.createRequest({ params: { id: 'u1' } });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await getUserProfileCtrl(req, res, next);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual(user);
  });

  test('getMe -> not logged in (no user found) -> 401', async () => {
    const UserMock: any = { findById: (jest.fn() as any).mockResolvedValue(null) };
    
    await Promise.all([
      jest.unstable_mockModule('../../src/models/User.js', () => ({ __esModule: true, default: UserMock }))
    ]);
      
    const mod = await import('../../src/controllers/usersController.js');
    const { getMe } = mod;

    const req: any = httpMocks.createRequest({ user: { id: 'u1' } });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await getMe(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0] as { status: number, statusCode: number};
    expect(err.status || err.statusCode).toBe(401);
  });

  test('getMe -> found -> returns me', async () => {
    const me = { _id: 'u2', username: 'me' };
    const UserMock: any = { findById: (jest.fn() as any).mockResolvedValue(me) };
    
    await Promise.all([
      jest.unstable_mockModule('../../src/models/User.js', () => ({ __esModule: true, default: UserMock }))
    ]);

    const mod = await import('../../src/controllers/usersController.js');
    const { getMe } = mod;

    const req: any = httpMocks.createRequest({ user: { id: 'u2' } });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await getMe(req, res, next);

    expect(res.statusCode).toBe(200);
    const body = res._getJSONData();
    expect(body.status).toBe(true);
    expect(body.result).toEqual(me);
  });

  test('updateUserProfileCtrl -> nothing to update -> 400', async () => {
    const mod = await import('../../src/controllers/usersController.js');
    const { updateUserProfileCtrl } = mod;

    const userObj = { save: jest.fn() }; // req.user won't be modified here
    const req: any = httpMocks.createRequest({ body: {}, user: userObj });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await updateUserProfileCtrl(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0] as { status: number, statusCode: number, message: string};
    expect(err.status || err.statusCode).toBe(400);
    expect(String(err.message)).toMatch(/Nothing to update/);
  });

  test('updateUserProfileCtrl -> updates and saves user', async () => {
    const saveMock = (jest.fn() as any).mockResolvedValue(undefined);
    const userObj: any = { save: saveMock, password: 'secret' };

    const mod = await import('../../src/controllers/usersController.js');
    const { updateUserProfileCtrl } = mod;

    const req: any = httpMocks.createRequest({
      body: { username: 'newname', bio: 'bio' },
      user: userObj,
    });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await updateUserProfileCtrl(req, res, next);

    expect(saveMock).toHaveBeenCalled();
    expect((res._getJSONData() as any).password).toBeUndefined();
    expect(res.statusCode).toBe(200);
    expect((res._getJSONData() as any).username).toBe('newname');
  });

  test('getUsersCountCtrl -> returns count number', async () => {
    const UserMock: any = { countDocuments: (jest.fn() as any).mockResolvedValue(7) };
    
    await Promise.all([
      jest.unstable_mockModule('../../src/models/User.js', () => ({ __esModule: true, default: UserMock }))
    ]);

    const mod = await import('../../src/controllers/usersController.js');
    const { getUsersCountCtrl } = mod;

    const req: any = httpMocks.createRequest();
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await getUsersCountCtrl(req, res, next);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toBe(7);
  });

  test('profilePhotoUploadCtrl -> missing file -> 400', async () => {
    await Promise.all([
      jest.unstable_mockModule('../../src/utils/cloudinary.js', () => ({
        __esModule: true,
        uploadBufferToCloudinary: jest.fn(),
        removeImage: jest.fn(),
        removeMultipleImages: jest.fn(),
      })),
      jest.unstable_mockModule('../../src/models/User.js', () => ({ __esModule: true, default: {} }))
    ]);

    const mod = await import('../../src/controllers/usersController.js');
    const { profilePhotoUploadCtrl } = mod;

    const req: any = httpMocks.createRequest({ user: { id: 'u1' } }); // no file
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await profilePhotoUploadCtrl(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0] as { status: number, statusCode: number, message: string};
    expect(err.status || err.statusCode).toBe(400);
    expect(String(err.message)).toMatch(/No image provided/);
  });

  test('profilePhotoUploadCtrl -> uploads, removes old photo if present, saves and returns profilePhoto', async () => {
    const uploadRes = { secure_url: 'https://cdn/me.jpg', public_id: 'pub-me' };
    const uploadMock = (jest.fn() as any).mockResolvedValue(uploadRes);
    const removeImageMock = (jest.fn() as any).mockResolvedValue(undefined);

    const userDoc: any = {
      _id: 'u1',
      profilePhoto: { url: 'old', publicId: 'oldpub' },
      save: (jest.fn() as any).mockResolvedValue(undefined),
    };
    const UserMock: any = { findById: (jest.fn() as any).mockResolvedValue(userDoc) };

    await Promise.all([
      jest.unstable_mockModule('../../src/models/User.js', () => ({ __esModule: true, default: UserMock })),
      jest.unstable_mockModule('../../src/utils/cloudinary.js', () => ({
        __esModule: true,
        uploadBufferToCloudinary: uploadMock,
        removeImage: removeImageMock,
        removeMultipleImages: jest.fn(),
      }))
    ]);

    const mod = await import('../../src/controllers/usersController.js');
    const { profilePhotoUploadCtrl } = mod;

    const file = { buffer: Buffer.from('img') } as Express.Multer.File;
    const req: any = httpMocks.createRequest({ user: { id: 'u1' }, file });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await profilePhotoUploadCtrl(req, res, next);

    expect(uploadMock).toHaveBeenCalledWith(file.buffer, { folder: 'users' });
    expect(removeImageMock).toHaveBeenCalledWith('oldpub');
    expect(userDoc.save).toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    const body = res._getJSONData();
    expect(body.profilePhoto).toEqual({ url: uploadRes.secure_url, publicId: uploadRes.public_id || uploadRes.public_id });
    expect(body.message).toMatch(/uploaded successfully/);
  });

  test('deleteUserProfileCtrl -> user not found -> 404', async () => {
    await Promise.all([
      jest.unstable_mockModule('../../src/models/User.js', () => ({ __esModule: true, default: { findById: (jest.fn() as any).mockResolvedValue(null) } })),
      jest.unstable_mockModule('../../src/models/Post.js', () => ({ __esModule: true, default: { find: jest.fn() } })),
      jest.unstable_mockModule('../../src/models/Comment.js', () => ({ __esModule: true, default: { deleteMany: jest.fn() } })),
      jest.unstable_mockModule('../../src/utils/cloudinary.js', () => ({
        __esModule: true,
        uploadBufferToCloudinary: jest.fn(),
        removeMultipleImages: jest.fn(),
        removeImage: jest.fn(),
      }))
    ]);

    const mod = await import('../../src/controllers/usersController.js');
    const { deleteUserProfileCtrl } = mod;

    const req: any = httpMocks.createRequest({ params: { id: 'no' } });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await deleteUserProfileCtrl(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0] as { status: number, statusCode: number};
    expect(err.status || err.statusCode).toBe(404);
  });

  test('deleteUserProfileCtrl -> deletes posts images, profile photo & related docs, returns success', async () => {
    const removeMultipleImagesMock = (jest.fn() as any).mockResolvedValue(undefined);
    const removeImageMock = (jest.fn() as any).mockResolvedValue(undefined);

    const user = {
      _id: 'u1',
      profilePhoto: { url: 'p', publicId: 'ppub' },
    };
    const posts = [
      { image: { publicId: 'a' } },
      { image: { publicId: 'b' } },
    ];

    const UserMock: any = {
      findById: (jest.fn() as any).mockResolvedValue(user),
      findByIdAndDelete: (jest.fn() as any).mockResolvedValue(undefined),
    };
    const PostMock: any = {
      find: (jest.fn() as any).mockResolvedValue(posts),
      deleteMany: (jest.fn() as any).mockResolvedValue(undefined),
    };
    const CommentMock: any = {
      deleteMany: (jest.fn() as any).mockResolvedValue(undefined),
    };

    await Promise.all([
      jest.unstable_mockModule('../../src/models/User.js', () => ({ __esModule: true, default: UserMock })),
      jest.unstable_mockModule('../../src/models/Post.js', () => ({ __esModule: true, default: PostMock })),
      jest.unstable_mockModule('../../src/models/Comment.js', () => ({ __esModule: true, default: CommentMock })),
      jest.unstable_mockModule('../../src/utils/cloudinary.js', () => ({
        __esModule: true,
        uploadBufferToCloudinary: jest.fn(),
        removeMultipleImages: removeMultipleImagesMock,
        removeImage: removeImageMock,
      }))
    ]);

    const mod = await import('../../src/controllers/usersController.js');
    const { deleteUserProfileCtrl } = mod;

    const req: any = httpMocks.createRequest({ params: { id: 'u1' } });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await deleteUserProfileCtrl(req, res, next);

    expect(PostMock.find).toHaveBeenCalledWith({ user: user._id });
    expect(removeMultipleImagesMock).toHaveBeenCalledWith(['a', 'b']);
    expect(removeImageMock).toHaveBeenCalledWith('ppub');
    expect(PostMock.deleteMany).toHaveBeenCalledWith({ user: user._id });
    expect(CommentMock.deleteMany).toHaveBeenCalledWith({ user: user._id });
    expect(UserMock.findByIdAndDelete).toHaveBeenCalledWith('u1');
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({ message: 'Your profile has been deleted' });
  });
});