const Genres = require('../models/Genres');
const Series = require('../models/Series');

// Get series by genre ID

const getSeriesByGenreIds = async (req, res) => {
    try {
        // Split the incoming genre IDs into an array
        const genreIds = req.params.genreId.split(',');

        // Fetch series that have exactly the provided genre IDs
        const series = await Series.find({
            genreId: { $all: genreIds },
            seriesType: { $ne: "single-series" }
        })
            .populate("adsManager")
            .sort({ genrePosition: 1 });


        if (!series || series.length === 0) {
            return res.status(404).json({ message: 'No series found for the provided genre IDs' });
        }

        res.status(200).json({ series: series });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getSeriesByGenreId = async (req, res) => {
    try {
        const genreId = req.params.genreId;
        const series = await Series.find({ genreId: genreId, seriesType: { $ne: "single-series" } }).populate("adsManager");


        if (!series) {
            return res.status(404).json({ message: 'No series found for this genre ID' });
        }

        res.status(200).json({ series: series });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const getSeriesByGenreIdPG = async (req, res) => {
    const genreId = req.params.genreId;
    const { page = 1, limit = 10 } = req.query; // Defaults: page = 1, limit = 10


    try {

        const series = await Series.find({
            genreId: genreId,
            seriesType: { $ne: "single-series" }
        })
            .populate("adsManager") // Populate the adsManager field
            .sort({ genrePosition: 1 }) // Sort by position in ascending order
            .skip((page - 1) * limit) // Skip documents for previous pages
            .limit(Number(limit)); // Limit the number of documents returned
        const totalSeries = await Series.countDocuments({ genreId: genreId, seriesType: { $ne: "single-series" } }); // Total episodes for the series
        const totalPages = Math.ceil(totalSeries / limit);

        res.status(200).json({

            series,
            currentPage: Number(page),
            limit: Number(limit),
            totalSeries,
            totalPages,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


//Get all genres
const getAllGenres = async (req, res) => {
    try {
        const genre = await Genres.find();
        res.json(genre);
    } catch (err) {
        res.json({ message: err });
    }
}

const getAllPublishedGenres = async (req, res) => {
    try {
        const genres = await Genres.find({ published: true });
        res.json(genres);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

//Get a specific genre

const getSpecificGenre = async (req, res) => {
    try {
        const genre = await Genres.findById(req.params.genreId);
        res.json(genre);
    } catch (err) {
        res.json({ message: err });
    }
};

//Create a new genre

const createGenre = async (req, res) => {

    const genre = new Genres({
        title: req.body.title,
        description: req.body.description,
        image: req.body.image,
        appId: req.body.appId,
        published: req.body.published
    });

    try {
        const savedGenre = await genre.save();
        res.json(savedGenre);
    } catch (err) {
        res.json({ message: err });
    }
};

//Update a genre

const updateGenre = async (req, res) => {

    try {

        const updatedGenre = await Genres.updateOne(
            { _id: req.params.genreId },
            {
                $set: {
                    title: req.body.title,
                    description: req.body.description,
                    image: req.body.image,
                    appId: req.body.appId,
                    published: req.body.published
                },
            }
        );
        res.json(updatedGenre);
    } catch (err) {
        res.json({ message: err });
    }
};

//Delete a genre

const deleteGenre = async (req, res) => {
    try {
        const removedGenre = await Genres.deleteOne({ _id: req.params.genreId });
        res.json(removedGenre);
    } catch (err) {
        res.json({ message: err });
    }
};

module.exports = {
    getAllGenres,
    getSpecificGenre,
    createGenre,
    updateGenre,
    deleteGenre,
    getSeriesByGenreId,
    getSeriesByGenreIdPG,
    getSeriesByGenreIds,
    getAllPublishedGenres
};
