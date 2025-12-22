import validateObjectIdParam from '../../src/middlewares/validateObjectId.js';
import httpMocks from 'node-mocks-http';
import { jest } from "@jest/globals";

describe('validateObjectId middleware', () => {
  it('calls next with error for invalid id', () => {
    const mw = validateObjectIdParam('id');
    const req = httpMocks.createRequest({ params: { id: 'invalid' } });
    const res = httpMocks.createResponse();
    const next = jest.fn();
    mw(req as any, res as any, next);
    expect(next).toHaveBeenCalled();
    const err = (next as jest.Mock).mock.calls[0][0];
    expect(err).toBeTruthy();
  });

  it('calls next without error for valid id', () => {
    const mw = validateObjectIdParam('id');
    const req = httpMocks.createRequest({ params: { id: '507f1f77bcf86cd799439011' } });
    const res = httpMocks.createResponse();
    const next = jest.fn();
    mw(req as any, res as any, next);
    expect(next).toHaveBeenCalledWith();
  });
});