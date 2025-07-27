const User = require('../model/user');
const fs = require('fs');
const path = require('path');
const { AppError } = require('../middleware/error');

exports.uploadProfileImage = async (req, res) => {
  if (!req.file) {
    throw new AppError('Please upload an image file', 400);
  }

  const user = await User.findById(req.user.id);
  
  // Delete old profile image if exists
  if (user.profileImage) {
    const oldImagePath = path.join(__dirname, '..', user.profileImage);
    if (fs.existsSync(oldImagePath)) {
      fs.unlinkSync(oldImagePath);
    }
  }

  // Update user with new profile image
  user.profileImage = `/uploads/${req.file.filename}`;
  await user.save();

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage
      }
    }
  });
};

exports.deleteProfileImage = async (req, res) => {
  const user = await User.findById(req.user.id);
  
  if (!user.profileImage) {
    throw new AppError('User has no profile image', 400);
  }

  // Delete profile image
  const imagePath = path.join(__dirname, '..', user.profileImage);
  if (fs.existsSync(imagePath)) {
    fs.unlinkSync(imagePath);
  }

  // Update user
  user.profileImage = null;
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Profile image deleted successfully'
  });
};
