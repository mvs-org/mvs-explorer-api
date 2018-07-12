'use strict';

//Load express
var express = require('express');
var app = express();
app.disable('x-powered-by');

const expressSwagger = require('express-swagger-generator')(app);

let options = {
    swaggerDefinition: {
        info: {
            description: 'MVS explorer api documentation',
            title: 'API Docs',
            version: '1.0.0'
        },
        host: 'explorer.mvs.org',
        basePath: '/api',
        produces: [
            "application/json",
        ],
        schemes: ['https']
    },
    basedir: __dirname, //app absolute path
    files: ['./controllers/index.js'] //Path to the API handle folder
};
expressSwagger(options);

//Load app config file
var config = require('./config/config.js');

//Load routes definition
var router = require('./controllers/index.js');

//Enable body parsing
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

//Configure logging
if (config.app.logging.enable) {
    var winston = require('winston');
    var expressWinston = require('express-winston');
    var Elasticsearch = require('winston-elasticsearch');
    app.use(expressWinston.logger({
        transports: [
            new Elasticsearch({
                index: 'explorer-api'
            })
        ],
        meta: true,
        msg: "HTTP {{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}",
        expressFormat: true,
        colorize: true,
        ignoreRoute: function(req, res) {
            return false;
        } // optional: allows to skip some log messages based on request and/or response
    }));
}

//HTTP Method overwriter to set error response codes
var methodOverride = require('method-override');
app.use(methodOverride());
app.use((err, req, res, next) => {
    res.status(500).json(message(0, 'ERR_SERVER_ERROR'));
});

//Set CORS handling
app.all('/*', (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Content-Type', 'application/json');
    next();
});

//Define routes
app.use(router.routes);

//Provide webserver for static files on public dir
let path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

//Strartup the services
function start() {
    //Load http service
    if (config.app.http.port != undefined && config.app.http.port != '') {
        app.listen(config.app.http.port, () => console.info('Public API server running on port ' + config.app.http.port));
    }
};

//Error handling
process.on('uncaughtException', (err) => {
    if (err.code == 'EADDRINUSE')
        console.error('Public API server could not start. Port already in use');
    else
        console.error('Public API server error: ' + err);
    process.exit('SIGTERM');
});

start();
