const express = require('express');
const multer = require('multer'); // For handling file uploads
const path = require('path');
const fs = require('fs');
const { vodOpenapi } = require('@byteplus/vcloud-sdk-nodejs');

const router = express.Router();
const upload = multer({ dest: path.join(__dirname, '../tmp') });

const vodService = vodOpenapi.defaultService;
vodService.setAccessKeyId(process.env.BYTEPLUS_AK);
vodService.setSecretKey(process.env.BYTEPLUS_SK);


/**
 * doUpload
 * - Expects a multipart/form-data body with field `file`
 * - Uploads the file to BytePlus VOD
 * - Triggers the transcoding workflow
 */
async function doUpload(req, res) {
    const file = req.file;
    if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        // 1️⃣ Upload the file to BytePlus VOD
        const uploadResp = await vodService.UploadMedia({
            FilePath: file.path,
            SpaceName: process.env.BYTEPLUS_SPACE_NAME,

        });
        const vids = uploadResp;

        // 2️⃣ Start your transcoding workflow
        await vodService.StartWorkflow({
            Vid: vids.Result.Data.Vid,
            TemplateId: process.env.BYTEPLUS_TEMPLATE_ID,
        });


        // 3️⃣ Return the video ID to the client
        res.json({ vid: vids });
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ error: err.message });
    } finally {
        // Clean up temp file
        fs.unlink(file.path, () => { });
    }
}

router.post('/updm', upload.single('file'), doUpload);

module.exports = router;
