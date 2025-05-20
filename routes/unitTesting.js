const router = require('express').Router();
const UnitTestingController = require('../controllers/UnitTestingController');
const authMiddleware = require('../middlewares/auth');

//router.use(authMiddleware);

router.post('/', UnitTestingController.testAllEndpoints);

module.exports = router;