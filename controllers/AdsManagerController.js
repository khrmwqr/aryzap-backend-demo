const AdsManager = require('../models/AdsManager');

//Get all age ratings

const getAllAdsManager = async (req, res) => {
    try {
        const adsManager = await AdsManager.find();
        res.json(adsManager);
    } catch (err) {
        res.json({ message: err });
    }
}

//Get a specific age rating

const getSpecificAdsManager = async (req, res) => {
    try {
        const adsManager = await AdsManager.findById(req.params.adsManagerId);
        res.json(adsManager);
    } catch (err) {
        res.json({ message: err });
    }
};

//Create a new age rating

const createAdsManager = async (req, res) => {

    const adsManager = new AdsManager({
        title: req.body.title,
        type: req.body.type,
        tag: req.body.tag
    });

    try {
        const savedadsManager = await adsManager.save();
        res.json(savedadsManager);
    } catch (err) {
        res.json({ message: err });
    }
};

//Update an age rating

const updateAdsManager = async (req, res) => {

    try {

        const updatedadsManager = await AdsManager.updateOne(
            { _id: req.params.adsManagerId },
            {
                $set: {
                    title: req.body.title,
                    type: req.body.type,
                    tag: req.body.tag
                },
            }
        );
        res.json(updatedadsManager);
    } catch (err) {
        res.json({ message: err });
    }
};

//Delete an age rating

const deleteAdsManager = async (req, res) => {
    try {
        const removedadsManager = await AdsManager.deleteOne({ _id: req.params.adsManagerId });
        res.json(removedadsManager);
    } catch (err) {
        res.json({ message: err });
    }
};

module.exports = {
    getAllAdsManager,
    getSpecificAdsManager,
    createAdsManager,
    updateAdsManager,
    deleteAdsManager
};