const router = require('express').Router();
const HomeV2Controller = require('../controllers/HomeV2Controller');
const authMiddleware = require('../middlewares/auth');

//router.use(authMiddleware);

router.get('/', HomeV2Controller.getAllHome);
router.get('/v2', HomeV2Controller.getAllHomeV2);
router.get('/:homeId', HomeV2Controller.getSpecificHome);
router.get('/:homeId/:cn', HomeV2Controller.getSpecificHome);
router.post('/', HomeV2Controller.createHome);
router.put('/:homeId', HomeV2Controller.updateHome);
router.delete('/:homeId', HomeV2Controller.deleteHome);

module.exports = router;