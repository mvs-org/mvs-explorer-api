'use strict';

var Mining = require('../models/mining_pool.js'),
    Block = require('../models/block.js'),
    Message = require('../models/message.js');

module.exports = {
    info: info,
    poolstats: poolstats
};

function info(req, res) {
    Block.height()
        .then((height) => Promise.all([Block.fetch(height), Block.fetch(Math.max(height - 100, 1))])
            .then((blocks) => {
                return {
                    height: height,
                    difficulty: parseInt(blocks[0].bits),
                    hashrate: blocks[0].bits / (blocks[0].time_stamp - blocks[1].time_stamp) * 100
                };
            }))
        .then((mining_info) => res.json(Message(1, undefined, mining_info)))
        .catch((error) => {
            console.error(error);
            res.status(404).json(Message(0, error.message));
        });
}

function poolstats(req, res) {
    Block.height()
        .then((height) => Promise.all([Mining.pools(), Mining.poolstats(height - 1000, height)]))
        .then((results) => {
            return Promise.all(results[0].map((pool) => {
                pool.counter = 0;
                return Promise.all(results[1].map((stat) => {
                    if (pool.addresses.indexOf(stat._id)!==-1)
                            pool.counter += stat.finds;
                    }))
                    .then(() => (pool.counter)?pool:undefined);
            }));
        })
        .then((mining_info) => res.json(Message(1, undefined, mining_info)))
        .catch((error) => res.status(404).json(Message(0, error.message)));
}
