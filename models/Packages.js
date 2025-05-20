const mongoose = require('mongoose');
const PackagesSchema = new mongoose.Schema({
    packageName: {
        type: String,
        required: true
    },
    packageDetails: {
        type: String,
        required: true
    },
    packagePrice: {
        type: String,
        required: true
    },
    packageLabel: {
        type: String,
        required: true
    },
    packageAllowScreens: {
        type: String,
        required: true
    },
    packageStatus: {
        type: String,
        required: true
    },
    packageCreatedDate: {
        type: Date,
        default: Date.now
    },
    packageDays: {
        type: String,
        required: true
    },
    packageStripePriceId: {
        type: String,
        required: false
    }
});


module.exports = mongoose.model('Packages', PackagesSchema);