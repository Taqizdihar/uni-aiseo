const express = require('express');
const router = express.Router();
const multer = require('multer');
const userController = require('../controllers/userController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/team', authorizeRoles('SEO Manager', 'SEO Analyst', 'Content Writer', 'Administrator', 'admin'), userController.getTeamMembers);
router.delete('/:id', authorizeRoles('SEO Manager', 'Administrator', 'admin'), userController.removeUser);

const upload = require('../middleware/uploadMiddleware');
router.get('/profile', userController.getProfile);

// Profile update with multer error handling
router.put('/profile', (req, res, next) => {
  upload.single('profile_picture')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Multer-specific errors (e.g. file too large)
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'Ukuran file melebihi batas 2MB.' });
      }
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      // Custom file filter errors
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, userController.updateProfile);

module.exports = router;
