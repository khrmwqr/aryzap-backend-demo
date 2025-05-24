const express = require('express');
const router = express.Router();
const CTAController = require('../controllers/CTAController');

router.post('/', CTAController.createCTA);
router.get('/', CTAController.getAllCTAs);
router.get('/:id', CTAController.getCTAById);
router.put('/:id', CTAController.updateCTA);
router.delete('/:id', CTAController.deleteCTA);

module.exports = router;