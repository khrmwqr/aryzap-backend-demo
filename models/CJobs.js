const mongoose = require('mongoose');

const CJobSchema = new mongoose.Schema({
    seriesId: {
        type: String,
        required: true,
        unique: true
    },
    schedule: {
        type: String,
        required: true
    },
    lastRun: {
        type: Date,
        default: null
    },
    isRunning: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('CJobs', CJobSchema);