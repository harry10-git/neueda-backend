const express = require('express');
const { getAllHoldings, getAllStocks,updateHoldings } = require('../controllers/index');
const { getHoldingsByUserId , getUserStocksNews} = require('../controllers/stocks');
const { register, login, logout } = require('../controllers/auth');
const { addWalletCash } = require('../controllers/user');

const router = express.Router();

router.post('/addCash', addWalletCash);

router.get('/stockNews/:user_id', getUserStocksNews);
router.get('/holdings/:user_id', getHoldingsByUserId); // API endpoint: GET /holdings/:user_id
router.get('/getAllHoldings', getAllHoldings); // API endpoint: GET /data
router.get('/getAllStocks', getAllStocks);
router.post('/updateHoldings', updateHoldings);

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

module.exports = router;