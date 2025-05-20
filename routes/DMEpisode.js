const express = require('express');
const router = express.Router();
const DMEpisodeController = require('../controllers/DMEpisodeController'); // Adjust the path as needed

// Route to fetch and store episodes
router.get('/:seriesId/:playlistId/:page/:limit', DMEpisodeController.getDMEpisode);
router.get('/:seriesId', DMEpisodeController.fetchEPbySeriesId);
router.get('/pg/:seriesId', DMEpisodeController.fetchEPbySeriesIdPg);  //this was pagination api
router.get('/', DMEpisodeController.fetchAllEpisodes);
router.delete('/:seriesId', DMEpisodeController.deleteDmEpisode);
router.delete('/all/:seriesId', DMEpisodeController.deleteAllDmEpisodes);
module.exports = router;