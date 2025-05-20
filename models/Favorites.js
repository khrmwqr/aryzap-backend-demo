const mongoose = require('mongoose');

const FavoritesSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    seriesId: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: 'Series'
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Favorites', FavoritesSchema);