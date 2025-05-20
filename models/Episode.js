const mongoose = require('mongoose');

const EpisodeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: false,
        trim: true
    },
    cast: {
        type: Array,
        required: true,
        trim: true
    },
    seriesDM: {
        type: String,
        required: false,
        trim: true
    },
    seriesYT: {
        type: String,
        required: false,
        trim: true
    },
    seiresCDN: {
        type: String,
        required: false,
        trim: true
    },
    imagePoster: {
        type: String,
        required: false,
        trim: true
    },
    imageCoverMobile: {
        type: String,
        required: false,
        trim: true
    },
    imageCoverDesktop: {
        type: String,
        required: false,
        trim: true
    },
    trailer: {
        type: String,
        required: false,
        trim: true
    },
    ost: {
        type: String,
        required: false,
        trim: true
    },
    logo: {
        type: String,
        required: false,
        trim: true
    },
    day: {
        type: String,
        required: false,
        trim: true
    },
    time: {
        type: String,
        required: false,
        trim: true
    },
    ageRatingId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'AgeRatings'
    },
    genreId: [{
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'Genres'
    }],
    categoryId: [{
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'Categories'
    }],
    appId: [{
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'Apps'
    }],
    status: {
        type: String,
        trim: true
    },
    geoPolicy: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'GeoPolicy'
    },
    adsManager: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'AgsManager'
    },
    seriesType: {
        type: String,
        trim: true
    },
    publishedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Episode', EpisodeSchema);