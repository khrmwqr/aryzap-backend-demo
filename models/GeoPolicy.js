const mongoose = require('mongoose');

const GeoPolicySchema = new mongoose.Schema({

    title: {
        type: String,
        required: true,
        trim: true
    },
    condition: {
        type: String,
        required: true,
        trim: true
    },
    countries: {
        type: Array,
        required: true,
        trim: true
    }
});

module.exports = mongoose.model('GeoPolicy', GeoPolicySchema);