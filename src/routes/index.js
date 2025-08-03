const express = require('express');
const { getAllHoldings, getAllStocks,updateHoldings } = require('../controllers/index');

const router = express.Router();

router.get('/getAllHoldings', getAllHoldings); // API endpoint: GET /data
router.get('/getAllStocks', getAllStocks);
router.post('/updateHoldings', updateHoldings);

module.exports = router;