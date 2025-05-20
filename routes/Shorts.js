const express = require('express');
const router = express.Router();
const shortsController = require('../controllers/ShortsController');

router.post('/', shortsController.createShort);
router.get('/', shortsController.getShorts);
router.get('/:id', shortsController.getShortById);
router.put('/:shortId', shortsController.editShort);
router.post('/:id/like', shortsController.likeShort);
router.post('/:id/share', shortsController.shareShort);
router.delete('/:id', shortsController.deleteShort);
router.get('/user-feed/:userId', shortsController.getAllShorts);
router.get('/user-feed/:userId/:shortId', shortsController.getShortsWithFeatured);

module.exports = router;