const redisClient = require('./redis-server'); // Adjust the path to your Redis client setup

const cacheMiddleware = (req, res, next) => {
    const cacheKey = req.originalUrl;
    redisClient.get(cacheKey, (err, data) => {
        if (err) {
            console.error('Redis error:', err);
            return res.status(500).send('Internal Server Error');
        }

        if (data !== null) {
            return res.json(JSON.parse(data));
        } else {
            next();
        }
    });
};

module.exports = cacheMiddleware;