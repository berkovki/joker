
/**
 *  subscription.js
 *  Handles internal state required for one-click unsubscription links in emails.
 */

var redis = require('redis').createClient(),
    randomString = require('randomstring');

exports.getSubscriptionSecret = function(email, callback) {
    redis.get(email, function(err, secret) {
        if (err) throw err;

        if (!secret) {
            createSubscriptionSecret(email, function(secret) {
                callback(secret);
            });
        } else {
            callback(secret);
        }
    });
};

exports.checkSubscriptionSecret = function(email, providedSecret, callback) {
    redis.get(email, function(err, secret) {
        if (err) throw err;

        callback((providedSecret == secret));
    });
};

/*
    Private functions
*/

function createSubscriptionSecret(email, callback) {
    var secret = randomString.generate();

    redis.set(email, secret, function(err) {
        if (err) throw err;
        callback(secret);
    });
}