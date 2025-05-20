const mongoose = require('mongoose');
const BillingsSchema = new mongoose.Schema({
    billingType: {
        type: String,
        required: true
    },
    billingFullName: {
        type: String,
        required: true
    },
    billingCardNumber: {
        type: String,
        required: true
    },
    billingCVV: {
        type: String,
        required: true
    },
    billingValidThru: {
        type: String,
        required: true
    },
    billingClientID: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'UserSubscribers'
    },
    billingStatus: {
        type: String,
        default: null,
    },
});


module.exports = mongoose.model('Billings', BillingsSchema);