const router = require('express').Router();
const WatchHistoryController = require('../controllers/WatchHistoryController');
const authMiddleware = require('../middlewares/auth');

router.use(authMiddleware);

router.get('/', WatchHistoryController.getAllWatchHistory);
router.get('/:hid', WatchHistoryController.getSpecificWatchHistory);
// router.post('/', WatchHistoryController.createWatchHistory);
router.put('/:hid', WatchHistoryController.updateWatchHistory);
router.delete('/:hid', WatchHistoryController.deleteWatchHistory);
router.get('/by-user/:userId', WatchHistoryController.getWatchHistoryByUserId);
router.get('/by-user-series/:userId/:seriesId', WatchHistoryController.getWatchHistoryByUserIdAndSeriesId);
router.post('/upd', WatchHistoryController.createOrUpdateWatchHistory);
router.get('/series-by-user/:userId', WatchHistoryController.getWatchHistorySeriesByUserId);
router.delete('/delete/:userId/:seriesId', WatchHistoryController.deleteWatchHistoryByUserIdAndSeriesId);

module.exports = router;