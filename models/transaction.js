'use strict';

//Set up database
var mongo = require('../libraries/mongo.js');
var metaversejs = require('metaversejs')

const mvsd_config = require('../config/mvsd.js'),
    rp = require('request-promise');


module.exports = {
    fetch: fetch,
    locksum: locksum,
    circulation: circulation,
    suggest: suggest,
    counttxs: counttxs,
    rewards: rewards,
    broadcast: broadcast,
    outputs: outputs,
    decode: decode,
};

/**
 * Get transaction data for given hash
 * @param {} hash
 * @returns {}
 */
function fetch(hash) {
    return mongo.connect()
        .then((db) => db.collection('tx').find({
            "hash": hash
        }).sort({
            orphan: 1
        }).toArray())
        .then((result) => result[0])
        .then((tx) => {
            if (tx == null)
                throw Error('ERR_TX_NOT_FOUND');
            return tx;
        });
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
                out: { inline: 1},
                query: {
                    "outputs.locked_height_range": {
                        $gt: 0
                    },
                    height: {
                        $gt: height - 1314000
                    },
                    orphan: 0
                },
                scope: {
                    height: height
                }
            })
            .then((docs) => {
                return (docs && docs.length) ? docs[0].value : 0;
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

function circulation(symbol) {
    if(symbol==='DNA'){
        return 100000000000
    }
    return mongo.connect()
        .then((db) => db.collection('address_balances').findOne({
            _id: "coinbase"
        }))
        .then((result) => -result.value[symbol] * Math.pow(10, -8));
}

async function decode(rawTx){
    return metaversejs.transaction.decode(rawTx)
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
