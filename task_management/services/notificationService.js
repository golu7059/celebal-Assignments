const Notification = require('../models/Notification');
const User = require('../models/User');
const nodemailer = require('nodemailer');

// Create a transporter object
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Create a new notification
exports.createNotification = async (notificationData) => {
  try {
    const notification = new Notification(notificationData);
    await notification.save();
    
    // Get recipient user for email
    const user = await User.findById(notificationData.recipient);
    
    // Send email notification
    if (user && user.email) {
      await sendEmailNotification(user.email, notificationData.message);
    }
    
    return notification;
  } catch (err) {
    console.error('Error creating notification:', err);
    throw err;
  }
};

// Check for approaching deadlines and send notifications
exports.checkDeadlines = async () => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
    
    // Find tasks with deadlines approaching in the next 24 hours
    const tasksWithDeadlines = await Task.find({
      deadline: {
        $gte: tomorrow,
        $lt: dayAfterTomorrow
      },
      status: { $ne: 'completed' }
    }).populate('assignedTo').populate('creator');
    
    // Create notifications for each task
    for (const task of tasksWithDeadlines) {
      // Notify the assigned user
      if (task.assignedTo) {
        await this.createNotification({
          recipient: task.assignedTo._id,
          task: task._id,
          type: 'deadline_approaching',
          message: `Deadline approaching for task: ${task.title}`
        });
      }
      
      // Notify the creator if different from assignee
      if (task.creator && (!task.assignedTo || task.assignedTo._id.toString() !== task.creator._id.toString())) {
        await this.createNotification({
          recipient: task.creator._id,
          task: task._id,
          type: 'deadline_approaching',
          message: `Deadline approaching for task: ${task.title}`
        });
      }
    }
    
    console.log('Deadline check completed.');
  } catch (err) {
    console.error('Error checking deadlines:', err);
  }
};

// Send email notification
const sendEmailNotification = async (email, message) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Task Management Notification',
      text: message,
      html: `<p>${message}</p>`
    };
    
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Error sending email:', err);
  }
};
