const router = require('express').Router();
const EpisodeController = require('../controllers/EpisodeController');

router.get('/', EpisodeController.getAllEpisodes);
router.get('/:seriesId', EpisodeController.getSpecificEpisode);
router.get('/byCatID/:catId', EpisodeController.getAllEpisodesByCategoriesId);
router.get('/byCatID/:catId/:cn', EpisodeController.getAllEpisodesByCategoriesId);
router.get('/byCatIDInt/:catId', EpisodeController.getAllSeriesByCategoriesIdInt);
router.post('/', EpisodeController.createEpisode);
router.put('/:seriesId', EpisodeController.updateEpisode);
router.put('/status/:seriesId', EpisodeController.updateAsDraft);
router.delete('/:seriesId', EpisodeController.deleteEpisode);

module.exports = router;