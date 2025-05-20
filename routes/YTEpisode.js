const router = require('express').Router();

const YTEpisodeController = require('../controllers/YTEpisodeController');

router.get('/get/:playlistId/:seriesId', YTEpisodeController.ytEPF);
router.get('/', YTEpisodeController.getAllYTEpisodes);
router.get('/:seriesId', YTEpisodeController.getSpecificYTEpisodesBySeriesID);
router.get('/video/:episodeId', YTEpisodeController.getSpecificYTEpisode);
router.get('/pg/:seriesId', YTEpisodeController.getSpecificYTEpisodesBySeriesIDPG); //this was pagination api

module.exports = router;