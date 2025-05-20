const mongoose = require('mongoose');
const UserSubscribersSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    username: {
        type: String,
        unique: true
    },
    createdDate: {
        type: Date,
        default: Date.now
    },
    lastLoginDate: {
        type: Date,
        default: null
    },
    lastModifiedDate: {
        type: Date,
        default: null

    },
    description: {
        type: String,
        default: ''
    },
    provider: {
        type: String,
        default: ''
    },
    profilePic: {
        type: String,
        default: ''
    },
    phoneNumber: {
        type: String,
        default: ''
    },
    country: {
        type: String,
        default: ''
    },
    city: {
        type: String,
        default: ''
    },
    state: {
        type: String,
        default: ''
    },
    subscriptionID: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    packageID: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    billingID: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    }
});

UserSubscribersSchema.methods.comparePassword = function (password) {
    //return bcrypt.compareSync(password, this.password)
    if (password == this.password) {
        return password;
    }
}

module.exports = mongoose.model('UserSubscribers', UserSubscribersSchema);