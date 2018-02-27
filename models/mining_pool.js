let requestify = require('requestify');

//Set up database
var mysql = require('mysql');
var config = require('../config/mysql.js');
var connection = mysql.createConnection(config.db);

module.exports = {
    stats: stats,
    partofcake: partofcake
};

function stats() {
    return new Promise((resolve, reject) => {
        requestify.get('http://pool.mvs.live/api/stats')
            .then(function(response) {
                resolve(response.getBody());
            });
    });
}

function partofcake(number_of_blocks, start_height) {
    return new Promise((resolve, reject) => {
        var sql = "SELECT miner_address.name, miner.url, miner.origin , count(*) as counter FROM (SELECT address.id, address.address FROM explorer.block JOIN tx ON tx.block_height = block.number JOIN tx_output ON tx.id = tx_output.tx_id JOIN address on tx_output.address_id=address.id WHERE block.number < ? AND block.number > ? AND tx_output.output_index=0 GROUP BY block.number) as t1 LEFT JOIN miner_address ON t1.id = miner_address.address_id JOIN miner ON miner_address.name = miner.name GROUP BY miner_address.name ORDER BY count(*) DESC;";

        connection.query(sql, [number_of_blocks + start_height, start_height], (error, result, fields) => {
            if (error) {
                console.log(error);
                reject(Error("ERR_PART_OF_CAKE"));
            } else {
                resolve(result);
            }
        });
    });
}
