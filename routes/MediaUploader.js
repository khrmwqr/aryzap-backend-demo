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


router.get('/getvod', async (req, res) => {
    try {
        const options = {
            SpaceName: process.env.BYTEPLUS_SPACE_NAME, // Replace with your actual space name
            Status: 'Published',          // Fetch only published videos
            Order: 'Desc',                // Sort by creation time descending
            PageSize: '100',              // Number of records per page (max 100)
            Offset: '0'                   // Starting point
        };

        const response = await vodService.GetMediaList(options);

        // Extract relevant information
        const videos = response.Result.MediaInfoList.map(media => ({
            Vid: media.BasicInfo.Vid,
            Title: media.BasicInfo.Title,
            Description: media.BasicInfo.Description,
            PosterUri: media.BasicInfo.PosterUri,
            CreateTime: media.BasicInfo.CreateTime,
            PublishStatus: media.BasicInfo.PublishStatus,
            Tags: media.BasicInfo.Tags,
            Classification: media.BasicInfo.Classification,
            TosStorageClass: media.BasicInfo.TosStorageClass,
            VodUploadSource: media.BasicInfo.VodUploadSource
        }));

        res.json({ videos });
    } catch (error) {
        console.error('Error fetching media list:', error);
        res.status(500).json({ error: 'Failed to fetch media list' });
    }
});



module.exports = router;