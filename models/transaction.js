'use strict';

//Set up database
var mongo = require('../libraries/mongo.js');

const mvsd_config = require('../config/mvsd.js'),
    rp = require('request-promise');


module.exports = {
    fetch: fetch,
    locksum: locksum,
    circulation: circulation,
    suggest: suggest,
    list: list,
    listall: listall,
    counttxs: counttxs,
    rewards: rewards,
    broadcast: broadcast,
    outputs: outputs
};

/**
 * Get transaction data for given hash
 * @param {} hash
 * @returns {}
 */
function fetch(hash) {
    return mongo.connect()
        .then((db) => db.collection('tx').findOne({
            "hash": hash
        }).then((tx) => {
            if (tx == null)
                throw Error('ERR_TX_NOT_FOUND');
            return tx;
        }));
}

function listall(filter) {
    let query = {};
    if (!filter.allow_orphan) {
        query.orphan = 0;
    }
    if (filter.blockhash)
        query.block = filter.blockhash;
    if (filter.addresses) {
        query.$or = [{
            'inputs.address': {
                $in: filter.addresses
            }
        }, {
            'outputs.address': {
                $in: filter.addresses
            }
        }];
    }
    if (filter.min_time || filter.max_time) {
        query.confirmed_at = {};
        if (filter.max_time)
            query.confirmed_at.$lte = filter.max_time;
        if (filter.min_time)
            query.confirmed_at.$gte = filter.min_time;
    }
    if (filter.min_height || filter.max_height) {
        query.height = {};
        if (filter.max_height)
            query.height.$lte = filter.max_height;
        if (filter.min_height)
            query.height.$gte = filter.min_height;
    }
    return mongo.connect()
        .then((db) => db.collection('tx').find(query, {
            "hash": 1,
            "inputs": 1,
            "outputs": 1,
            confirmed_at: 1,
            height: 1,
            "_id": 0
        }).sort({
            height: -1
        }))
        .then((result) => result.toArray());
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
    if (!filter.allow_orphan) {
        query.orphan = 0;
    }
    if (filter.blockhash)
        query.block = filter.blockhash;
    if (filter.addresses) {
        query.$or = [{
            'inputs.address': {
                $in: filter.addresses
            }
        }, {
            'outputs.address': {
                $in: filter.addresses
            }
        }];
    }
    if (filter.address) {
        query.$or = [{
            'inputs.address': filter.address
        }, {
            'outputs.address': filter.address
        }];
    }
    if (filter.min_time || filter.max_time) {
        query.confirmed_at = {};
        if (filter.max_time)
            query.confirmed_at.$lte = filter.max_time;
        if (filter.min_time)
            query.confirmed_at.$gte = filter.min_time;
    }
    if (filter.min_height || filter.max_height) {
        query.height = {};
        if (filter.max_height)
            query.height.$lte = filter.max_height;
        if (filter.min_height)
            query.height.$gte = filter.min_height;
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
 * Count all transactions that meet the filter criteria.
 * Possible filter options are:
 * - max_time - Unix timestamp for upper time limit
 * - min_time
 * @param {any} filter
 * @returns {number}
 */
function counttxs(filter) {
    let query = {};
    if (filter.min_time || filter.max_time) {
        query.confirmed_at = {};
        if (filter.max_time)
            query.confirmed_at.$lte = filter.max_time;
        if (filter.min_time)
            query.confirmed_at.$gte = filter.min_time;
    }
    query.orphan = 0;
    return mongo.connect()
        .then((db) => db.collection('tx'))
        .then(collection => collection.count(query, {
            "_id": 0
        }))
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
        .then((collection) => collection.find({
            hash: {
                $regex: new RegExp('^' + prefix)
            },
            orphan: 0
        }, {
            hash: 1,
            _id: 0,
            height: 1
        }).toArray())
        .then((result) => result.slice(0, limit))
        .then((result) => result.map((tx) => {
            return {
                h: tx.hash,
                b: tx.height
            };
        }));
}

function locksum(height) {
    return mongo.connect()
        .then((db) =>
            db.collection('tx').mapReduce(function() {
                this.outputs.forEach((output) => {
                    if (this.height + output.locked_height_range > height) {
                        emit('ETP', output.value);
                    }
                });
            }, function(name, quantity) {
                return Array.sum(quantity);
            }, {
                out: "inline",
                query: {
                    "outputs.locked_height_range": {
                        $gt: 0
                    },
                    orphan: 0
                },
                scope: {
                    height: height
                }
            })
            .then(collection => collection.find())
            .then((docs) => {
                console.log(docs)
                if (docs[0] && docs[0].value)
                    return docs[0].value;
                else
                    return null;
            }));
}

function rewards(height) {
    return mongo.connect()
        .then((db) =>
            db.collection('tx').mapReduce(function() {
                this.outputs.forEach((output) => {
                    if (this.inputs.length == 1 && this.inputs[0].address == "") {
                        if (this.height + output.locked_height_range > height) emit('locked', parseInt(output.value));
                        else emit('unlocked', parseInt(output.value));
                    }
                });
            }, function(name, quantity) {
                return Array.sum(quantity);
            }, {
                out: "rewards",
                query: {
                    "outputs.locked_height_range": {
                        $gt: 0
                    },
                    orphan: 0
                },
                scope: {
                    height: height
                }
            })
            .then(() => db.collection('rewards').find().toArray())
            .then((docs) => {
                let res = {};
                if (docs.length)
                    docs.forEach((e) => {
                        res[e._id] = e.value;
                    });
                return res;
            }))
        .catch((err) => {
            console.error(err);
            throw Error("ERROR_FETCH_REWARDS");
        });
}

function circulation() {
    return mongo.connect()
        .then((db) => db.collection('address_balances').findOne({
            _id: "coinbase"
        }))
        .then((result) => -result.value["ETP"] * Math.pow(10, -8));
}

function broadcast(tx) {
    let options = {
        uri: `${mvsd_config.protocol}://${mvsd_config.host}:${mvsd_config.port}/rpc`,
        method: 'POST',
        json: true //parse result
    };

    options.body = {
        method: 'sendrawtx',
        params: [tx]
    };
    return rp(options);
}


/**
 * Get transaction outputs for given hash
 * @param {} hash
 * @returns {}
 */
function outputs(hash) {
    return mongo.connect()
        .then((db) => db.collection('output'))
        .then((collection) => collection.find({
            "tx": hash
        }).toArray())
        .then((outputs) => {
            if (outputs == null)
                throw Error('ERR_TX_OUTPUTS_NOT_FOUND');
            return outputs;
        });
}
