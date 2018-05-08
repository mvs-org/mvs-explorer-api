module.exports = {
    "host": (process.env.MONGO_HOST) ? process.env.MONGO_HOST : '127.0.0.1',
    "port": (process.env.MONGO_PORT) ? process.env.MONGO_PORT : "27017",
    "database": (process.env.MONGO_NAME) ? process.env.MONGO_NAME : 'metaverse',
    "url": (process.env.MONGO_URL) ? process.env.MONGO_URL : null
};
