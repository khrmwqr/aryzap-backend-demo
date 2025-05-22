const router = require('express').Router();

const CDNEpisodeController = require('../controllers/CDNEpisodeController');

router.get('/', CDNEpisodeController.getAllCDNEpisodesWithPagination);
router.get('/:seriesId', CDNEpisodeController.getSpecificCDNEpisodesBySeriesID);
router.get('/ep/:episodeId', CDNEpisodeController.getSpecificCDNEpisode);
router.post('/', CDNEpisodeController.createCDNEpisode);
router.put('/:episodeId', CDNEpisodeController.updateCDNEpisode);
router.delete('/:episodeId', CDNEpisodeController.deleteCDNEpisode);
router.get('/pg/:seriesId', CDNEpisodeController.getSpecificCDNEpisodesBySeriesIDWithPagination); //this was pagination api

module.exports = router;
