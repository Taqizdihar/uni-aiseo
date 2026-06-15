const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/', authorizeRoles('SEO Manager', 'SEO Analyst', 'Content Writer', 'Administrator', 'admin'), taskController.getTasks);
router.post('/', authorizeRoles('SEO Manager', 'SEO Analyst', 'Content Writer', 'Administrator', 'admin'), taskController.createTask);
router.put('/:id/status', authorizeRoles('SEO Manager', 'SEO Analyst', 'Content Writer', 'Administrator', 'admin'), taskController.updateTaskStatus);
router.get('/archive', authorizeRoles('SEO Manager', 'Administrator', 'admin'), taskController.getArchive);

module.exports = router;
