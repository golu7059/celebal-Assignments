const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');

router.get('/', auth, taskController.getAllTasks);
router.get('/me', auth, taskController.getMyTasks);
router.get('/:id', auth, taskController.getTaskById);

router.post(
  '/',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty()
    ]
  ],
  taskController.createTask
);

router.put('/:id', auth, taskController.updateTask);
router.delete('/:id', auth, taskController.deleteTask);

module.exports = router;
