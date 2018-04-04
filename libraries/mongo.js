let MongoClient = require('mongodb').MongoClient,
	mongo_config = require('../config/mongo.js');

var _db;

module.exports = {
	'find': find,
	'find_and_count': find_and_count,
	'connect': connect
};

function find_and_count(args, selector, collection,sort,page,items_per_page) {
		return connect()
			.then((db) => Promise.all([_find_paged(db,args,selector,collection,sort,page,items_per_page), _count(db,args,collection)]))
			  .then((results)=> { return {result: results[0],count: results[1]}; });
};

function _find_paged(db, args, selector, collection, sort,page, items_per_page) {
	return new Promise((resolve,reject)=>{
				let col = db.collection(collection);
				col.find(args, selector).sort(sort).skip(page*items_per_page).limit(items_per_page).toArray((err, docs) => {
					if (err)
						reject(Error(err.message));
					else
						resolve(docs);
				});
	});
};

function find(args, selector, collection,sort) {
		if(sort===undefined)
			sort={};
		return connect()
			.then((db) => _find(db,args,selector,collection,sort));
};

function _find(db,args,selector,collection,sort){
	return new Promise((resolve,reject)=>{
				let col = db.collection(collection);
				col.find(args,selector).sort(sort).toArray((err, docs) => {
					if (err)
						reject(Error(err.message));
					else
						resolve(docs);
				});
	});
}

function _count(db,args,collection,sort){
	return new Promise((resolve,reject)=>{
				let col = db.collection(collection);
				col.find(args).sort(sort).count((err, count) => {
					if (err)
						reject(Error(err.message));
					else
						resolve(count);
				});
	});
}
function connect() {
	return new Promise((resolve, reject) => {
		if (_db !== undefined)
			resolve(_db);
		else {
			let url = 'mongodb://' + mongo_config.host + ':' + mongo_config.port + '/' + mongo_config.database;
			MongoClient.connect(url, function(err, db) {
				if (err) throw Error(err.message);
				else {
					resolve(db);
					_db = db;
				}
			});
		}
	});
}
