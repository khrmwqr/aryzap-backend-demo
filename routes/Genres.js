const router = require('express').Router();
const GenreController = require('../controllers/GenreController');

router.get('/', GenreController.getAllGenres);
router.get('/:genreId', GenreController.getSpecificGenre);
router.get('/genreid/:genreId', GenreController.getSeriesByGenreId);
router.get('/all/:genreId', GenreController.getSeriesByGenreIds);
router.get('/genreid/pg/:genreId', GenreController.getSeriesByGenreIdPG);
router.post('/', GenreController.createGenre);
router.put('/:genreId', GenreController.updateGenre);
router.delete('/:genreId', GenreController.deleteGenre);
router.get('/pubgen', GenreController.getAllPublishedGenres);


module.exports = router;