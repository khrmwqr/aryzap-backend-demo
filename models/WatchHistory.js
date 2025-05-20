const mongoose = require('mongoose');

const WatchHistorySchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    seriesId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Series'
    },
    episodeId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'CDNEpisode'
    },
    currentTime: {
        default: null,
        type: Number,
        required: false,
    },
    seriesType: {
        type: String,
        required: false,
        enum: ['show', 'singleVideo'],
        default: 'show'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },

});

module.exports = mongoose.model('WatchHistory', WatchHistorySchema);