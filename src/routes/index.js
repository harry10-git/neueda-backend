const express = require('express');
const { getAllHoldings, getAllStocks,updateHoldings } = require('../controllers/index');
const { register, login, logout } = require('../controllers/auth');

const router = express.Router();

router.get('/getAllHoldings', getAllHoldings); // API endpoint: GET /data
router.get('/getAllStocks', getAllStocks);
router.post('/updateHoldings', updateHoldings);

router.post('/register', register);
router.post('/login', login);
//router.post('/logout', logout);

module.exports = router;