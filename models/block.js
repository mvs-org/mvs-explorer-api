'use strict';

//Set up database
var mongo = require('../libraries/mongo.js');

exports.height = height;
exports.list = list;
exports.blockstats = blockstats;
exports.fetch = fetch;
exports.fetchHash = fetchHash;
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
        .catch(error=>{
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

function blockstats(interval){
    return mongo.connect()
        .then((db)=>db.collection('block'))
        .then((c)=>c.find({orphan: 0, number: {$mod: [interval,0]}},{number: -1}).toArray())
        .then((blocks)=>blocks.map((block, index)=>{
            return [block.number,(block.number==0)?0:parseFloat(((block.time_stamp-blocks[index+1].time_stamp)/interval).toFixed(3)),parseInt(block.bits)];
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
        .then((result)=>result.map((tx)=>{
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
    return mongo.find_and_count({orphan:0}, {
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
                    .find()
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
