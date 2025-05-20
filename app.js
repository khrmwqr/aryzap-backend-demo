const express = require('express');
const app = express();
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const cluster = require('cluster');
const redisClient = require('./redis-server');
const util = require('util');
const { initializeCronJobs } = require('./controllers/CronJobController');
const CJobs = require('./models/CJobs');

const cron = require('node-cron');
const moment = require('moment-timezone');
const authMiddleware = require('./middlewares/auth');


redisClient.info = util.promisify(redisClient.info);

//Middleware
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
dotenv.config();
// In-memory storage for active cron jobs
const activeJobs = {};

const reloadCronJobs = async () => {
    try {
        const jobs = await CJobs.find();

        jobs.forEach(job => {
            if (cron.validate(job.schedule)) {
                activeJobs[job.seriesId] = cron.schedule(
                    job.schedule,
                    () => {
                        console.log(`Running job: ${job.seriesId} at ${moment().tz('Asia/Karachi').format()}`);
                        job.lastRun = moment().tz('Asia/Karachi').toDate();
                        job.save();
                    },
                    {
                        timezone: 'Asia/Karachi',
                    }
                );

                if (!job.isRunning) {
                    activeJobs[job.seriesId].stop();
                }

                console.log(`Loaded job: ${job.seriesId}`);
            }
        });

        console.log('All saved cron jobs have been reloaded.');
    } catch (error) {
        console.error('Error reloading cron jobs:', error.message);
    }
};


// if (cluster.isMaster) {
//     // Master process (parent)
//     const numCPUs = require('os').cpus().length;

//     console.log(`Master process ID: ${process.pid}`);

//     // Fork worker processes for each CPU core
//     for (let i = 0; i < numCPUs; i++) {
//         cluster.fork();
//     }

//     cluster.on('online', function (worker) {
//         console.log('Worker ' + worker.process.pid + ' is online');
//     });

//     cluster.on('exit', (worker, code, signal) => {
//         console.log(`Worker ${worker.process.pid} died (exit code ${code}, signal ${signal})`);
//         console.log('Starting a new worker');
//         cluster.fork();
//     });

// } else {
// Worker process (child)
// ... (Your Express application code here)

//Connect to DB
mongoose.set('strictQuery', true);
// mongoose.connect(process.env.DB_CONNECT)
//     .catch((err) => console.log(err))
//     .finally(() => console.log('Connected to DB along with pid: ' + process.pid));

mongoose.connect(process.env.DB_CONNECT)
    .then(() => {
        console.log('Connected to DB along with pid: ' + process.pid);
        // initializeCronJobs(); // Initialize cron jobs after successful DB connection

    })
    .catch(err => {
        console.log('DB connection error:', err);
    })
    .finally(() => {
        console.log('DB connection attempt finished.');
        //reloadCronJobs();
    });

// ... (Your Express application code here)

const port = process.env.PORT || 8080; // Use environment variable for port or default to 3000
// Reload cron jobs from database


app.get('/api/v1/stats', async (req, res) => {

    mongoose.connect(process.env.DB_CONNECT)
        .catch((err) => console.log(err))
        .finally(() => console.log('Connected to DB along with PID = ' + process.pid));
    //Connect to DB
    try {
        const stats = await mongoose.connection.db.stats();
        res.json({ status: stats, pid: process.pid });
    } catch (err) {
        res.json({
            status: err
        });
    }


});

app.post('/api/pay/callback', async (req, res) => {

    try {

        res.json({ response: req });
    } catch (err) {
        res.json({
            error: err
        });
    }

});

app.get('/api/v1/dashboard', async (req, res) => {
    //Connect to DB
    try {
        const Series = require('./models/Series');
        const stats = await mongoose.connection.db.collection("series");
        var count = Series.find()
        res.json({
            status: count
        });
    } catch (err) {
        res.json({
            status: err.message
        });
    }



});
//Import Routes
const appsRoute = require('./routes/Apps');
const genresRoute = require('./routes/Genres');
const agerRatingsRoutes = require('./routes/AgeRatings');
const categoriesRoute = require('./routes/Categories');
const seriesRoute = require('./routes/Series');
const userRoute = require('./routes/Users');
const episodeRoute = require('./routes/Episodes');
const YTEpisodeRoute = require('./routes/YTEpisode');
const PaymentRoute = require('./routes/PaymentRoute');
const mediaRoute = require('./routes/Media');
const mediaLogoRoute = require('./routes/MediaLogo');
const mediaPosterRoute = require('./routes/MediaPoster');
const mediaMobileRoute = require('./routes/MediaMobile');
const mediaDesktopRoute = require('./routes/MediaDesktop');

