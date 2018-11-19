'use strict';

//Set up database
var mongo = require('../libraries/mongo.js');


module.exports = {
    listavatars: listavatars,
    countavatars: countavatars,
    suggest: suggest,
    avatarinfo: avatarinfo,
    avatarInfoByAddress: avatarInfoByAddress,
};

/**
 * Get the list of all the assets.
 * @param {} hash
 * @returns {}
 */
function listavatars(page, items_per_page) {
    return mongo.find_and_count({}, {_id:0, type: 0}, 'avatar', {"height": -1}, page, items_per_page);
}

/**
 * Count all the avatars.
 * @returns {number}
 */
function countavatars() {
    return mongo.connect()
        .then((db) => db.collection('avatar'))
        .then(collection => collection.count({}, {}))
}

/**
 * Search for avatars.
 * @param {} hash
 * @returns {}
 */
function suggest(prefix, limit) {
    return mongo.connect()
        .then((db) => db.collection('avatar'))
        .then((avatars) => avatars.find({symbol: {
            $regex: new RegExp('^' + prefix)
        }},{_id:0, symbol: 1}))
        .then((result)=>result.toArray())
        .then((result) => result.slice(0, limit))
        .then((result) => result.map((item) => item.symbol));
}

/**
 * Get the information of an avatar.
 */
function avatarinfo(symbol) {
    return mongo.connect()
        .then((db) => db.collection('avatar'))
        .then((avatars) => avatars.findOne({
            "symbol": symbol
        }, {
            "_id": 0,
            "type": 0
        }));
}

/**
 * Get the information of an avatar by its address.
 */
function avatarInfoByAddress(address) {
    return mongo.connect()
        .then((db) => db.collection('avatar'))
        .then((avatars) => avatars.findOne({
            "address": address
        }, {
            "_id": 0,
            "type": 0
        }));
}
