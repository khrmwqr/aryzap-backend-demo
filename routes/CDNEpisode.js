const router = require('express').Router();

const CDNEpisodeController = require('../controllers/CDNEpisodeController');

router.get('/', CDNEpisodeController.getAllCDNEpisodes);
router.get('/:seriesId', CDNEpisodeController.getSpecificCDNEpisodesBySeriesID);
router.get('/ep/:episodeId', CDNEpisodeController.getSpecificCDNEpisode);
router.post('/', CDNEpisodeController.createCDNEpisode);
router.put('/:episodeId', CDNEpisodeController.updateCDNEpisode);
router.delete('/:episodeId', CDNEpisodeController.deleteCDNEpisode);

module.exports = router;