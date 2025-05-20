const mongoose = require('mongoose');
const PromotionalBanner = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    appId: [{
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'Apps'
    }],
    action: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    }
});


module.exports = mongoose.model('PromotionalBanner', PromotionalBanner);