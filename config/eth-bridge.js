module.exports = {
    "whitelist": (process.env.BRIDGE_BLACKLIST) ? process.env.BRIDGE_BLACKLIST.split(',') : []
};
