module.exports={
    "host": (process.env.MVSD_HOST) ? process.env.MVSD_HOST : '127.0.0.1',
    "port": (process.env.MVSD_PORT) ? process.env.MVSD_PORT : "8820",
    "protocol": (process.env.MVSD_PROTOCOL) ? process.env.MVSD_PROTOCOL : "http",
};
