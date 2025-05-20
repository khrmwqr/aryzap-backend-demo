const mongoose = require('mongoose');

const AdsManagerSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        trim: true
    },
    tag: {
        type: String,
        required: true,
        trim: true
    }
});

module.exports = mongoose.model('AdsManager', AdsManagerSchema);