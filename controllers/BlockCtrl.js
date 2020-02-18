'use strict';

//Load Models
var Message = require('../models/message.js');
var Block = require('../models/block');
var Transaction = require('../models/transaction');
let Address = require('../models/address.js');

let Helper = require('../libraries/helper.js');

exports.ListBlocks = ListBlocks;
exports.FetchHeight = FetchHeight;
exports.Fetch = Fetch;
exports.ListBlockstats = ListBlockstats;
exports.ListBlockstatsByDate = ListBlockstatsByDate;
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
        .catch((error) => {
            console.error(error)
            res.status(404).json(Message(0, 'ERR_FETCH_BLOCK'))
        });
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
        .catch((error) => {
            console.error(error)
            res.status(404).json(Message(0, 'ERR_FETCH_BLOCK'))
        });
}

function ListTxs(req, res) {
    var page = parseInt(req.query.page) || 0;
    var filter = {
        allow_orphan: true,
        blockhash: req.params.blockhash,
        max_height: parseInt(req.query.max_height) || undefined,
        min_height: parseInt(req.query.min_height) || undefined
    };
    Transaction.list(page, 10, filter)
        .then((txs) => res.json(Message(1, undefined, txs)))
        .catch((error) => {
            console.error(error)
            res.status(404).json(Message(0, 'ERR_LIST_BLOCK_TXS'))
        });
}

function ListBlockstats(req, res) {

    var limit = parseInt(req.query.limit) || 0;
    var downscale = Math.max(1, parseInt(req.query.downscale)) || 10

    let interval = 1000

    var type = undefined;
    switch (req.query.type) {
        case 'count':
            type = 'COUNT_HEIGHT'
            break;
        case 'blocktime':
            type = 'BLOCKTIME_HEIGHT'
            break;
        case 'txcount':
            type = 'TX_COUNT_HEIGHT'
            break;
        case 'pow':
            type = 'DIFFICULTY_POW_HEIGHT'
            break;
        case 'pos':
            type = 'DIFFICULTY_POS_HEIGHT'
            break;
        case 'dpos':
            type = 'DIFFICULTY_DPOS_HEIGHT'
            break;
        default:
            type = 'DIFFICULTY_POW_HEIGHT'
    }
    
    Block.blockstats((limit > 0) ? limit : 0, type, interval, downscale * interval)
        .then((times) => res.json(Message(1, undefined, times)))
        .catch((error) => {
            console.error(error);
            res.status(404).json(Message(0, 'ERR_LIST_BLOCKTIMES'));
        });
}

function ListBlockstatsByDate(req, res) {

    var limit = parseInt(req.query.limit) || 0;
    let interval = 86400

    var type = undefined;
    switch (req.query.type) {
        case 'count':
            type = 'COUNT_TIME'
            break;
        case 'blocktime':
            type = 'BLOCKTIME_TIME'
            break;
        case 'txcount':
            type = 'TX_COUNT_TIME'
            break;
        case 'pow':
            type = 'DIFFICULTY_POW_TIME'
            break;
        case 'pos':
            type = 'DIFFICULTY_POS_TIME'
            break;
        case 'dpos':
            type = 'DIFFICULTY_DPOS_TIME'
            break;
        default:
            type = 'DIFFICULTY_POW_TIME'
    }
    Block.blockstatsbydate((limit > 0) ? limit : 0, type, interval)
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
        .then((height) => {
            res.setHeader('Cache-Control', 'public, max-age=10, s-maxage=10')
            res.json(Message(1, undefined, height))
        })
        .catch((error) => {
            console.error(error);
            res.status(404).json(Message(0, 'ERR_FETCH_HEIGHT'))
        });
}

async function FetchCirculation(req, res) {
    var adjust = parseInt(req.query.adjust) > 0;
    const format = (req.query.format === 'plain') ? 'plain' : 'json'
    const symbol = req.query.symbol || 'ETP'

    const decimals = symbol === 'DNA' ? 4 : 8


    function getMSTBalance(address, symbol, height){
        return Address.balances(address, height)
            .then(balance => balance.tokens && balance.tokens[symbol] ? (balance.tokens[symbol] / Math.pow(10, decimals)) : 0) 
    }

    async function getAdjustment(symbol) {
        const height = await Block.height()
        if (symbol === 'ETP' && adjust) {
            const balance = await Address.balances("MSCHL3unfVqzsZbRVCJ3yVp7RgAmXiuGN3", height)
            return balance.info.ETP ? (balance.info.ETP / Math.pow(10, decimals)) : 0
        } else if(symbol==='DNA'){
            const balances = await Promise.all([
                getMSTBalance("MEruoraUVWwWUs8GRPz5f5EhG1G7PeiHHV", symbol, height),
                getMSTBalance("MJ4t3K2pykxXkwxkCXxWwCHUWqdDDpqQFi", symbol, height),
                getMSTBalance("MSTMxz2kykshMEQiLnmxQy1QXYMsiNBkoj", symbol, height),
                getMSTBalance("MWA22ayfLUys4PMkranHowY21tkDas6HRJ", symbol, height),
                getMSTBalance("MLMJcRB8LzioAXRUaay9eUm1Yi5Ka37tQi", symbol, height),
                getMSTBalance("MKYELpVDRfmJjkM4xaqhwJihpoNCxEAU77", symbol, height),
            ])
            return balances.reduce((acc, cur)=>acc+cur, 0)
        }
        return 0
    }
    Promise.all([Transaction.circulation(symbol), getAdjustment(symbol)])
        .then(([circulation, adjustment]) => parseFloat((circulation - adjustment).toFixed(decimals)))
        .then(result => format === 'plain' ? res.send(result.toString()) : res.json(Message(1, undefined, result)))
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
        .catch((error) => {
            console.error(error)
            res.status(404).json(Message(0, 'ERR_LIST_BLOCK_TXS'))
        });
}

/**
 * Suggest transaction hashes for given prefix.
 * @param {} req
 * @param {} res
 */
function Suggest(req, res) {
    var prefix = req.params.prefix;
    let limit = Math.min(parseInt(req.query.limit) || 10, 100)
    Block.suggest(prefix, limit)
        .then((hashes) => {
            res.json(Message(1, undefined, hashes));
        })
        .catch((error) => {
            console.error(error);
            res.status(404).json(Message(0, 'ERR_SUGGEST_BLOCKS'));
        });
}
