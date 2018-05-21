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
    var show_invalidated = req.query.show_invalidated>0;
    Certs.listcerts(show_invalidated)
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
    var show_invalidated = req.query.show_invalidated>0;
    Certs.certsinfo(owner, show_invalidated)
        .then((certs) => res.json(Message(1, undefined, certs)))
        .catch((error) => res.status(404).json(Message(0, 'ERR_LIST_CERTS')));
};
