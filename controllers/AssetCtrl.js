'use strict';

//Load Models
var Assets = require('../models/assets.js'),
    Message = require('../models/message.js');

exports.ListAllAssets = listassets;

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
