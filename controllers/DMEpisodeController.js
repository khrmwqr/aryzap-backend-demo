const mongoose = require('mongoose');
const DMEpisode = require('../models/DMEpisode'); // Adjust the path to your DMEpisode model
const axios = require('axios');

const getDMEpisode = async (req, res) => {
    const { page, limit, playlistId, seriesId } = req.params;

    try {
        // Fetch data from Dailymotion API
        const response = await axios.get(`https://api.dailymotion.com/playlist/${playlistId}/videos?fields=thumbnail_480_url,title,id,views_total,duration,owner.screenname,owner,description&page=${page}&limit=${limit}`);
        // &sort=id-asc removed sorting.
        const episodes = response.data.list;
        console.log(episodes);

        for (let episodeData of episodes) {
            const { id, thumbnail_480_url, title, views_total, duration, owner, description } = episodeData;

            // Check if the episode already exists
            let existingEpisode = await DMEpisode.findOne({ videoDmId: id });

            if (!existingEpisode) {
                // If episode doesn't exist, create a new entry
                let newEpisode = new DMEpisode({
                    seriesId: seriesId, // Replace with actual seriesId if available
                    videoSource: 'Dailymotion', // Assuming the source is Dailymotion
                    imagePath: thumbnail_480_url,
                    description: description,
                    title: title,
                    videoDmId: id,
                    videoViews: views_total,
                    videoDuration: duration
                });

                await newEpisode.save();
            } else if (existingEpisode.title !== title) {
                // If episode exists but title has changed, update the title
                existingEpisode.title = title;
                await existingEpisode.save();
            }
        }

        res.status(200).json({ message: 'Episodes fetched and stored successfully' });

    } catch (error) {
        console.error('Error fetching or storing episodes:', error);
        res.status(500).json({ message: 'Failed to fetch and store episodes', error });
    }
}

const fetchEPbySeriesId = async (req, res) => {
    const { seriesId } = req.params;
    try {
        const episodes = await DMEpisode.find({ seriesId: seriesId });
        res.status(200).json({ episode: episodes });
    }
    catch (errot) {
        console.error('Error fetching:', error);
        res.status(500).json({ message: 'Failed to fetch episodes', error });
    }
}

const fetchEPbySeriesIdPg = async (req, res) => {
    const { seriesId } = req.params;
    const { page = 1, limit = 10 } = req.query; // Defaults: page = 1, limit = 10

    try {
        const episode = await DMEpisode.find({ seriesId: seriesId })
            .skip((page - 1) * limit) // Skip the documents for previous pages
            .limit(Number(limit)) // Limit the number of documents returned

        const totalEpisodes = await DMEpisode.countDocuments({ seriesId: seriesId }); // Total episodes for the series
        const totalPages = Math.ceil(totalEpisodes / limit);

        res.status(200).json({

            episode,
            currentPage: Number(page),
            limit: Number(limit),
            totalEpisodes,
            totalPages,
        });
    } catch (error) {
        console.error('Error fetching:', error);
        res.status(500).json({ message: 'Failed to fetch episodes', error });
    }
};


const fetchAllEpisodes = async (req, res) => {

    try {
        const episodes = await DMEpisode.find();
        res.status(200).json({ episode: episodes });
    }
    catch (errot) {
        console.error('Error fetching:', error);
        res.status(500).json({ message: 'Failed to fetch episodes', error });
    }
}


// const deleteDmEpisode = async (req, res) => {
//     try {
//         const removedSeries = await DMEpisode.remove({ _id: req.params.seriesId });
//         res.json(removedSeries);
//     } catch (err) {
//         res.json({ message: err });
//     }
// };

const deleteDmEpisode = async (req, res) => {
    try {
        const { seriesId } = req.params;

        // Validate the seriesId
        if (!seriesId) {
            return res.status(400).json({ message: "seriesId is required." });
        }

        // Use `findByIdAndDelete` for a more explicit and modern approach
        const removedEpisode = await DMEpisode.findByIdAndDelete(seriesId);

        // Check if the document exists
        if (!removedEpisode) {
            return res.status(404).json({ message: "Episode not found." });
        }

        // Respond with the deleted document
        res.status(200).json({
            message: "Episode deleted successfully.",
            data: removedEpisode,
        });
    } catch (err) {
        res.status(500).json({ message: "An error occurred while deleting the episode.", error: err.message });
    }
};
const deleteAllDmEpisodes = async (req, res) => {
    try {
        const { seriesId } = req.params;

        // Validate the seriesId
        if (!seriesId) {
            return res.status(400).json({ message: "seriesId is required." });
        }

        // Convert seriesId to ObjectId
        const objectIdSeriesId = new mongoose.Types.ObjectId(seriesId);
        const result = await DMEpisode.deleteMany({ seriesId: objectIdSeriesId });

        // Check if any documents were deleted
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "No episodes found for the given seriesId." });
        }

        // Respond with success message
        res.status(200).json({
            message: "Episodes deleted successfully.",
            deletedCount: result.deletedCount,
        });

        
    } catch (err) {
        res.status(500).json({ message: "An error occurred while deleting the episode.", error: err.message });
    }
};


module.exports = {
    getDMEpisode,
    fetchEPbySeriesId,
    fetchAllEpisodes,
    fetchEPbySeriesIdPg,
    deleteDmEpisode,
    deleteAllDmEpisodes
}