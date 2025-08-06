const express = require('express');
const { getAllHoldings, getAllStocks,updateHoldings } = require('../controllers/index');
const { getHoldingsByUserId , getUserStocksNews, allStockLogos, getAllStocksBuy} = require('../controllers/stocks');
const { register, login, logout } = require('../controllers/auth');
const { addWalletCash , getWalletCash} = require('../controllers/user');
const {sellStock, buyStock} = require('../controllers/trade')
const {chatApi} = require('../controllers/chatbot');

const router = express.Router();

router.post('/sell', sellStock);
router.post('/buy', buyStock);


router.post('/addCash', addWalletCash);
router.post('/getWalletCash', getWalletCash); // API endpoint: GET /getWalletCash/:user_id

router.get('/stockNews/:user_id', getUserStocksNews);
router.get('/holdings/:user_id', getHoldingsByUserId); // API endpoint: GET /holdings/:user_id
router.get('/getAllHoldings', getAllHoldings); // API endpoint: GET /data
router.get('/allStockLogos', allStockLogos); // API endpoint: GET /allStockLogos
router.get('/getAllStockBuy', getAllStocksBuy);
router.get('/getAllStocks', getAllStocks);
router.post('/updateHoldings', updateHoldings);

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/chat', chatApi)

module.exports = router;