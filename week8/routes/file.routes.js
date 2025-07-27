const express = require('express');
const router = express.Router();
const fileController = require('../controller/file.controller');
const auth = require('../middleware/auth');
const upload = require('../middleware/fileUpload');

router.post(
  '/profile-image',
  auth,
  upload.single('profileImage'),
  fileController.uploadProfileImage
);

router.delete(
  '/profile-image',
  auth,
  fileController.deleteProfileImage
);

module.exports = router;
