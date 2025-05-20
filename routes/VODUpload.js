const router = require('express').Router();
const multer = require('multer'); // For handling file uploads
const path = require('path');


// Configure storage for uploaded files
const storage = multer.diskStorage({
    destination: './public/video', // Set the destination folder for uploaded files
    filename: (req, file, callback) => {

        //callback(null, file.originalname); // Use the original filename.

        const timestamp = Date.now();
        const originalname = path.parse(file.originalname);
        const newFilename = `${originalname.name}_${timestamp}${originalname.ext}`;
        callback(null, newFilename);

    },
});


const upload = multer({ storage });



router.post('/vodupload', upload.single('file'), (req, res) => {
    res.status(200).json({ imagePath: req.file.filename });
});

module.exports = router;