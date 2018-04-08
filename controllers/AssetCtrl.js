'use strict';

//Load Models
var Assets = require('../models/assets.js'),
    Message = require('../models/message.js');

exports.ListAllAssets = listassets;
exports.AssetInfo = assetinfo;
exports.Search = search;

/**
 * Get the list of all the assets.
 * @param {} req
 * @param {} res
 */
function listassets(req, res) {
    Assets.listassets()
        .then((assets) => res.json(Message(1, undefined, assets)))
        .catch((error) => res.status(404).json(Message(0, 'ERR_LIST_ASSETS')));
};

/**
 * Search for assets names.
 * @param {} req
 * @param {} res
 */
function search(req, res) {
    let prefix = req.params.prefix;
    Assets.search(prefix)
        .then((assets) => res.json(Message(1, undefined, assets)))
        .catch((error) => res.status(404).json(Message(0, 'ERR_SEARCH_ASSETS')));
};

/**
 * Get the information of an asset.
 * @param {} req
 * @param {} res
 */
function assetinfo(req, res) {
    var symbol = req.params.asset_symbol;
    Assets.assetinfo(symbol)
        .then((assets) => res.json(Message(1, undefined, assets)))
        .catch((error) => res.status(404).json(Message(0, 'ERR_LIST_ASSETS')));
};
