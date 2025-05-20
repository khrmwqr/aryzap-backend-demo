const mongoose = require('mongoose');
const SliderSchema = new mongoose.Schema({
    sliderTitle: {
        type: String,
        required: true
    },
    sliderAppId: [{
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'Apps'
    }],
    sliderData: {
        type: mongoose.Schema.Types.Array,
        required: false
    }
});


module.exports = mongoose.model('Slider', SliderSchema);