const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/', faqController.getFaqs);

router.post(
  '/',
  authorizeRoles('Administrator'),
  faqController.createFaq
);

router.put(
  '/:id',
  authorizeRoles('Administrator'),
  faqController.updateFaq
);

router.delete(
  '/:id',
  authorizeRoles('Administrator'),
  faqController.deleteFaq
);

module.exports = router;
