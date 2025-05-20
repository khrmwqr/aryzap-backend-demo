const Apps = require('../models/Apps');
const path = require('path');

const fs = require('fs');
const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);
//Get all apps

const mediaUpload = async (req, res) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send({
                message: 'No files were uploaded.'
            });
        }

        const uploadedImage = req.files.image;
        const imagePath = path.join(__dirname, 'public', 'uploads', uploadedImage.name);

        await writeFileAsync(imagePath, uploadedImage.data);

        res.status(200).send({ message: 'Image Upload Successfully' });
    } catch (error) {
        console.error('Error uploading image', error);
        res.status(500).send({ message: 'Error uploading image' });
    }
};

module.exports = {
    mediaUpload
};