const mediaBigRoute = require('./routes/MediaBig');
const mediaExtraRoute = require('./routes/MediaExtra');

const mediaSliderRoute = require('./routes/MediaSlider');
const mediaPromotionalBanner = require('./routes/MediaPromotionalBanner');
const mediaVODUpload = require('./routes/VODUpload');
const CDNV1Upload = require('./routes/MediaCDNV1');
const CDNV2Upload = require('./routes/MediaCDNV2');

const mediaUpdRoute = require('./routes/MediaUploader');
// const mediaUpdRoutev2 = require('./routes/TencentUploader');

const geoPolicyRoute = require('./routes/GeoPolicy');
const GetCountry = require('./routes/GetCountry');
const VodContent = require('./routes/VodContent');
const AdsManagerRoutes = require('./routes/AdsManager');
const DisplayAdsRoutes = require('./routes/DisplayAds');
const CronjobRoutes = require('./routes/CronJob');
const CJOBRoutes = require('./routes/CJobs');

const WatchHistoryRoutes = require('./routes/WatchHistory');




const { stat } = require('fs');

//for episode media upload
const shortsRouter = require('./routes/Shorts');
const episodeLogoRoute = require('./routes/EpisodeMediaLogo');
const episodePosterRoute = require('./routes/EpisodeMediaPoster');
const episodeMobileRoute = require('./routes/EpisodeMediaMobile');
const episodeDesktopRoute = require('./routes/EpisodeMediaDesktop');

const membersRoute = require('./routes/Members');

const favoritesRoutes = require('./routes/Favorites');
const ratingsRoutes = require('./routes/Rating');
const feedbackRoutes = require('./routes/Feedback');

// Private Routes   --------------------------------

const userSubscriberRoutes = require('./routes/UserSubscribers');
const packages = require('./routes/Packages');
const billings = require('./routes/Billings');
const subscription = require('./routes/Subscriptions');
const HomeRoutes = require('./routes/Home');
const sliders = require('./routes/Slider');
const HomeV2Routes = require('./routes/HomeV2');
const PromotionalBanner = require('./routes/PromotionalBanner');
const { options } = require('apicache');

const SearchApi = require('./routes/SearchApi');
const DMEpisodeRoute = require('./routes/DMEpisode');
const CDNEpisodeRoute = require('./routes/CDNEpisode');
const UnitTestingRoute = require('./routes/unitTesting');

const LikesCount = require('./routes/LikeCount');

app.use('/api/v2', authMiddleware);




//Route Middlewares
app.use('/api/vod', VodContent);
app.use('/api/apps', appsRoute);
app.use('/api/genres', genresRoute);
app.use('/api/ageratings', agerRatingsRoutes);
app.use('/api/categories', categoriesRoute);
app.use('/api/series', seriesRoute);
app.use('/api/users', userRoute);
app.use('/api/episodes', episodeRoute);
app.use('/api/geo', geoPolicyRoute);
app.use('/api/yt', YTEpisodeRoute);
app.use('/api/dm', DMEpisodeRoute);
app.use('/api/payment', PaymentRoute);
app.use('/api/cf', GetCountry);
app.use('/api/media', mediaRoute);
app.use('/api/media', mediaPosterRoute);
app.use('/api/media', mediaMobileRoute);
app.use('/api/media', mediaDesktopRoute);
app.use('/api/media', mediaSliderRoute);
app.use('/api/media', mediaPromotionalBanner);
app.use('/api/media', mediaLogoRoute);

app.use('/api/media', mediaBigRoute);
app.use('/api/media', mediaExtraRoute);

app.use('/api/media', mediaVODUpload);
app.use('/api/media', CDNV1Upload);
app.use('/api/media', mediaUpdRoute);
app.use('/api/media', CDNV2Upload);
app.use('/api/ads', AdsManagerRoutes);
app.use('/api/dads', DisplayAdsRoutes);
app.use('/api/cron-jobs', CronjobRoutes);
app.use('/api/cjobs', CJOBRoutes);
app.use('/api/watch-history', WatchHistoryRoutes);
// app.use('/api/media/', mediaUpdRoutev2)


