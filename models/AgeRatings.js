const mongoose = require('mongoose');

const AgeRatingsSchema = new mongoose.Schema({
    title: String,
    description: String,
    image: String,
    appId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Series'
    }
});

module.exports = mongoose.model('AgeRatings', AgeRatingsSchema);