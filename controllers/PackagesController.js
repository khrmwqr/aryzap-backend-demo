const Packages = require('../models/Packages');

//Get all genres

const getAllPackages = async (req, res) => {
    try {
        const pack = await Packages.find();
        res.json(pack);
    } catch (err) {
        res.json({ message: err });
    }
}

//Get a specific genre

const getSpecificPackages = async (req, res) => {
    try {
        const pack = await Packages.findById(req.params.packageId);
        res.json(pack);
    } catch (err) {
        res.json({ message: err });
    }
};

//Create a new genre

const createPackages = async (req, res) => {

    const pack = new Packages({
        packageName: req.body.packageName,
        packageDetails: req.body.packageDetails,
        packagePrice: req.body.packagePrice,
        packageLabel: req.body.packageLabel,
        packageAllowScreens: req.body.packageAllowScreens,
        packageStatus: req.body.packageStatus,
        packageDays: req.body.packageDays,
        packageStripePriceId: req.body.packageStripePriceId
    });

    try {
        const savedpack = await pack.save();
        res.json(savedpack);
    } catch (err) {
        res.json({ message: err });
    }
};

//Update a genre

const updatePackages = async (req, res) => {

    try {

        const updatedpack = await Packages.updateOne(
            { _id: req.params.packageId },
            {
                $set: {
                    packageName: req.body.packageName,
                    packageDetails: req.body.packageDetails,
                    packagePrice: req.body.packagePrice,
                    packageLabel: req.body.packageLabel,
                    packageAllowScreens: req.body.packageAllowScreens,
                    packageStatus: req.body.packageStatus,
                    packageDays: req.body.packageDays,
                    packageStripePriceId: req.body.packageStripePriceId
                },
            }
        );
        res.json(updatedpack);
    } catch (err) {
        res.json({ message: err });
    }
};

//Delete a genre

const deletePackages = async (req, res) => {
    try {
        const removedpack = await Packages.remove({ _id: req.params.packageId });
        res.json(removedpack);
    } catch (err) {
        res.json({ message: err });
    }
};

module.exports = {
    getAllPackages,
    getSpecificPackages,
    createPackages,
    updatePackages,
    deletePackages,
};
