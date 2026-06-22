const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/', authorizeRoles('SEO Manager', 'SEO Analyst', 'Content Writer', 'Administrator', 'admin'), taskController.getTasks);
router.get('/active', authorizeRoles('SEO Manager', 'SEO Analyst', 'Content Writer', 'Administrator', 'admin'), taskController.getActiveTasks);
router.get('/:id/details', authorizeRoles('SEO Manager', 'SEO Analyst', 'Content Writer', 'Administrator', 'admin'), taskController.getTaskDetails);
router.post('/', authorizeRoles('SEO Manager'), taskController.createTask);
router.put('/:id/status', authorizeRoles('SEO Manager', 'SEO Analyst', 'Content Writer'), taskController.updateTaskStatus);
router.delete('/:id', authorizeRoles('SEO Manager'), taskController.deleteTask);
router.get('/archive', authorizeRoles('SEO Manager', 'Administrator', 'admin'), taskController.getArchive);
router.get('/stats', authorizeRoles('SEO Manager', 'SEO Analyst', 'Content Writer', 'Administrator', 'admin'), taskController.getDashboardStats);

module.exports = router;
