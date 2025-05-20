const mongoose = require('mongoose');

const DMEpisodeSchema = new mongoose.Schema({
    seriesId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Series'
    },
    videoSource: {
        type: String,
        required: false,
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
    videoDmId: {
        type: String,
        required: false,
        trim: true
    },
    videoYtId: {
        type: String,
        required: false,
        trim: true
    },
    videoViews: {
        type: String,
        required: false,
        trim: true
    },
    videoLength: {
        type: String,
        required: false,
        trim: true
    },
    createdAd: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('DMEpisode', DMEpisodeSchema);