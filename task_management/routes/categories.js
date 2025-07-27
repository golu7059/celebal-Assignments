const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const categoryController = require('../controllers/categoryController');
const auth = require('../middleware/auth');

router.get('/', auth, categoryController.getAllCategories);
router.post(
  '/',
  [
    auth,
    [
      check('name', 'Name is required').not().isEmpty()
    ]
  ],
  categoryController.createCategory
);
router.put(
  '/:id',
  [
    auth,
    [
      check('name', 'Name is required').not().isEmpty()
    ]
  ],
  categoryController.updateCategory
);

router.delete('/:id', auth, categoryController.deleteCategory);

module.exports = router;
