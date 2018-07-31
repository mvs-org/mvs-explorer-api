'use strict';

var Message = require('../models/message.js');
let Address = require('../models/address.js');
let Asset = require('../models/assets.js');
let Block = require('../models/block.js');
let Tx = require('../models/transaction.js');

exports.ListTxs = ListTxs;
exports.ListAddressesTxs = ListAddressesTxs;
exports.Suggest = Suggest;
exports.GetBalance = GetBalance;
exports.ListBalances = ListBalances;

/**
 * List transactions for given addresses.
 * @param {} req
 * @param {} res
 */
function ListAddressesTxs(req, res) {
    var filter = {
        addresses: (Array.isArray(req.query.addresses)) ? req.query.addresses : [req.query.addresses],
        max_time: parseInt(req.query.max_time) || undefined,
        min_time: parseInt(req.query.min_time) || undefined,
        max_height: parseInt(req.query.max_height) || undefined,
        min_height: parseInt(req.query.min_height) || undefined
    };
    let filter_inouts = req.query.filter_inouts;
    Tx.listall(filter)
        .then((txs) => (filter_inouts) ? Promise.all(txs.map((tx) => {
            let inp = [],
                outp = [];
            tx.inputs.forEach((input) => {
                if (filter.addresses.indexOf(input.address) !== -1)
                    inp.push(input);
            });
            tx.outputs.forEach((output) => {
                if (filter.addresses.indexOf(output.address) !== -1)
                    outp.push(output);
            });
            tx.inputs = inp;
            tx.outputs = outp;
            return tx;
        })) : txs)
        .then((txs_data) => {
            res.json(Message(1, undefined, {
                transactions: txs_data
            }));
        })
        .catch((error) => {
            console.error('Error listing txs for address : ' + error.message);
            res.status(404).json(Message(0, 'ERR_LIST_TRANSACTIONS'));
        });
}

/**
 * List transactions for given address.
 * @param {} req
 * @param {} res
 */
function ListTxs(req, res) {
    var page = parseInt(req.query.page) || 0;
    var items_per_page = (req.query.items_per_page) ? parseInt(req.query.items_per_page) : 10;
    var filter = {
        address: req.params.address,
        max_time: parseInt(req.query.max_time) || undefined,
        min_time: parseInt(req.query.min_time) || undefined,
        max_height: parseInt(req.query.max_height) || undefined,
        min_height: parseInt(req.query.min_height) || undefined
    };
    Tx.list(page, items_per_page, filter)
        .then((txs_data) => {
            res.json(Message(1, undefined, {
                transactions: txs_data.result,
                count: txs_data.count,
                items_per_page: items_per_page
            }));
        })
        .catch((error) => {
            console.error('Error listing txs for address : ' + error.message);
            res.status(404).json(Message(0, 'ERR_LIST_TRANSACTIONS'));
        });
}

function Suggest(req, res) {
    let prefix = req.params.prefix;
    let limit = 10;
    let includeTxCount = false;
    Address.suggest(prefix, limit, includeTxCount)
        .then((addresses) => res.status(200).json(Message(1, undefined, addresses)))
        .catch((error) => {
            console.error(error);
            res.status(404).json(Message(0, 'ERR_SUGGEST_ADDRESSES'));
        });
};

function ListBalances(req, res) {
    let address = req.params.address;
    Block.height()
        .then((height) => Address.balances(address, height))
        .then((balances) => {
            balances['definitions'] = {};
            Asset.listassets()
                .then((assets) => Promise.all(assets.map((asset) => {
                    if (typeof(balances['tokens'][asset.symbol]) != 'undefined') {
                        balances['definitions'][asset.symbol] = asset;
                    }
                })))
                .then(() => res.status(200).json(Message(1, undefined, balances)));
        })
        .catch((error) => {
            console.error(error);
            res.status(404).json(Message(0, 'ERR_LIST_BALANCES'));
        });
};

function GetBalance(req, res) {
    let address = req.params.address;
    let symbol = req.params.symbol.toUpperCase();
    let format = (req.query.format=="plain") ? "plain" : "json";
    Block.height()
        .then((height) => Address.balances(address, height))
        .then((balances) => {
            if(symbol=="ETP")
                return (balances.info.ETP) ? parseInt(balances.info.ETP)/Math.pow(10,8) : 0;
            else
                return (balances.tokens[symbol]) ? balances.tokens[symbol]/Math.pow(10,balances.definitions[symbol].decimals) : 0;
        })
        .then((balance) => {
            if(format=="plain")
                res.send(balance);
            else
                res.status(200).json(Message(1, undefined, balance));
        })
        .catch((error) => {
            console.error(error);
            res.status(404).json(Message(0, 'ERR_LIST_BALANCES'));
        });
};
