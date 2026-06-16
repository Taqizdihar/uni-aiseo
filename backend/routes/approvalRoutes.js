const express = require('express');
const router = express.Router();
const approvalController = require('../controllers/approvalController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(verifyToken);

// Fetch pending approvals
router.get(
  '/pending',
  authorizeRoles('SEO Manager'),
  approvalController.getPendingApprovals
);

// Approve a task
router.put(
  '/:taskId/approve',
  authorizeRoles('SEO Manager'),
  approvalController.approveTask
);

// Reject a task
router.put(
  '/:taskId/reject',
  authorizeRoles('SEO Manager'),
  approvalController.rejectTask
);

module.exports = router;
