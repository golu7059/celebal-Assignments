const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');
const dotenv = require('dotenv');
const notificationService = require('./services/notificationService');

dotenv.config();
const app = express();

// MnongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

app.use(cors());
app.use(express.json({ extended: false }));

// routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/notifications', require('./routes/notifications'));

// Schedule deadline checks every day at midnight
cron.schedule('0 0 * * *', () => {
  console.log('Running deadline check...');
  notificationService.checkDeadlines();
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));