const router = require('express').Router();
const HomeController = require('../controllers/HomeController');

router.get('/', HomeController.getAllHome);
router.get('/v2', HomeController.getAllHomeV2);
router.get('/:homeId', HomeController.getSpecificHome);
router.post('/', HomeController.createHome);
router.put('/:homeId', HomeController.updateHome);
router.delete('/:homeId', HomeController.deleteHome);

module.exports = router;