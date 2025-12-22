import { jest } from '@jest/globals';
import httpMocks from 'node-mocks-http';

describe('categoriesController', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('createCategoryCtrl -> existing category -> calls next with 409', async () => {
    await Promise.all([
      jest.unstable_mockModule('../../src/models/Category.js', () => ({
        __esModule: true,
        default: {
          findOne: (jest.fn() as any).mockResolvedValue({ _id: 'c1', title: 'exists' }),
        },
      }))
    ]);

    const mod = await import('../../src/controllers/categoriesController.js');
    const { createCategoryCtrl } = mod;

    const req: any = httpMocks.createRequest({
      method: 'POST',
      body: { title: 'exists' },
      user: { id: 'u1' },
    });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await createCategoryCtrl(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0] as { status: number, statusCode: number, message: string};
    expect(err).toBeDefined();
    expect(err.status || err.statusCode).toBe(409);
    expect(String(err.message)).toMatch(/Category already exist/i);
  });

  test('createCategoryCtrl -> no existing category -> creates and returns 201 json', async () => {
    const created = { _id: 'c2', title: 'new-cat', user: 'u1' };

    await Promise.all([
      jest.unstable_mockModule('../../src/models/Category.js', () => ({
        __esModule: true,
        default: {
          findOne: (jest.fn() as any).mockResolvedValue(null),
          create: (jest.fn() as any).mockResolvedValue(created),
        },
      }))
    ]);

    const mod = await import('../../src/controllers/categoriesController.js');
    const { createCategoryCtrl } = mod;

    const req: any = httpMocks.createRequest({
      method: 'POST',
      body: { title: 'new-cat' },
      user: { id: 'u1' },
    });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await createCategoryCtrl(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(201);
    const data = res._getJSONData();
    expect(data).toEqual(created);
  });

  test('getAllCategoriesCtrl -> no search -> returns paginated users and totalPages', async () => {
    const fakeDocs = Array.from({ length: 4 }, (_, i) => ({ title: `cat${i}` }));
    const findResult = {
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: (jest.fn() as any).mockResolvedValue(fakeDocs),
    };

    const countDocumentsMock = (jest.fn() as any).mockResolvedValue(25);
    const findMock = jest.fn().mockReturnValue(findResult);

    await Promise.all([
      jest.unstable_mockModule('../../src/models/Category.js', () => ({
        __esModule: true,
        default: {
          countDocuments: countDocumentsMock,
          find: findMock,
        },
      }))
    ]);

    const mod = await import('../../src/controllers/categoriesController.js');
    const { getAllCategoriesCtrl } = mod;

    const req: any = httpMocks.createRequest({
      method: 'GET',
      query: {},
    });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await getAllCategoriesCtrl(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(countDocumentsMock).toHaveBeenCalledWith({});
    expect(findMock).toHaveBeenCalledWith({});
    expect(findResult.skip).toHaveBeenCalledWith(0);
    expect(findResult.limit).toHaveBeenCalledWith(10);

    expect(res.statusCode).toBe(200);
    const data = res._getJSONData();
    expect(data).toHaveProperty('users');
    expect(data.users).toHaveLength(fakeDocs.length);
    expect(data).toHaveProperty('totalPages', Math.ceil(25 / 10));
  });

  test('getAllCategoriesCtrl -> with search and pageNumber -> applies filter and skip', async () => {
    const fakeDocs = [{ title: 'foo' }];
    const findResult = {
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: (jest.fn() as any).mockResolvedValue(fakeDocs),
    };

    const countDocumentsMock = (jest.fn() as any).mockResolvedValue(7);
    const findMock = jest.fn().mockReturnValue(findResult);

    await Promise.all([
      jest.unstable_mockModule('../../src/models/Category.js', () => ({
        __esModule: true,
        default: {
          countDocuments: countDocumentsMock,
          find: findMock,
        },
      }))
    ]);

    const mod = await import('../../src/controllers/categoriesController.js');
    const { getAllCategoriesCtrl } = mod;

    const req: any = httpMocks.createRequest({
      method: 'GET',
      query: { search: 'foo', pageNumber: '2' },
    });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await getAllCategoriesCtrl(req, res, next);

    const expectedFilter = { title: { $regex: 'foo', $options: 'i' } };
    expect(countDocumentsMock).toHaveBeenCalledWith(expectedFilter);
    expect(findMock).toHaveBeenCalledWith(expectedFilter);
    expect(findResult.skip).toHaveBeenCalledWith(10);
    expect(findResult.limit).toHaveBeenCalledWith(10);
    expect(res.statusCode).toBe(200);
    const data = res._getJSONData();
    expect(data.totalPages).toBe(Math.ceil(7 / 10));
    expect(data.users).toEqual(fakeDocs);
  });

  test('deleteCategoryCtrl -> category not found -> next called with 404', async () => {
    await Promise.all([
      jest.unstable_mockModule('../../src/models/Category.js', () => ({
        __esModule: true,
        default: {
          findByIdAndDelete: (jest.fn() as any).mockResolvedValue(null),
        },
      }))
    ]);

    const mod = await import('../../src/controllers/categoriesController.js');
    const { deleteCategoryCtrl } = mod;

    const req: any = httpMocks.createRequest({
      method: 'DELETE',
      params: { id: 'does-not-exist' },
    });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await deleteCategoryCtrl(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0] as { status: number, statusCode: number, message: string};
    expect(err).toBeDefined();
    expect(err.status || err.statusCode).toBe(404);
    expect(String(err.message)).toMatch(/Category not found/i);
  });

  test('deleteCategoryCtrl -> success -> returns 200 and categoryId', async () => {
    const deleted = { _id: 'c-deleted' };
    await Promise.all([
      jest.unstable_mockModule('../../src/models/Category.js', () => ({
        __esModule: true,
        default: {
          findByIdAndDelete: (jest.fn() as any).mockResolvedValue(deleted),
        },
      }))
    ]);

    const mod = await import('../../src/controllers/categoriesController.js');
    const { deleteCategoryCtrl } = mod;

    const req: any = httpMocks.createRequest({
      method: 'DELETE',
      params: { id: 'c-deleted' },
    });
    const res: any = httpMocks.createResponse();
    const next = jest.fn();

    await deleteCategoryCtrl(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    const data = res._getJSONData();
    expect(data).toHaveProperty('message');
    expect(data).toHaveProperty('categoryId', deleted._id);
  });
});