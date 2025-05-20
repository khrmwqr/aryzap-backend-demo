const mongoose = require('mongoose');
var current = new Date();
const SubscriptionSchema = new mongoose.Schema({
	
	transaction_meta: {
        type: Object,
        required: false,
        trim: true
    },
	customer_id: {
        type: String,
        required: true
    },
	transaction_id: {
        type: String,
        required: true
    },
    package_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Packages'
    },
	subscription_date: {
        type: String,
        required: false
    },
	subscription_expiry: {
        type: String,
        required: false
    }
});


module.exports = mongoose.model('Subscriptions', SubscriptionSchema);