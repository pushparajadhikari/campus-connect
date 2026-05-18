const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../src/config/database', () => ({
  query: jest.fn(),
  pool: { query: jest.fn(), connect: jest.fn(), end: jest.fn() },
  getClient: jest.fn(),
}));

const { query } = require('../../src/config/database');
process.env.JWT_SECRET = 'test-secret-key';
process.env.NODE_ENV = 'test';

let app;
const validToken = jwt.sign({ userId: 'user-123' }, 'test-secret-key');
const mockUser = { id: 'user-123', name: 'Test User', email: 'test@campus.edu', role: 'student', avatar_url: null, is_active: true };

beforeAll(() => {
  app = require('../../src/server').app;
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('Posts API', () => {
  describe('GET /api/posts/categories', () => {
    it('should return categories', async () => {
      query.mockResolvedValueOnce({
        rows: [
          { id: 1, slug: 'lost-and-found', name: 'Lost & Found', post_count: '5' },
          { id: 2, slug: 'books', name: 'Books', post_count: '10' },
        ],
      });

      const res = await request(app).get('/api/posts/categories');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
    });
  });

  describe('GET /api/posts', () => {
    it('should return posts list', async () => {
      query
        .mockResolvedValueOnce({
          rows: [{
            id: 'post-1', title: 'Test Post', description: 'Description', price: null,
            location: 'Campus', status: 'active', category_slug: 'books',
            author_name: 'Test User', like_count: '3', images: null, files: null,
            created_at: new Date(),
          }],
        })
        .mockResolvedValueOnce({ rows: [{ total: '1' }] });

      const res = await request(app).get('/api/posts');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.pagination).toBeDefined();
    });

    it('should support category filter', async () => {
      query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ total: '0' }] });

      const res = await request(app).get('/api/posts?category=books');
      expect(res.status).toBe(200);
    });

    it('should support search filter', async () => {
      query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ total: '0' }] });

      const res = await request(app).get('/api/posts?search=calculus');
      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/posts', () => {
    it('should reject unauthenticated post creation', async () => {
      const res = await request(app).post('/api/posts').send({
        title: 'Test Post',
        description: 'A test post description',
        categoryId: 1,
      });
      expect(res.status).toBe(401);
    });

    it('should create a post when authenticated', async () => {
      // Auth query
      query
        .mockResolvedValueOnce({ rows: [mockUser] })
        // Insert post
        .mockResolvedValueOnce({ rows: [{ id: 'new-post-id' }] })
        // Get post
        .mockResolvedValueOnce({
          rows: [{
            id: 'new-post-id', title: 'Test Post', description: 'A test post description',
            category_id: 1, category_slug: 'books', category_name: 'Books',
            author_id: 'user-123', author_name: 'Test User', like_count: '0',
            images: null, files: null, created_at: new Date(),
          }],
        });

      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ title: 'Test Post', description: 'A test post description', categoryId: 1 });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should reject post with short title', async () => {
      query.mockResolvedValueOnce({ rows: [mockUser] });

      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ title: 'Hi', description: 'A test post description that is long enough', categoryId: 1 });

      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/posts/:id', () => {
    it('should reject unauthenticated delete', async () => {
      const res = await request(app).delete('/api/posts/some-id');
      expect(res.status).toBe(401);
    });

    it('should return 404 for non-existent post', async () => {
      query
        .mockResolvedValueOnce({ rows: [mockUser] }) // auth
        .mockResolvedValueOnce({ rows: [] }); // find post

      const res = await request(app)
        .delete('/api/posts/non-existent-id')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(404);
    });
  });
});
