const Notification = require('../models/Notification');

exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .populate('sender', 'name')
      .populate('task', 'title')
      .sort({ createdAt: -1 });
    
    res.json(notifications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    let notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ msg: 'Notification not found' });
    }

    if (notification.recipient.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    notification.read = true;
    await notification.save();

    res.json(notification);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Notification not found' });
    }
    res.status(500).send('Server error');
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { $set: { read: true } }
    );
    
    res.json({ msg: 'All notifications marked as read' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ msg: 'Notification not found' });
    }

    if (notification.recipient.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await notification.deleteOne();
    res.json({ msg: 'Notification removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Notification not found' });
    }
    res.status(500).send('Server error');
  }
};
