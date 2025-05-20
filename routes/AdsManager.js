const router = require('express').Router();
const AdsManagerController = require('../controllers/AdsManagerController');

router.get('/', AdsManagerController.getAllAdsManager);
router.get('/:adsManagerId', AdsManagerController.getSpecificAdsManager);
router.post('/', AdsManagerController.createAdsManager);
router.put('/:adsManagerId', AdsManagerController.updateAdsManager);
router.delete('/:adsManagerId', AdsManagerController.deleteAdsManager);

module.exports = router;