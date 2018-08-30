module.exports = {
    "blacklist": (process.env.BRIDGE_BLACKLIST) ? process.env.BRIDGE_BLACKLIST.split(',') : []
};
