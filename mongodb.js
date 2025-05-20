const mongoose = require('mongoose');

mongoose.connect(process.env.DB_CONNECT, (err) => {
    mongoose.set('useFindAndModify', false);
    logger.info(`connecting ${process.env.DB_CONNECT}`);
    if (err) {
        logger.error(`failed db connection: ${err}`);
    }
});

module.exports = mongoose.connection;