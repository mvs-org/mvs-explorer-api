'use strict';

var Mining = require('../models/mining_pool.js'),
    Block = require('../models/block.js'),
    Message = require('../models/message.js');

module.exports = {
    info: info,
    PowInfo: PowInfo,
    PosInfo: PosInfo,
    poolstats: poolstats,
    posstats: posstats
};

function info(req, res) {
    var interval = parseInt(req.query.interval) || 1000;
    Block.height()
        .then((height) => Promise.all([height, Block.statsTypeBlock(height-interval+1), Block.fetch(height), Block.fetch(Math.max(height - interval, 1))]))
        .then(([height, stats, block0, block1]) => {
            var renamed_stats = [];
            Promise.all(stats.map((stat) => {
                let one_stat = {}
                let type = 'unknown'
                switch (stat._id) {
                    case 1:
                        type = 'pow';
                        break;
                    case 2:
                        type = 'pos';
                        break;
                    case 3:
                        type = 'dpos';
                        break;
                    default:
                        type = 'unknown'
                }
                one_stat.type = type
                one_stat.counter = stat.counter
                renamed_stats.push(one_stat)
            }));
            return {
                height: height,
                stats: renamed_stats,
                blocktime: (block0.time_stamp - block1.time_stamp) / interval
            };
        })
        .then((mining_info) => res.json(Message(1, undefined, mining_info)))
        .catch((error) => {
            console.error(error);
            res.status(404).json(Message(0, error.message));
        });
}

function PowInfo(req, res) {
    var nbr_blocks = parseInt(req.query.number) || 100;
    var block_version = 1;
    Promise.all([Block.height(), Block.fetchDifficulty(nbr_blocks, block_version)])
        .then(([height, blocks]) => {
            return {
                height: height,
                difficulty: parseInt(blocks[0].bits),
                hashrate: blocks[0].bits / (blocks[0].time_stamp - blocks[blocks.length-1].time_stamp) * nbr_blocks,
                last: blocks[0].number,
                pow_blocktime: (blocks[0].time_stamp - blocks[blocks.length-1].time_stamp) / blocks.length
            };
        })
        .then((mining_info) => res.json(Message(1, undefined, mining_info)))
        .catch((error) => {
            console.error(error);
            res.status(404).json(Message(0, error.message));
        });
}

function PosInfo(req, res) {
    var nbr_blocks = parseInt(req.query.number) || 100;
    var block_version = 2;
    Promise.all([Block.height(), Block.fetchDifficulty(nbr_blocks, block_version)])
        .then(([height, blocks]) => {
            return {
                height: height,
                difficulty: parseInt(blocks[0].bits),
                last: blocks[0].number,
                pos_blocktime: (blocks[0].time_stamp - blocks[blocks.length-1].time_stamp) / blocks.length
            };
        })
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
