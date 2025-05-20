// --- 📁 routes/cronRoutes.js ---
const express = require('express');
const router = express.Router();
const cronController = require('../controllers/CJobControllers');

// Route to create a new cron job
router.post('/create', cronController.createCronJob);

// Route to get all cron jobs
router.get('/', cronController.getAllCronJobs);

// Route to update a cron job
router.put('/update/:id', cronController.updateCronJob);

// Route to start a cron job
router.post('/start/:id', cronController.startCronJob);

// Route to stop a cron job
router.post('/stop/:id', cronController.stopCronJob);

// Route to delete a cron job
router.delete('/delete/:id', cronController.deleteCronJob);

module.exports = router;