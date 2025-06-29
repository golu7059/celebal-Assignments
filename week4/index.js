const express = require('express');
const logger = require('./middleware/logger');
const router = require('./routes');

const app = express();

app.use(logger);

app.use(router);

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
