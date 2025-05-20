const router = require('express').Router();
const BillingsController = require('../controllers/BillingsController');

router.get('/', BillingsController.getAllBillings);
router.get('/:billingsId', BillingsController.getSpecificBillings);
router.post('/', BillingsController.createBillings);
router.put('/:billingsId', BillingsController.updateBillings);
router.delete('/:billingsId', BillingsController.deleteBillings);

module.exports = router;