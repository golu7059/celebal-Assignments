const express = require('express');
const router = express.Router();
const weatherController = require('../controller/weather.controller');
const auth = require('../middleware/auth');

router.get('/:city', auth, weatherController.getWeather);

module.exports = router;
