const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('This is the week 4 assignment solution by Golu kumar.');
});

router.get('/status', (req, res) => {
  res.json({ status: 'OK', timestamp: Date.now() });
});

module.exports = router;
