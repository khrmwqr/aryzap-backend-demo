const router = require('express').Router();
const VODController = require('../controllers/VodContentConroller');

router.get('/', VODController.getAllVodContents);
router.get('/:vodId', VODController.getSpecificVodContent);
router.post('/', VODController.createVodContent);
router.put('/:vodId', VODController.updateVodContent);
router.delete('/:vodId', VODController.deleteVodContent);

module.exports = router;