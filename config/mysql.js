exports.db = {
    "host": (process.env.DB_HOST) ? process.env.DB_HOST : 'mysql',
    "port": (process.env.DB_PORT) ? process.env.DB_PORT : "3306",
    "user": (process.env.DB_USER) ? process.env.DB_USER : 'explorer',
    "password": (process.env.DB_PASS) ? process.env.DB_PASS : 'explorer',
    "database": (process.env.DB_NAME) ? process.env.DB_NAME : 'explorer'
};
