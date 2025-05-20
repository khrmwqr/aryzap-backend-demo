const { default: mongoose } = require('mongoose');
const Series = require('../models/Series');
const YTEpisode = require('../models/YTEpisode');
const Genres = require('../models/Genres');

// Search in Series and YTEpisode
const doSearch = async (req, res) => {
    const query = req.params.searchId.toLowerCase();

    try {
        // Search in Series
        const seriesResults = await Series.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { cast: { $regex: query, $options: 'i' } }
            ]
        }).populate('adsManager');

        // Deduplicate cast by lowercased version but return original casing
        const castMap = new Map(); // key: lowercase name, value: original name

        seriesResults.forEach(series => {
            series.cast.forEach(castMember => {
                if (typeof castMember === 'string') {
                    const clean = castMember.trim();
                    const key = clean.toLowerCase();

                    if (key.includes(query) && !castMap.has(key)) {
                        castMap.set(key, clean); // keep the original version
                    }
                }
            });
        });

        const castResults = Array.from(castMap.values());

        // Search in YTEpisode
        const episodeResults = await YTEpisode.find({
            $or: [
                { title: { $regex: query, $options: 'i' } }
            ]
        });

        res.status(200).json({
            series: seriesResults,
            episodes: episodeResults,
            cast: castResults
        });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while searching.' });
    }
};
const doSearchbyCast = async (req, res) => {
    const query = req.params.castId;

    try {
        // Search in Series
        const seriesResults = await Series.find({
            $or: [
                { cast: { $regex: query, $options: 'i' } }  // Searching within cast array

            ]
        }).populate("adsManager");

        res.status(200).json({
            series: seriesResults
        });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while searching.' });
    }
};

// Fetch trending series (in category 361237921312) and all published genres
const getAllTrendingSearchesAndWithAllPublishedGenres = async (req, res) => {
    try {
        const categoryId = new mongoose.Types.ObjectId(req.params.searchId);

        // Fetch all series with the given category ID
        const trendingSeries = await Series.find({
            categoryId: categoryId
        }).populate('adsManager');

        // Fetch all genres where published = true
        const publishedGenres = await Genres.find({
            published: true
        });

        res.status(200).json({
            series: trendingSeries,
            genres: publishedGenres
        });
    } catch (error) {
        console.error('Error fetching trending series and published genres:', error);
        res.status(500).json({ error: 'An error occurred while fetching data.' });
    }
};

module.exports = {
    doSearch,
    doSearchbyCast,
    getAllTrendingSearchesAndWithAllPublishedGenres
};