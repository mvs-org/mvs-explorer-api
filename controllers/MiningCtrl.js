'use strict';

const Mining = require('../models/mining_pool.js'),
    Block = require('../models/block.js'),
    _ = require('lodash'),
    Message = require('../models/message.js');

module.exports = {
    info,
    PowInfo,
    PosInfo,
    poolstats,
    posstats,
    posVotes,
    posVotesByAddress,
};

function info(req, res) {
    var interval = parseInt(req.query.interval) || 1000;
    Block.height()
        .then((height) => Promise.all([height, Block.statsTypeBlock(height - interval + 1), Block.fetch(height), Block.fetch(Math.max(height - interval, 1))]))
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
                hashrate: blocks[0].bits / (blocks[0].time_stamp - blocks[blocks.length - 1].time_stamp) * nbr_blocks,
                last: blocks[0].number,
                pow_blocktime: (blocks[0].time_stamp - blocks[blocks.length - 1].time_stamp) / blocks.length
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
                pos_blocktime: (blocks[0].time_stamp - blocks[blocks.length - 1].time_stamp) / blocks.length
            };
        })
        .then((mining_info) => res.json(Message(1, undefined, mining_info)))
        .catch((error) => {
            console.error(error);
            res.status(404).json(Message(0, error.message));
        });
}

function poolstats(req, res) {
    var interval = Math.max(parseInt(req.query.interval) || 1000, 10000);
    Promise.all([Mining.pools().then(pools => _.keyBy(pools, 'name')), Mining.poolstats(interval)])
        .then(([pools, stats]) => Promise.all(stats.map(stat => {
            if (pools[stat._id]) {
                return {
                    ...pools[stat._id],
                    counter: stat.finds
                }
            }
        })))
        .then(results => _.compact(results))
        .then((mining_info) => res.json(Message(1, undefined, mining_info)))
        .catch((error) => res.status(404).json(Message(0, error.message)));
}

function posstats(req, res) {
    var interval = parseInt(req.query.interval) || 1000;
    var top = Math.min(parseInt(req.query.top) || 25, 100)
    Mining.posstats(interval)
        .then((result) =>
            Promise.all(result.map((stats) => {
                return {
                    avatar: stats._id,
                    address: stats.miner_address,
                    counter: stats.finds,
                }
            })))
        .then((avatars) => avatars.slice(0, top))
        .then((mining_info) => res.json(Message(1, undefined, mining_info)))
        .catch((error) => res.status(404).json(Message(0, error.message)));
}

async function posVotes(req, res) {
    try {
        var interval = parseInt(req.query.interval) || 1000;
        const height = await Block.height()
        const posstats = await Mining.posstats(interval)
        const avatarRegister = _.keyBy(posstats, 'address')
        const utxoCount = (await Mining.posVotesCount(posstats.map(m => m.address), height)).map(item=>{
            item.avatar=avatarRegister[item._id]._id
            item.recentBlocks = avatarRegister[item._id].finds
            item.address = item._id
            delete item._id
            return item
        })
        res.json(Message(1, undefined, utxoCount))
    } catch (error) {
        res.status(404).json(Message(0, error.message))
    }
}

async function posVotesByAddress(req, res) {
    try {
        const address = req.params.address
        var interval = parseInt(req.query.interval) || 1000;
        const height = await Block.height()
        const posstats = await Mining.posstats(interval)
        const avatarRegister = _.keyBy(posstats, 'address')
        const utxoCount = (await Mining.posVotesCount( [address], height)).map(item=>{
            item.avatar=avatarRegister[item._id]._id
            item.recentBlocks = avatarRegister[item._id].finds
            item.address = item._id
            delete item._id
            return item
        })
        res.json(Message(1, undefined, utxoCount.length ? utxoCount[0] : null))
    } catch (error) {
        res.status(404).json(Message(0, error.message))
    }
}
