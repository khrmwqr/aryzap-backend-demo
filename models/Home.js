const mongoose = require('mongoose');
const HomeSchema = new mongoose.Schema({
    homeTitle: {
        type: String,
        required: true
    },
    homeAppId: [{
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'Apps'
    }],
    homeData: {
        type: mongoose.Schema.Types.Array,
        required: false
    }
});


module.exports = mongoose.model('HomeSection', HomeSchema);