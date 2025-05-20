const AgeRatings = require('../models/AgeRatings');

//Get all age ratings

const getAllAgeRatings = async (req, res) => {
    try {
        const ageRating = await AgeRatings.find();
        res.json(ageRating);
    } catch (err) {
        res.json({ message: err });
    }
}

//Get a specific age rating

const getSpecificAgeRating = async (req, res) => {
    try {
        const ageRating = await AgeRatings.findById(req.params.ageId);
        res.json(ageRating);
    } catch (err) {
        res.json({ message: err });
    }
};

//Create a new age rating

const createAgeRating = async (req, res) => {

    const ageRating = new AgeRatings({
        title: req.body.title,
        description: req.body.description,
        image: req.body.image,
        appId: req.body.appId
    });

    try {
        const savedAgeRating = await ageRating.save();
        res.json(savedAgeRating);
    } catch (err) {
        res.json({ message: err });
    }
};

//Update an age rating

const updateAgeRating = async (req, res) => {

    try {

        const updatedAgeRating = await AgeRatings.updateOne(
            { _id: req.params.ageId },
            {
                $set: {
                    title: req.body.title,
                    description: req.body.description,
                    image: req.body.image,
                    appId: req.body.appId,
                },
            }
        );
        res.json(updatedAgeRating);
    } catch (err) {
        res.json({ message: err });
    }
};

//Delete an age rating

const deleteAgeRating = async (req, res) => {
    try {
        const removedAgeRating = await AgeRatings.deleteOne({ _id: req.params.ageId });
        res.json(removedAgeRating);
    } catch (err) {
        res.json({ message: err });
    }
};

module.exports = {
    getAllAgeRatings,
    getSpecificAgeRating,
    createAgeRating,
    updateAgeRating,
    deleteAgeRating
};