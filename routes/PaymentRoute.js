const router = require('express').Router();

const PaymentController = require('../controllers/PaymentController');

router.post('/reg', PaymentController.postReg);

module.exports = router;