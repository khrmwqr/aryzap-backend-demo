const Apps = require('../models/Apps');

//Get all apps

const getAllApps = async (req, res) => {
    try {
        const app = await Apps.find();
        res.json(app);
    } catch (err) {
        res.json({ message: err });
    }
};

//Get a specific app

const getSpecificApp = async (req, res) => {
    try {
        const app = await Apps.findById(req.params.appId);
        res.json(app);
    } catch (err) {
        res.json({ message: err });
    }
};

//Create a new app

const createApp = async (req, res) => {
    const app = new Apps({
        title: req.body.title,
        description: req.body.description,
        image: req.body.image,
        bundleId: req.body.bundleId,
        platform: req.body.platform,
        appsConfig: req.body.appsConfig
    });

    try {
        const savedApp = await app.save();
        res.json(savedApp);
    } catch (err) {
        res.json({ message: err });
    }
};

//Update an app

const updateApp = async (req, res) => {
    try {

        const updatedApp = await Apps.updateOne(
            { _id: req.params.appId },
            {
                $set: {
                    title: req.body.title,
                    description: req.body.description,
                    image: req.body.image,
                    bundleId: req.body.bundleId,
                    platform: req.body.platform,
                    appsConfig: req.body.appsConfig
                },
            }
        );

        res.json(updatedApp);

    } catch (err) {
        res.json({ message: err });
    }
};

//Delete an app

const deleteApp = async (req, res) => {
    try {
        const removedApp = await Apps.deleteOne({ _id: req.params.appId });
        res.json(removedApp);
    } catch (err) {
        res.json({ message: err });
    }
};

module.exports = {
    getAllApps,
    getSpecificApp,
    createApp,
    updateApp,
    deleteApp,
};