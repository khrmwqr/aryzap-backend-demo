const VodContent = require('../models/VodContent');
const { VodUploadClient, VodUploadRequest } = require('vod-node-sdk');
//Get all VodContent



const getAllVodContents = async (req, res) => {
    try {
        const app = await VodContent.find();
        res.json(app);
    } catch (err) {
        res.json({ message: err });
    }
};

//Get a specific app

const getSpecificVodContent = async (req, res) => {
    try {
        const app = await VodContent.findById(req.params.vodId);
        res.json(app);
    } catch (err) {
        res.json({ message: err });
    }
};

//Create a new app

const createVodContent = async (req, res) => {

    //file://C:\Users\ARY\Downloads\y2mate.is - 1 second black screen video-kvO_nHnvPtQ-360p-1692104810.mp4





    try {
        const client = new VodUploadClient(process.env.tcntSecretId, process.env.tcntSecretKey);
        let vodRequest = new VodUploadRequest();
        vodRequest.MediaFilePath = "./public/video/y2mate.mp4";
        client.upload("ap-singapore", req, function (err, data) {
            if (err) {
                res.json({ error_vod_uploading: err });
            } else {
                console.log(data.FileId);
                console.log(data.MediaUrl);

                res.json({ mediaUrl: data.MediaUrl, fieldId: data.fieldId });
            }
        });




    } catch (err) {

        res.json({ message: err.message });
    }
};

//Update an app

const updateVodContent = async (req, res) => {
    try {

        const updatedApp = await VodContent.updateOne(
            { _id: req.params.vodId },
            {
                $set: {
                    title: req.body.title,
                    hlsPath: req.body.hlsPath,
                    transcoded: req.body.transcoded
                },
            }
        );

        res.json(updatedApp);

    } catch (err) {
        res.json({ message: err });
    }
};

//Delete an app

const deleteVodContent = async (req, res) => {
    try {
        const removedApp = await Apps.deleteOne({ _id: req.params.appId });
        res.json(removedApp);
    } catch (err) {
        res.json({ message: err });
    }
};

module.exports = {
    getAllVodContents,
    getSpecificVodContent,
    createVodContent,
    updateVodContent,
    deleteVodContent
};