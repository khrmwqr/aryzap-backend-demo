const { duration } = require('moment-timezone');
const mongoose = require('mongoose');

const SeriesSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: false,
        trim: true
    },
    cast: {
        type: Array,
        required: false,
        trim: true
    },
    seriesDM: {
        type: String,
        required: false,
        trim: true
    },
    seriesYT: {
        type: String,
        required: false,
        trim: true
    },
    seiresCDN: {
        type: String,
        required: false,
        trim: true
    },
    seiresCDNWebLink: {
        type: String,
        required: false,
        trim: true
    },
    seiresCDNWebKey: {
        type: String,
        required: false,
        trim: true
    },
    imagePoster: {
        type: String,
        required: false,
        trim: true
    },
    imageCoverMobile: {
        type: String,
        required: false,
        trim: true
    },
    imageCoverDesktop: {
        type: String,
        required: false,
        trim: true
    },
    imageCoverBig: {
        type: String,
        required: false,
        trim: true
    },
    imageCoverExtra: {
        type: String,
        required: false,
        trim: true
    },
    trailer: {
        type: String,
        required: false,
        trim: true
    },
    ost: {
        type: String,
        required: false,
        trim: true
    },
    logo: {
        type: String,
        required: false,
        trim: true
    },
    day: {
        type: String,
        required: false,
        trim: true
    },
    time: {
        type: String,
        required: false,
        trim: true
    },
    ageRatingId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'AgeRatings'
    },
    genreId: [{
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'Genres'
    }],
    categoryId: [{
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'Categories'
    }],
    appId: [{
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'Apps'
    }],
    status: {
        type: String,
        trim: true
    },
    geoPolicy: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'GeoPolicy'
    },
    adsManager: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'AdsManager'
    },
    seriesType: {
        type: String,
        trim: true
    },
    publishedAt: {
        type: Date,
        default: Date.now
    },
    position: {
        type: Number,
        default: null,
        required: false
    },
    genrePosition: {
        type: Number,
        default: null,
        required: false
    },
    isDM: {
        type: Boolean,
        default: false,
        required: false
    },
    cdnPlatform: {
        type: String,
        enum: ['yt', 'dm', 'cdn'],
        required: true,
        default: 'dm'
    },
    seriesLayout: {
        type: String,
        enum: ['v1', 'v2', 'v3'], // Allowed values
        required: false, // Make it required if necessary
        default: 'v1' // Optional: Set a default value
    },
    isLive: {
        type: Boolean,
        default: false,
        required: false
    },
    optionalFieldOne: {
        type: String,
        required: false,
        trim: true
    },
    optionalFieldTwo: {
        type: String,
        required: false,
        trim: true
    },
    releaseDate: {
        type: Date,
        required: false,
        default: null
    },
    duration: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: v => /^(\d{2}):([0-5]\d):([0-5]\d)$/.test(v),
            message: props => `${props.value} is not a valid HH:MM:SS format`
        }
    },
    duration_seconds: {
        type: Number,
        required: false
    },
    duration_iso: {
        type: String,
        required: false
    }
});

SeriesSchema.pre('save', function (next) {
    if (!this.duration) {
        return next(new Error('Duration is required'));
    }

    try {
        const seconds = hmsToSeconds(this.duration);
        this.duration_seconds = seconds;
        this.duration_iso = secondsToISO(seconds);
        next();
    } catch (error) {
        next(new Error('Invalid duration format'));
    }
});

function hmsToSeconds(hms) {
    const [h, m, s] = hms.split(':').map(Number);
    if (isNaN(h) || isNaN(m) || isNaN(s)) {
        throw new Error('Invalid duration format');
    }
    return h * 3600 + m * 60 + s;
}

function secondsToISO(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        throw new Error('Invalid seconds value');
    }
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `PT${h ? h + 'H' : ''}${m ? m + 'M' : ''}${s ? s + 'S' : ''}`;
}

module.exports = mongoose.model('Series', SeriesSchema);
