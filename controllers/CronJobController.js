const cron = require('node-cron');
const moment = require('moment-timezone');
const CronJob = require('../models/CronJob');
const Series = require('../models/Series');
const { mongoose } = require('mongoose');

// Function to initialize and start all cron jobs from MongoDB on server startup
const initializeCronJobs = async () => {
    try {
        const jobs = await CronJob.find({ isRunning: true });

        jobs.forEach(job => {
            if (!cron.getTasks().has(job.seriesId)) {
                const scheduledJob = cron.schedule(job.schedule, () => {
                    const now = moment().tz('Asia/Karachi').format('YYYY-MM-DD HH:mm:ss');
                    console.log(`Running job for Series ID: ${job.seriesId} at ${now}`);
                    CronJob.findByIdAndUpdate(job._id, { lastRun: new Date() });
                });

                cron.getTasks().set(job.seriesId, scheduledJob);
            }
        });

        console.log(`${jobs.length} cron jobs initialized from the database.`);
    } catch (error) {
        console.error('Error initializing cron jobs:', error);
    }
};

// Function to set up cron jobs dynamically and save to MongoDB
const setCronJob = async (req, res) => {
    const seriesJobs = req.body.seriesJobs;

    for (const series of seriesJobs) {
        const { seriesId, schedule } = series;

        // Check if the cron job already exists in the database
        let existingJob = await CronJob.findOne({ seriesId });
        if (!existingJob) {
            // Create a new cron job in MongoDB
            existingJob = new CronJob({ seriesId, schedule });
            await existingJob.save();
        }

        // Start the job if it’s not running
        if (!existingJob.isRunning) {
            startCronJob(existingJob._id, false);
        }
    }

    return res.json({
        message: "Cron jobs have been set.",
        timeNow: new Date()
    });
};

// const setCronJob = async (req, res) => {
//     const seriesJobs = req.body.seriesJobs;

//     for (const series of seriesJobs) {
//         const { seriesId, schedule } = series;

//         try {
//             // Fetch the series details from the Series collection
//             const seriesDetails = await Series.findOne({ _id: new mongoose.Types.ObjectId(seriesId) });
//             if (!seriesDetails) {
//                 return res.status(404).json({ message: `Series with ID ${seriesId} not found.` });
//             }

//             // Check if the cron job already exists in the database
//             let existingJob = await CronJob.findOne({ seriesId });
//             if (!existingJob) {
//                 // Create a new cron job in MongoDB
//                 existingJob = new CronJob({ seriesId, schedule });
//                 await existingJob.save();
//             }

//             // Perform the API request based on the cdnPlatform field
//             let apiResponse;
//             if (seriesDetails.cdnPlatform === 'dm') {
//                 const url = `${process.env.BASE_URL}/api/dm/${seriesId}/${seriesDetails.seriesDM}/1/100`;
//                 apiResponse = await fetch(url);
//             } else if (seriesDetails.cdnPlatform === 'yt') {
//                 const url = `${process.env.BASE_URL}/api/yt/get/${seriesDetails.seriesYT}/${seriesId}`;
//                 apiResponse = await fetch(url);
//             }

//             if (!apiResponse || !apiResponse.ok) {
//                 console.error(`Failed to fetch data for Series ID: ${seriesId}`);
//             }

//             // Start the job if it’s not running
//             if (!existingJob.isRunning) {
//                 startCronJob(existingJob._id, false);
//             }

//         } catch (error) {
//             console.error(`Error processing series with ID ${seriesId}:`, error);
//         }
//     }

//     return res.json({
//         message: "Cron jobs have been set.",
//         timeNow: new Date()
//     });
// };

// Function to get all cron jobs from MongoDB
const getAllCronJob = async (req, res) => {
    const { jobId } = req.params;
    const jobs = cron.getTasks().has(req.params.jobId)
    //const jobs = cron.getTasks().clear(req.params.jobId)

    return res.json({ message: jobs });
}
const getCronJobs = async (req, res) => {
    try {
        const jobs = await CronJob.find();
        return res.json({
            jobs,
            message: "All cron jobs details",
            timeNow: new Date()
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching cron jobs.', error: error.message });
    }
};

// Function to delete a cron job by ID
const deleteCronJob = async (req, res) => {
    const { id } = req.params;

    try {
        const dbJob = await CronJob.findByIdAndDelete(id);
        if (dbJob) {
            if (cron.getTasks().has(dbJob.seriesId)) {
                cron.getTasks().get(dbJob.seriesId).stop();
            }
            return res.json({
                message: `Cron job with ID ${id} has been deleted.`
            });
        } else {
            return res.status(404).json({
                message: `Cron job with ID ${id} not found.`
            });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Error deleting cron job.', error: error.message });
    }
};

// Function to stop a cron job by ID
const stopCronJob = async (req, res) => {
    const { id } = req.params;

    try {
        const job = await CronJob.findById(id);

        if (!job) {
            return res.status(404).json({ message: `Cron job with ID ${id} not found.` });
        }

        // Check if the cron job is running in the node-cron tasks
        if (cron.getTasks().has(job.seriesId)) {
            const task = cron.getTasks().get(job.seriesId);
            task.stop(); // Stop the cron job

            // Update the job status in MongoDB
            job.isRunning = false;
            await job.save();

            return res.json({ message: `Cron job with ID ${id} has been stopped.` });
        } else {
            return res.status(400).json({ message: `Cron job with seriesId ${job.seriesId} is not running.` });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Error stopping cron job.', error: error.message });
    }
};


// Function to start a cron job by ID
const startCronJob = async (req, res) => {
    const { id } = req.params;

    try {
        const job = await CronJob.findById(id);

        if (!job) return res.status(404).json({ message: `Cron job with ID ${id} not found.` });

        // Check if the job is already scheduled
        if (!cron.getTasks().has(job.seriesId)) {
            const scheduledJob = cron.schedule(job.schedule, () => {
                const now = moment().tz('Asia/Karachi').format('YYYY-MM-DD HH:mm:ss');
                console.log(`Running job for Series ID: ${job.seriesId} at ${now}`);
                CronJob.findByIdAndUpdate(job._id, { lastRun: new Date() });
            });

            cron.getTasks().set(job.seriesId, scheduledJob);
        }

        // Update the job status in MongoDB
        job.isRunning = true;
        await job.save();

        return res.json({ message: `Cron job with ID ${id} has been started.` });
    } catch (error) {
        return res.status(500).json({ message: 'Error starting cron job.', error: error.message });
    }
};


module.exports = {
    initializeCronJobs,
    setCronJob,
    getCronJobs,
    deleteCronJob,
    stopCronJob,
    startCronJob,
    getAllCronJob
};
