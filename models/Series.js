const { duration } = require('moment-timezone');
const mongoose = require('mongoose');

const SeriesSchema = new mongoose.Schema({
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
        required: false,
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
    seiresCDNWebLink: {
        type: String,
        required: false,
        trim: true
    },
    seiresCDNWebKey: {
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
    imageCoverBig: {
        type: String,
        required: false,
        trim: true
    },
    imageCoverExtra: {
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
        ref: 'AdsManager'
    },
    seriesType: {
        type: String,
        trim: true
    },
    publishedAt: {
        type: Date,
        default: Date.now
    },
    position: {
        type: Number,
        default: null,
        required: false
    },
    genrePosition: {
        type: Number,
        default: null,
        required: false
    },
    isDM: {
        type: Boolean,
        default: false,
        required: false
    },
    cdnPlatform: {
        type: String,
        enum: ['yt', 'dm', 'cdn'],
        required: true,
        default: 'dm'
    },
    seriesLayout: {
        type: String,
        enum: ['v1', 'v2', 'v3'], // Allowed values
        required: false, // Make it required if necessary
        default: 'v1' // Optional: Set a default value
    },
    isLive: {
        type: Boolean,
        default: false,
        required: false
    },
    optionalFieldOne: {
        type: String,
        required: false,
        trim: true
    },
    optionalFieldTwo: {
        type: String,
        required: false,
        trim: true
    },
    releaseDate: {
        type: Date,
        required: false,
        default: null
    },
    duration: {
        type: Number,
        required: false,
        trim: true
    }

});

module.exports = mongoose.model('Series', SeriesSchema);