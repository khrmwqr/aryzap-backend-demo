const express = require('express');
const router = express.Router();
const LikeCountController = require('../controllers/LikeCountController');

router.post('/like/', LikeCountController.likeShort);
router.post('/unlike/', LikeCountController.unlikeShort);
router.get('/short/:shortId', LikeCountController.getAllLikesForShort);
router.get('/user/:userId', LikeCountController.getAllLikesByUser);
router.get('/short/:shortId/user/:userId', LikeCountController.getAllLikesForShortByUser);
router.get('/count/:shortId', LikeCountController.getLikeCount);
router.get('/count/user/:userId', LikeCountController.getLikeCountByUserId);

module.exports = router;