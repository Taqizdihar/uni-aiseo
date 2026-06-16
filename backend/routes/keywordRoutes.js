const express = require('express');
const router = express.Router();
const keywordController = require('../controllers/keywordController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(verifyToken);

// Generate keywords with Gemini AI
router.post(
  '/generate',
  authorizeRoles('SEO Manager', 'SEO Analyst'),
  keywordController.generateKeywords
);

// Save selected keywords to a task
router.post(
  '/save',
  authorizeRoles('SEO Manager', 'SEO Analyst'),
  keywordController.saveKeywords
);

module.exports = router;
