const WatchHistory = require('../models/WatchHistory');

//Get all apps

const getAllWatchHistory = async (req, res) => {
    try {
        const data = await WatchHistory.find();
        res.json(data);
    } catch (err) {
        res.json({ message: err });
    }
};


//Get a specific app

const getSpecificWatchHistory = async (req, res) => {
    try {
        const data = await WatchHistory.findById(req.params.hid);
        res.json(data);
    } catch (err) {
        res.json({ message: err });
    }
};

//Get All Watch History by User ID,

const getWatchHistoryByUserId = async (req, res) => {
    try {
        const data = await WatchHistory.find({ userId: req.params.userId });
        res.json(data);
    } catch (err) {
        res.json({ message: err });
    }
};


//Get All Watch History by User ID and seriesId,

const getWatchHistoryByUserIdAndSeriesId = async (req, res) => {
    try {
        const data = await WatchHistory.find({
            userId: req.params.userId, seriesId: req.params
                .seriesId
        });
        res.json(data);
    } catch (err) {
        res.json({ message: err });
    }
};



//Create a watch history

const createWatchHistory = async (req, res) => {
    try {
        const { userId, seriesId, episodeId, currentTime, seriesType } = req.body;

        // Check if watch history already exists
        const existingHistory = await WatchHistory.findOne({ userId, seriesId, episodeId });

        if (existingHistory) {
            // Update the existing entry
            existingHistory.currentTime = currentTime;
            existingHistory.updatedAt = new Date(); // Optional: keep track of updates
            const updatedHistory = await existingHistory.save();
            return res.json(updatedHistory);
        }

        // If not exists, create new
        const newHistory = new WatchHistory({ userId, seriesId, episodeId, currentTime, seriesType });
        const savedHistory = await newHistory.save();
        res.json(savedHistory);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


//Update an app

const updateWatchHistory = async (req, res) => {
    try {

        const updatedWatchHistory = await WatchHistory.updateOne(
            { _id: req.params.hid },
            {
                $set: {
                    userId: req.body.userId,
                    seriesId: req.body.seriesId,
                    episodeId: req.body.episodeId,
                    currentTime: req.body.currentTime,
                    seriesType: req.body.seriesType,
                    updatedAt: req.body.updatedAt
                },
            }
        );

        res.json(updatedWatchHistory);

    } catch (err) {
        res.json({ message: err });
    }
};

//Delete all episodes of a series where userId and seriesId match 
const deleteWatchHistoryByUserIdAndSeriesId = async (req, res) => {
    try {
        const removedData = await WatchHistory.deleteMany({
            userId: req.params.userId,
            seriesId: req.params.seriesId
        });
        res.json(removedData);
    } catch (err) {
        res.json({ message: err });
    }
};


const deleteWatchHistory = async (req, res) => {
    try {
        const removedData = await WatchHistory.deleteOne({ _id: req.params.hid });
        res.json(removedData);
    } catch (err) {
        res.json({ message: err });
    }
};

const createOrUpdateWatchHistory = async (req, res) => {
    const { userId, seriesId, episodeId, currentTime, seriesType } = req.body;

    // Input validation
    if (!userId || !seriesId || !seriesType) {
        return res.status(400).json({ message: "userId, seriesId, and seriesType are required" });
    }

    if (seriesType === "show" && !episodeId) {
        return res.status(400).json({ message: "episodeId is required for show type" });
    }

    if (typeof currentTime !== "number" || currentTime < 0) {
        return res.status(400).json({ message: "currentTime must be a non-negative number" });
    }

    try {
        // Define query based on seriesType
        const query = seriesType === "show"
            ? { userId, seriesId, episodeId }
            : { userId, seriesId };

        // Find existing history
        const existingHistory = await WatchHistory.findOne(query);

        if (existingHistory) {
            // Update existing record
            existingHistory.currentTime = currentTime;
            const updatedHistory = await existingHistory.save();
            return res.status(200).json(updatedHistory);
        }

        // Create new record
        const newHistory = new WatchHistory({
            userId,
            seriesId,
            episodeId: seriesType === "show" ? episodeId : null,
            currentTime,
            seriesType
        });

        const savedHistory = await newHistory.save();
        return res.status(201).json(savedHistory);

    } catch (err) {
        console.error("Error in createOrUpdateWatchHistory:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const getWatchHistorySeriesByUserId = async (req, res) => {

    //Get all series watched by userId, wihout series repeatition, also get series meta data from series table
    //We need to populate the adsmanager of series table


    try {
        const data = await WatchHistory.aggregate([
            { $match: { userId: req.params.userId } },
            {
                $group: {
                    _id: "$seriesId",
                    seriesId: { $first: "$seriesId" },
                    episodeId: { $first: "$episodeId" },
                    seriesType: { $first: "$seriesType" },
                    currentTime: { $first: "$currentTime" },
                    updatedAt: { $first: "$updatedAt" },
                    createdAt: { $first: "$createdAt" },
                }
            },
            {
                $lookup: {
                    from: "series",
                    localField: "seriesId",
                    foreignField: "_id",
                    as: "series"
                }
            },
            { $unwind: "$series" },

        ]);
        res.json(data);
    } catch (err) {
        res.json({ message: err });
    }



};


module.exports = {
    getAllWatchHistory,
    getSpecificWatchHistory,
    createWatchHistory,
    updateWatchHistory,
    deleteWatchHistory,
    getWatchHistoryByUserId,
    getWatchHistoryByUserIdAndSeriesId,
    createOrUpdateWatchHistory,
    getWatchHistorySeriesByUserId,
    deleteWatchHistoryByUserIdAndSeriesId
};