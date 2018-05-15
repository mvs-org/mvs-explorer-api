'use strict';

//Load Models
var Certs = require('../models/certs.js'),
    Message = require('../models/message.js');

exports.ListAllCerts = listcerts;
exports.CertsInfo = certsinfo;

/**
 * Get the list of all the certs.
 * @param {} req
 * @param {} res
 */
function listcerts(req, res) {
    Certs.listcerts()
        .then((certs) => res.json(Message(1, undefined, certs)))
        .catch((error) => res.status(404).json(Message(0, 'ERR_LIST_CERTS')));
};

/**
 * Get the certs of an avatar.
 * @param {} req
 * @param {} res
 */
function certsinfo(req, res) {
    var owner = req.params.owner;
    Certs.certsinfo(owner)
        .then((certs) => res.json(Message(1, undefined, certs)))
        .catch((error) => res.status(404).json(Message(0, 'ERR_LIST_CERTS')));
};
