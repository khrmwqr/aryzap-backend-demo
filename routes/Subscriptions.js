const router = require('express').Router();
const SubscriptionsController = require('../controllers/SubscriptionsController');

router.get('/', SubscriptionsController.getAllSubscriptions);
router.get('/:subsId', SubscriptionsController.getSpecificSubscriptions);
router.post('/', SubscriptionsController.createSubscriptions);
router.put('/:subsId', SubscriptionsController.updateSubscriptions);
router.delete('/:subsId', SubscriptionsController.deleteSubscriptions);

module.exports = router;