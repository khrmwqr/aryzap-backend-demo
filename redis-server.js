const redis = require('redis')


const redisClient = redis.createClient({
    //url: 'redis://default:es6EOuZvnb+8QSQSpuNSjzQx0hSsdxHsYzdNRkLf9qMA0v8F56kQf0kupgQca3AdOUIDvPzBxtDKYAyM@50.7.28.250:6379',
    //url: 'redis://default:g1qj3Tx3YIcdTtDrpVFwnZAOURqfpgmq@redis-17988.c295.ap-southeast-1-1.ec2.redns.redis-cloud.com:17988',
    url: "redis://default:Asar@9301807@145.239.87.54:6378",
    legacyMode: false
});
redisClient.on('error', (err) => {
    console.error('Redis Client Error', err);
});

(async () => {
    try {
        await redisClient.connect();
        console.log('Connected to Redis');
    } catch (err) {
        console.error('Failed to connect to Redis', err);
    }
})();

module.exports = redisClient
