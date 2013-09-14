
/**
 *  mail.js
 *  Send notification mails to users.
 */

var config = require('./config'),
    postmark = require('postmark')(config.defaults.postmarkAPIKey),
    _ = require('underscore');

exports.sendBatchNotification = function(emails, callback) {
    var batch = _.map(emails, function(email) {
        return {
            From: config.email.from,
            To: email,
            Subject: config.email.subject,
            TextBody: 'Joker\'iniz hazır!'
        };
    });

    postmark.batch(batch, callback);
};