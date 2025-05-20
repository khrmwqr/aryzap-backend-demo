const Slider = require('../models/Slider');

//Get all genres

const getAllSlider = async (req, res) => {
    try {
        const slider = await Slider.find();
        res.json({ slider: slider });
    } catch (err) {
        res.json({ message: err });
    }
}

// get specific slider with country geo poliy



//Get a specific slider

const getSpecificSlider = async (req, res) => {
    try {
        const slider = await Slider.findById(req.params.sliderId).populate("sliderData");
        res.json({ slider: slider });
    } catch (err) {
        res.json({ message: err });
    }
};

//Create a new genre

const createSlider = async (req, res) => {

    const slider = new Slider({
        sliderTitle: req.body.sliderTitle,
        sliderAppId: req.body.sliderAppId,
        sliderData: req.body.sliderData
    });

    try {
        const savedSlider = await slider.save();
        res.json(savedSlider);
    } catch (err) {
        res.json({ message: err });
    }
};

//Update a genre

const updateSlider = async (req, res) => {

    try {

        const updatedSlider = await Slider.updateOne(
            { _id: req.params.sliderId },
            {
                $set: {
                    sliderTitle: req.body.sliderTitle,
                    sliderAppId: req.body.sliderAppId,
                    sliderData: req.body.sliderData
                },
            }
        );
        res.json(updatedSlider);
    } catch (err) {
        res.json({ message: err });
    }
};

//Delete a genre

const deleteSlider = async (req, res) => {
    try {
        const removedSlider = await Slider.deleteOne({ _id: req.params.sliderId });
        res.json(removedSlider);
    } catch (err) {
        res.json({ message: err });
    }
};

module.exports = {
    getAllSlider,
    getSpecificSlider,
    createSlider,
    updateSlider,
    deleteSlider,
};
