const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const notificationService = require('../services/notificationService');

// Get all tasks
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('creator', 'name email')
      .populate('assignedTo', 'name email')
      .populate('category', 'name color')
      .sort({ createdAt: -1 });
    
    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get task by ID
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('creator', 'name email')
      .populate('assignedTo', 'name email')
      .populate('category', 'name color');
    
    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }
    
    res.json(task);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Task not found' });
    }
    res.status(500).send('Server error');
  }
};

// Create a new task
exports.createTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    title,
    description,
    assignedTo,
    category,
    status,
    priority,
    deadline
  } = req.body;

  try {
    const newTask = new Task({
      title,
      description,
      creator: req.user.id,
      assignedTo,
      category,
      status,
      priority,
      deadline
    });

    const task = await newTask.save();

    // Create notification if task is assigned to someone
    if (assignedTo && assignedTo !== req.user.id) {
      await notificationService.createNotification({
        recipient: assignedTo,
        sender: req.user.id,
        task: task._id,
        type: 'task_assigned',
        message: `You have been assigned a new task: ${title}`
      });
    }

    const populatedTask = await Task.findById(task._id)
      .populate('creator', 'name email')
      .populate('assignedTo', 'name email')
      .populate('category', 'name color');

    res.json(populatedTask);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    title,
    description,
    assignedTo,
    category,
    status,
    priority,
    deadline
  } = req.body;

  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }

    if (task.creator.toString() !== req.user.id && 
        (task.assignedTo && task.assignedTo.toString() !== req.user.id) &&
        req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const prevStatus = task.status;
    const prevAssignedTo = task.assignedTo ? task.assignedTo.toString() : null;

    const taskFields = {};
    if (title) taskFields.title = title;
    if (description) taskFields.description = description;
    if (assignedTo) taskFields.assignedTo = assignedTo;
    if (category) taskFields.category = category;
    if (status) taskFields.status = status;
    if (priority) taskFields.priority = priority;
    if (deadline) taskFields.deadline = deadline;
    taskFields.updatedAt = Date.now();

    task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: taskFields },
      { new: true }
    ).populate('creator', 'name email')
     .populate('assignedTo', 'name email')
     .populate('category', 'name color');

    // Send notifications if needed
    if (status && prevStatus !== status) {
      await notificationService.createNotification({
        recipient: task.assignedTo || task.creator,
        sender: req.user.id,
        task: task._id,
        type: 'status_update',
        message: `Task "${task.title}" status changed to ${status}`
      });
    }

    if (assignedTo && prevAssignedTo !== assignedTo) {
      await notificationService.createNotification({
        recipient: assignedTo,
        sender: req.user.id,
        task: task._id,
        type: 'task_assigned',
        message: `You have been assigned task: ${task.title}`
      });
    }

    res.json(task);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Task not found' });
    }
    res.status(500).send('Server error');
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }

    if (task.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await task.deleteOne();
    
    // Delete related notifications
    await Notification.deleteMany({ task: req.params.id });

    res.json({ msg: 'Task removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Task not found' });
    }
    res.status(500).send('Server error');
  }
};

// Get current user's tasks
exports.getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      $or: [
        { creator: req.user.id },
        { assignedTo: req.user.id }
      ]
    })
      .populate('creator', 'name email')
      .populate('assignedTo', 'name email')
      .populate('category', 'name color')
      .sort({ createdAt: -1 });
    
    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
