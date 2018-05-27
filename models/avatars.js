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
function listavatars(page, items_per_page) {
    return mongo.find_and_count({}, {_id:0, type: 0}, 'avatar', {"height": -1}, page, items_per_page);
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
 * @param {} hash
 * @returns {}
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
