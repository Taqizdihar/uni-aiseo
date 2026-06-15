const express = require('express');
const router = express.Router();
const visualController = require('../controllers/visualController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(verifyToken);

// Analyze an uploaded image with Gemini AI
router.post(
  '/analyze',
  authorizeRoles('SEO Manager', 'SEO Analyst'),
  upload.single('image'),
  visualController.analyzeImage
);

// Save analysis results to a task
router.post(
  '/save',
  authorizeRoles('SEO Manager', 'SEO Analyst'),
  visualController.saveToTask
);

// Get active tasks for the dropdown
router.get(
  '/active-tasks',
  authorizeRoles('SEO Manager', 'SEO Analyst'),
  visualController.getActiveTasks
);

module.exports = router;
