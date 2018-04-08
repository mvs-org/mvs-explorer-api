'use strict';

//Set up database
var mongo = require('../libraries/mongo.js');


module.exports = {
    listassets: listassets,
    search: search,
    assetinfo: assetinfo
};

/**
 * Get the list of all the assets.
 * @param {} hash
 * @returns {}
 */
function listassets(hash) {
    return new Promise((resolve, reject) => {
        mongo.connect()
            .then((db) => {
                db.collection('asset').find({

                }, {
                    "_id": 0,
                    "type": 0
                }).toArray((err, docs) => {
                    resolve(docs);
                });
            });
    });
}

/**
 * Search for assets.
 * @param {} hash
 * @returns {}
 */
function search(prefix) {
    return mongo.connect()
        .then((db) => db.collection('asset'))
        .then((collection) => collection.distinct("symbol", {
            symbol: {
                $regex: new RegExp('^'+prefix)
            }
        }, {
            symbol: 1
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
