// tests/controllers/auth.test.js

const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

jest.mock('../../src/config/database', () => ({
  query: jest.fn()
}));
const db = require('../../src/config/database');
const authController = require('../../src/controllers/auth');

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.post('/register', authController.register);
app.post('/login', authController.login);
app.post('/logout', authController.logout);

describe('Auth Controller', () => {
  afterEach(() => jest.clearAllMocks());

  describe('register', () => {
    it('should return 409 if user already exists', async () => {
      db.query.mockResolvedValueOnce([[{ id: 1 }]]);
      const res = await request(app).post('/register').send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

      expect(res.status).toBe(409);
      expect(res.body).toBe("User already exists!");
    });

    it('should return 200 if user is successfully created', async () => {
      db.query
        .mockResolvedValueOnce([[]]) // no existing user
        .mockResolvedValueOnce([{}]); // insert query

      const res = await request(app).post('/register').send({
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123'
      });

      expect(res.status).toBe(200);
      expect(res.body).toBe("User has been created successfully!");
    });
  });

  describe('login', () => {
    it('should return 404 if user not found', async () => {
      db.query.mockResolvedValueOnce([[]]);

      const res = await request(app).post('/login').send({
        username: 'missinguser',
        password: 'password'
      });

      expect(res.status).toBe(404);
      expect(res.body).toBe("User not found!");
    });
  });

  describe('logout', () => {
    it('should clear the access token cookie and return success', async () => {
      const res = await request(app).post('/logout');

      expect(res.status).toBe(200);
      expect(res.body).toBe("User has been logged out.");
      expect(res.headers['set-cookie']).toBeDefined();
    });
  });
});
