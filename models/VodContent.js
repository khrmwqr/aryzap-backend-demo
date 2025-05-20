const mongoose = require('mongoose');

const VODContentSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true,
        trim: true
    },
    hlsPath: {
        type: String,
        required: true,
        trim: true
    },
    transcoded: {
        type: String,
        required: true,
        trim: true
    }
});

module.exports = mongoose.model('VodContent', VODContentSchema);