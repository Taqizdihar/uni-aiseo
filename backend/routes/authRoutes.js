const express = require('express');
const router = express.Router();
const { register, login, changePassword } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/change-password
router.post('/change-password', verifyToken, changePassword);

module.exports = router;
