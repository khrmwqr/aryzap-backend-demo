const mongoose = require('mongoose');

const CDNEpisodeSchema = new mongoose.Schema({
    seriesId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Series'
    },
    videoEpNumber: {
        type: Number,
        required: false,
        trim: true
    },
    videoSource: {
        type: String,
        required: true,
        default: null,
        trim: true
    },
    title: {
        type: String,
        required: false,
        trim: true
    },
    description: {
        type: String,
        required: false,
        trim: true
    },
    imagePath: {
        type: String,
        required: false,
        trim: true
    },
    imagePathV2: {
        type: String,
        required: false,
        trim: true
    },
    videoViews: {
        default: null,
        type: String,
        required: false,
        trim: true
    },
    videoLength: {
        type: String,
        required: false,
        trim: true
    },
    videoType: {
        type: String,
        required: false,
        trim: true
    },
    createdAd: {
        type: Date,
        default: Date.now
    },
    published: {
        type: Boolean,
        default: true,
        required: false
    },
    streamAds: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'AdsManager'
    },
    introTimeStamp: {
        default: null,
        type: Number,
        required: false,
    },

});

module.exports = mongoose.model('CDNEpisode', CDNEpisodeSchema);