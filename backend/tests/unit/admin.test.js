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
const adminToken = jwt.sign({ userId: 'admin-123' }, 'test-secret-key');
const studentToken = jwt.sign({ userId: 'student-123' }, 'test-secret-key');
const adminUser = { id: 'admin-123', name: 'Admin', email: 'admin@campus.edu', role: 'admin', avatar_url: null, is_active: true };
const studentUser = { id: 'student-123', name: 'Student', email: 'student@campus.edu', role: 'student', avatar_url: null, is_active: true };

beforeAll(() => { app = require('../../src/server').app; });
afterEach(() => { jest.clearAllMocks(); });

describe('Admin API', () => {
  describe('GET /api/admin/stats', () => {
    it('should reject non-admin access', async () => {
      query.mockResolvedValueOnce({ rows: [studentUser] });
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(403);
    });

    it('should return stats for admin', async () => {
      query
        .mockResolvedValueOnce({ rows: [adminUser] }) // auth
        .mockResolvedValueOnce({ rows: [{ total: '100', new_this_week: '10' }] }) // users
        .mockResolvedValueOnce({ rows: [{ total: '50', active: '40', pending: '5' }] }) // posts
        .mockResolvedValueOnce({ rows: [{ total: '3', pending: '2' }] }) // reports
        .mockResolvedValueOnce({ rows: [] }); // recent posts

      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.stats).toBeDefined();
    });

    it('should reject unauthenticated requests', async () => {
      const res = await request(app).get('/api/admin/stats');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/admin/users', () => {
    it('should return users list for admin', async () => {
      query
        .mockResolvedValueOnce({ rows: [adminUser] })
        .mockResolvedValueOnce({ rows: [adminUser, studentUser] })
        .mockResolvedValueOnce({ rows: [{ total: '2' }] });

      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/admin/posts/:postId/status', () => {
    it('should update post status', async () => {
      query
        .mockResolvedValueOnce({ rows: [adminUser] }) // auth
        .mockResolvedValueOnce({ rows: [] }); // update

      const res = await request(app)
        .put('/api/admin/posts/post-123/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'rejected' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should reject invalid status', async () => {
      query.mockResolvedValueOnce({ rows: [adminUser] });
      const res = await request(app)
        .put('/api/admin/posts/post-123/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'invalid_status' });

      expect(res.status).toBe(400);
    });
  });
});
