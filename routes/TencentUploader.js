// const express = require('express');
// const router = express.Router();
// const tencentcloud = require("tencentcloud-sdk-nodejs-intl-en");
// const VodClient = tencentcloud.vod.v20180717.Client;
// const models = tencentcloud.vod.v20180717.Models;
// const Credential = require('tencentcloud-sdk-nodejs-intl-en').common.Credential; // Corrected path
// const ClientProfile = require('tencentcloud-sdk-nodejs-intl-en').common.ClientProfile; // Corrected path
// const HttpProfile = require('tencentcloud-sdk-nodejs-intl-en').common.HttpProfile;// Corrected path
// const multer = require('multer');
// const path = require('path');

// // Instantiate an authentication object.
// const cred = new Credential(process.env.TENCENT_SECRET_ID, process.env.TENCENT_SECRET_KEY);

// // Instantiate an HTTP option
// const httpProfile = new HttpProfile();
// httpProfile.endpoint = "vod.intl.tencentcloudapi.com";

// // Instantiate a client configuration object.
// const clientProfile = new ClientProfile();
// clientProfile.httpProfile = httpProfile;

// // Instantiate a client object
// const client = new VodClient(cred, "ap-singapore", clientProfile);

// // Configure multer for file uploads
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'tmp/');
//     },
//     filename: function (req, file, cb) {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         const fileExtension = path.extname(file.originalname);
//         cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
//     },
// });
// const upload = multer({ storage: storage });

// /**
//  * Route for applying for video upload.
//  * Handles the Tencent Cloud VOD ApplyUpload API.
//  */
// router.post('/apply-upload', upload.single('video'), async (req, res) => {
//     try {
//         // Check if a file was uploaded
//         if (!req.file) {
//             return res.status(400).json({ error: 'No video file provided.' });
//         }

//         // Instantiate a request object.
//         let applyUploadReq = new models.ApplyUploadRequest();

//         const fileSize = req.file.size;
//         const mediaType = 'video';
//         const mediaName = req.body.title || req.file.originalname;

//         let params = {
//             MediaType: mediaType,
//             MediaName: mediaName,
//             FileSize: fileSize,
//         };

//         applyUploadReq.from_json_string(JSON.stringify(params));

//         // The returned "response" is an instance of the ApplyUploadResponse class
//         // Use a Promise-based approach to handle the async operation
//         const response = await client.ApplyUpload(applyUploadReq);

//         // A string return packet in JSON format is output
//         console.log(response.to_json_string());
//         const result = JSON.parse(response.to_json_string());

//         res.status(200).json(result);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: error.message || 'Failed to apply for upload' });
//     }
// });

// module.exports = router;
