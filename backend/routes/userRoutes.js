const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/team', authorizeRoles('SEO Manager', 'SEO Analyst', 'Content Writer', 'Administrator', 'admin'), userController.getTeamMembers);
router.delete('/:id', authorizeRoles('SEO Manager', 'Administrator', 'admin'), userController.removeUser);

const upload = require('../middleware/uploadMiddleware');
router.get('/profile', userController.getProfile);
router.put('/profile', upload.single('profile_picture'), userController.updateProfile);

module.exports = router;
