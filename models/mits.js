'use strict';

//Set up database
var mongo = require('../libraries/mongo.js');


module.exports = {
    listmits: listmits,
    countmits: countmits,
    mitsinfo: mitsinfo,
    suggest: suggest
};

/**
 * Get the list of all the MITs.
 * @param {boolean} show_invalidated include invalidated certs
 * @returns {Array<Output>}
 */
function listmits(show_invalidated, page, items_per_page) {
    let query = {
        'attachment.type': "mit",
        orphaned_at: 0
    };
    if(!show_invalidated){
        query.spent_tx = 0;
    }
    return mongo.find_and_count(query, {_id:0, type: 0}, 'output', {"height": -1}, page, items_per_page);
}

/**
 * Count all the MITs.
 * @returns {number}
 */
function countmits() {
    let query = {
        'attachment.type': "mit",
        orphaned_at: 0,
        spent_tx: 0
    };
    return mongo.connect()
        .then((db) => db.collection('output'))
        .then(collection => collection.count(query, {}))
}

/**
 * Get the information of a MIT.
 * @param {string} symbol MIT symbol
 * @param {boolean} show_invalidated include invalidated MITs
 * @returns {Array<Output>}
 */
function mitsinfo(symbol, show_invalidated) {
    let query = {
        'attachment.type': "mit",
        orphaned_at: 0,
        'attachment.symbol': symbol
    };
    if(!show_invalidated){
        query.spent_tx = 0;
    }
    return mongo.connect()
        .then((db) => db.collection('output'))
        .then(collection => collection.find(query, {
            "_id": 0,
            "type": 0
        }))
        .then(cursor => cursor.toArray());
}

/**
 * Search for MIT.
 * @param {string} symbol MIT symbol
 * @returns {}
 */
function suggest(symbol) {
    return mongo.connect()
        .then((db) => db.collection('output'))
        .then((collection) => collection.find({
            'attachment.type': 'mit',
            'attachment.symbol': symbol,
            spent_tx: 0,
            orphaned_at: 0
        }, {
            'attachment.symbol': 1,
            _id: 0
        }).toArray())
        .then((result) => result.map((item) => item.attachment.symbol));
}
