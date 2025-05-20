const Favorite = require('../models/Favorites'); // Adjust the path as necessary

// Create a new favorite
exports.createFavorite = async (req, res) => {
    try {
        const { userId, seriesId } = req.body;
        if (seriesId && userId) {
            const favorite = new Favorite({ userId, seriesId });
            await favorite.save();
            res.status(201).json({ message: 'Favorite added successfully', favorite });
        } else {

            res.status(400).json({ error: 'Series ID not found' });
        }

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all favorites for a user
exports.getFavoritesByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const favorites = await Favorite.find({ userId }).populate('seriesId');
        res.status(200).json(favorites);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get a specific favorite by ID
exports.getFavoriteById = async (req, res) => {
    try {
        const { id } = req.params;
        const favorite = await Favorite.findById(id).populate('seriesId');
        if (!favorite) {
            return res.status(404).json({ message: 'Favorite not found' });
        }
        res.status(200).json(favorite);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update a favorite
exports.updateFavorite = async (req, res) => {
    try {
        const { id } = req.params;
        const { seriesId } = req.body;
        const favorite = await Favorite.findByIdAndUpdate(
            id,
            { seriesId },
            { new: true }
        );
        if (!favorite) {
            return res.status(404).json({ message: 'Favorite not found' });
        }
        res.status(200).json({ message: 'Favorite updated successfully', favorite });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a favorite
exports.deleteFavorite = async (req, res) => {
    try {
        const { id } = req.params;
        const favorite = await Favorite.findByIdAndDelete(id);
        if (!favorite) {
            return res.status(404).json({ message: 'Favorite not found' });
        }
        res.status(200).json({ message: 'Favorite deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.toggleFavorite = async (req, res) => {
    try {
        const { userId, seriesId } = req.body;

        if (seriesId && userId) {
            // Check if the favorite already exists
            let favorite = await Favorite.findOne({ userId, seriesId });

            if (favorite) {
                // If it exists, delete it
                await Favorite.findByIdAndDelete(favorite._id);
                return res.status(200).json({ message: 'Favorite removed successfully' });
            } else {
                // If it does not exist, create it
                favorite = new Favorite({ userId, seriesId });
                await favorite.save();
                return res.status(201).json({ message: 'Favorite added successfully', favorite });
            }
        } else {
            res.status(400).json({ error: 'Series ID not found' });
        }

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};