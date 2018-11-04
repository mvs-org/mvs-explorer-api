exports.app = {
    "http": {
        "port": "8080"
    },
    "logging": {
        "enable": process.env.LOGGING=='true',
        "type": (process.env.LOGGIN_TYPE)? process.env.LOGGIN_TYPE : 'std',
    }
};
