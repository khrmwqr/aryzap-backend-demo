const router = require('express').Router();
const GeoPolicyController = require('../controllers/GeoPolicyController');

router.get('/', GeoPolicyController.getAllGeoPolicy);
router.get('/:geoPolicyId', GeoPolicyController.getSpecificGeoPolicy);
router.post('/', GeoPolicyController.createGeoPolicy);
router.put('/:geoPolicyId', GeoPolicyController.updateGeoPolicy);
router.delete('/:geoPolicyId', GeoPolicyController.deleteGeoPolicy);

module.exports = router;