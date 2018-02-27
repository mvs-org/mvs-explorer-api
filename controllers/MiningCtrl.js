'use strict';

var Mining = require('../models/mining_pool.js'),
    Block = require('../models/block.js'),
    Message = require('../models/message.js');

module.exports = {
    info: info,
    partofcake: partofcake
};

function info(req, res) {
    Mining.stats()
        .then((mining_info) => res.json(Message(1, undefined, mining_info)))
        .catch((error) => res.status(404).json(Message(0, error.message)));
}

function partofcake(req, res) {
    Block.height()
        .then((height) => Mining.partofcake(1000, height - 1000))
        .then((mining_info) => res.json(Message(1, undefined, mining_info)))
        .catch((error) => res.status(404).json(Message(0, error.message)));
}
