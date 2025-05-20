const mongoose = require('mongoose');

const ShortSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    videoUrl: {
        type: String,
        required: true,
        trim: true
    },
    thumbnailUrl: {
        type: String,
        trim: true
    },
    duration: {
        type: Number,
        required: true
    },
    likesCount: {
        type: Number,
        default: 0
    },
    sharesCount: {
        type: Number,
        default: 0
    },
    viewsCount: {
        type: Number,
        default: 0
    },
    relatedContentType: {
        type: String,
        enum: ['Series', 'Episode', 'LiveEvent'],
        required: true
    },
    seriesId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'Series'
    },
    episodeId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'Episode'
    },

    relatedContent: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        refPath: 'relatedContentType'
    },
    tags: [{
        type: String,
        trim: true,
        required: false
    }],
    isLiked: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Short', ShortSchema);