
/**
 *  api.js
 *  Handles device registration & unregistration process via HTTP.
 */

var config = require('../config'),
    mongoose = require('mongoose');

/**
 * POST host:port/watch
 *      username
 *      password (MD5'd)
 *      email
 */

exports.watch = function(req, res) {

};

/**
 * GET host:port/watch
 *     secret
 */

exports.unwatch = function(req, res) {

};