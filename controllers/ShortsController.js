const Short = require('../models/Shorts');
const Series = require('../models/Series');
const Episode = require('../models/Episode');
const { default: mongoose } = require('mongoose');

exports.createShort = async (req, res) => {
    try {
        const { title, description, videoUrl, thumbnailUrl, duration, relatedContentType, relatedContent, tags, seriesId, episodeId } = req.body;

        if (!title || !videoUrl || !relatedContentType || !duration) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        let contentModel;
        switch (relatedContentType) {
            case 'Series': contentModel = Series; break;
            case 'Episode': contentModel = Episode; break;
            case 'LiveEvent': contentModel = LiveEvent; break;
            default: return res.status(400).json({ message: 'Invalid content type' });
        }

        // const contentExists = await contentModel.findById(relatedContent);
        // if (!contentExists) return res.status(404).json({ message: 'Related content not found' });

        const newShort = new Short({
            title,
            description,
            videoUrl,
            thumbnailUrl,
            duration,
            relatedContentType,
            relatedContent,
            tags,
            seriesId,
            episodeId

        });

        await newShort.save();
        res.status(201).json(await newShort);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.editShort = async (req, res) => {
    try {
        const { shortId } = req.params;
        const {
            title,
            description,
            videoUrl,
            thumbnailUrl,
            duration,
            relatedContentType,
            relatedContent,
            tags,
            seriesId,
            episodeId
        } = req.body;

        // Validate shortId
        if (!shortId || !mongoose.Types.ObjectId.isValid(shortId)) {
            return res.status(400).json({ message: 'Invalid or missing shortId' });
        }

        // Ensure required fields (if you want to enforce some for updates)
        if (!title || !videoUrl || !relatedContentType || !duration) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Validate relatedContentType
        let contentModel;
        switch (relatedContentType) {
            case 'Series': contentModel = Series; break;
            case 'Episode': contentModel = Episode; break;
            case 'LiveEvent': contentModel = LiveEvent; break;
            default: return res.status(400).json({ message: 'Invalid relatedContentType' });
        }

        // Optional: validate relatedContent existence
        // const contentExists = await contentModel.findById(relatedContent);
        // if (!contentExists) {
        //     return res.status(404).json({ message: 'Related content not found' });
        // }

        const updatedShort = await Short.findByIdAndUpdate(
            shortId,
            {
                title,
                description,
                videoUrl,
                thumbnailUrl,
                duration,
                relatedContentType,
                relatedContent,
                tags,
                seriesId,
                episodeId
            },
            { new: true } // Return the updated document
        );

        if (!updatedShort) {
            return res.status(404).json({ message: 'Short not found' });
        }

        res.status(200).json(updatedShort);
    } catch (error) {
        console.error('Error updating short:', error);
        res.status(500).json({ message: error.message });
    }
};


exports.getShorts = async (req, res) => {
    try {
        const { sortBy, filterByTag, page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        // Validate inputs
        if (isNaN(pageNum) || pageNum < 1) return res.status(400).json({ message: 'Invalid page number' });
        if (isNaN(limitNum) || limitNum < 1) return res.status(400).json({ message: 'Invalid limit' });
        const validSortOptions = ['likes', 'views', 'newest'];
        if (sortBy && !validSortOptions.includes(sortBy)) {
            return res.status(400).json({ message: 'Invalid sortBy value' });
        }

        const skip = (pageNum - 1) * limitNum;
        let query = Short.find().populate('relatedContent');

        if (filterByTag) {
            // Sanitize filterByTag if needed (e.g., escape special characters)
            query = query.where('tags').in([filterByTag]);
        }

        if (sortBy) {
            const sortOrder = {
                likes: '-likesCount',
                views: '-viewsCount',
                newest: '-createdAt'
            }[sortBy] || '-createdAt';
            query = query.sort(sortOrder);
        } else {
            query = query.sort('-createdAt'); // Explicit default
        }

        const [shorts, total] = await Promise.all([
            query.skip(skip).limit(limitNum).exec(),
            Short.countDocuments(query._conditions)
        ]);

        res.json({
            total,
            page: pageNum,
            limit: limitNum,
            data: shorts
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



exports.getShortById = async (req, res) => {
    try {
        const short = await Short.findById(req.params.id).populate('relatedContent');
        if (!short) return res.status(404).json({ message: 'Short not found' });

        short.viewsCount += 1;
        await short.save();
        res.json(short);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.likeShort = async (req, res) => {
    try {
        const short = await Short.findByIdAndUpdate(
            req.params.id,
            { $inc: { likesCount: 1 } },
            { new: true }
        ).populate('relatedContent');

        if (!short) return res.status(404).json({ message: 'Short not found' });
        res.json(short);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.shareShort = async (req, res) => {
    try {
        const short = await Short.findByIdAndUpdate(
            req.params.id,
            { $inc: { sharesCount: 1 } },
            { new: true }
        ).populate('relatedContent');

        if (!short) return res.status(404).json({ message: 'Short not found' });
        res.json(short);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteShort = async (req, res) => {
    try {
        const short = await Short.findByIdAndDelete(req.params.id);
        if (!short) return res.status(404).json({ message: 'Short not found' });
        res.json({ message: 'Short deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllShorts = async (req, res) => {
    try {
        const { userId } = req.params;
        const { sortBy, filterByTag, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        if (!userId) {
            return res.status(400).json({ message: 'userId is required' });
        }

        // Build match stage
        const matchStage = {};
        if (filterByTag) {
            matchStage.tags = filterByTag;
        }

        // Sorting logic
        const sortOrder = {
            likes: { likesCount: -1 },
            views: { viewsCount: -1 },
            newest: { createdAt: -1 }
        }[sortBy] || { createdAt: -1 };

        // Aggregation pipeline
        const pipeline = [
            { $match: matchStage },
            {
                $lookup: {
                    from: 'likecounts',
                    let: { shortId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$shortId', '$$shortId'] },
                                        { $eq: ['$userId', userId] }
                                    ]
                                }
                            }
                        },
                        { $limit: 1 }
                    ],
                    as: 'userLike'
                }
            },
            {
                $addFields: {
                    isLiked: { $gt: [{ $size: '$userLike' }, 0] }
                }
            },
            { $sort: sortOrder },
            { $skip: parseInt(skip) },
            { $limit: parseInt(limit) },
            {
                $lookup: {
                    from: 'series', // Assumes relatedContentType maps to collections like 'series', 'episodes', etc.
                    localField: 'relatedContent',
                    foreignField: '_id',
                    as: 'relatedContentData'
                }
            },
            {
                $addFields: {
                    relatedContent: { $arrayElemAt: ['$relatedContentData', 0] }
                }
            },
            { $project: { userLike: 0, relatedContentData: 0 } }
        ];

        const [shorts, total] = await Promise.all([
            Short.aggregate(pipeline),
            Short.countDocuments(matchStage)
        ]);

        res.json({
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            data: shorts
        });

    } catch (error) {
        console.error('Error fetching shorts:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


exports.getShortsWithFeatured = async (req, res) => {
    try {
        const { userId, shortId } = req.params;
        const { sortBy, filterByTag, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        if (!userId || !shortId) {
            return res.status(400).json({ message: 'userId and shortId are required' });
        }

        // Validate shortId format
        if (!mongoose.Types.ObjectId.isValid(shortId)) {
            return res.status(400).json({ message: 'Invalid shortId format' });
        }

        // Check if the short exists before aggregation
        const shortExists = await Short.exists({ _id: shortId });
        if (!shortExists) {
            return res.status(404).json({ message: 'Short not found or invalid shortId' });
        }

        const matchStage = {};
        if (filterByTag) {
            matchStage.tags = filterByTag;
        }

        const sortOrder = {
            likes: { likesCount: -1 },
            views: { viewsCount: -1 },
            newest: { createdAt: -1 }
        }[sortBy] || { createdAt: -1 };

        const featuredShortAgg = [
            { $match: { _id: new mongoose.Types.ObjectId(shortId) } },
            {
                $lookup: {
                    from: 'likecounts',
                    let: { shortId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$shortId', '$shortId'] },
                                        { $eq: ['$userId', userId] }
                                    ]
                                }
                            }
                        },
                        { $limit: 1 }
                    ],
                    as: 'userLike'
                }
            },
            {
                $addFields: {
                    isLiked: { $gt: [{ $size: '$userLike' }, 0] }
                }
            },
            {
                $lookup: {
                    from: 'series',
                    localField: 'relatedContent',
                    foreignField: '_id',
                    as: 'relatedContentData'
                }
            },
            {
                $addFields: {
                    relatedContent: { $arrayElemAt: ['$relatedContentData', 0] }
                }
            },
            { $project: { userLike: 0, relatedContentData: 0 } }
        ];

        const [featuredShort] = await Short.aggregate(featuredShortAgg);

        const restMatchStage = {
            ...matchStage,
            _id: { $ne: new mongoose.Types.ObjectId(shortId) }
        };

        const restPipeline = [
            { $match: restMatchStage },
            {
                $lookup: {
                    from: 'likecounts',
                    let: { shortId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$shortId', '$$shortId'] },
                                        { $eq: ['$userId', userId] }
                                    ]
                                }
                            }
                        },
                        { $limit: 1 }
                    ],
                    as: 'userLike'
                }
            },
            {
                $addFields: {
                    isLiked: { $gt: [{ $size: '$userLike' }, 0] }
                }
            },
            { $sort: sortOrder },
            { $skip: parseInt(skip) },
            { $limit: parseInt(limit) },
            {
                $lookup: {
                    from: 'series',
                    localField: 'relatedContent',
                    foreignField: '_id',
                    as: 'relatedContentData'
                }
            },
            {
                $addFields: {
                    relatedContent: { $arrayElemAt: ['$relatedContentData', 0] }
                }
            },
            { $project: { userLike: 0, relatedContentData: 0 } }
        ];

        const [restShorts, totalRest] = await Promise.all([
            Short.aggregate(restPipeline),
            Short.countDocuments(restMatchStage)
        ]);

        const combinedShorts = [featuredShort, ...restShorts];

        res.json({
            total: totalRest + 1,
            page: parseInt(page),
            limit: parseInt(limit),
            data: combinedShorts
        });

    } catch (error) {
        console.error('Error fetching shorts with featured:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

