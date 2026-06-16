const express = require('express');
const router = express.Router();
const { sendInvite } = require('../controllers/teamController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// POST /api/team/invite - Send workspace invitation (SEO Manager only)
router.post('/invite', verifyToken, authorizeRoles('SEO Manager'), sendInvite);

module.exports = router;
