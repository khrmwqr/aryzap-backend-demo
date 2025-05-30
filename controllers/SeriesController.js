const axios = require('axios');
const Series = require('../models/Series');
const mongoose = require('mongoose');
const redisClient = require('../redis-server');
const Episode = require('../models/Episode');
const CDNEpisode = require('../models/CDNEpisode');

// Get All Series with Genres
const getAllSeriesWithGenres = async (req, res) => {
    try {
        const series = await Series.find()
            .select("title description cast imagePoster genreId")
            .populate("genreId", "title")
            .lean(); // Use lean() for better performance since we modify the output

        // Add episodeCount to each series
        const seriesWithEpisodeCount = await Promise.all(
            series.map(async (s) => ({
                ...s,
                episodeCount: await CDNEpisode.countDocuments({ seriesId: s._id })
            }))
        );

        res.json({ series: seriesWithEpisodeCount });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get All Series
const getAllSeries = async (req, res) => {
    try {
        let data = 'PK';
        const cacheBuster = `deviceID=${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
        const apiUrl = `https://cdn.aryzap.com/api/geoCountry.php?${cacheBuster}`;
        const response = await axios.get(apiUrl);
        if (response.data && response.data.country_code) {
            data = response.data.country_code;
        }

        const series = await Series.find()
            .sort({ createdAt: -1 })
            .lean();

        // Add episodeCount to each series
        const seriesWithEpisodeCount = await Promise.all(
            series.map(async (s) => ({
                ...s,
                episodeCount: await CDNEpisode.countDocuments({ seriesId: s._id })
            }))
        );

        res.json({ pid: process.pid, series: seriesWithEpisodeCount, countryCode: data });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get Series Count by Genre and Category ID (unchanged)
const getSeriesCountByGenreByCatId = async (req, res) => {
    const genreId = new mongoose.Types.ObjectId(req.params.genreId);
    try {
        const count = await Series.aggregate([
            {
                $lookup: {
                    from: 'genres',
                    localField: 'genreId',
                    foreignField: '_id',
                    as: 'genreInfo'
                }
            },
            {
                $match: {
                    'genreInfo._id': genreId
                }
            },
            {
                $count: "seriesCount"
            },
            {
                $sort: {
                    position: 1
                }
            }
        ]);

        res.json({ count: count[0]?.seriesCount || 0, genreId });
    } catch (err) {
        res.json({ count: 0, genreId });
    }
};

// Get Series Count by Category ID (unchanged)
const getSeriesCountByCatId = async (req, res) => {
    const catId = new mongoose.Types.ObjectId(req.params.catId);
    try {
        const count = await Series.aggregate([
            {
                $lookup: {
                    from: 'categories',
                    localField: 'categoryId',
                    foreignField: '_id',
                    as: 'categoryInfo'
                }
            },
            {
                $match: {
                    'categoryInfo._id': catId
                }
            },
            {
                $count: "seriesCount"
            },
            {
                $sort: {
                    position: 1
                }
            }
        ]);

        res.json({ count: count[0]?.seriesCount || 0, catId });
    } catch (err) {
        res.json({ count: 0, catId });
    }
};

// Get All Series by Category ID with Pagination
const getAllSeriesByCategoriesIdPG = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const data = req.params.cn || "PK";

    try {
        const result = await Series.aggregate([
            {
                $lookup: {
                    from: 'categories',
                    localField: 'categoryId',
                    foreignField: '_id',
                    as: 'categoryIdInfo'
                }
            },
            {
                $match: {
                    'categoryIdInfo.title': { $regex: `^${req.params.catId}$`, $options: 'i' }
                }
            },
            {
                $lookup: {
                    from: 'geopolicies',
                    localField: 'geoPolicy',
                    foreignField: '_id',
                    as: 'geoPolicyInfo'
                }
            },
            {
                $match: {
                    'geoPolicyInfo.countries': { $in: [data] }
                }
            },
            {
                $lookup: {
                    from: 'adsmanagers',
                    localField: 'adsManager',
                    foreignField: '_id',
                    as: 'adsManager'
                }
            },
            {
                $unwind: {
                    path: '$adsManager',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'genres',
                    localField: 'genreId',
                    foreignField: '_id',
                    as: 'genreIdInfo'
                }
            },
            // Add lookup for AgeRatings
            {
                $lookup: {
                    from: 'ageratings', // Use the collection name (lowercase, as Mongoose typically uses lowercase pluralized names)
                    localField: 'ageRatingId',
                    foreignField: '_id',
                    as: 'ageRatingInfo'
                }
            },
            {
                $set: {
                    seriesType: {
                        $cond: {
                            if: { $eq: [req.params.catId, "OST's"] },
                            then: 'singleVideo',
                            else: '$seriesType'
                        }
                    },
                    status: {
                        $cond: {
                            if: { $eq: [req.params.catId, "OST's"] },
                            then: 'published',
                            else: '$status'
                        }
                    },
                    genreId: {
                        $map: {
                            input: '$genreIdInfo',
                            as: 'genre',
                            in: '$$genre.title'
                        }
                    },
                    // Extract ageRating title
                    ageRating: {
                        $arrayElemAt: ['$ageRatingInfo.title', 0]
                    }
                }
            },
            {
                $sort: {
                    position: 1
                }
            },
            {
                $facet: {
                    totalSeries: [{ $count: "count" }],
                    paginatedResults: [
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $project: {
                                genreIdInfo: 0,
                                ageRatingInfo: 0 // Exclude the raw ageRatingInfo array
                            }
                        }
                    ]
                }
            }
        ]);

        const totalSeries = result[0].totalSeries[0]?.count || 0;
        let series = result[0].paginatedResults;

        // Add episodeCount to each series
        series = await Promise.all(
            series.map(async (s) => ({
                ...s,
                episodeCount: await CDNEpisode.countDocuments({ seriesId: s._id })
            }))
        );

        res.json({
            series,
            countryCode: data,
            pagination: {
                currentPage: page,
                pageSize: limit,
                totalSeries
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getAllSeriesByCategoriesIdPGWithStatus = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const data = req.params.cn || "PK";

    try {
        const result = await Series.aggregate([
            {
                $lookup: {
                    from: 'categories',
                    localField: 'categoryId',
                    foreignField: '_id',
                    as: 'categoryIdInfo'
                }
            },
            {
                $match: {
                    'categoryIdInfo.title': { $regex: `^${req.params.catId}$`, $options: 'i' },
                    $expr: {
                        $cond: {
                            if: { $eq: [req.params.catId, "OST's"] },
                            then: { $eq: ["$status", "published"] },
                            else: true // Allow all statuses for non-OST categories
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'geopolicies',
                    localField: 'geoPolicy',
                    foreignField: '_id',
                    as: 'geoPolicyInfo'
                }
            },
            {
                $match: {
                    'geoPolicyInfo.countries': { $in: [data] }
                }
            },
            {
                $lookup: {
                    from: 'adsmanagers',
                    localField: 'adsManager',
                    foreignField: '_id',
                    as: 'adsManager'
                }
            },
            {
                $unwind: {
                    path: '$adsManager',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'genres',
                    localField: 'genreId',
                    foreignField: '_id',
                    as: 'genreIdInfo'
                }
            },
            {
                $lookup: {
                    from: 'ageratings',
                    localField: 'ageRatingId',
                    foreignField: '_id',
                    as: 'ageRatingInfo'
                }
            },
            {
                $set: {
                    seriesType: {
                        $cond: {
                            if: { $eq: [req.params.catId, "OST's"] },
                            then: 'singleVideo',
                            else: '$seriesType'
                        }
                    },
                    status: {
                        $cond: {
                            if: { $eq: [req.params.catId, "OST's"] },
                            then: 'published',
                            else: '$status'
                        }
                    },
                    genreId: {
                        $map: {
                            input: '$genreIdInfo',
                            as: 'genre',
                            in: '$$genre.title'
                        }
                    },
                    ageRating: {
                        $arrayElemAt: ['$ageRatingInfo.title', 0]
                    }
                }
            },
            {
                $sort: {
                    position: 1
                }
            },
            {
                $facet: {
                    totalSeries: [{ $count: "count" }],
                    paginatedResults: [
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $project: {
                                genreIdInfo: 0,
                                ageRatingInfo: 0
                            }
                        }
                    ]
                }
            }
        ]);

        const totalSeries = result[0].totalSeries[0]?.count || 0;
        let series = result[0].paginatedResults;

        // Add episodeCount to each series
        series = await Promise.all(
            series.map(async (s) => ({
                ...s,
                episodeCount: await CDNEpisode.countDocuments({ seriesId: s._id })
            }))
        );

        res.json({
            series,
            countryCode: data,
            pagination: {
                currentPage: page,
                pageSize: limit,
                totalSeries
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get All Series by Category ID
const getAllSeriesByCategoriesId = async (req, res) => {
    try {
        const data = req.params.cn || "PK";

        const series = await Series.aggregate([
            {
                $lookup: {
                    from: 'categories',
                    localField: 'categoryId',
                    foreignField: '_id',
                    as: 'categoryIdInfo'
                }
            },
            {
                $match: {
                    'categoryIdInfo.title': { $regex: `^${req.params.catId}$`, $options: 'i' }
                }
            },
            {
                $lookup: {
                    from: 'geopolicies',
                    localField: 'geoPolicy',
                    foreignField: '_id',
                    as: 'geoPolicyInfo'
                }
            },
            {
                $match: {
                    'geoPolicyInfo.countries': { $in: [data] }
                }
            },
            {
                $lookup: {
                    from: 'adsmanagers',
                    localField: 'adsManager',
                    foreignField: '_id',
                    as: 'adsManager'
                }
            },
            {
                $unwind: {
                    path: '$adsManager',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'genres',
                    localField: 'genreId',
                    foreignField: '_id',
                    as: 'genreIdInfo'
                }
            },
            // Add lookup for AgeRatings
            {
                $lookup: {
                    from: 'ageratings', // Use the collection name (lowercase, as Mongoose typically uses lowercase pluralized names)
                    localField: 'ageRatingId',
                    foreignField: '_id',
                    as: 'ageRatingInfo'
                }
            },
            {
                $set: {
                    seriesType: {
                        $cond: {
                            if: { $eq: [req.params.catId, "OST's"] },
                            then: 'singleVideo',
                            else: '$seriesType'
                        }
                    },
                    status: {
                        $cond: {
                            if: { $eq: [req.params.catId, "OST's"] },
                            then: 'published',
                            else: '$status'
                        }
                    },
                    genreId: {
                        $map: {
                            input: '$genreIdInfo',
                            as: 'genre',
                            in: '$$genre.title'
                        }
                    },
                    // Extract ageRating title
                    ageRating: {
                        $arrayElemAt: ['$ageRatingInfo.title', 0]
                    }
                }
            },
            {
                $sort: {
                    position: 1
                }
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    description: 1,
                    cast: 1,
                    seriesDM: 1,
                    seriesYT: 1,
                    seiresCDN: 1,
                    imagePoster: 1,
                    imageCoverMobile: 1,
                    imageCoverDesktop: 1,
                    imageCoverBig: 1,
                    imageCoverExtra: 1,
                    trailer: 1,
                    ost: 1,
                    logo: 1,
                    day: 1,
                    time: 1,
                    ageRatingId: 1,
                    ageRating: 1, // Include the new ageRating field
                    genreId: 1,
                    categoryId: 1,
                    appId: 1,
                    status: 1,
                    geoPolicy: 1,
                    adsManager: req.params.cn ? 1 : 0,
                    seriesType: 1,
                    publishedAt: 1,
                    position: 1,
                    genrePosition: 1,
                    isDM: 1,
                    cdnPlatform: 1,
                    seriesLayout: 1,
                    isLive: 1,
                    optionalFieldOne: 1,
                    optionalFieldTwo: 1,
                    releaseDate: 1,
                    __v: 1
                }
            }
        ]);

        // Add episodeCount to each series
        const seriesWithEpisodeCount = await Promise.all(
            series.map(async (s) => ({
                ...s,
                episodeCount: await CDNEpisode.countDocuments({ seriesId: s._id })
            }))
        );

        res.json({ series: seriesWithEpisodeCount, countryCode: data });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get All Series by Category ID (Internal)
const getAllSeriesByCategoriesIdInt = async (req, res) => {
    try {
        let data = 'PK';
        const cacheBuster = `deviceID=${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
        const apiUrl = `https://cdn.aryzap.com/api/geoCountry.php?${cacheBuster}`;
        const response = await axios.get(apiUrl);
        if (response.data && response.data.country_code) {
            data = response.data.country_code;
        }

        const series = await Series.aggregate([
            {
                $lookup: {
                    from: 'categories',
                    localField: 'categoryId',
                    foreignField: '_id',
                    as: 'categoryIdInfo'
                }
            },
            {
                $match: {
                    'categoryIdInfo.title': { $regex: `^${req.params.catId}$`, $options: 'i' }
                }
            },
            {
                $lookup: {
                    from: 'geopolicies',
                    localField: 'geoPolicy',
                    foreignField: '_id',
                    as: 'geoPolicyInfo'
                }
            },
            {
                $match: {
                    'geoPolicyInfo.countries': data
                }
            }
        ]);

        // Add episodeCount to each series
        const seriesWithEpisodeCount = await Promise.all(
            series.map(async (s) => ({
                ...s,
                episodeCount: await CDNEpisode.countDocuments({ seriesId: s._id })
            }))
        );

        res.json({ series: seriesWithEpisodeCount, countryCode: data });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getAllSeriesByCategoriesIdWithStatus = async (req, res) => {
    try {
        const data = req.params.cn || "PK";

        const series = await Series.aggregate([
            {
                $lookup: {
                    from: 'categories',
                    localField: 'categoryId',
                    foreignField: '_id',
                    as: 'categoryIdInfo'
                }
            },
            {
                $match: {
                    'categoryIdInfo.title': { $regex: `^${req.params.catId}$`, $options: 'i' },
                    $expr: {
                        $cond: {
                            if: { $eq: [req.params.catId, "OST's"] },
                            then: { $eq: ["$status", "published"] },
                            else: true // Allow all statuses for non-OST categories
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'geopolicies',
                    localField: 'geoPolicy',
                    foreignField: '_id',
                    as: 'geoPolicyInfo'
                }
            },
            {
                $match: {
                    'geoPolicyInfo.countries': { $in: [data] }
                }
            },
            {
                $lookup: {
                    from: 'adsmanagers',
                    localField: 'adsManager',
                    foreignField: '_id',
                    as: 'adsManager'
                }
            },
            {
                $unwind: {
                    path: '$adsManager',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'genres',
                    localField: 'genreId',
                    foreignField: '_id',
                    as: 'genreIdInfo'
                }
            },
            {
                $lookup: {
                    from: 'ageratings',
                    localField: 'ageRatingId',
                    foreignField: '_id',
                    as: 'ageRatingInfo'
                }
            },
            {
                $set: {
                    seriesType: {
                        $cond: {
                            if: { $eq: [req.params.catId, "OST's"] },
                            then: 'singleVideo',
                            else: '$seriesType'
                        }
                    },
                    status: {
                        $cond: {
                            if: { $eq: [req.params.catId, "OST's"] },
                            then: 'published',
                            else: '$status'
                        }
                    },
                    genreId: {
                        $map: {
                            input: '$genreIdInfo',
                            as: 'genre',
                            in: '$$genre.title'
                        }
                    },
                    ageRating: {
                        $arrayElemAt: ['$ageRatingInfo.title', 0]
                    }
                }
            },
            {
                $sort: {
                    position: 1
                }
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    description: 1,
                    cast: 1,
                    seriesDM: 1,
                    seriesYT: 1,
                    seiresCDN: 1,
                    imagePoster: 1,
                    imageCoverMobile: 1,
                    imageCoverDesktop: 1,
                    imageCoverBig: 1,
                    imageCoverExtra: 1,
                    trailer: 1,
                    ost: 1,
                    logo: 1,
                    day: 1,
                    time: 1,
                    ageRatingId: 1,
                    ageRating: 1,
                    genreId: 1,
                    categoryId: 1,
                    appId: 1,
                    status: 1,
                    geoPolicy: 1,
                    adsManager: req.params.cn ? 1 : 0,
                    seriesType: 1,
                    publishedAt: 1,
                    position: 1,
                    genrePosition: 1,
                    isDM: 1,
                    cdnPlatform: 1,
                    seriesLayout: 1,
                    isLive: 1,
                    optionalFieldOne: 1,
                    optionalFieldTwo: 1,
                    releaseDate: 1,
                    __v: 1
                }
            }
        ]);

        // Add episodeCount to each series
        const seriesWithEpisodeCount = await Promise.all(
            series.map(async (s) => ({
                ...s,
                episodeCount: await CDNEpisode.countDocuments({ seriesId: s._id })
            }))
        );

        res.json({ series: seriesWithEpisodeCount, countryCode: data });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get a Specific Series
const getSpecificSeries = async (req, res) => {
    try {
        const series = await Series.findById(req.params.seriesId)
            .populate("appId")
            .populate("genreId")
            .populate("categoryId")
            .populate("ageRatingId")
            .populate("geoPolicy")
            .populate("adsManager")
            .lean();

        if (!series) {
            return res.status(404).json({ message: "Series not found" });
        }

        const episodeCount = await CDNEpisode.countDocuments({ seriesId: req.params.seriesId });
        const seriesWithEpisodeCount = {
            ...series,
            episodeCount
        };

        res.json(seriesWithEpisodeCount);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create, Update, Delete, and Other Functions (unchanged)
const createSeries = async (req, res) => {
    const series = new Series({
        title: req.body.title,
        description: req.body.description,
        cast: req.body.cast,
        seriesDM: req.body.seriesDM,
        seriesYT: req.body.seriesYT,
        seiresCDN: req.body.seiresCDN,
        seiresCDNWebLink: req.body.seiresCDNWebLink,
        seiresCDNWebKey: req.body.seiresCDNWebKey,
        imagePoster: req.body.imagePoster,
        imageCoverMobile: req.body.imageCoverMobile,
        imageCoverDesktop: req.body.imageCoverDesktop,
        imageCoverBig: req.body.imageCoverBig,
        imageCoverExtra: req.body.imageCoverExtra,
        trailer: req.body.trailer,
        ost: req.body.ost,
        logo: req.body.logo,
        day: req.body.day,
        time: req.body.time,
        categoryId: req.body.categoryId,
        genreId: req.body.genreId,
        ageRatingId: req.body.ageRatingId,
        appId: req.body.appId,
        status: "published",
        geoPolicy: req.body.geoPolicy,
        adsManager: req.body.adsManager,
        seriesType: req.body.seriesType,
        publishedAt: Date.now() + (5 * 60 * 60 * 1000),
        isDM: req.body.isDM,
        cdnPlatform: req.body.cdnPlatform,
        seriesLayout: req.body.seriesLayout,
        isLive: req.body.isLive,
        optionalFieldOne: req.body.optionalFieldOne,
        optionalFieldTwo: req.body.optionalFieldTwo,
        releaseDate: req.body.releaseDate,
        duration: req.body.duration,
    });

    try {
        const savedSeries = await series.save();
        res.json(savedSeries);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateSeries = async (req, res) => {
    try {
        const updatedSeries = await Series.updateOne(
            { _id: req.params.seriesId },
            {
                $set: {
                    title: req.body.title,
                    description: req.body.description,
                    cast: req.body.cast,
                    seriesDM: req.body.seriesDM,
                    seriesYT: req.body.seriesYT,
                    seiresCDN: req.body.seiresCDN,
                    seiresCDNWebLink: req.body.seiresCDNWebLink,
                    seiresCDNWebKey: req.body.seiresCDNWebKey,
                    imagePoster: req.body.imagePoster,
                    imageCoverMobile: req.body.imageCoverMobile,
                    imageCoverDesktop: req.body.imageCoverDesktop,
                    imageCoverBig: req.body.imageCoverBig,
                    imageCoverExtra: req.body.imageCoverExtra,
                    trailer: req.body.trailer,
                    ost: req.body.ost,
                    logo: req.body.logo,
                    day: req.body.day,
                    time: req.body.time,
                    categoryId: req.body.categoryId,
                    genreId: req.body.genreId,
                    ageRatingId: req.body.ageRatingId,
                    appId: req.body.appId,
                    status: "published",
                    geoPolicy: req.body.geoPolicy,
                    adsManager: req.body.adsManager,
                    seriesType: req.body.seriesType,
                    isDM: req.body.isDM,
                    cdnPlatform: req.body.cdnPlatform,
                    seriesLayout: req.body.seriesLayout,
                    isLive: req.body.isLive,
                    optionalFieldOne: req.body.optionalFieldOne,
                    optionalFieldTwo: req.body.optionalFieldTwo,
                    releaseDate: req.body.releaseDate,
                    duration: req.body.duration
                }
            }
        );

        res.json(updatedSeries);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const deleteSeries = async (req, res) => {
    try {
        const removedSeries = await Series.deleteOne({ _id: req.params.seriesId });
        if (removedSeries.deletedCount === 0) {
            return res.status(404).json({ message: "Series not found" });
        }
        res.status(200).json({ message: "Series deleted successfully", data: removedSeries });
    } catch (err) {
        res.status(500).json({ message: "An error occurred", error: err.message });
    }
};

const updateAsDraft = async (req, res) => {
    try {
        const updateAsDrafts = await Series.updateOne(
            { _id: req.params.seriesId },
            {
                $set: {
                    status: req.body.status,
                },
            }
        );
        res.json(updateAsDrafts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateSeriesPositions = async (req, res) => {
    const seriesUpdates = req.body.series;
    if (!Array.isArray(seriesUpdates)) {
        return res.status(400).json({ message: "Invalid input data. Expected an array of series updates." });
    }

    const bulkOps = seriesUpdates.map(item => ({
        updateOne: {
            filter: { _id: new mongoose.Types.ObjectId(item._id) },
            update: { $set: { position: item.position } }
        }
    }));

    try {
        const result = await Series.bulkWrite(bulkOps);
        res.json({ message: "Positions updated successfully", result });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateSeriesPositionsGenre = async (req, res) => {
    const seriesUpdates = req.body.series;
    if (!Array.isArray(seriesUpdates)) {
        return res.status(400).json({ message: "Invalid input data. Expected an array of series updates." });
    }

    const bulkOps = seriesUpdates.map(item => ({
        updateOne: {
            filter: { _id: new mongoose.Types.ObjectId(item._id) },
            update: { $set: { genrePosition: item.position } }
        }
    }));

    try {
        const result = await Series.bulkWrite(bulkOps);
        res.json({ message: "Genre Positions updated successfully", result });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getAllSeriesWithGenres,
    getAllSeries,
    getSpecificSeries,
    createSeries,
    updateSeries,
    deleteSeries,
    updateAsDraft,
    getAllSeriesByCategoriesId,
    getAllSeriesByCategoriesIdInt,
    getSeriesCountByCatId,
    getSeriesCountByGenreByCatId,
    updateSeriesPositions,
    updateSeriesPositionsGenre,
    getAllSeriesByCategoriesIdPG,
    getAllSeriesByCategoriesIdPGWithStatus,
    getAllSeriesByCategoriesIdWithStatus
};