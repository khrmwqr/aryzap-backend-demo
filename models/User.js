const mongoose = require('mongoose');
const crypto = require('crypto'); // Built-in Node.js module for hashing

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
        index: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
    },
    firstName: String,
    lastName: String,
    image: String,
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    access: {
        type: Array,
        required: true,
        trim: true,
    },
    appId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Apps',
    },
});

// Hash the password before saving the user
UserSchema.pre('save', function (next) {
    if (this.isModified('password')) {
        // Hash the password using MD5
        this.password = crypto.createHash('md5').update(this.password).digest('hex');
    }
    next();
});

// Method to compare hashed passwords
UserSchema.methods.comparePassword = function (password) {
    // Hash the provided password and compare with the stored hash
    const hashedPassword = crypto.createHash('md5').update(password).digest('hex');
    return this.password === hashedPassword;
};

module.exports = mongoose.model('User', UserSchema);