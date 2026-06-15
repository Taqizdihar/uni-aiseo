const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/team', userController.getTeamMembers);
router.delete('/:id', userController.removeUser);

module.exports = router;
