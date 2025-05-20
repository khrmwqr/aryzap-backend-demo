const Ratings = require('../models/Ratings'); // Adjust the path as necessary

// Create a new rating
exports.createRatings = async (req, res) => {
    try {
        const { userId, seriesId, rate, comments } = req.body;

        // Basic validation
        if (!seriesId || !userId || !rate) {
            return res.status(400).json({ error: 'Missing seriesId, userId, or rate.' });
        }

        // Validate that rate is within range (if defined in the model as 1-5)
        if (rate < 1 || rate > 5) {
            return res.status(400).json({ error: 'Rate must be between 1 and 5.' });
        }

        // Check if a rating already exists for this user and series
        const existingRating = await Ratings.findOne({ userId, seriesId });

        if (existingRating) {
            // Update the existing rating
            existingRating.rate = rate;
            existingRating.comments = comments;
            await existingRating.save();

            return res.status(200).json({ 
                message: 'Rating updated successfully', 
                ratings: existingRating,
                success: true 
            });
        }

        // Create a new rating if no existing rating is found
        const newRating = new Ratings({ userId, seriesId, rate, comments });
        await newRating.save();

        res.status(201).json({ 
            message: 'Rating added successfully', 
            ratings: newRating,
            success: true
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



// Get all favorites for a user
exports.getRatingsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        // const ratings = await Ratings.find({ userId }).populate('seriesId');
        const ratings = await Ratings.find({ userId }).select('userId seriesId rate comments addedAt');
        res.status(200).json(ratings);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get the rating for a user based on a specific series
exports.getRatingsByUserSeriesBased = async (req, res) => {
    try {
        const { userId, seriesId } = req.params;

        // Find a single rating by userId and seriesId
        const rating = await Ratings.findOne({ userId, seriesId }).select('userId seriesId rate comments addedAt');

        if (!rating) {
            return res.status(404).json({ error: 'No rating found for this user and series.' });
        }

        res.status(200).json(rating);
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