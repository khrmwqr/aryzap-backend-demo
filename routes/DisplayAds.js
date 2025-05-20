const router = require('express').Router();
const DisplayAdsController = require('../controllers/DisplayAdsController');

router.post('/', DisplayAdsController.createDisplayAds);
router.get('/', DisplayAdsController.getAllDisplayAds);
router.get('/:dadsId', DisplayAdsController.getSpecificDisplayAds);
router.put('/:dadsId', DisplayAdsController.updateDisplayAds);
router.delete('/:dadsId', DisplayAdsController.deleteDisplayAds);

module.exports = router;