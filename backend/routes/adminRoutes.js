const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(verifyToken);
router.use(authorizeRoles('Administrator'));

// Metrics
router.get('/metrics', adminController.getMetrics);

// Users
router.get('/users', adminController.getUsers);
router.put('/users/:id/status', adminController.updateUserStatus);
router.delete('/users/:id', adminController.deleteUser);

// Workspaces
router.get('/workspaces', adminController.getWorkspaces);
router.put('/workspaces/:id/status', adminController.updateWorkspaceStatus);

// Audit Trail
router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;
