'use strict';

//Set up database
var mongo = require('../libraries/mongo.js');


module.exports = {
    listmits: listmits,
    mitsinfo: mitsinfo
};

/**
 * Get the list of all the assets.
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
 * Get the information of an avatar.
 * @param {string} owner did symbol of owner
 * @param {boolean} show_invalidated include invalidated certs
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
