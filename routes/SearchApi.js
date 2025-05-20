const express = require('express');
const router = express.Router();
const searchController = require('../controllers/SearchApiController');

router.get('/:searchId', searchController.doSearch);
router.get('/cast/:castId', searchController.doSearchbyCast);
router.get('/trending/:searchId', searchController.getAllTrendingSearchesAndWithAllPublishedGenres);
module.exports = router;