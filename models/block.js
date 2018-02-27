'use strict';

//Set up database
var mongo = require('../libraries/mongo.js');
var mysql = require('mysql');
var config = require('../config/mysql.js');
var connection = mysql.createConnection(config.db);

exports.height = height;
exports.list = list;
exports.circulation = circulation;
exports.fetch = fetch;
exports.list_block_txs = list_block_txs;
exports.fetch_mongo = fetch_mongo;

function circulation (number) {
     return new Promise( (resolve, reject) => {
          var sql = "SELECT sum_output.value-sum_input.value AS circulation FROM sum_input,sum_output;";
          connection.query(sql, (error, result, fields) => {
               if (error || result.length !== 1) {
                    console.log(error);
                    reject(Error("ERR_FETCH_BLOCK"));
               } else {
                    resolve(result[0].circulation);
               }
          });
     });
}
/**
 * Get block by height
 * @param {} number Height
 * @returns {} 
 */
function fetch (number) {
    return new Promise( (resolve, reject) => {
        var sql = "SELECT * FROM `block` WHERE `number`= ?;";
        connection.query(sql, [number], (error, result, fields) => {
            if (error || result.length !== 1) {
                console.log(error);
                reject(Error("ERR_FETCH_BLOCK"));
            } else {
                resolve(result[0]);
            }
        });
    });
}

function fetch_mongo (number) {
    return new Promise((resolve,reject)=>{
        mongo.connect()
            .then((db)=>{
                db.collection('block').find({"number":number}, {"_id": 0}).toArray((err,docs)=>{
                    if(err || docs.length!==1){
			console.error(err, number);
			throw Error("ERR_FETCH_BLOCK");
		    }
                    else
                        resolve(docs[0]);
                });
            });
    });
}


function list_block_txs(height) {
    return new Promise((resolve,reject)=>{
        mongo.connect()
            .then((db)=>{
	return db.collection('tx').find({
			"height": height
		}, {"_id":0,"id":0, "inputs": {"$slice": 5}}).toArray((err,txs)=>{
                    if(err){
			console.error(err);
			throw Error("ERR_FETCH_BLOCK_TRANSACTIONS");
		    }
                    else
                        resolve(txs);
                });
            });
    });
}

/**
 * List blocks
 * @param {} page
 * @param {} num Number of blocks per page
 * @returns {} 
 */
function list (page, num) {
    return new Promise((resolve, reject) => {
        if (typeof num === 'undefined')
            num = 20;
        if (typeof page === 'undefined')
            page = 0;
        var sql = "SELECT * FROM `block` ORDER BY `number` DESC LIMIT ?,?;";
        connection.query(sql, [num * page, num], (error, result, fields) => {
            if (error) {
                console.log(error);
                reject(Error("ERR_FETCH_BLOCK"));
            } else {
                resolve(result);
            }
        });
    });
}

/**
 * Get current height
 * @returns {} 
 */
function height () {
    return new Promise( (resolve, reject) => {
        var sql = "SELECT `number` FROM `block` ORDER BY `number` DESC LIMIT 1;";
        connection.query(sql, (error, result, fields) => {
            if (error) {
                console.log(error);
                reject(Error("ERR_FETCH_BLOCK"));
            } else {
                resolve(result[0].number);
            }
        });
    });
}
