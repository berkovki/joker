
/**
 *  mail.js
 *  Send notification mails to users.
 */

var config = require('./config'),
    subscription = require('./subscription'),
    postmark = require('postmark')(config.defaults.postmarkAPIKey),
    _ = require('underscore'),
    async = require('async');

exports.sendBatchNotification = function(emails, callback) {
    /*
        Getting the subscription secrets is unfortunately async.
    */

    var queue = [];

    _.each(emails, function(email) {
        var operation = function(callback) {
            generateHTMLForEmail(email, function(HTML) {
                var postmarkEmail= {From: config.defaults.email.from,
                                    To: email,
                                    Subject: config.defaults.email.subject,
                                    HtmlBody: HTML};

                callback(null, postmarkEmail);
            });
        };

        queue.push(operation);
    });

    async.series(queue, function(err, batch) {
        postmark.batch(batch, callback);
    });
};

function generateHTMLForEmail(email, callback) {
    subscription.getSubscriptionSecret(email, function(secret) {
        var HTML = "<div style='text-align: center;'><h1>Joker'iniz hazır!</h1><h2><a href='http://yemeksepeti.com'>Yemeksepeti.com</a>'dan Joker kampanyanız var</h2><a href='http://joker.dumenci.me/api/unwatch?email=" + email + "&secret=" + secret + "'>Bu maili bir daha almak istemiyorsanız tıklayınız</a></div>";
        callback(HTML);
    });
}