const { response } = require('express');
const YTEpisodeSchema = require('../models/YTEpisode');
const axios = require('axios');

function getPosts() {
    const response = fetch(`${process.env.BASE_URL}/api/series`);
    return response.json();
}

const getLoc = async (req, res) => {

    try {
        let data = 'PK';

        // Properly interpolate the cacheBuster value
        const cacheBuster = `deviceID=${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

        // Correctly build the apiUrl string
        const apiUrl = `https://cdn.aryzap.com/api/geoCountry.php?${cacheBuster}`;

        // Make the request to fetch geoCountry info
        const response = await axios.get(apiUrl);
        if (response.data && response.data.country_code) {
            data = response.data.country_code;
        }


        // const resp = await axios.get(`https://1.1.1.1/cdn-cgi/trace`);
        // const data = resp.data;
        // const newArray = resp.data.match(/loc=(\S+)/)[1];



        res.json({ country: data });

    } catch (e) {
        res.json({ error: e.message });
    }

};

const ytEPF = async (req, res) => {

    const newData = [];
    const episodeData = [];

    try {
        const resp = await axios.get(`https://www.googleapis.com/youtube/v3/playlistItems?part=status,snippet,id,contentDetails&playlistId=${req.params.playlistId}&key=AIzaSyAPkP3ZAajyxoKlbpvZFj2a9N2jZwlxcoM&maxResults=100`);
        const data = resp.data.items;

        // TODO: Create a For loop that will check if item etag is already exists or not if its not exists then it will create a new item

        for (const item of data) {

            const existingItem = await YTEpisodeSchema.findOne({ videoYtId: item.contentDetails.videoId });

            if (!existingItem) {
                //Insert a new Item

                if (item.snippet.title !== "Private video") {
                    if (req.params.seriesId == "66bdbdeabd61cd78039fc9be" || req.params.seriesId == "66bdf4acaae81905147c4cb5") {
                        const newItem = new YTEpisodeSchema({
                            seriesId: req.params.seriesId,
                            videoSource: null,
                            title: item.snippet.title,
                            description: item.snippet.description,
                            imagePath: req.params.seriesId === "66bdf4acaae81905147c4cb5"
                                ? item?.snippet?.thumbnails?.maxres?.url
                                : item?.snippet?.thumbnails?.medium?.url,
                            videoYtId: item.contentDetails.videoId,
                            videoViews: null,
                            videoLength: null,
                            publishedAt: item.snippet.publishedAt,
                        });
                        const savedEpisode = await newItem.save();
                        console.log(`Inserted item with _id ${savedEpisode._id}`);
                        newData.push(savedEpisode);
                    } else {
                        const newItem = new YTEpisodeSchema({ seriesId: req.params.seriesId, videoSource: null, title: item.snippet.title, description: item.snippet.description, imagePath: item?.snippet?.thumbnails?.medium?.url, videoYtId: item.contentDetails.videoId, videoViews: null, videoLength: null, publishedAt: item.snippet.publishedAt });
                        const savedEpisode = await newItem.save();
                        console.log(`Inserted item with _id ${savedEpisode._id}`);
                        newData.push(savedEpisode);
                    }

                } else {
                    console.log("private video found");
                }

            } else {
                console.log(`Item with _id ${item.id} already exists in the database.`);
            }


        }

        res.json(newData);

    } catch (e) {
        res.json({ error: e.message });
    }

};

const getAllYTEpisodes = async (req, res) => {
    try {
        const episode = await YTEpisodeSchema.find();
        res.json({ episode: episode });
    } catch (err) {
        res.json({ message: err });
    }
};

//Get a specific episode

const getSpecificYTEpisode = async (req, res) => {

    try {
        const episode = await YTEpisodeSchema.findOne(req.params.episodeId);
        res.json({ episode: episode });
    } catch (err) {
        res.json({ message: err });
    }
};


const getSpecificYTEpisodesBySeriesID = async (req, res) => {
    try {
        let limit = 100; // Default limit
        const seriesId = req.params.seriesId;

        // Apply specific limits based on the series ID
        if (seriesId === "66bdf4acaae81905147c4cb5") {
            // drama ost 
            limit = 5;
        }

        // Fetch episodes based on the seriesId with the appropriate limit
        const episode = await YTEpisodeSchema.find({ seriesId })
            .sort({ publishedAt: -1 })
            .limit(limit);

        res.json({ episode });
    } catch (err) {
        res.status(500).json({ message: "An error occurred", error: err.message });
    }
};


//Create a new episode

const createYTEpisode = async (req, res) => {

    const episode = new YTEpisodeSchema({
        title: req.body.title,
        description: req.body.description,
        season: req.body.season,
        episode: req.body.episode,
        air_date: req.body.air_date,
        cast: req.body.cast,
        series: req.body.series,
        image: req.body.image,
        imageCover: req.body.imageCover,
        imagePortrait: req.body.imagePortrait,
        trailer: req.body.trailer,
        video: req.body.video,
    });

    try {
        if (req.body.title !== "Private video") {
            const savedEpisode = await episode.save();
            res.json(savedEpisode);
        } else {
            res.json({ message: "Private video" });
        }

    } catch (err) {
        res.json({ message: err });
    }
};

//Update an episode

const updateYTEpisode = async (req, res) => {

    try {

        const updatedEpisode = await YTEpisodeSchema.updateOne(
            { _id: req.params.episodeId },
            {
                $set: {
                    title: req.body.title,
                    description: req.body.description,
                    season: req.body.season,
                    episode: req.body.episode,
                    air_date: req.body.air_date,
                    cast: req.body.cast,
                    series: req.body.series,
                    image: req.body.image,
                    imageCover: req.body.imageCover,
                    imagePortrait: req.body.imagePortrait,
                    trailer: req.body.trailer,
                    video: req.body.video,
                },
            }
        );
        res.json(updatedEpisode);
    } catch (err) {
        res.json({ message: err });
    }
};

//Delete an episode

const deleteYTEpisode = async (req, res) => {
    try {
        const removedEpisode = await YTEpisodeSchema.deleteOne({ _id: req.params.episodeId });
        res.json(removedEpisode);
    } catch (err) {
        res.json({ message: err });
    }
};

const getSpecificYTEpisodesBySeriesIDPG = async (req, res) => {
    try {
        // Extract seriesId from request parameters
        const seriesId = req.params.seriesId;

        // Extract page and limit from query parameters (default values are 1 and 10)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // Calculate the number of documents to skip
        const skip = (page - 1) * limit;

        // Fetch episodes with pagination
        const episode = await YTEpisodeSchema.find({ seriesId })
            .skip(skip)
            .sort({ publishedAt: -1 })
            .limit(limit);

        // Fetch total count of episodes for the given seriesId
        const totalEpisodes = await YTEpisodeSchema.countDocuments({ seriesId });

        // Send paginated response
        res.json({
            episode,
            currentPage: page,
            totalPages: Math.ceil(totalEpisodes / limit),
            totalEpisodes,

            limit: Number(limit),
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getAllYTEpisodes,
    getSpecificYTEpisode,
    createYTEpisode,
    updateYTEpisode,
    deleteYTEpisode,
    getSpecificYTEpisodesBySeriesID,
    ytEPF,
    getLoc,
    getSpecificYTEpisodesBySeriesIDPG
};