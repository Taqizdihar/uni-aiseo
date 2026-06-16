const express = require('express');
const router = express.Router();
const metatagController = require('../controllers/metatagController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(verifyToken);

// Generate meta tags
router.post(
  '/generate',
  authorizeRoles('SEO Manager', 'SEO Analyst', 'Content Writer'),
  metatagController.generateMetaTags
);

// Save meta tags to a task
router.post(
  '/save',
  authorizeRoles('SEO Manager', 'SEO Analyst', 'Content Writer'),
  metatagController.saveMetaTags
);

module.exports = router;