app.use('/api/subuser', userSubscriberRoutes);
app.use('/api/packages', packages);
app.use('/api/billings', billings);
app.use('/api/subscriptions', subscription);
app.use('/api/slider', sliders);
app.use('/api/pb/', PromotionalBanner);

app.use('/api/home', HomeRoutes);
app.use('/api/homev2', HomeV2Routes)

// define media routed for espisode media
app.use('/api/emedia', episodeDesktopRoute);
app.use('/api/emedia', episodePosterRoute);
app.use('/api/emedia', episodeLogoRoute);
app.use('/api/emedia', episodeLogoRoute);

app.use('/api/fav', favoritesRoutes);
app.use('/api/ratings', ratingsRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/search', SearchApi);
app.use('/api/cdn', CDNEpisodeRoute);
app.use('/api/testAllEndpoints', UnitTestingRoute);





//V2 Routes
app.use('/api/v2/vod', VodContent);
app.use('/api/v2/apps', appsRoute);
app.use('/api/v2/genres', genresRoute);
app.use('/api/v2/ageratings', agerRatingsRoutes);
app.use('/api/v2/categories', categoriesRoute);
app.use('/api/v2/series', seriesRoute);
app.use('/api/v2/users', userRoute);
app.use('/api/v2/episodes', episodeRoute);
app.use('/api/v2/geo', geoPolicyRoute);
app.use('/api/v2/yt', YTEpisodeRoute);
app.use('/api/v2/dm', DMEpisodeRoute);
app.use('/api/v2/payment', PaymentRoute);
app.use('/api/v2/cf', GetCountry);
app.use('/api/v2/media', mediaRoute);
app.use('/api/v2/media', mediaPosterRoute);
app.use('/api/v2/media', mediaMobileRoute);
app.use('/api/v2/media', mediaDesktopRoute);
app.use('/api/v2/media', mediaSliderRoute);
app.use('/api/v2/media', mediaPromotionalBanner);
app.use('/api/v2/media', mediaLogoRoute);

app.use('/api/v2/media', mediaBigRoute);
app.use('/api/v2/media', mediaExtraRoute);

app.use('/api/v2/media', mediaVODUpload);
app.use('/api/v2/media', CDNV1Upload);
app.use('/api/v2/media', CDNV2Upload);
app.use('/api/v2/ads', AdsManagerRoutes);
app.use('/api/v2/dads', DisplayAdsRoutes);
app.use('/api/v2/cron-jobs', CronjobRoutes);
app.use('/api/v2/cjobs', CJOBRoutes);
app.use('/api/v2/watch-history', WatchHistoryRoutes);


app.use('/api/v2/subuser', userSubscriberRoutes);
app.use('/api/v2/packages', packages);
app.use('/api/v2/billings', billings);
app.use('/api/v2/subscriptions', subscription);
app.use('/api/v2/slider', sliders);
app.use('/api/v2/pb/', PromotionalBanner);

app.use('/api/v2/home', HomeRoutes);
app.use('/api/v2/homev2', HomeV2Routes)

// define media routed for espisode media
app.use('/api/v2/emedia', episodeDesktopRoute);
app.use('/api/v2/emedia', episodePosterRoute);
app.use('/api/v2/emedia', episodeLogoRoute);
app.use('/api/v2/emedia', episodeLogoRoute);

app.use('/api/v2/fav', favoritesRoutes);
app.use('/api/v2/ratings', ratingsRoutes);
app.use('/api/v2/feedback', feedbackRoutes);
app.use('/api/v2/search', SearchApi);
app.use('/api/v2/cdn', CDNEpisodeRoute);
app.use('/api/v2/testAllEndpoints', UnitTestingRoute);
app.use('/api/v2/shorts', shortsRouter);
app.use('/api/v2/like-count/', LikesCount);
app.use('/api/shorts', shortsRouter);

app.use('/api/v2/members', membersRoute);



// Serve static files from the 'public' folder
app.use('/public', express.static('public'))

// Clear Redis Cache

app.get('/flush-cache', async (req, res) => {

    const cache = redisClient.FLUSHALL;
    if (cache) {
        res.send("Cache Cleared");
    }
});


// Enable file uploads
app.use(fileUpload());


const server = app.listen(port, () => {
    console.log(`Worker ${process.pid} listening on port ${port}`);
});