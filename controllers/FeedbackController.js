const Feedback = require('../models/Feedback'); // Adjust the path as necessary

// Create a new rating
exports.createFeedback = async (req, res) => {
    try {
        const { userId, feedback, app, rate } = req.body;

        // Basic validation
        if (!userId || !app || !rate) {
            return res.status(400).json({ error: 'Missing rate, userId or app name' });
        }

        const feedback_query = new Feedback({ userId, feedback, app, rate });
        await feedback_query.save();

        res.status(201).json({ message: 'Feedback added successfully', feedback_query });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Get all favorites for a user
exports.getFeedbackByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const ratings = await Feedback.find({ userId }).select('userId feedback app addedAt rate');
        res.status(200).json(ratings);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.getFeedbacks = async (req, res) => {
    try {
        const ratings = await Feedback.find().select('userId feedback app addedAt rate');
        res.status(200).json(ratings);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all ratings for a user based on a specific series
exports.getRatingsByUserSeriesBased = async (req, res) => {
    try {
        const { userId, seriesId } = req.params;

        // Find ratings by userId and seriesId without populating series data
        const ratings = await Ratings.find({ userId, seriesId }).select('userId seriesId rate comments addedAt');

        res.status(200).json(ratings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Get a specific favorite by ID
exports.getRatingsById = async (req, res) => {
    try {
        const { id } = req.params;
        const ratings = await Ratings.findById(id).populate('seriesId');
        if (!ratings) {
            return res.status(404).json({ message: 'Ratings not found' });
        }
        res.status(200).json(ratings);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update a favorite
exports.updateRatings = async (req, res) => {
    try {
        const { id } = req.params;
        const { seriesId } = req.body;
        const ratings = await Ratings.findByIdAndUpdate(
            id,
            { seriesId },
            { new: true }
        );
        if (!ratings) {
            return res.status(404).json({ message: 'Ratings not found' });
        }
        res.status(200).json({ message: 'Ratings updated successfully', ratings });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a favorite
exports.deleteRatings = async (req, res) => {
    try {
        const { id } = req.params;
        const ratings = await Ratings.findByIdAndDelete(id);
        if (!ratings) {
            return res.status(404).json({ message: 'Ratings not found' });
        }
        res.status(200).json({ message: 'Ratings deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.toggleRatings = async (req, res) => {
    try {
        const { userId, seriesId } = req.body;

        if (seriesId && userId) {
            // Check if the favorite already exists
            let ratings = await Ratings.findOne({ userId, seriesId });

            if (ratings) {
                // If it exists, delete it
                await Ratings.findByIdAndDelete(ratings._id);
                return res.status(200).json({ message: 'Ratings removed successfully' });
            } else {
                // If it does not exist, create it
                ratings = new Ratings({ userId, seriesId });
                await ratings.save();
                return res.status(201).json({ message: 'Ratings added successfully', ratings });
            }
        } else {
            res.status(400).json({ error: 'Series ID not found' });
        }

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};