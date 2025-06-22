const express = require('express');
const fsCallback = require('fs');
const fs = require('fs').promises;

const app = express();
app.use(express.json());

// Callback-based implementation
app.get('/data-callback', (req, res) => {
  fsCallback.readFile('data.txt', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    res.send(data);
  });
});

app.post('/data-callback', (req, res) => {
  const payload = JSON.stringify(req.body, null, 2);
  fsCallback.writeFile('data.txt', payload, err => {
    if (err) {
      return res.status(500).send(err.message);
    }
    res.send('Data saved via callback');
  });
});

// Promise & Async/Await implementation
app.get('/data', async (req, res) => {
  try {
    const data = await fs.readFile('data.txt', 'utf8');
    res.send(data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post('/data', async (req, res) => {
  try {
    const payload = JSON.stringify(req.body, null, 2);
    await fs.writeFile('data.txt', payload);
    res.send('Data saved via async/await');
  } catch (error) {
    res.status(500).send(error.message);
  }
});


app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
