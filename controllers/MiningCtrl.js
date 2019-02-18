'use strict';

var Mining = require('../models/mining_pool.js'),
    Block = require('../models/block.js'),
    Message = require('../models/message.js');

module.exports = {
    info: info,
    poolstats: poolstats,
    posstats: posstats
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
    var interval = parseInt(req.query.interval) || 1000;
    Promise.all([Mining.pools(), Mining.poolstats(interval)])
        .then((results) => {
            let pools = [];
            return Promise.all(results[0].map((pool) => {
                    pool.counter = 0;
                    return Promise.all(results[1].map((stat) => {
                            if (pool.name == stat._id)
                                pool.counter = stat.finds;
                        }))
                        .then(() => {
                            if (pool.counter)
                                pools.push(pool);
                        });
                }))
                .then(() => pools);
        })
        .then((mining_info) => res.json(Message(1, undefined, mining_info)))
        .catch((error) => res.status(404).json(Message(0, error.message)));
}

function posstats(req, res) {
    var interval = parseInt(req.query.interval) || 1000;
    var top = parseInt(req.query.top) || 25;
    Mining.posstats(interval)
        .then((result) => {
            let avatars = []
            return Promise.all(result.map((stat) => {
                if(stat._id) {
                    let avatar = {}
                    avatar.avatar = stat._id
                    avatar.counter = stat.finds
                    avatars.push(avatar)
                }
            }))
            .then(() => avatars.slice(0, top))
        })
        .then((mining_info) => res.json(Message(1, undefined, mining_info)))
        .catch((error) => res.status(404).json(Message(0, error.message)));
}
