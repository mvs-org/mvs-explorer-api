'use strict';

//Set up database
var mongo = require('../libraries/mongo.js');


module.exports = {
    listavatars: listavatars,
    suggest: suggest,
    avatarinfo: avatarinfo
};

/**
 * Get the list of all the assets.
 * @param {} hash
 * @returns {}
 */
function listavatars() {
    return new Promise((resolve, reject) => {
        mongo.connect()
            .then((db) => {
                db.collection('avatar').find({}, {
                    "_id": 0,
                    "type": 0
                }).toArray((err, docs) => {
                    resolve(docs);
                });
            });
    });
}

/**
 * Search for avatars.
 * @param {} hash
 * @returns {}
 */
function suggest(prefix, limit) {
    return mongo.connect()
        .then((db) => db.collection('avatar'))
        .then((collection) => collection.find({
            symbol: {
                $regex: new RegExp('^' + prefix)
            }
        }, {
            symbol: 1,
            _id: 0
        }).toArray())
        .then((result) => result.slice(0, limit))
        .then((result) => result.map((item) => item.symbol));
}

/**
 * Get the information of an avatar.
 * @param {} hash
 * @returns {}
 */
function avatarinfo(symbol) {
    return new Promise((resolve, reject) => {
        mongo.connect()
            .then((db) => {
                db.collection('avatar').find({
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
