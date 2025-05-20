//LikeCountController.js
const LikeCount = require('../models/LikeCount');
const Short = require('../models/Shorts');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;


// Function to like and unlink a short
const likeShort = async (req, res) => {
    const { userId, shortId } = req.body;

    // Validate input
    if (!userId || !shortId) {
        return res.status(400).json({ message: 'userId and shortId are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(shortId)) {
        return res.status(400).json({ message: 'Invalid shortId format' });
    }

    try {
        // Check if the short exists
        const short = await Short.findById(shortId);
        if (!short) {
            return res.status(404).json({ message: 'Short not found' });
        }

        // Check if the user has already liked the short
        const existingLike = await LikeCount.findOne({ shortId, userId });

        if (existingLike) {
            // Unlike: Remove the like entry
            await LikeCount.deleteOne({ _id: existingLike._id });

            // Decrement likes count safely
            short.likesCount = Math.max(0, short.likesCount - 1);
            await short.save();

            return res.status(200).json({ message: 'Short unliked successfully' });
        } else {
            // Like: Add new like entry
            const newLike = new LikeCount({ shortId, userId });
            await newLike.save();

            // Increment likes count
            short.likesCount += 1;
            await short.save();

            return res.status(200).json({ message: 'Short liked successfully' });
        }

    } catch (error) {
        console.error('Error liking/unliking short:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Function to unlike a short
const unlikeShort = async (req, res) => {
    try {
        const { userId, shortId } = req.body;

        // Check if the short exists
        const short = await Short.findById(shortId);
        if (!short) {
            return res.status(404).json({ message: 'Short not found' });
        }

        // Check if the user has already liked the short
        const existingLike = await LikeCount.findOne({ shortId, userId });
        if (!existingLike) {
            return res.status(400).json({ message: 'You have not liked this short yet' });
        }

        // Remove the like count entry
        await LikeCount.deleteOne({ shortId, userId });

        // Decrement the likes count in the Short model
        short.likesCount -= 1;
        await short.save();

        return res.status(200).json({ message: 'Short unliked successfully' });
    } catch (error) {
        console.error('Error unliking short:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Function to get the user ID from the token
const getUserIdFromToken = (req) => {
    // Assuming you have a middleware that verifies the token and attaches the user ID to the request
    return req.userId; // Adjust this based on your authentication middleware
};
// Function to get the like count for a specific short

const getLikeCount = async (req, res) => {
    try {
        const shortId = req.params.id;

        // Check if the short exists
        const short = await Short.findById(shortId);
        if (!short) {
            return res.status(404).json({ message: 'Short not found' });
        }

        // Get the like count from the Short model
        const likeCount = short.likesCount;

        return res.status(200).json({ likeCount });
    } catch (error) {
        console.error('Error getting like count:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// Function to get the like count for a specific short
const getLikeCountByUserId = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Check if the user ID is valid
        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        // Get the like count for the user
        const likeCount = await LikeCount.countDocuments({ userId });

        return res.status(200).json({ likeCount });
    } catch (error) {
        console.error('Error getting like count by user ID:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// Function to get all likes for a specific short
const getAllLikesForShort = async (req, res) => {
    try {
        const shortId = req.params.id;

        // Check if the short exists
        const short = await Short.findById(shortId);
        if (!short) {
            return res.status(404).json({ message: 'Short not found' });
        }

        // Get all likes for the short
        const likes = await LikeCount.find({ shortId });

        return res.status(200).json({ likes });
    } catch (error) {
        console.error('Error getting all likes for short:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// Function to get all likes for a specific user
const getAllLikesByUser = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Check if the user ID is valid
        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        // Get all likes for the user
        const likes = await LikeCount.find({ userId });

        return res.status(200).json({ likes });
    } catch (error) {
        console.error('Error getting all likes by user:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// Function to get all likes for a specific short
const getAllLikesForShortByUser = async (req, res) => {
    try {
        const shortId = req.params.id;
        const userId = req.params.userId;

        // Check if the short exists
        const short = await Short.findById(shortId);
        if (!short) {
            return res.status(404).json({ message: 'Short not found' });
        }

        // Get all likes for the short by the user
        const likes = await LikeCount.find({ shortId, userId });

        return res.status(200).json({ likes });
    } catch (error) {
        console.error('Error getting all likes for short by user:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

//exports all functions
module.exports = {
    likeShort,
    unlikeShort,
    getLikeCount,
    getLikeCountByUserId,
    getAllLikesForShort,
    getAllLikesByUser,
    getAllLikesForShortByUser
};

