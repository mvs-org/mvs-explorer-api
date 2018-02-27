'use strict';

//Load express
var express = require('express');
var app = express();

//Set CORS handling
app.all('/*', (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

const expressSwagger = require('express-swagger-generator')(app);

let options = {
    swaggerDefinition: {
        info: {
            description: 'MVS explorer api documentation',
            title: 'API Docs',
            version: '1.0.0',
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
expressSwagger(options)
app.listen(3000);

