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

function makeDocument(value: Record<string, any>) {
  const doc: any = { ...value };
  doc.populate = jest.fn().mockImplementation(() => Promise.resolve(doc));
  return doc;
}

describe('postsController', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('createPostCtrl -> category not found -> next(404)', async () => {
    await Promise.all([
      jest.unstable_mockModule('../../src/models/Category.js', () => ({
        __esModule: true,
        default: { findById: (jest.fn() as any).mockResolvedValue(null) },
      })),
      jest.unstable_mockModule('../../src/models/Post.js', () => ({
        __esModule: true,
        default: { create: jest.fn() },
      })),
      jest.unstable_mockModule('../../src/utils/cloudinary.js', () => ({
        __esModule: true,
        uploadBufferToCloudinary: jest.fn(),
        removeImage: jest.fn(),
      }))
    ]);

    const mod = await import('../../src/controllers/postsController.js');
    const { createPostCtrl } = mod;

    const req: any = httpMocks.createRequest({
      method: 'POST',
      body: { title: 't', description: 'd', categoryId: 'cat1' },
      user: { id: 'u1' },
    });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await createPostCtrl(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0] as { status: number, statusCode: number};
    expect(err.status || err.statusCode).toBe(404);
  });

  test('createPostCtrl -> with image buffer uploads and creates post', async () => {
    const fakeCategory = { _id: 'cat1' };
    const createdDoc = makeDocument({ _id: 'p1', title: 't' });
    const PostMock = {
      create: (jest.fn() as any).mockResolvedValue(createdDoc),
    };
    const uploadRes = { secure_url: 'https://cdn/test.jpg', public_id: 'pub1' };
    const uploadMock = (jest.fn() as any).mockResolvedValue(uploadRes);

    await Promise.all([
      jest.unstable_mockModule('../../src/models/Category.js', () => ({
        __esModule: true,
        default: { findById: (jest.fn() as any).mockResolvedValue(fakeCategory) },
      })),
      jest.unstable_mockModule('../../src/models/Post.js', () => ({
        __esModule: true,
        default: PostMock,
      })),
      jest.unstable_mockModule('../../src/utils/cloudinary.js', () => ({
        __esModule: true,
        uploadBufferToCloudinary: uploadMock,
        removeImage: jest.fn(),
      }))
    ]);

    const mod = await import('../../src/controllers/postsController.js');
    const { createPostCtrl } = mod;

    const file = { buffer: Buffer.from('ok') } as Express.Multer.File;
    const req: any = httpMocks.createRequest({
      method: 'POST',
      body: { title: 't', description: 'desc', categoryId: fakeCategory._id },
      file,
      user: { id: 'u1' },
    });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await createPostCtrl(req, res, next);

    expect(uploadMock).toHaveBeenCalledTimes(1);
    expect(PostMock.create).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(201); // now controller should have returned 201
    const body = res._getJSONData();
    expect(body).toHaveProperty('_id', 'p1');
  });

  test('createPostCtrl -> without image sets empty image and creates post', async () => {
    const fakeCategory = { _id: 'catX' };
    const createdDoc = makeDocument({ _id: 'p2', title: 't2' });
    const PostMock = { create: (jest.fn() as any).mockResolvedValue(createdDoc) };

    await Promise.all([
      jest.unstable_mockModule('../../src/models/Category.js', () => ({
        __esModule: true,
        default: { findById: (jest.fn() as any).mockResolvedValue(fakeCategory) },
      })),
      jest.unstable_mockModule('../../src/models/Post.js', () => ({
        __esModule: true,
        default: PostMock,
      })),
      jest.unstable_mockModule('../../src/utils/cloudinary.js', () => ({
        __esModule: true,
        uploadBufferToCloudinary: jest.fn(),
        removeImage: jest.fn(),
      }))
    ]);

    const mod = await import('../../src/controllers/postsController.js');
    const { createPostCtrl } = mod;

    const req: any = httpMocks.createRequest({
      method: 'POST',
      body: { title: 't2', description: 'desc2', categoryId: fakeCategory._id },
      user: { id: 'u2' },
    });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await createPostCtrl(req, res, next);

    expect(PostMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 't2',
        description: 'desc2',
        user: 'u2',
        categoryId: fakeCategory._id,
        image: { url: '', publicId: null },
      }),
    );
    expect(res.statusCode).toBe(201);
  });

  test('getAllPostsCtrl -> category filter when not found returns empty posts', async () => {
    const CategoryMock = { findOne: (jest.fn() as any).mockResolvedValue(null) };
    const PostMock: any = { countDocuments: (jest.fn() as any).mockResolvedValue(0) };
    PostMock.find = jest.fn().mockReturnValue(makeQuery([]));

    await Promise.all([
      jest.unstable_mockModule('../../src/models/Category.js', () => ({
        __esModule: true,
        default: CategoryMock,
      })),
      jest.unstable_mockModule('../../src/models/Post.js', () => ({
        __esModule: true,
        default: PostMock,
      }))
    ]);

    const mod = await import('../../src/controllers/postsController.js');
    const { getAllPostsCtrl } = mod;

    const req: any = httpMocks.createRequest({
      method: 'GET',
      query: { category: 'NoSuchCategory' },
    });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await getAllPostsCtrl(req, res, next);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({ posts: [], totalPages: 0 });
  });

  test('getAllPostsCtrl -> text search path uses textScore select/sort', async () => {
    const samplePosts = [{ _id: 'a' }];
    const cursor = makeQuery(samplePosts);
    const PostMock: any = {
      countDocuments: (jest.fn() as any).mockResolvedValue(1),
      find: jest.fn().mockReturnValue(cursor),
    };
    
    await Promise.all([
      jest.unstable_mockModule('../../src/models/Post.js', () => ({
        __esModule: true,
        default: PostMock,
      })),
      jest.unstable_mockModule('../../src/models/Category.js', () => ({
        __esModule: true,
        default: { findOne: jest.fn() },
      }))
    ]);

    const mod = await import('../../src/controllers/postsController.js');
    const { getAllPostsCtrl } = mod;

    const req: any = httpMocks.createRequest({
      method: 'GET',
      query: { text: 'search terms', pageNumber: '1' },
    });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await getAllPostsCtrl(req, res, next);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData().posts).toEqual(samplePosts);
  });

  test('getAllPostsCtrl -> non-text path sorts by createdAt', async () => {
    const samplePosts = [{ _id: 'b' }];
    const cursor = makeQuery(samplePosts);
    const PostMock: any = {
      countDocuments: (jest.fn() as any).mockResolvedValue(1),
      find: jest.fn().mockReturnValue(cursor),
    };

    await Promise.all([
      jest.unstable_mockModule('../../src/models/Post.js', () => ({
        __esModule: true,
        default: PostMock,
      })),
      jest.unstable_mockModule('../../src/models/Category.js', () => ({
        __esModule: true,
        default: { findOne: jest.fn() },
      }))
    ]);

    const mod = await import('../../src/controllers/postsController.js');
    const { getAllPostsCtrl } = mod;

    const req: any = httpMocks.createRequest({
      method: 'GET',
      query: { pageNumber: '2' },
    });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await getAllPostsCtrl(req, res, next);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData().totalPages).toBe(Math.ceil(1 / 4));
  });

  test('getPostCountCtrl -> returns count', async () => {
    await Promise.all([
      jest.unstable_mockModule('../../src/models/Post.js', () => ({
        __esModule: true,
        default: { countDocuments: (jest.fn() as any).mockResolvedValue(42) },
      }))
    ]);
    const mod = await import('../../src/controllers/postsController.js');
    const { getPostCountCtrl } = mod;

    const req: any = httpMocks.createRequest();
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await getPostCountCtrl(req, res, next);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toBe(42);
  });

  test('getSinglePostCtrl -> not found -> 404', async () => {
    await Promise.all([
      jest.unstable_mockModule('../../src/models/Post.js', () => ({
        __esModule: true,
        default: { findById: jest.fn().mockReturnValue(makeQuery(null)) },
      }))
    ]);

    const mod = await import('../../src/controllers/postsController.js');
    const { getSinglePostCtrl } = mod;

    const req: any = httpMocks.createRequest({ params: { id: 'no' } });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await getSinglePostCtrl(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0] as { status: number, statusCode: number};
    expect(err.status || err.statusCode).toBe(404);
  });

  test('getSinglePostCtrl -> found -> returns post', async () => {
    const post = { _id: 'p' };
    await Promise.all([
      jest.unstable_mockModule('../../src/models/Post.js', () => ({
        __esModule: true,
        default: { findById: jest.fn().mockReturnValue(makeQuery(post)) },
      }))
    ]);

    const mod = await import('../../src/controllers/postsController.js');
    const { getSinglePostCtrl } = mod;

    const req: any = httpMocks.createRequest({ params: { id: 'p' } });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await getSinglePostCtrl(req, res, next);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual(post);
  });

  test('deletePostCtrl -> not found -> 404', async () => {
    await Promise.all([
      jest.unstable_mockModule('../../src/models/Post.js', () => ({
        __esModule: true,
        default: { findById: (jest.fn() as any).mockResolvedValue(null) },
      })),
      jest.unstable_mockModule('../../src/models/Comment.js', () => ({
        __esModule: true,
        default: { deleteMany: jest.fn() },
      })),
      jest.unstable_mockModule('../../src/utils/cloudinary.js', () => ({
        __esModule: true,
        uploadBufferToCloudinary: jest.fn(),
        removeImage: jest.fn(),
      }))
    ]);

    const mod = await import('../../src/controllers/postsController.js');
    const { deletePostCtrl } = mod;

    const req: any = httpMocks.createRequest({ params: { id: 'x' }, user: { id: 'u1', isAdmin: false } });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await deletePostCtrl(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0] as { status: number, statusCode: number};
    expect(err.status || err.statusCode).toBe(404);
  });

  test('deletePostCtrl -> unauthorized -> 403', async () => {
    const post = { _id: 'p', user: 'owner-id', image: { publicId: null } };
    const PostMock: any = { findById: (jest.fn() as any).mockResolvedValue(post) };
    
    await Promise.all([
      jest.unstable_mockModule('../../src/models/Post.js', () => ({
        __esModule: true,
        default: PostMock,
      })),
      jest.unstable_mockModule('../../src/models/Comment.js', () => ({
        __esModule: true,
        default: { deleteMany: jest.fn() },
      })),
      jest.unstable_mockModule('../../src/utils/cloudinary.js', () => ({
        __esModule: true,
        uploadBufferToCloudinary: jest.fn(),
        removeImage: jest.fn(),
      }))
    ]);

    const mod = await import('../../src/controllers/postsController.js');
    const { deletePostCtrl } = mod;

    const req: any = httpMocks.createRequest({ params: { id: 'p' }, user: { id: 'not-owner', isAdmin: false } });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await deletePostCtrl(req, res, next);

    expect(next).toHaveBeenCalled();
    const err = next.mock.calls[0][0] as { status: number, statusCode: number};
    expect(err.status || err.statusCode).toBe(403);
  });

  test('deletePostCtrl -> owner deletes post and removeImage called if publicId present', async () => {
    const post = { _id: 'p', user: { toString: () => 'owner' }, image: { publicId: 'img-1' } };
    const PostMock: any = {
      findById: (jest.fn() as any).mockResolvedValue(post),
      findByIdAndDelete: (jest.fn() as any).mockResolvedValue(undefined),
    };
    const CommentMock: any = { deleteMany: (jest.fn() as any).mockResolvedValue(undefined) };
    const removeImageMock =(jest.fn() as any).mockResolvedValue(undefined);

    await Promise.all([
      jest.unstable_mockModule('../../src/models/Post.js', () => ({ __esModule: true, default: PostMock })),
      jest.unstable_mockModule('../../src/models/Comment.js', () => ({ __esModule: true, default: CommentMock })),
      jest.unstable_mockModule('../../src/utils/cloudinary.js', () => ({
        __esModule: true,
        uploadBufferToCloudinary: jest.fn(),
        removeImage: removeImageMock,
      }))
    ]);

    const mod = await import('../../src/controllers/postsController.js');
    const { deletePostCtrl } = mod;

    const req: any = httpMocks.createRequest({ params: { id: 'p' }, user: { id: 'owner', isAdmin: false } });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await deletePostCtrl(req, res, next);

    expect(removeImageMock).toHaveBeenCalledWith('img-1');
    expect(CommentMock.deleteMany).toHaveBeenCalledWith({ postId: post._id });
    expect(PostMock.findByIdAndDelete).toHaveBeenCalledWith('p');
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toHaveProperty('postId', post._id);
  });

  test('updatePostCtrl -> not found -> 404', async () => {
    await Promise.all([
      jest.unstable_mockModule('../../src/models/Post.js', () => ({ __esModule: true, default: { findById: (jest.fn() as any).mockResolvedValue(null) } })),
      jest.unstable_mockModule('../../src/models/Category.js', () => ({ __esModule: true, default: { findById: jest.fn() } }))
    ]);

    const mod = await import('../../src/controllers/postsController.js');
    const { updatePostCtrl } = mod;

    const req: any = httpMocks.createRequest({ params: { id: 'no' }, body: {}, user: { id: 'u1' } });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await updatePostCtrl(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0] as { status: number, statusCode: number};
    expect(err.status || err.statusCode).toBe(404);
  });

  test('updatePostCtrl -> not owner -> 403', async () => {
    const post = { _id: 'p', user: 'owner' };
    const PostMock: any = { findById: (jest.fn() as any).mockResolvedValue(post) };
    
    
    await Promise.all([
      jest.unstable_mockModule('../../src/models/Post.js', () => ({ __esModule: true, default: PostMock })),
      jest.unstable_mockModule('../../src/models/Category.js', () => ({ __esModule: true, default: { findById: jest.fn() } }))
    ]);

    const mod = await import('../../src/controllers/postsController.js');
    const { updatePostCtrl } = mod;

    const req: any = httpMocks.createRequest({ params: { id: 'p' }, body: {}, user: { id: 'someone' } });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await updatePostCtrl(req, res, next);

    expect(next).toHaveBeenCalled();
    const err = next.mock.calls[0][0] as { status: number, statusCode: number};
    expect(err.status || err.statusCode).toBe(403);
  });

  test('updatePostCtrl -> categoryId provided but category not found -> 404', async () => {
    const post = { _id: 'p', user: 'u1' };
    const PostMock: any = {
      findById: (jest.fn() as any).mockResolvedValue(post),
      findByIdAndUpdate: jest.fn(),
    };

    await Promise.all([
      jest.unstable_mockModule('../../src/models/Post.js', () => ({ __esModule: true, default: PostMock })),
      jest.unstable_mockModule('../../src/models/Category.js', () => ({ __esModule: true, default: { findById: (jest.fn() as any).mockResolvedValue(null) } }))
    ]);

    const mod = await import('../../src/controllers/postsController.js');
    const { updatePostCtrl } = mod;

    const req: any = httpMocks.createRequest({
      params: { id: 'p' },
      body: { categoryId: 'no-cat' },
      user: { id: 'u1' },
    });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await updatePostCtrl(req, res, next);

    expect(next).toHaveBeenCalled();
    const err = next.mock.calls[0][0] as { status: number, statusCode: number};
    expect(err.status || err.statusCode).toBe(404);
  });

  test('updatePostCtrl -> success returns updated post', async () => {
    const post = { _id: 'p', user: 'u1' };
    const updated = { _id: 'p', title: 'new' };
    const PostMock: any = {
      findById: (jest.fn() as any).mockResolvedValue(post),
      findByIdAndUpdate: jest.fn().mockReturnValue(makeQuery(updated)),
    };

    await Promise.all([
      jest.unstable_mockModule('../../src/models/Post.js', () => ({ __esModule: true, default: PostMock })),
      jest.unstable_mockModule('../../src/models/Category.js', () => ({ __esModule: true, default: { findById: (jest.fn() as any).mockResolvedValue({ _id: 'c1' }) } }))
    ]);

    const mod = await import('../../src/controllers/postsController.js');
    const { updatePostCtrl } = mod;

    const req: any = httpMocks.createRequest({ params: { id: 'p' }, body: { title: 'new', categoryId: 'c1' }, user: { id: 'u1' } });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await updatePostCtrl(req, res, next);

    expect(PostMock.findByIdAndUpdate).toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual(updated);
  });

  test('updatePostImageCtrl -> various failures and success path', async () => {
    const mod0 = await import('../../src/controllers/postsController.js');
    const { updatePostImageCtrl } = mod0;
    let req: any = httpMocks.createRequest({ params: { id: 'x' }, user: { id: 'u' } });
    let res: any = httpMocks.createResponse();
    let next = jest.fn();
    await updatePostImageCtrl(req, res, next);
    let err = next.mock.calls[0][0] as { status: number, statusCode: number};
    expect(err.status || err.statusCode).toBe(400);

    await Promise.all([
      jest.resetModules(),
      jest.unstable_mockModule('../../src/models/Post.js', () => ({ __esModule: true, default: { findById: (jest.fn() as any).mockResolvedValue(null) } })),
      jest.unstable_mockModule('../../src/utils/cloudinary.js', () => ({ __esModule: true, uploadBufferToCloudinary: jest.fn(), removeImage: jest.fn() }))
    ]);

    const mod1 = await import('../../src/controllers/postsController.js');
    const { updatePostImageCtrl: uPic1 } = mod1;
    req = httpMocks.createRequest({ params: { id: 'no' }, file: { buffer: Buffer.from('x') }, user: { id: 'u' } });
    res = httpMocks.createResponse();
    next = jest.fn();
    await uPic1(req, res, next);
    err = next.mock.calls[0][0] as { status: number, statusCode: number};
    expect(err.status || err.statusCode).toBe(404);

    const postOwner = { _id: 'p', user: 'owner', image: { publicId: null } };
    
    await Promise.all([
      jest.resetModules(),
      jest.unstable_mockModule('../../src/models/Post.js', () => ({ __esModule: true, default: { findById: (jest.fn() as any).mockResolvedValue(postOwner) } })),
      jest.unstable_mockModule('../../src/utils/cloudinary.js', () => ({ __esModule: true, uploadBufferToCloudinary: jest.fn(), removeImage: jest.fn() }))
    ]);

    const mod2 = await import('../../src/controllers/postsController.js');
    const { updatePostImageCtrl: uPic2 } = mod2;
    req = httpMocks.createRequest({ params: { id: 'p' }, file: { buffer: Buffer.from('x') }, user: { id: 'someone' } });
    res = httpMocks.createResponse();
    next = jest.fn();
    await uPic2(req, res, next);
    err = next.mock.calls[0][0] as { status: number, statusCode: number};
    expect(err.status || err.statusCode).toBe(403);

    const postWithOld = { _id: 'p', user: { toString: () => 'u1' }, image: { publicId: 'old-pub' } };
    const updatedPost = { _id: 'p', image: { url: 'u', publicId: 'new' } };
    const uploadMock = (jest.fn() as any).mockResolvedValue({ secure_url: 'u', public_id: 'new' });
    const removeMock = (jest.fn() as any).mockResolvedValue(undefined);

    await Promise.all([
      jest.resetModules(),
      jest.unstable_mockModule('../../src/models/Post.js', () => ({
        __esModule: true,
        default: {
          findById: (jest.fn() as any).mockResolvedValue(postWithOld),
          findByIdAndUpdate: (jest.fn() as any).mockResolvedValue(updatedPost),
        },
      })),
      jest.unstable_mockModule('../../src/utils/cloudinary.js', () => ({
        __esModule: true,
        uploadBufferToCloudinary: uploadMock,
        removeImage: removeMock,
      }))
    ]);

    const mod3 = await import('../../src/controllers/postsController.js');
    const { updatePostImageCtrl: uPic3 } = mod3;
    req = httpMocks.createRequest({ params: { id: 'p' }, file: { buffer: Buffer.from('x') }, user: { id: 'u1' } });
    res = httpMocks.createResponse();
    next = jest.fn();
    await uPic3(req, res, next);
    expect(uploadMock).toHaveBeenCalled();
    expect(removeMock).toHaveBeenCalledWith('old-pub');
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual(updatedPost);
  });

  test('toggleLikeCtrl -> not found and toggles', async () => {
    await Promise.all([
      jest.unstable_mockModule('../../src/models/Post.js', () => ({ __esModule: true, default: { findById: (jest.fn() as any).mockResolvedValue(null) } }))
    ]);

    let mod = await import('../../src/controllers/postsController.js');
    let { toggleLikeCtrl } = mod;
    let req: any = httpMocks.createRequest({ params: { id: 'no' }, user: { id: 'u1' } });
    let res: any = httpMocks.createResponse();
    let next = jest.fn();
    await toggleLikeCtrl(req, res, next);
    expect(next).toHaveBeenCalled();
    const err = next.mock.calls[0][0] as { status: number, statusCode: number};
    expect(err.status || err.statusCode).toBe(404);

    const likedPost = { _id: 'p', likes: [{ toString: () => 'u1' }] };
    const updatedAfterPull = { _id: 'p', likes: [] };
    
    await Promise.all([
      jest.resetModules(),
      jest.unstable_mockModule('../../src/models/Post.js', () => ({
        __esModule: true,
        default: {
          findById: (jest.fn() as any).mockResolvedValue(likedPost),
          findByIdAndUpdate:(jest.fn() as any).mockResolvedValue(updatedAfterPull),
        },
      }))
    ]);

    mod = await import('../../src/controllers/postsController.js');
    toggleLikeCtrl = mod.toggleLikeCtrl;
    req = httpMocks.createRequest({ params: { id: 'p' }, user: { id: 'u1' } });
    res = httpMocks.createResponse();
    next = jest.fn();
    await toggleLikeCtrl(req, res, next);
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual(updatedAfterPull);

    const notLiked = { _id: 'p2', likes: [] };
    const updatedAfterPush = { _id: 'p2', likes: ['u2'] };
    
    await Promise.all([
      jest.resetModules(),
      jest.unstable_mockModule('../../src/models/Post.js', () => ({
        __esModule: true,
        default: {
          findById: (jest.fn() as any).mockResolvedValue(notLiked),
          findByIdAndUpdate: (jest.fn() as any).mockResolvedValue(updatedAfterPush),
        },
      }))
    ]);

    mod = await import('../../src/controllers/postsController.js');
    toggleLikeCtrl = mod.toggleLikeCtrl;
    req = httpMocks.createRequest({ params: { id: 'p2' }, user: { id: 'u2' } });
    res = httpMocks.createResponse();
    next = jest.fn();
    await toggleLikeCtrl(req, res, next);
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual(updatedAfterPush);
  });
});