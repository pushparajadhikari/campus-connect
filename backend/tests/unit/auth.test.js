const request = require('supertest');

// Mock the database module
jest.mock('../../src/config/database', () => ({
  query: jest.fn(),
  pool: { query: jest.fn(), connect: jest.fn(), end: jest.fn() },
  getClient: jest.fn(),
}));

const { query } = require('../../src/config/database');

// Set env before requiring app
process.env.JWT_SECRET = 'test-secret-key';
process.env.NODE_ENV = 'test';

let app;
beforeAll(() => {
  app = require('../../src/server').app;
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      query
        .mockResolvedValueOnce({ rows: [] }) // check existing email
        .mockResolvedValueOnce({
          rows: [{
            id: 'uuid-123',
            name: 'Test User',
            email: 'test@campus.edu',
            role: 'student',
            avatar_url: null,
            department: 'CS',
            year_of_study: 2,
            created_at: new Date(),
          }],
        });

      const res = await request(app).post('/api/auth/register').send({
        name: 'Test User',
        email: 'test@campus.edu',
        password: 'Password1',
        department: 'CS',
        yearOfStudy: 2,
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user.email).toBe('test@campus.edu');
    });

    it('should reject duplicate email', async () => {
      query.mockResolvedValueOnce({ rows: [{ id: 'existing-id' }] });

      const res = await request(app).post('/api/auth/register').send({
        name: 'Test User',
        email: 'existing@campus.edu',
        password: 'Password1',
      });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should reject weak password', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Test User',
        email: 'test@campus.edu',
        password: 'weak',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });

    it('should reject invalid email', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Test User',
        email: 'not-an-email',
        password: 'Password1',
      });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should reject login with wrong credentials', async () => {
      query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app).post('/api/auth/login').send({
        email: 'notfound@campus.edu',
        password: 'Password1',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject missing credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({});
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should reject unauthenticated request', async () => {
      const res = await request(app).get('/api/auth/profile');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid.token.here');
      expect(res.status).toBe(401);
    });
  });
});

describe('Health Check', () => {
  it('should return healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });
});
