const Home = require('../models/Home');

//Get all genres

const getAllHome = async (req, res) => {
    try {
        const home = await Home.find();
        res.json({ home: home[1] });
    } catch (err) {
        res.json({ message: err });
    }
}

const getAllHomeV2 = async (req, res) => {
    try {
        const home = await Home.find();
        res.json(home);
    } catch (err) {
        res.json({ message: err });
    }
}

//Get a specific genre

const getSpecificHome = async (req, res) => {
    try {
        const home = await Home.findById(req.params.homeId);
        res.json({ home: home });
    } catch (err) {
        res.json({ message: err });
    }
};

//Create a new genre

const createHome = async (req, res) => {

    const home = new Home({
        homeTitle: req.body.homeTitle,
        homeAppId: req.body.homeAppId,
        homeData: req.body.homeData
    });

    try {
        const savedhome = await home.save();
        res.json(savedhome);
    } catch (err) {
        res.json({ message: err });
    }
};

//Update a genre

const updateHome = async (req, res) => {

    try {

        const updatedhome = await Home.updateOne(
            { _id: req.params.homeId },
            {
                $set: {
                    homeTitle: req.body.homeTitle,
                    homeAppId: req.body.homeAppId,
                    homeData: req.body.homeData
                },
            }
        );
        res.json(updatedhome);
    } catch (err) {
        res.json({ message: err });
    }
};

//Delete a genre

const deleteHome = async (req, res) => {
    try {
        const removedhome = await Home.deleteOne({ _id: req.params.homeId });
        res.json(removedhome);
    } catch (err) {
        res.json({ message: err });
    }
};

module.exports = {
    getAllHome,
    getSpecificHome,
    createHome,
    updateHome,
    deleteHome,
    getAllHomeV2
};
