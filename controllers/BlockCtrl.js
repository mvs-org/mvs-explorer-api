'use strict';

//Load Models
var Message = require('../models/message.js');
var Block = require('../models/block');
var Transaction = require('../models/transaction');

let Helper = require('../libraries/helper.js');

exports.ListBlocks = ListBlocks;
exports.FetchHeight = FetchHeight;
exports.Fetch = Fetch;
exports.ListBlockstats = ListBlockstats;
exports.FetchHash = FetchHash;
exports.ListTxs = ListTxs;
exports.Suggest = Suggest;
exports.FetchCirculation = FetchCirculation;

/**
 * Get block information for block hash.
 * @param {} req
 * @param {} res
 */
function FetchHash(req, res) {
    var blockhash = req.params.blockhash;
    Helper.checkError(blockhash,'ERR_BLOCK_HASH_MISSING')
        .then(()=>Block.fetchHash(blockhash))
        .then((block) => {
            return res.json(Message(1, undefined, block));
        })
        .catch((error) => res.status(404).json(Message(0, error.message)));
}

/**
 * Get block information for block number.
 * @param {} req
 * @param {} res
 */
function Fetch(req, res) {
    var number = parseInt(req.params.block_no);
    Helper.checkError(!isNaN(number),'ERR_BLOCK_NUMER_INVALID')
        .then(()=>Block.fetch(number))
        .then((block) => {
            return res.json(Message(1, undefined, block));
        })
        .catch((error) => res.status(404).json(Message(0, error.message)));
}

function ListTxs(req,res){
    var number = req.params.block_no;
    var page = parseInt(req.query.page) || 0;
    var filter = {
        allow_orphan: true,
        blockhash: req.params.blockhash,
        max_height: parseInt(req.query.max_height) || undefined,
        min_height: parseInt(req.query.min_height) || undefined
    };
    Transaction.list(page, 10, filter)
        .then((txs) => res.json(Message(1, undefined, txs)))
        .catch((error) => res.status(404).json(Message(0, 'ERR_BLOCK_TXS')));
}

function ListBlockstats(req,res){
    var interval = parseInt(req.query.interval) || 1000;
    Block.blockstats(interval)
        .then((times) => res.json(Message(1, undefined, times)))
        .catch((error) => res.status(404).json(Message(0, 'ERR_LIST_BLOCKTIMES')));
}

/**
 * Get the current blockchain height.
 * @param {} req
 * @param {} res
 */
function FetchHeight(req, res) {
    Block.height()
        .then((height) => res.json(Message(1, undefined, height)))
        .catch((error) => res.status(404).json(Message(0, 'ERR_FETCH_HEIGHT')));
}

function FetchCirculation(req, res) {
    Transaction.circulation()
        .then((result) => {
            if (req.query.format == 'plain') {
                res.send(result.toString());
            } else {
                res.json(Message(1, undefined, result));
            }
        })
        .catch((error) => {
            console.error(error);
            res.status(404).json(Message(0, 'ERR_FETCH_CIRCULATION'));
        });
}

/**
 * List blocks in pages.
 * @param {} req
 * @param {} res
 */
function ListBlocks(req, res) {
    var page = parseInt(req.params.page);
    Block.list(page,50)
        .then((blocks) => res.json(Message(1, undefined, blocks)))
        .catch((error) => res.status(404).json(Message(0, 'ERR_LIST_BLOCKS')));
}

/**
 * Suggest transaction hashes for given prefix.
 * @param {} req
 * @param {} res
 */
function Suggest(req, res) {
    var prefix = req.params.prefix;
    var limit = parseInt(req.query.limit) || 10;
    Block.suggest(prefix, limit)
        .then((hashes) => {
            res.json(Message(1, undefined, hashes));
        })
        .catch((error) => {
            console.error(error);
            res.status(404).json(Message(0, 'ERR_SUGGEST_BLOCKS'));
        });
}
