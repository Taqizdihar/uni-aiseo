const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/metrics', authorizeRoles('SEO Manager', 'SEO Analyst', 'Content Writer', 'Administrator', 'admin'), taskController.getMetrics);

module.exports = router;
