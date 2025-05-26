const axios = require('axios');
const Series = require('../models/Series');
const mongoose = require('mongoose');
const redisClient = require('../redis-server')
//Get All Series

const getAllSeriesWithGenres = async (req, res) => {
    try {

        // const code = await axios.get('https://1.1.1.1/cdn-cgi/trace');
        // const newArray = code.data.match(/loc=(\S+)/)[1];
        // const data = newArray;
        // const series = await Series.find({ status: "published" }).populate({
        //     path: 'geoPolicy',
        //     match: { 'condition': 'Available' },
        //     select: 'condition'
        // });
        const series = await Series.find().select("title description cast imagePoster genreId").populate("genreId", "title");
        //db.events.find({"details.detail_list.count": {"$gt": 0}})

        res.json({ series: series });
    } catch (err) {
        res.json({ message: err });
    }
};

const getAllSeries = async (req, res) => {
    try {
        // Default country code
        let data = 'PK';

        const cacheBuster = `deviceID=${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

        const apiUrl = `https://cdn.aryzap.com/api/geoCountry.php?${cacheBuster}`;
        const response = await axios.get(apiUrl);
        if (response.data && response.data.country_code) {
            data = response.data.country_code;
        }

        // const code = await axios.get('https://1.1.1.1/cdn-cgi/trace');
        // const newArray = code.data.match(/loc=(\S+)/)[1];
        // const data = newArray;
        // const series = await Series.find({ status: "published" }).populate({
        //     path: 'geoPolicy',
        //     match: { 'condition': 'Available' },
        //     select: 'condition'
        // });
        const series = await Series.find().sort({ createdAt: -1 });
        //db.events.find({"details.detail_list.count": {"$gt": 0}})

        res.json({ pid: process.pid, series: series, countryCode: data });
    } catch (err) {
        res.json({ message: err });
    }
};

const getSeriesCountByGenreByCatId = async (req, res) => {


    const genreId = new mongoose.Types.ObjectId(req.params.genreId);

    try {

        const count = await Series.aggregate([
            {
                $lookup: {
                    from: 'genres', // Assuming the name of the geoPolicy collection is 'geopolicies'
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
                $count: "seriesCount" // This will create a field called seriesCount with the count result
            },
            {
                $sort: {
                    position: 1
                }
            }
        ]);

        res.json({ count: count[0].seriesCount, genreId: genreId });
    } catch (err) {

        res.json({ count: 0, genreId: genreId });
    }
};

const getSeriesCountByCatId = async (req, res) => {

    const catId = new mongoose.Types.ObjectId(req.params.catId);

    try {

        const count = await Series.aggregate([
            {
                $lookup: {
                    from: 'categories', // Assuming the name of the geoPolicy collection is 'geopolicies'
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
                $count: "seriesCount" // This will create a field called seriesCount with the count result
            },
            {
                $sort: {
                    position: 1
                }

            }
        ]);

        res.json({ count: count[0].seriesCount, catId: catId });
    } catch (err) {

        res.json({ count: 0, catId: catId });
    }
};
const getAllSeriesByCategoriesIdPG = async (req, res) => {
    // Extract page and limit from query parameters (default values are 1 and 10)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const data = req.params.cn ? req.params.cn : "PK"; // Normalize country code to array

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
                    'categoryIdInfo.title': req.params.catId
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
                    from: 'genres', // Assuming the name of the genres collection is 'genres'
                    localField: 'genreId',
                    foreignField: '_id',
                    as: 'genreIdInfo'
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
                    genreId: {
                        $map: {
                            input: '$genreIdInfo',
                            as: 'genre',
                            in: '$$genre.title'
                        }
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
                                genreIdInfo: 0 // Exclude genreIdInfo from the final output
                            }
                        }
                    ]
                }
            }
        ]);

        const totalSeries = result[0].totalSeries[0]?.count || 0;
        const series = result[0].paginatedResults;

        // Return the series along with pagination metadata
        const seriesData = {
            series,
            countryCode: data,
            pagination: {
                currentPage: page,
                pageSize: limit,
                totalSeries
            }
        };
        res.json(seriesData);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
const getAllSeriesByCategoriesId = async (req, res) => {
    try {
        // Normalize country code to array
        const data = req.params.cn ? req.params.cn : "PK";

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
                    'categoryIdInfo.title': req.params.catId
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
                $set: {
                    seriesType: {
                        $cond: {
                            if: { $eq: [req.params.catId, "OST's"] },
                            then: 'singleVideo',
                            else: '$seriesType'
                        }
                    },
                    genreId: {
                        $map: {
                            input: '$genreIdInfo',
                            as: 'genre',
                            in: '$$genre.title'
                        }
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

        res.json({ series, countryCode: data });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getAllSeriesByCategoriesIdInt = async (req, res) => {
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

        // const code = await axios.get('https://1.1.1.1/cdn-cgi/trace');
        // const newArray = code.data.match(/loc=(\S+)/)[1];
        // const data = ["PK"];
        // const series = await Series.find({ status: "published" }).populate({
        //     path: 'geoPolicy',
        //     match: { 'condition': 'Available' },
        //     select: 'condition'
        // });
        const series = await Series.aggregate([
            {
                $lookup: {
                    from: 'categories', // Assuming the name of the geoPolicy collection is 'geopolicies'
                    localField: 'categoryId',
                    foreignField: '_id',
                    as: 'categoryIdInfo'
                }
            },
            {
                $match: {
                    'categoryIdInfo.categoryId': [req.params.catId]
                }
            },
            {
                $lookup: {
                    from: 'geopolicies', // Assuming the name of the geoPolicy collection is 'geopolicies'
                    localField: 'geoPolicy',
                    foreignField: '_id',
                    as: 'geoPolicyInfo'
                },
            },
            {
                $match: {
                    'geoPolicyInfo.countries': data
                }
            }
        ]);
        //db.events.find({"details.detail_list.count": {"$gt": 0}})

        res.json({ series: series, countryCode: data });
    } catch (err) {
        res.json({ message: err });
    }
};

//Get a specific series

const getSpecificSeries = async (req, res) => {
    try {
        const series = await Series.findById(req.params.seriesId).populate("appId").populate("genreId").populate("categoryId").populate("ageRatingId").populate("geoPolicy").populate("adsManager");
        res.json(series);
    } catch (err) {
        res.json({ message: err });
    }
};

//Create a new series

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
        res.json({ message: err });
    }
};

//Update a series

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
        res.json({ message: err });
    }
};

//Delete a series

const deleteSeries = async (req, res) => {
    try {
        const removedSeries = await Series.deleteOne({ _id: req.params.seriesId }); // Use deleteOne instead of remove
        if (removedSeries.deletedCount === 0) {
            return res.status(404).json({ message: "Series not found" }); // Handle case where no series was deleted
        }
        res.status(200).json({ message: "Series deleted successfully", data: removedSeries });
    } catch (err) {
        res.status(500).json({ message: "An error occurred", error: err.message });
    }
};

// Update series published status to draft status


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
        res.json({ message: err });
    }

};
const updateSeriesPositions = async (req, res) => {
    const seriesUpdates = req.body.series; // Expecting an array of { _id, position } objects

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
    const seriesUpdates = req.body.series; // Expecting an array of { _id, position } objects

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
    getAllSeriesByCategoriesIdPG
};