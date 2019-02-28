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
    Helper.checkError(blockhash, 'ERR_BLOCK_HASH_MISSING')
        .then(() => Block.fetchHash(blockhash))
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
    Helper.checkError(!isNaN(number), 'ERR_BLOCK_NUMER_INVALID')
        .then(() => Block.fetch(number))
        .then((block) => {
            res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300')
            return res.json(Message(1, undefined, block));
        })
        .catch((error) => res.status(404).json(Message(0, error.message)));
}

function ListTxs(req, res) {
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

function ListBlockstats(req, res) {
    var downscale = Math.max(1, parseInt(req.query.downscale)) || 10;
    var interval = downscale*1000;
    var type = undefined;
    var limit = parseInt(req.query.limit) || 0;
    switch (req.query.type) {
        case 'pow':
            type = 'DIFFICULTY_POW';
            break;
        case 'pos':
            type = 'DIFFICULTY_POS';
            break;
        case 'dpos':
            type = 'DIFFICULTY_DPOS';
            break;
        default:
            type = 'DIFFICULTY_POW';
    }
    Block.blockstats(interval, (limit > 0) ? limit : 0, type)
        .then((times) => res.json(Message(1, undefined, times)))
        .catch((error) => {
            console.error(error);
            res.status(404).json(Message(0, 'ERR_LIST_BLOCKTIMES'));
        });
}

/**
 * Get the current blockchain height.
 * @param {} req
 * @param {} res
 */
function FetchHeight(req, res) {
    Block.height()
        .then((height) =>{
            res.setHeader('Cache-Control', 'public, max-age=10, s-maxage=10')
            res.json(Message(1, undefined, height))
        })
        .catch((error) => {
            console.error(error);
            res.status(404).json(Message(0, 'ERR_FETCH_HEIGHT'))
        });
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
    var page = parseInt(req.query.page) || 0;
    var items_per_page = (req.query.items_per_page) ? parseInt(req.query.items_per_page) : 50;
    Helper.checkError(items_per_page >= 1 && items_per_page <= 100, 'ERR_INVALID_PAGE_SIZE')
        .then(() => Block.list(page, items_per_page))
        .then((blocks) => res.json(Message(1, undefined, blocks)))
        .catch((error) => res.status(404).json(Message(0, error.message)));
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
