const router = require('express').Router();
const CronJobController = require('../controllers/CronJobController');

// Route to get all cron jobs
router.get('/', CronJobController.getCronJobs);

// Route to set cron jobs dynamically
router.post('/', CronJobController.setCronJob);

// Route to delete a cron job by ID
router.delete('/:id', CronJobController.deleteCronJob);

// New Stop Route
router.post('/:id/stop', CronJobController.stopCronJob);

// New Start Route
router.post('/:id/start', CronJobController.startCronJob);

router.get('/get-all/:jobId', CronJobController.getAllCronJob);

module.exports = router;