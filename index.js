const express = require('express');
const app = express();
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const fileUpload = require('express-fileupload');
// const redisConnection = require('./redis-server')
const bodyParser = require('body-parser');



//Middleware
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
dotenv.config();
//Connect to DB
mongoose.set('strictQuery', true);
mongoose.connect(process.env.DB_CONNECT)
    .catch((err) => console.log(err))
    .finally(() => console.log('Connected to DB'));



// app.get('/api/cache/:id', async (req, res) => {

//     const { id } = req.params;
//     // Check Redis cache first
//     const cachedData = await redisClient.get(id);
//     if (cachedData) {
//         return res.send(JSON.parse(cachedData));
//     }

//     // If not in cache, fetch from MongoDB
//     const data = {
//         user: id,
//         cache: true
//     };
//     if (data) {
//         // Store the result in Redis (with an expiration time)
//         redisClient.setEx(id, 3600, JSON.stringify(data));
//         return res.send(data);
//     }

//     res.status(404).send('Data not found');



// });

app.post('/api/pay/callback', async (req, res) => {

    try {

        res.json({ response: req });
    } catch (err) {
        res.json({
            error: err
        });
    }



});


app.get('/api/v1/stats', async (req, res) => {

    mongoose.connect(process.env.DB_CONNECT)
        .catch((err) => console.log(err))
        .finally(() => console.log('Connected to DB'));
    //Connect to DB
    try {
        const stats = await mongoose.connection.db.stats();
        res.json({ status: stats });
    } catch (err) {
        res.json({
            status: err
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
const mediaSliderRoute = require('./routes/MediaSlider');
const mediaVODUpload = require('./routes/VODUpload');
const geoPolicyRoute = require('./routes/GeoPolicy');
const GetCountry = require('./routes/GetCountry');
const VodContent = require('./routes/VodContent');
const AdsManagerRoutes = require('./routes/AdsManager');
const DisplayAdsRoutes = require('./routes/DisplayAds');
const { stat } = require('fs');

//for episode media upload

const episodeLogoRoute = require('./routes/EpisodeMediaLogo');
const episodePosterRoute = require('./routes/EpisodeMediaPoster');
const episodeMobileRoute = require('./routes/EpisodeMediaMobile');
const episodeDesktopRoute = require('./routes/EpisodeMediaDesktop');

// Private Routes   --------------------------------

const userSubscriberRoutes = require('./routes/UserSubscribers');
const packages = require('./routes/Packages');
const billings = require('./routes/Billings');
const subscription = require('./routes/Subscriptions');
const HomeRoutes = require('./routes/Home');
const sliders = require('./routes/Slider');
const HomeV2Routes = require('./routes/HomeV2');
const { options } = require('apicache');
const redisClient = require('./redis-server');

const unitTesting = require('./routes/unitTesting');






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
app.use('/api/payment', PaymentRoute);
app.use('/api/cf', GetCountry);
app.use('/api/media', mediaRoute);
app.use('/api/media', mediaPosterRoute);
app.use('/api/media', mediaMobileRoute);
app.use('/api/media', mediaDesktopRoute);
app.use('/api/media', mediaSliderRoute);
app.use('/api/media', mediaLogoRoute);
app.use('/api/media', mediaVODUpload);
app.use('/api/ads', AdsManagerRoutes);
app.use('/api/dads', DisplayAdsRoutes);

app.use('/api/subuser', userSubscriberRoutes);
app.use('/api/packages', packages);
app.use('/api/billings', billings);
app.use('/api/subscriptions', subscription);
app.use('/api/slider', sliders);

app.use('/api/home', HomeRoutes);
app.use('/api/homev2', HomeV2Routes)

// define media routed for espisode media
app.use('/api/emedia', episodeDesktopRoute);
app.use('/api/emedia', episodePosterRoute);
app.use('/api/emedia', episodeLogoRoute);
app.use('/api/emedia', episodeLogoRoute);


app.use('/api/testing', unitTesting);




// Serve static files from the 'public' folder
app.use(express.static('public'));

// Enable file uploads
app.use(fileUpload());
app.listen(3001, () => console.log('Server up and running'));