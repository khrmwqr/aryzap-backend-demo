const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Subdocument schema for profiles
const ProfileSchema = new Schema({
    profileName: {
        type: String,
        required: true,
        trim: true
    },
    firstName: {
        type: String,
        required: false,
        trim: true
    },
    lastName: {
        type: String,
        required: false,
        trim: true
    },
    profilePicture: {
        type: String,
        required: false
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Prefer not to say'],
        required: false,
        default: null
    },
    ageGroup: {
        type: String,
        enum: ['23 and under', '24-34', '35-44', '45-55', '55+'],
        required: false,
        default: null
    },
    genresPreference: {
        type: [String],
        enum: ['Romance', 'Comedy', 'Action', 'Drama', 'TV Shows', 'News', 'Sports', 'Shorts', 'Telefilms', 'Thriller'],
        required: false,
        default: []
    },
    isKidsProfile: {
        type: Boolean,
        default: false
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

const MembersSchema = new Schema({
    uid: {
        type: String,
        required: false,
        unique: true
    },
    authProvider: {
        type: String,
        required: true
    },
    plan: {
        type: String,
        enum: ['free', 'pro'],
        default: 'free'
    },
    device: {
        type: String,
        required: false
    },
    phoneNumber: {
        type: String,
        required: false
    },
    country: {
        type: String,
        required: false
    },
    city: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: false
    },
    profiles: {
        type: [ProfileSchema],
        validate: {
            validator: function (profiles) {
                return profiles.length <= 4;
            },
            message: 'Cannot create more than 4 profiles per account.'
        },
        default: []
    },
    defaultProfile: {
        type: String, // Stores profileName of the default profile
        required: false,
        default: null
    },
    firstName: {
        type: String,
        required: false,
        trim: true
    },
    lastName: {
        type: String,
        required: false,
        trim: true
    },
    profilePicture: {
        type: String,
        required: false
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Prefer not to say'],
        required: false,
        default: null
    },
    ageGroup: {
        type: String,
        enum: ['23 and under', '24-34', '35-44', '45-55', '55+'],
        required: false,
        default: null
    },
    genresPreference: {
        type: [String],
        enum: ['Romance', 'Comedy', 'Action', 'Drama', 'TV Shows', 'News', 'Sports', 'Shorts', 'Telefilms', 'Thriller'],
        required: false,
        default: []
    },

    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

// Update the updated_at fields before saving
MembersSchema.pre('save', function (next) {
    this.updated_at = Date.now();
    // Update updated_at for all profiles
    if (this.profiles && this.profiles.length > 0) {
        this.profiles.forEach(profile => {
            profile.updated_at = Date.now();
        });
    }
    next();
});

module.exports = mongoose.model('Members', MembersSchema);