//Like Count Mongodb Schema
const mongoose = require('mongoose');
const LikeCountSchema = new mongoose.Schema({
    shortId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Short'
    },
    userId: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('LikeCount', LikeCountSchema);