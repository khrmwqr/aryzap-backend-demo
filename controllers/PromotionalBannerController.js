const PromotionalBanner = require('../models/PromotionalBanner');

//Get all genres

const getAllPromotionalBanner = async (req, res) => {
    try {
        const promotionalBanner = await PromotionalBanner.find();
        res.json({ promotionalBanner: promotionalBanner });
    } catch (err) {
        res.json({ message: err });
    }
}

//Get a specific genre

const getSpecificPromotionalBanner = async (req, res) => {
    try {
        const promotionalBanner = await PromotionalBanner.findById(req.params.pbId);
        res.json({ promotionalBanner: promotionalBanner });
    } catch (err) {
        res.json({ message: err });
    }
};

//Create a new genre

const createPromotionalBanner = async (req, res) => {

    const promotionalBanner = new PromotionalBanner({
        title: req.body.title,
        appId: req.body.appId,
        action: req.body.action,
        image: req.body.image,
    });

    try {
        const savedpromotionalBanner = await promotionalBanner.save();
        res.json(savedpromotionalBanner);
    } catch (err) {
        res.json({ message: err });
    }
};

//Update a genre

const updatePromotionalBanner = async (req, res) => {

    try {

        const updatedPromotionalBanner = await PromotionalBanner.updateOne(
            { _id: req.params.pbId },
            {
                $set: {
                    title: req.body.title,
                    appId: req.body.appId,
                    action: req.body.action,
                    image: req.body.image
                },
            }
        );
        res.json(updatedPromotionalBanner);
    } catch (err) {
        res.json({ message: err });
    }
};

//Delete a genre

const deletePromotionalBanner = async (req, res) => {
    try {
        const removedPromotionalBanner = await PromotionalBanner.deleteOne({ _id: req.params.pbId });
        res.json(removedPromotionalBanner);
    } catch (err) {
        res.json({ message: err });
    }
};

module.exports = {
    getAllPromotionalBanner,
    getSpecificPromotionalBanner,
    createPromotionalBanner,
    updatePromotionalBanner,
    deletePromotionalBanner,
};
