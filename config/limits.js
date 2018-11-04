module.exports = {
    "limit": (process.env.LIMIT) ? parseInt(process.env.LIMIT) : 0,
    "expiration": (process.env.LIMIT_EXPIRATION) ? parseInt(process.env.LIMIT_EXPIRATION) : 1000 * 60 * 5,
};
