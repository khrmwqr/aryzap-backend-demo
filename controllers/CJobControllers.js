// --- 📁 controllers/cronController.js ---
const CronJobModel = require('../models/CJobs');
const cron = require('node-cron');
const moment = require('moment-timezone');
// In-memory storage for active cron jobs
const activeJobs = {};

// Create a new cron job
exports.createCronJob = async (req, res) => {
    try {
        const { seriesId, schedule } = req.body;

        // Validate schedule format
        if (!cron.validate(schedule)) {
            return res.status(400).json({ message: 'Invalid cron schedule format' });
        }

        // Save to database
        const newJob = await CronJobModel.create({ seriesId, schedule });

        // Schedule the job
        activeJobs[seriesId] = cron.schedule(schedule, () => {
            console.log(`Running job: ${seriesId}`);
            newJob.lastRun = moment().tz('Asia/Karachi').toDate();
            newJob.save();
        });

        res.status(201).json(newJob);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all cron jobs
exports.getAllCronJobs = async (req, res) => {
    try {
        const jobs = await CronJobModel.find();
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a cron job
exports.updateCronJob = async (req, res) => {
    try {
        const { id } = req.params;
        const { schedule } = req.body;

        if (!cron.validate(schedule)) {
            return res.status(400).json({ message: 'Invalid cron schedule format' });
        }

        const job = await CronJobModel.findByIdAndUpdate(id, { schedule }, { new: true });

        if (activeJobs[job.seriesId]) {
            activeJobs[job.seriesId].stop();
        }

        activeJobs[job.seriesId] = cron.schedule(schedule, () => {
            console.log(`Running job: ${job.seriesId}`);
            job.lastRun = moment().tz('Asia/Karachi').toDate();
            job.save();
        });

        res.status(200).json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Start a cron job
exports.startCronJob = async (req, res) => {
    try {
        const { id } = req.params;
        const job = await CronJobModel.findById(id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (activeJobs[job.seriesId]) {
            return res.status(400).json({ message: 'Job is already running' });
        }

        activeJobs[job.seriesId] = cron.schedule(job.schedule, () => {
            console.log(`Running job: ${job.seriesId}`);
            job.lastRun = moment().tz('Asia/Karachi').toDate();
            job.save();
        });

        job.isRunning = true;
        await job.save();

        res.status(200).json({ message: 'Job started successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Stop a cron job
exports.stopCronJob = async (req, res) => {
    try {
        const { id } = req.params;
        const job = await CronJobModel.findById(id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (!activeJobs[job.seriesId]) {
            return res.status(400).json({ message: 'Job is not running' });
        }

        activeJobs[job.seriesId].stop();
        delete activeJobs[job.seriesId];

        job.isRunning = false;
        await job.save();

        res.status(200).json({ message: 'Job stopped successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a cron job
exports.deleteCronJob = async (req, res) => {
    try {
        const { id } = req.params;
        const job = await CronJobModel.findByIdAndDelete(id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (activeJobs[job.seriesId]) {
            activeJobs[job.seriesId].stop();
            delete activeJobs[job.seriesId];
        }

        res.status(200).json({ message: 'Job deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};