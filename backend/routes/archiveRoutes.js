const express = require('express');
const router = express.Router();
const archiveController = require('../controllers/archiveController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get(
  '/',
  authorizeRoles('SEO Manager', 'SEO Analyst', 'Content Writer'),
  archiveController.getArchive
);

module.exports = router;
