'use strict';

//Set up database
var mongo = require('../libraries/mongo.js');


module.exports = {
    list: listMST,
    config: config
};

/**
 * Get the list of all the compatible MST configs.
 * @param {} hash
 * @returns {}
 */
function config() {
    return mongo.connect()
        .then((db) => db.collection('bridge'))
        .then(collection => collection.find({}, {
            "_id": 0
        }))
        .then(cursor => cursor.toArray());
}

function listMST() {
    return config()
        .then((list) => list.map(item=>item.MST));
}
