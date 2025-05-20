const Billings = require('../models/Billings');
const crypto = require('crypto');
//Get all genres


const encryptionKey = 'ARY$!@#$%#$$$ASDSKJAdjk_=423094892066433';

function encryptData(data) {
    const cipher = crypto.createCipher('aes-256-cbc', encryptionKey);
    let encryptedData = cipher.update(data, 'utf8', 'hex');
    encryptedData += cipher.final('hex');
    return encryptedData;
}


function decryptData(encryptedData) {
    const decipher = crypto.createDecipher('aes-256-cbc', encryptionKey);
    let decryptedData = decipher.update(encryptedData, 'hex', 'utf8');
    decryptedData += decipher.final('utf8');
    return decryptedData;
}

const getAllBillings = async (req, res) => {
    try {
        const billings = await Billings.find();
        res.json(billings);
    } catch (err) {
        res.json({ message: err });
    }
}

//Get a specific genre

const getSpecificBillings = async (req, res) => {
    try {
        const billings = await Billings.findById(req.params.billingsId);
        res.json(billings);
    } catch (err) {
        res.json({ message: err });
    }
};

//Create a new genre

const createBillings = async (req, res) => {

    const billings = new Billings({
        billingType: req.body.billingType,
        billingFullName: encryptData(req.body.billingFullName),
        billingCardNumber: encryptData(req.body.billingCardNumber),
        billingCVV: encryptData(req.body.billingCVV),
        billingValidThru: encryptData(req.body.billingValidThru),
        billingClientID: req.body.billingClientID,
        billingStatus: req.body.billingStatus
    });

    try {
        const savedBillings = await billings.save();
        res.json(savedBillings);
    } catch (err) {
        res.json({ message: err });
    }
};

//Update a genre

const updateBillings = async (req, res) => {

    try {

        const updatedBillings = await Billings.updateOne(
            { _id: req.params.billingsId },
            {
                $set: {
                    billingType: req.body.billingType,
                    billingFullName: req.body.billingFullName,
                    billingCardNumber: req.body.billingCardNumber,
                    billingCVV: req.body.billingCVV,
                    billingValidThru: req.body.billingValidThru,
                    billingClientID: req.body.billingClientID,
                    billingStatus: req.body.billingStatus
                },
            }
        );
        res.json(updatedBillings);
    } catch (err) {
        res.json({ message: err });
    }
};

//Delete a genre

const deleteBillings = async (req, res) => {
    try {
        const removedBillings = await Billings.remove({ _id: req.params.billingsId });
        res.json(removedBillings);
    } catch (err) {
        res.json({ message: err });
    }
};

module.exports = {
    getAllBillings,
    getSpecificBillings,
    createBillings,
    updateBillings,
    deleteBillings,
};
