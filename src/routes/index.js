const express = require('express');
const { getAllData } = require('../controllers/index');

const router = express.Router();

router.get('/data', getAllData); // API endpoint: GET /data

module.exports = router;