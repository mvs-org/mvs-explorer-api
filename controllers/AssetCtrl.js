'use strict';

//Load Models
var Assets = require('../models/assets.js'),
    Bridge = require('../models/bridge.js'),
    BridgeConfig = require('../config/eth-bridge.js'),
    Message = require('../models/message.js');

exports.ListAllAssets = listassets;
exports.ListIcons = listIcons;
exports.ListStakes = listStakes;
exports.AssetInfo = assetinfo;
exports.Search = search;
exports.BridgeWhitelist = ethBridgeList;
exports.BridgeConfig = ethBridgeConfig;

/**
 * Get the list of all the assets.
 * @param {} req
 * @param {} res
 */
function listassets(req, res) {
    Assets.listassets()
        .then((assets) => res.json(Message(1, undefined, assets)))
        .catch((error) => {
            console.error(error)
            res.status(404).json(Message(0, 'ERR_LIST_ASSETS'))
        });
};

/**
 * Get the list of all the assets with an icon.
 * @param {} req
 * @param {} res
 */
function listIcons(req, res) {
    res.json(Message(1, undefined, ['ETP', 'MVS.ZGC', 'MVS.ZDC', 'CSD.CSD', 'PARCELX.GPX', 'PARCELX.TEST', 'SDG', 'META', 'MVS.HUG', 'RIGHTBTC.RT', 'TIPLR.TPC', 'PANDO', 'VALOTY', 'KOALA.KT', 'DNA', 'GKC']))
};

/**
 * Get the list of all the assets stakeholders ordered by stake.
 * @param {} req
 * @param {} res
 */
function listStakes(req, res) {
    let symbol = req.params.symbol;
    let limit = parseInt(req.query.limit) || 20;
    let min = parseInt(req.query.min) || 0;
    Assets.stakelist(symbol.replace(/\./g, '_'), limit, min)
        .then((list) => res.json(Message(1, undefined, list)))
        .catch((error) => {
            console.error(error);
            res.status(404).json(Message(0, 'ERR_LIST_ASSETS_STAKES'));
        });
};

/**
 * Search for assets names.
 * @param {} req
 * @param {} res
 */
function search(req, res) {
    let prefix = req.params.prefix;
    var limit = parseInt(req.query.limit) || 10;
    Assets.suggest(prefix, limit)
        .then((assets) => res.json(Message(1, undefined, assets)))
        .catch((error) => {
            console.error(error)
            res.status(404).json(Message(0, 'ERR_SEARCH_ASSETS'))
        });
};

/**
 * Get the information of an asset.
 * @param {} req
 * @param {} res
 */
function assetinfo(req, res) {
    var symbol = req.params.asset_symbol;
    Promise.all([Assets.assetinfo(symbol.toUpperCase()), Assets.minedQuantity(symbol.toUpperCase())])
        .then(([asset, minedQuantity]) => {
            if (asset)
                res.json(Message(1, undefined, { minedQuantity, ...asset }))
            else
                throw Error('Not found')
        })
        .catch((error) => {
            console.error(error)
            res.status(404).json(Message(0, 'ERR_GET_ASSET'))
        });
};

function ethBridgeList(req, res) {
    Bridge.list()
        .then(list => res.json(Message(1, undefined, list)))
        .catch((error) => {
            console.error(error)
            res.status(404).json(Message(0, 'ERR_ETH_BRIDGE_WHITELIST'))
        });
}

function ethBridgeConfig(req, res) {
    Bridge.config()
        .then(list => res.json(Message(1, undefined, list)))
        .catch((error) => {
            console.error(error);
            res.status(404).json(Message(0, 'ERR_ETH_BRIDGE_CONFIG'));
        });
}
