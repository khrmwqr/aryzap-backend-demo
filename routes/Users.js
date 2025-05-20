const router = require('express').Router();
const UserController = require('../controllers/UserController');

router.get('/getAllUsers', UserController.getAllUsers);
router.get('/:userId', UserController.getSpecificUser);
router.post('/', UserController.createUser);
router.put('/:userId', UserController.updateUser);
router.delete('/:userId', UserController.deleteUser);
router.post('/signin', UserController.signInUser);
router.post('/verify', UserController.verifyUser);
router.get('/md5/:password', UserController.genPass);

module.exports = router;