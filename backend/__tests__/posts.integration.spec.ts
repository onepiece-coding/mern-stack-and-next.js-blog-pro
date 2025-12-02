import request from 'supertest';
import app from '../src/app'; // no extension — ts-jest + moduleNameMapper handles both styles

describe('GET /api/v1/posts (integration)', () => {
  it('returns posts list (empty at start)', async () => {
    const res = await request(app).get('/api/v1/posts').expect(200);
    expect(res.body).toHaveProperty('posts');
    expect(Array.isArray(res.body.posts)).toBe(true);
  });
});