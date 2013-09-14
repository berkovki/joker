
/**
 *  api.js
 *  Handles device registration & unregistration process via HTTP.
 */

var config = require('../config'),
    schema = require('../schema'),
    subscription = require('../subscription'),
    mongoose = require('mongoose');

/**
 * POST host:port/watch
 *      username
 *      password
 *      email
 */

exports.watch = function(req, res) {
    if (!req.body.username || !req.body.password || !req.body.email) {
        res.json(responseObject(false, 'Required params not set'));
        return;
    }

    var user = schema.User();
    user.email = req.body.email;
    user.yemeksepetiCredentials = {
        username: req.body.username,
        password: req.body.password
    };

    user.save(function(err) {
        var resObject;

        if (err) {
            resObject = responseObject(false, 'Database error ' + err);
        } else {
            resObject = responseObject(true, 'Started watching ' + user.email + ' for joker promotions');
        }

        res.json(resObject);
    });
};

/**
 * GET host:port/watch
 *     email
 *     secret
 */

exports.unwatch = function(req, res) {
    if (!req.query.email || !req.query.secret) {
        res.json(responseObject(false, 'Required params not set'));
        return;
    }

    subscription.checkSubscriptionSecret(req.query.email, req.query.secret, function(isValid) {
        if (isValid) {
            schema.User.remove({email: req.query.email}, function(err) {
                var resObject;

                if (err) {
                    resObject = responseObject(false, 'Database error ' + err);
                } else {
                    resObject = responseObject(true, 'Unwatched ' + req.query.email + ' for joker promotions');
                }

                res.json(resObject);
            });
        } else {
            res.json(responseObject(false, 'Subscription secret invalid'));
        }
    });
};

/*
    Private functions
*/

function responseObject(isSuccess, message) {
    return {status: isSuccess ? 'success' : 'error', message: message};
}