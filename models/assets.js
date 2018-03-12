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
              db.collection('asset_output').find({

              }, {
                  "_id": 0,
                  "output_id": 0,
                  "address_id": 0,
                  "tx_id": 0
              }).toArray((err, docs) => {
                  resolve(docs);
              });
          });
  });
}
