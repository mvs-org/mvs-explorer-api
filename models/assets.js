'use strict';

//Set up database
var mongo = require('../libraries/mongo.js');


module.exports = {
    listassets: listassets,
    suggest: suggest,
    stakelist: stakelist,
    assetinfo: assetinfo
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

function stakelist(symbol, limit) {
    return mongo.connect()
        .then((db) => db.collection('address_balances'))
        .then((c) => c.find({
            ["value." + symbol]: {
                $gt: 0
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
 * @param {} hash
 * @returns {}
 */
function assetinfo(symbol) {
    return new Promise((resolve, reject) => {
        mongo.connect()
            .then((db) => {
                db.collection('asset').find({
                    "symbol": symbol
                }, {
                    "_id": 0,
                    "type": 0
                }).toArray((err, docs) => {
                    resolve(docs);
                });
            });
    });
}
