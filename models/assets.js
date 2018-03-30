'use strict';

//Set up database
var mongo = require('../libraries/mongo.js');


module.exports = {
    listassets: listassets,
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
