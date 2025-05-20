const router = require('express').Router();
const PromotionalBannerController = require('../controllers/PromotionalBannerController');

router.get('/', PromotionalBannerController.getAllPromotionalBanner);
router.get('/:pbId', PromotionalBannerController.getSpecificPromotionalBanner);
router.post('/', PromotionalBannerController.createPromotionalBanner);
router.put('/:pbId', PromotionalBannerController.updatePromotionalBanner);
router.delete('/:pbId', PromotionalBannerController.deletePromotionalBanner);

module.exports = router;