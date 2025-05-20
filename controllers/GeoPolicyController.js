const GeoPolicy = require('../models/GeoPolicy');

//Get all age ratings

const getAllGeoPolicy = async (req, res) => {
    try {
        const geo_policy = await GeoPolicy.find();
        res.json(geo_policy);
    } catch (err) {
        res.json({ message: err });
    }
}

//Get a specific age rating

const getSpecificGeoPolicy = async (req, res) => {
    try {
        const geo_policy = await GeoPolicy.findById(req.params.geoPolicyId);
        res.json(geo_policy);
    } catch (err) {
        res.json({ message: err });
    }
};

//Create a new age rating

const createGeoPolicy = async (req, res) => {

    const geo_policy = new GeoPolicy({
        title: req.body.title,
        condition: req.body.condition,
        countries: req.body.countries
    });

    try {
        const savedgeo_policy = await geo_policy.save();
        res.json(savedgeo_policy);
    } catch (err) {
        res.json({ message: err });
    }
};

//Update an age rating

const updateGeoPolicy = async (req, res) => {

    try {

        const updatedGeopolicy = await GeoPolicy.updateOne(
            { _id: req.params.geoPolicyId },
            {
                $set: {
                    title: req.body.title,
                    condition: req.body.condition,
                    countries: req.body.countries
                },
            }
        );
        res.json(updatedGeopolicy);
    } catch (err) {
        res.json({ message: err });
    }
};

//Delete an age rating

const deleteGeoPolicy = async (req, res) => {
    try {
        const removedGeoPolicy = await GeoPolicy.deleteOne({ _id: req.params.geoPolicyId });
        res.json(removedGeoPolicy);
    } catch (err) {
        res.json({ message: err });
    }
};

module.exports = {
    getAllGeoPolicy,
    getSpecificGeoPolicy,
    createGeoPolicy,
    updateGeoPolicy,
    deleteGeoPolicy
};