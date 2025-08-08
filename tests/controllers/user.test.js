// tests/controllers/user.test.js

const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');

jest.mock('../../src/config/database', () => ({
  query: jest.fn()
}));
const db = require('../../src/config/database');
const userController = require('../../src/controllers/user'); // updated path

const app = express();
app.use(bodyParser.json());
app.post('/user/add-wallet-cash', userController.addWalletCash);
app.post('/user/get-wallet-cash', userController.getWalletCash);

describe('User Controller - Wallet Operations', () => {
  afterEach(() => jest.clearAllMocks());

  describe('addWalletCash', () => {
    it('should return 400 if user_id or amount is missing/invalid', async () => {
      const res = await request(app).post('/user/add-wallet-cash').send({ user_id: 1 });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "user_id and amount are required" });

      const res2 = await request(app).post('/user/add-wallet-cash').send({ amount: 100 });
      expect(res2.status).toBe(400);
      expect(res2.body).toEqual({ error: "user_id and amount are required" });
    });

    it('should return 404 if user not found', async () => {
      db.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

      const res = await request(app).post('/user/add-wallet-cash').send({ user_id: 1, amount: 100 });
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "User not found" });
    });

    it('should return 200 if wallet is updated successfully', async () => {
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app).post('/user/add-wallet-cash').send({ user_id: 1, amount: 100 });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: "Wallet cash updated successfully" });
    });

    it('should return 500 on database error', async () => {
      db.query.mockRejectedValueOnce(new Error("Database failure"));

      const res = await request(app).post('/user/add-wallet-cash').send({ user_id: 1, amount: 100 });
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Database error" });
    });
  });

  describe('getWalletCash', () => {
    it('should return 400 if user_id is missing', async () => {
      const res = await request(app).post('/user/get-wallet-cash').send({});
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "user_id is required" });
    });

    it('should return 404 if user not found', async () => {
      db.query.mockResolvedValueOnce([[]]);

      const res = await request(app).post('/user/get-wallet-cash').send({ user_id: 1 });
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "User not found" });
    });

    it('should return 200 with wallet_cash if user is found', async () => {
      db.query.mockResolvedValueOnce([[{ wallet_cash: 150 }]]);

      const res = await request(app).post('/user/get-wallet-cash').send({ user_id: 1 });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ wallet_cash: 150 });
    });

    it('should return 500 on database error', async () => {
      db.query.mockRejectedValueOnce(new Error("Database failure"));

      const res = await request(app).post('/user/get-wallet-cash').send({ user_id: 1 });
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Database error" });
    });
  });
});
