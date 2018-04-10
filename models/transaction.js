'use strict';

//Set up database
var mongo = require('../libraries/mongo.js');


module.exports = {
    fetch: fetch,
    locksum: locksum,
    circulation: circulation,
    suggest: suggest,
    list: list,
    rewards: rewards
};

/**
 * Get transaction data for given hash
 * @param {} hash
 * @returns {}
 */
function fetch(hash) {
    return new Promise((resolve, reject) => {
        mongo.connect()
            .then((db) => {
                db.collection('tx').find({
                    "hash": hash
                }).toArray((err, docs) => {
                    if (err || docs.length !== 1) {
                        console.error(err);
                        throw Error("ERROR_FETCH_TX");
                    } else {
                        resolve(docs[0]);
                    }
                });
            });
    });
}

/**
 * List all transactions that meet the filter criteria.
 * Possible filter options are:
 * - max_time - Unix timestamp for upper time limit
 * - min_time
 * - min_height
 * - max_height
 * - address
 * @param {number} page
 * @param {number} items_per_page
 * @param {any} filter
 * @returns {}
 */
function list(page, items_per_page, filter) {
    let query = {};
    if(!filter.allow_orphan){
        query.orphan=0;
    }
    if(filter.blockhash)
        query.block=filter.blockhash;
    if(filter.address){
        query.$or=[{
            'inputs.address': filter.address
        }, {
            'outputs.address': filter.address
        }];
    }
    if(filter.min_time||filter.max_time){
        query.confirmed_at={};
        if(filter.max_time)
            query.confirmed_at.$lte=filter.max_time;
        if(filter.min_time)
            query.confirmed_at.$gte=filter.min_time;
    }
    if(filter.min_height||filter.max_height){
        query.height={};
        if(filter.max_height)
            query.height.$lte=filter.max_height;
        if(filter.min_height)
            query.height.$gte=filter.min_height;
    }
    return mongo.find_and_count(query, {
        "_id": 0,
        "rawtx": 0,
        "inputs": {
            "$slice": 5
        }
    }, 'tx', {
        "height": -1
    }, page, items_per_page);
}

/**
 * Get transaction hashes with given prefix
 * @param {String} prefix
 * @param {Number} limit
 * @returns {}
 */
function suggest(prefix, limit) {
    return mongo.connect()
        .then((db) => db.collection('tx'))
        .then((collection) => collection.distinct("hash", {
            hash: {
                $regex: new RegExp('^'+prefix)
            }
        }, {
            hash: 1
        }))
        .then((result)=>result.slice(0, limit));
}

function locksum(height) {
    return new Promise((resolve, reject) => {
        mongo.connect()
            .then((db) => {
                db.collection('tx').mapReduce(function() {
                    this.outputs.forEach((output) => {
                        if (this.height + output.lock_height > height && this.height < height) emit(output.asset.symbol, parseInt(output.quantity));
                    });
                }, function(name, quantity) {
                    return Array.sum(quantity);
                }, {
                    out: "locksum",
                    query: {
                        "outputs.lock_height": {
                            $gt: 0
                        }
                    }
                });
                db.collection('locksum').find().toArray((err, docs) => {
                    if (err || docs.length !== 1) {
                        console.error(err);
                        throw Error("ERROR_FETCH_LOCKSUM");
                    } else
                        resolve(docs[0].value);
                });
            });
    });
}

function rewards(height) {
    return new Promise((resolve, reject) => {
        mongo.connect()
            .then((db) => {
                db.collection('tx').mapReduce(function() {
                    this.outputs.forEach((output) => {
                        if (this.inputs.length == 1 && this.inputs[0].address == "") {
                            if (this.height + output.lock_height > height && this.height < height) emit('locked', parseInt(output.quantity));
                            else if (output.lock_height > 0) emit('unlocked', parseInt(output.quantity));
                        }
                    });
                }, function(name, quantity) {
                    return Array.sum(quantity);
                }, {
                    out: "rewards",
                    query: {
                        "outputs.lock_height": {
                            $gt: 0
                        }
                    }
                });
                db.collection('rewards').find().toArray((err, docs) => {
                    if (err) {
                        console.error(err);
                        throw Error("ERROR_FETCH_REWARDS");
                    } else {
                        let res = {};
                        if (docs.length)
                            docs.forEach((e) => {
                                res[e._id] = e.value;
                            });
                        resolve(res);
                    }
                });
            });
    });
}

function circulation() {
    return new Promise((resolve, reject) => {
        mongo.connect()
            .then((db) => {
                db.collection('tx').mapReduce(function() {
                    if (this.inputs[0].previous_output.hash == "0000000000000000000000000000000000000000000000000000000000000000")
                        this.outputs.forEach(function(output) {
                            if (output.locked_height_range)
                                emit("deposit", output.value);
                            else
                                emit("block", output.value);
                        });
                }, function(name, quantity) {
                    return Array.sum(quantity);
                }, {
                    out: "circulation",
                    query: {
                        "inputs.previous_output.hash": "0000000000000000000000000000000000000000000000000000000000000000",
                        "orphan": 0
                    }
                }, (err, tmp) => {
                    if (err) {
                        console.error(err);
                        throw Error("ERROR_FETCH_CIRCULATION");
                    } else {
                        tmp.find().toArray((err, result) => {
                            if (err) {
                                console.error(err);
                                throw Error("ERROR_FETCH_CIRCULATION");
                            } else {
                                resolve({
                                    block: result[0].value,
                                    deposit: result[1].value
                                });
                            }
                        });
                    }
                });
            });
    });
}
