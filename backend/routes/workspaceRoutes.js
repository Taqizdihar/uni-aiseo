const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const workspaceController = require('../controllers/workspaceController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(verifyToken);

router.get('/dashboard', authorizeRoles('SEO Manager', 'Administrator', 'admin'), taskController.getDashboardMetrics);
router.put('/profile', authorizeRoles('SEO Manager', 'Administrator', 'admin'), upload.single('background_image'), workspaceController.updateProfile);

module.exports = router;
