module.exports = {
    "whitelist": (process.env.BRIDGE_WHITELIST) ? process.env.BRIDGE_WHITELIST.split(',') : []
};
