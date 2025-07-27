const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

router.get('/', auth, notificationController.getMyNotifications);
router.put('/:id', auth, notificationController.markAsRead);
router.put('/', auth, notificationController.markAllAsRead);
router.delete('/:id', auth, notificationController.deleteNotification);

module.exports = router;
