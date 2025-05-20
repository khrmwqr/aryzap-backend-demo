const mongoose = require('mongoose');

const GenresSchema = new mongoose.Schema({
    title: String,
    description: String,
    image: String,
    appId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Apps'
    },
    published: {
        type: Boolean,
        default: false,
        required: false
    }
});

module.exports = mongoose.model('Genres', GenresSchema);