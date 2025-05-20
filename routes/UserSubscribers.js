const router = require('express').Router();
const UserSubscribersController = require('../controllers/UserSubscribersController');

router.get('/:userId', UserSubscribersController.getSpecificUser);
router.post('/', UserSubscribersController.createUser);
router.put('/:userId', UserSubscribersController.updateUser);
router.delete('/:userId', UserSubscribersController.deleteUser);
router.post('/signin', UserSubscribersController.signInUser);
router.post('/verify', UserSubscribersController.verifyUser);
router.post('/server', UserSubscribersController.checkHealth);
module.exports = router;