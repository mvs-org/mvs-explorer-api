'use strict';

//Set up database
var mongo = require('../libraries/mongo.js');


module.exports = {
    listassets: listassets,
    countassets: countassets,
    suggest: suggest,
    stakelist: stakelist,
    assetinfo: assetinfo,
    minedQuantity: minedQuantity,
    burnedQuantity: burnedQuantity
};

/**
 * Get the list of all the assets.
 * @param {} hash
 * @returns {}
 */
function listassets() {
    return mongo.connect()
        .then((db) => db.collection('asset'))
        .then(collection => collection.find({
            symbol: {
                $ne: 'ETP'
            }
        }, {
                "_id": 0,
                "type": 0
            }))
        .then(cursor => cursor.toArray());
}

/**
 * Count all the assets.
 * @returns {number}
 */
function countassets() {
    let query = {
        symbol: {
            $ne: 'ETP'
        }
    };
    return mongo.connect()
        .then((db) => db.collection('asset'))
        .then(collection => collection.count(query, {}))
}

/**
 * Search for assets.
 * @param {} hash
 * @returns {}
 */
function suggest(prefix, limit) {
    return mongo.connect()
        .then((db) => db.collection('asset'))
        .then((collection) => collection.find({
            '$and': [{
                symbol: {
                    $regex: new RegExp(prefix.toUpperCase())
                }
            },
            {
                symbol: {
                    $ne: 'ETP'
                }
            }
            ]
        }, {
                symbol: 1,
                _id: 0
            }).toArray())
        .then((result) => result.slice(0, limit))
        .then((result) => result.map((item) => item.symbol));
}

function stakelist(symbol, limit, min) {
    return mongo.connect()
        .then((db) => db.collection('address_balances'))
        .then((c) => c.find({
            ["value." + symbol]: {
                $gt: min
            }
        }, {
                ["value." + symbol]: 1
            }).sort({
                ["value." + symbol]: -1
            }).limit(limit).toArray())
        .then((result) => result.map((stake) => {
            return {
                a: stake._id,
                q: stake.value[symbol]
            };
        }));
}

/**
 * Get the information of an asset.
 * @param {} symbol string
 * @returns {}
 */
function assetinfo(symbol) {
    return mongo.connect()
        .then((db) => db.collection('asset').findOne({
            "symbol": symbol
        }, {
                "_id": 0,
                "type": 0,
            })
        );
}

/**
 * Get the mined quantity of an asset.
 * @param {} symbol string
 * @returns {}
 */
function minedQuantity(symbol) {
    return mongo.connect()
        .then((db) => db.collection('address_balances').findOne({
            _id: "coinbase",
        }))
        .then(coinbase => coinbase ? -coinbase.value[symbol.replace(/\./g, '_')] || 0 : 0)
}

/**
 * Get the burned quantity of an asset.
 * @param {} symbol string
 * @returns {}
 */
function burnedQuantity(symbol) {
    return mongo.connect()
        .then((db) => db.collection('address_balances').findOne({
            _id: "1111111111111111111114oLvT2",
        }))
        .then(burned => burned ? burned.value[symbol.replace(/\./g, '_')] || 0 : 0)
}
