'use strict';

//Set up database
var mongo = require('../libraries/mongo.js');

exports.height = height;
exports.list = list;
exports.blockstats = blockstats;
exports.blockstatsbydate = blockstatsbydate;
exports.fetch = fetch;
exports.fetchHash = fetchHash;
exports.fetchDifficulty = fetchDifficulty;
exports.statsTypeBlock = statsTypeBlock;
exports.statsMstMining = statsMstMining;
exports.suggest = suggest;
exports.list_block_txs = list_block_txs;

function fetch(number) {
    return mongo.connect()
        .then((db) => db.collection('block'))
        .then((collection) => collection.findOne({
            "number": number,
            "orphan": 0
        }, {
            "_id": 0
        }).then((block) => {
            if (block)
                return block;
            else
                throw Error("ERR_BLOCK_NOT_FOUND");
        }))
        .catch(error => {
            console.log(error);
            throw Error(error.message);
        });
}

function fetchHash(blockhash) {
    return mongo.connect()
        .then((db) => db.collection('block'))
        .then((collection) => collection.findOne({
            "hash": blockhash
        }, {
            "_id": 0
        }).then((block) => {
            if (block)
                return block;
            else
                throw Error("ERR_BLOCK_NOT_FOUND");
        }));
}

function fetchDifficulty(nbr_blocks, version) {
    return mongo.connect()
        .then((db) => db.collection('block'))
        .then((collection) => collection.find({
            version: version,
            orphan: 0
        }, {
            _id: 0,
            number: 1,
            bits: 1,
            time_stamp: 1
        }).sort({
            number: -1
        }).limit(nbr_blocks).toArray())
        .then((blocks) => {
            if (blocks)
                return blocks;
            else
                throw Error("ERR_BLOCK_NOT_FOUND");
        });
}

function statsTypeBlock(since_height) {
    return new Promise((resolve, reject) => {
        mongo.connect()
            .then((db) => {
                db.collection('block').aggregate([{
                    $match: {
                        number: {
                            $gte: since_height
                        },
                        orphan: 0
                    }
                }, {
                    $group: {
                        _id: "$version",
                        'counter': {
                            $sum: 1
                        }
                    }
                }, {
                    $sort: {
                        _id: 1
                    }
                }], {}, (err, result) => {
                    resolve(result);
                });
            });
    });
}

function statsMstMining(since_height) {
    return new Promise((resolve, reject) => {
        mongo.connect()
            .then((db) => {
                db.collection('block').aggregate([{
                    $match: {
                        number: {
                            $gte: since_height
                        },
                        orphan: 0
                    }
                }, {
                    $group: {
                        _id: "$mst_mining",
                        'blocks': {
                            $sum: 1
                        }
                    }
                }, {
                    $sort: {
                        blocks: -1
                    }
                }], {}, (err, result) => {
                    resolve(result);
                });
            });
    });
}

function blockstats(limit, type, interval, scale) {
    if(limit==undefined)
        limit=0;
    return mongo.connect()
        .then((db) => db.collection('statistic'))
        .then((c) => c.find({
            type: type,
            ...( scale && {height: {
                $mod: [scale, 0]
            }}),
            interval: interval,
        }, {
            _id: 0,
            height: 1,
            timestamp: 1,
            value: 1
        }).sort({
            height: -1
        }).limit(limit).toArray())
        .then((blocks) => blocks.map((block, index) => {
            return [block.height, (block.height == 0 || blocks[index + 1] == undefined) ? 0 : parseFloat(((block.timestamp - blocks[index + 1].timestamp) / scale).toFixed(3)), block.value];
        }));
}

function blockstatsbydate(limit, type, interval, scale) {
    if(limit==undefined)
        limit=0;
    return mongo.connect()
        .then((db) => db.collection('statistic'))
        .then((c) => c.find({
            type: type,
            interval: interval,
        }, {
            _id: 0,
            date: 1,
            value: 1
        }).sort({
            date: -1
        }).limit(limit).toArray())
        .then((blocks) => blocks.map((block, index) => {
            return [block.date, block.value];
        }));
}

/**
 * Get block hashes with given prefix
 * @param {String} prefix
 * @param {Number} limit
 * @returns {}
 */
function suggest(prefix, limit) {
    return mongo.connect()
        .then((db) => db.collection('block'))
        .then((collection) => collection.find({
            hash: {
                $regex: new RegExp('^' + prefix)
            },
            orphan: 0
        }, {
            _id: 0,
            hash: 1,
            number: 1,
            time_stamp: 1
        }).toArray())
        .then((result) => result.slice(0, limit))
        .then((result) => result.map((tx) => {
            return {
                h: tx.hash,
                n: tx.number,
                t: tx.time_stamp
            };
        }));
}

function list_block_txs(blockhash) {
    return new Promise((resolve, reject) => {
        mongo.connect()
            .then((db) => {
                return db.collection('tx').find({
                    "block": blockhash
                }, {
                    "_id": 0,
                    "id": 0,
                    "rawtx": 0,
                    "inputs": {
                        "$slice": 5
                    }
                }).toArray((err, txs) => {
                    if (err) {
                        console.error(err);
                        throw Error("ERR_FETCH_BLOCK_TRANSACTIONS");
                    } else
                        resolve(txs);
                });
            });
    });
}

/**
 * List blocks
 * @param {} page
 * @param {} num Number of blocks per page
 * @returns {} 
 */
function list(page, num) {
    return mongo.find_and_count({
        orphan: 0
    }, {
        "_id": 0,
    }, 'block', {
        "number": -1
    }, page, num);
}

/**
 * Get current height
 * @returns {} 
 */
function height() {
    return new Promise((resolve, reject) => {
        mongo.connect()
            .then((db) => {
                db.collection('block')
                    .find({
                        orphan: 0
                    })
                    .sort({
                        number: -1
                    })
                    .limit(1)
                    .toArray((err, docs) => {
                        if (err || docs.length !== 1) {
                            console.error(err);
                            throw Error("ERR_FETCH_HEIGHT");
                        } else
                            resolve(docs[0].number);
                    });
            });
    });
}
