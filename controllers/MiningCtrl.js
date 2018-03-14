'use strict';

var Mining = require('../models/mining_pool.js'),
    Block = require('../models/block.js'),
    Message = require('../models/message.js');

module.exports = {
    info: info,
    partofcake: partofcake
};

function info(req, res) {
    Block.height()
        .then((height) => Promise.all([Block.fetch_mongo(height), Block.fetch_mongo(Math.max(height-100, 1))])
            .then((blocks) => {
                return {
                    height: height,
                    difficulty: parseInt(blocks[0].bits),
                    hashrate: blocks[0].bits / (blocks[0].time_stamp - blocks[1].time_stamp) * 100
                };
            }))
            .then((mining_info) => res.json(Message(1, undefined, mining_info)))
            .catch((error) => res.status(404).json(Message(0, error.message)));
        }

    function partofcake(req, res) {
        Block.height()
            .then((height) => Mining.partofcake(1000, height - 1000))
            .then((mining_info) => res.json(Message(1, undefined, mining_info)))
            .catch((error) => res.status(404).json(Message(0, error.message)));
    }
