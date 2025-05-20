const DisplayAds = require('../models/DisplayAds');

//Get all age ratings

const getAllDisplayAds = async (req, res) => {
    try {
        const displayAds = await DisplayAds.find();
        res.json(displayAds);
    } catch (err) {
        res.json({ message: err });
    }
}

//Get a specific age rating

const getSpecificDisplayAds = async (req, res) => {
    try {
        const displayAds = await DisplayAds.findById(req.params.dadsId);
        res.json(displayAds);
    } catch (err) {
        res.json({ message: err });
    }
};

//Create a new age rating

const createDisplayAds = async (req, res) => {

    const DisplayAd = new DisplayAds({
        title: req.body.title,
        size: req.body.size,
        adUnit: req.body.adUnit,
        comments: req.body.comments
    });

    try {
        const savedDisplayAds = await DisplayAd.save();
        res.json(savedDisplayAds);
    } catch (err) {
        res.json({ message: err });
    }
};

//Update an age rating

const updateDisplayAds = async (req, res) => {

    try {

        const updatedadsManager = await DisplayAds.updateOne(
            { _id: req.params.dadsId },
            {
                $set: {
                    title: req.body.title,
                    size: req.body.size,
                    adUnit: req.body.adUnit,
                    comments: req.body.comments
                },
            }
        );
        res.json(updatedadsManager);
    } catch (err) {
        res.json({ message: err });
    }
};

//Delete an age rating

const deleteDisplayAds = async (req, res) => {
    try {
        const removedadsManager = await DisplayAds.deleteOne({ _id: req.params.dadsId });
        res.json(removedadsManager);
    } catch (err) {
        res.json({ message: err });
    }
};

module.exports = {
    getAllDisplayAds,
    getSpecificDisplayAds,
    createDisplayAds,
    updateDisplayAds,
    deleteDisplayAds
};