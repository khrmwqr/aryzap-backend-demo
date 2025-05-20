const mongoose = require('mongoose');

const RatingsSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    seriesId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Series'
    },
    rate: {
        type: Number,
        required: true,
        min: 1, // Minimum rating value (optional)
        max: 5  // Maximum rating value (optional)
    },
    comments: {
        type: String,
        required: true,
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Ratings', RatingsSchema);
