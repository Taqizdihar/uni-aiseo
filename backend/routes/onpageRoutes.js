const express = require('express');
const router = express.Router();
const onpageController = require('../controllers/onpageController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(verifyToken);

// Fetch keywords and task data for a specific task
router.get(
  '/task-data/:taskId',
  authorizeRoles('SEO Manager', 'Content Writer'),
  onpageController.getTaskData
);

// Analyze content draft with Gemini AI
router.post(
  '/analyze',
  authorizeRoles('SEO Manager', 'Content Writer'),
  onpageController.analyzeContent
);

// Submit draft for approval (moves task to Waiting Approval)
router.post(
  '/submit',
  authorizeRoles('SEO Manager', 'Content Writer'),
  onpageController.submitDraft
);

module.exports = router;
