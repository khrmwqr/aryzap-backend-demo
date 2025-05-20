const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    feedback: {
        type: String,
        required: false,
    },
    rate: {
        type: Number,
        required: true,
        min: 1, // Minimum rating value (optional)
        max: 5  // Maximum rating value (optional)
    },
    app: {
        type: String,
        required: true,
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Feedback', FeedbackSchema);
