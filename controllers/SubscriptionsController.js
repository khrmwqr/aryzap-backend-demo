const Subscriptions = require('../models/Subscriptions');

//Get all genres

const getAllSubscriptions = async (req, res) => {
    try {
        const subs = await Subscriptions.find();
        res.json(subs);
    } catch (err) {
        res.json({ message: err });
    }
}

//Get a specific genre

const getSpecificSubscriptions = async (req, res) => {
    try {
        const subs = await Subscriptions.findById(req.params.subsId);
        res.json(subs);
    } catch (err) {
        res.json({ message: err });
    }
};

//Create a new genre

const createSubscriptions = async (req, res) => {

    const subs = new Subscriptions({
        transaction_meta: req.body.transaction_meta,
        customer_id: req.body.customer_id,
        transaction_id: req.body.transaction_id,
        package_id: req.body.package_id,
        subscription_date: req.body.subscription_date,
        subscription_expiry: req.body.subscription_expiry
    });

    try {
        const savedsubs = await subs.save();
        res.json(savedsubs);
    } catch (err) {
        res.json({ message: err });
    }
};

//Update a genre

const updateSubscriptions = async (req, res) => {

    try {

        const updatedsubs = await Subscriptions.updateOne(
            { _id: req.params.subsId },
            {
                $set: {
                    transaction_meta: req.body.transaction_meta,
                    customer_id: req.body.customer_id,
                    transaction_id: req.body.transaction_id,
                    package_id: req.body.package_id,
                    subscription_date: req.body.subscription_date,
                    subscription_expiry: req.body.subscription_expiry
                },
            }
        );
        res.json(updatedsubs);
    } catch (err) {
        res.json({ message: err });
    }
};

//Delete a genre

const deleteSubscriptions = async (req, res) => {
    try {
        const removedsubs = await Subscriptions.deleteOne({ _id: req.params.subsId });
        res.json(removedsubs);
    } catch (err) {
        res.json({ message: err });
    }
};

module.exports = {
    getAllSubscriptions,
    getSpecificSubscriptions,
    createSubscriptions,
    updateSubscriptions,
    deleteSubscriptions,
};
