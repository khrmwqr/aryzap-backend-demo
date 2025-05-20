const router = require('express').Router();
const AppController = require('../controllers/AppController');
const authMiddleware = require('../middlewares/auth');

//router.use(authMiddleware);

router.get('/', AppController.getAllApps);
router.get('/:appId', AppController.getSpecificApp);
router.post('/', AppController.createApp);
router.put('/:appId', AppController.updateApp);
router.delete('/:appId', AppController.deleteApp);

module.exports = router;