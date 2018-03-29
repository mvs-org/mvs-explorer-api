'use strict';

//Load Models
var Message = require('../models/message.js');
var Block = require('../models/block');
var Transaction = require('../models/transaction');

exports.ListBlocks = ListBlocks;
exports.FetchHeight = FetchHeight;
exports.Fetch = FetchBlock;
exports.FetchCirculation = FetchCirculation;

/**
 * Get block information for block number.
 * @param {} req
 * @param {} res
 */
function FetchBlock(req, res) {
    var number = req.params.block_no;
    Block.fetch(parseInt(number))
        .then((block)=>{
            return Block.list_block_txs(block.hash)
                .then((transactions) => {
                    block.transactions = transactions;
                    res.json(Message(1, undefined, block));
                })
                .catch((error) => res.status(404).json(Message(0, error.message)));
        });
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
    Block.circulation()
        .then((quantity) => {
            if (req.query.format == 'plain') {
                res.send((quantity / 100000000).toString());
            } else {
                res.json(Message(1, undefined, quantity / 100000000));
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
    Block.list(page,10)
        .then((blocks) => res.json(Message(1, undefined, blocks)))
        .catch((error) => res.status(404).json(Message(0, 'ERR_LIST_BLOCKS')));
}
