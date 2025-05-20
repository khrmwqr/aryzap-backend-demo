const router = require('express').Router();

const YTEpisodeController = require('../controllers/YTEpisodeController');

router.get('/getLoc', YTEpisodeController.getLoc);

module.exports = router;