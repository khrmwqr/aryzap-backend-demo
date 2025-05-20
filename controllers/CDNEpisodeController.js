const { response } = require('express');
const CDNEpisodeSchema = require('../models/CDNEpisode');
const axios = require('axios');
const { default: mongoose } = require('mongoose');

// function getPosts() {
//     const response = fetch(`${process.env.BASE_URL}/api/series`);
//     return response.json();
// }

// const getLoc = async (req, res) => {

//     try {
//         const resp = await axios.get(`https://1.1.1.1/cdn-cgi/trace`);
//         const data = resp.data;
//         const newArray = resp.data.match(/loc=(\S+)/)[1];



//         res.json({ country: newArray });

//     } catch (e) {
//         res.json({ error: e.message });
//     }

// };

// const CDNEPF = async (req, res) => {

//     const newData = [];
//     const episodeData = [];

//     try {
//         const resp = await axios.get(`https://www.googleapis.com/youtube/v3/playlistItems?part=status,snippet,id,contentDetails&playlistId=${req.params.playlistId}&key=AIzaSyAPkP3ZAajyxoKlbpvZFj2a9N2jZwlxcoM&maxResults=100`);
//         const data = resp.data.items;

//         // TODO: Create a For loop that will check if item etag is already exists or not if its not exists then it will create a new item

//         for (const item of data) {

//             const existingItem = await CDNEpisodeSchema.findOne({ videoYtId: item.contentDetails.videoId });

//             if (!existingItem) {
//                 //Insert a new Item
//                 const newItem = new YTEpisodeSchema({ seriesId: req.params.seriesId, videoSource: null, title: item.snippet.title, description: item.snippet.description, imagePath: item?.snippet?.thumbnails?.medium?.url, videoYtId: item.contentDetails.videoId, videoViews: null, videoLength: null });
//                 const savedEpisode = await newItem.save();
//                 console.log(`Inserted item with _id ${savedEpisode._id}`);
//                 newData.push(savedEpisode);
//             } else {
//                 console.log(`Item with _id ${item.id} already exists in the database.`);
//             }


//         }

//         res.json(newData);

//     } catch (e) {
//         res.json({ error: e.message });
//     }

// };

const getAllCDNEpisodes = async (req, res) => {
    try {
        const episode = await CDNEpisodeSchema.find().populate("streamAds");
        res.json({ episode: episode });
    } catch (err) {
        res.json({ message: err });
    }
};

//Get a specific episode

const getSpecificCDNEpisode = async (req, res) => {

    try {
        const episode = await CDNEpisodeSchema.findOne(new mongoose.Types.ObjectId(req.params.episodeId)).populate('streamAds');
        res.json({ episode: episode });
    } catch (err) {
        res.json({ message: err });
    }
};

const getSpecificCDNEpisodesBySeriesID = async (req, res) => {
    try {
        // Fetch the episodes and populate only the 'tag' field from the streamAds reference
        const episodes = await CDNEpisodeSchema
            .find({ seriesId: req.params.seriesId })
            .populate('streamAds', 'tag') // Populate the 'tag' field and retain _id
            .lean(); // Convert documents to plain JS objects for easy manipulation

        // Transform the data to include both 'streamAds' (ID) and 'tag' (URL)
        const transformedEpisodes = episodes.map(episode => {
            return {
                ...episode,
                streamAds: episode.streamAds ? episode.streamAds._id : null, // Keep streamAds as its ID
                tag: episode.streamAds ? episode.streamAds.tag : null // Add 'tag' field separately
            };
        });

        // Send the transformed episodes in the response
        res.json({ episode: transformedEpisodes });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

//Create a new episode

const createCDNEpisode = async (req, res) => {

    const episode = new CDNEpisodeSchema({
        title: req.body.title,
        description: req.body.description,
        seriesId: req.body.seriesId,
        videoEpNumber: req.body.videoEpNumber,
        videoSource: req.body.videoSource,
        imagePath: req.body.imagePath,
        imagePathV2: req.body.imagePathV2,
        videoViews: req.body.videoViews,
        videoLength: req.body.videoLength,
        videoType: req.body.videoType,
        published: req.body.published,
        streamAds: req.body.streamAds,
        introTimeStamp: req.body.introTimeStamp
    });

    try {
        const savedEpisode = await episode.save();
        res.json(savedEpisode);
    } catch (err) {
        res.json({ message: err });
    }
};

//Update an episode

const updateCDNEpisode = async (req, res) => {

    try {

        const updatedEpisode = await CDNEpisodeSchema.updateOne(
            { _id: new mongoose.Types.ObjectId(req.params.episodeId) },
            {
                $set: {
                    title: req.body.title,
                    description: req.body.description,
                    seriesId: req.body.seriesId,
                    videoEpNumber: req.body.videoEpNumber,
                    videoSource: req.body.videoSource,
                    imagePath: req.body.imagePath,
                    imagePathV2: req.body.imagePathV2,
                    videoViews: req.body.videoViews,
                    videoLength: req.body.videoLength,
                    videoType: req.body.videoType,
                    published: req.body.published,
                    streamAds: req.body.streamAds,
                    introTimeStamp: req.body.introTimeStamp
                },
            }
        );
        res.json(updatedEpisode);
    } catch (err) {
        res.json({ message: err });
    }
};

//Delete an episode

const deleteCDNEpisode = async (req, res) => {
    try {
        const removedEpisode = await CDNEpisodeSchema.deleteOne({ _id: req.params.episodeId });
        res.json(removedEpisode);
    } catch (err) {
        res.json({ message: err });
    }
};

module.exports = {
    getAllCDNEpisodes,
    getSpecificCDNEpisode,
    createCDNEpisode,
    updateCDNEpisode,
    deleteCDNEpisode,
    getSpecificCDNEpisodesBySeriesID
};