const mongoose = require('mongoose');

const CTASchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    icon: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    buttonName: {
        type: String,
        required: true,
    },
    buttonAction: {
        type: String,
        required: true,
    },
    isLogin: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('CTA', CTASchema);