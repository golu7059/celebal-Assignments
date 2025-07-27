const { validationResult } = require('express-validator');
const Category = require('../models/Category');

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .sort({ name: 1 });
    
    res.json(categories);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
exports.createCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, description, color } = req.body;

  try {
    // Check if category already exists
    let category = await Category.findOne({ name });
    if (category) {
      return res.status(400).json({ msg: 'Category already exists' });
    }

    category = new Category({
      name,
      description,
      color,
      createdBy: req.user.id
    });

    await category.save();
    res.json(category);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update a category
exports.updateCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, description, color } = req.body;

  try {
    let category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ msg: 'Category not found' });
    }

    if (category.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    if (name) category.name = name;
    if (description) category.description = description;
    if (color) category.color = color;

    await category.save();
    res.json(category);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ msg: 'Category not found' });
    }

    if (category.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await category.deleteOne();
    res.json({ msg: 'Category removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
