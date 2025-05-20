const mongoose = require('mongoose');

const DisplayAdsSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true
    },
    size: {
        type: String,
        required: true
    },
    adUnit: {
        type: String,
        required: true
    },
    comments: {
        type: String,
        required: false
    }
});

module.exports = mongoose.model('DisplayAds', DisplayAdsSchema);