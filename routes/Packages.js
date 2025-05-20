const router = require('express').Router();
const PackagesController = require('../controllers/PackagesController');

router.get('/', PackagesController.getAllPackages);
router.get('/:packageId', PackagesController.getSpecificPackages);
router.post('/', PackagesController.createPackages);
router.put('/:packageId', PackagesController.updatePackages);
router.delete('/:packageId', PackagesController.deletePackages);

module.exports = router;