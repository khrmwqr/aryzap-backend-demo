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

    // Calculate the number of documents to skip
    const skip = (page - 1) * limit;

    // const cacheId = 'byCatID/pg/' + req.params.catId + '/' + req.params.cn ? req.params.cn : "" + '?page=' + page;
    let results;
    // let isCached = false;

    try {

        // const cacheResults = await redisClient.get(cacheId);

        // if (cacheResults) {
        //     isCached = true;
        //     results = JSON.parse(cacheResults);
        //     results["isCached"] = true

        //     res.json(results);
        // } else {


        // Extract page and limit from query parameters (default values are 1 and 10)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // Calculate the number of documents to skip
        const skip = (page - 1) * limit;

        try {
            const data = req.params.cn || ["PK"]; // Use the default country if `cn` is not provided

            const result = await Series.aggregate([
                {
                    $lookup: {
                        from: 'categories', // Assuming the name of the categories collection is 'categories'
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
                        from: 'geopolicies', // Assuming the name of the geoPolicy collection is 'geopolicies'
                        localField: 'geoPolicy',
                        foreignField: '_id',
                        as: 'geoPolicyInfo'
                    },
                },
                {
                    $match: {
                        'geoPolicyInfo.countries': Array.isArray(data) ? { $in: data } : data
                    }
                },
                {
                    $lookup: {
                        from: 'adsmanagers', // Assuming the name of the adsManager collection is 'adsmanagers'
                        localField: 'adsManager', // Field in the Series schema
                        foreignField: '_id', // Field in the adsManager collection
                        as: 'adsManager' // Output field to store the populated data
                    }
                },
                {
                    $unwind: {
                        path: '$adsManager', // Flatten the adsManagerInfo array to a single object
                        preserveNullAndEmptyArrays: true // Allows nulls if there is no match
                    }
                },
                {
                    $sort: {
                        position: 1
                    }
                },
                {
                    $facet: {
                        totalSeries: [{ $count: "count" }], // Count total number of matching documents
                        paginatedResults: [ // Fetch paginated results
                            { $skip: skip },
                            { $limit: limit }
                        ]
                    }
                }
            ]);

            const totalSeries = result[0].totalSeries[0]?.count || 0; // Extract total count or default to 0
            const series = result[0].paginatedResults; // Extract paginated results

            // Return the series along with pagination metadata
            const seriesData = {
                series,
                countryCode: data,
                pagination: {
                    currentPage: page,
                    pageSize: limit,
                    totalSeries
                },
            };
            // await redisClient.set(cacheId, JSON.stringify(seriesData));
            res.json(seriesData);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
        // }






    } catch (err) {
        res.json({ message: err });
    }
};
const getAllSeriesByCategoriesId = async (req, res) => {


    try {

        if (req.params.cn) {

            //fetch data from redis if available otherwise set a new data into redis

            const data = req.params.cn;





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
                        'categoryIdInfo.title': req.params.catId
                    }
                }, {
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
                },
                {
                    $lookup: {
                        from: 'adsmanagers', // Assuming the name of the adsManager collection is 'adsmanagers'
                        localField: 'adsManager', // Field in the Series schema
                        foreignField: '_id', // Field in the adsManager collection
                        as: 'adsManager' // Output field to store the populated data
                    }
                },
                {
                    $unwind: {
                        path: '$adsManager', // Flatten the adsManagerInfo array to a single object
                        preserveNullAndEmptyArrays: true // Allows nulls if there is no match
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
                        }
                    }
                },
                {
                    $sort: {
                        position: 1
                    }
                }
            ]);
            //db.events.find({"details.detail_list.count": {"$gt": 0}})

            res.json({ series: series, countryCode: data });





        } else {

            const data = ["PK"];
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
                        'categoryIdInfo.title': req.params.catId
                    }
                }, {
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
                },
                {
                    $set: {
                        seriesType: {
                            $cond: {
                                if: { $eq: [req.params.catId, "OST's"] },
                                then: 'singleVideo',
                                else: '$seriesType'
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
                        adsManager: 0 // Exclude the 'adsManager' field
                    }
                }
            ]);
            //db.events.find({"details.detail_list.count": {"$gt": 0}})

            res.json({ series: series, countryCode: req.params.cn });
        }




    } catch (err) {
        res.json({ message: err });
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
        releaseDate: req.body.releaseDate
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
                    releaseDate: req.body.releaseDate
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