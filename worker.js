
/**
 * worker.js
 * Checks the joker state for each registered user.
 */

var config = require('./config'),
    schema = require('./schema'),
    mail = require('./mail'),
    scraper = require('./scraper'),
    cron = require('cron').CronJob,
    mongoose = require('mongoose'),
    _ = require('underscore'),
    async = require('async');

function Worker() {
    this.job = new cronJob(config.settings.workerCronDate, function(){
        this.batchCheckJoker();
    }, null, true, "Europe/Istanbul");
}

Worker.prototype.batchCheckJoker = function() {
    console.info('Started checking jokers');

    schema.User.find({}, function(err, users) {
        if (err) throw err;

        /*
            Queue the joker check operations.
        */

        var queue = [];
        _.each(users, function(user) {
            var operation = function(callback) {
                console.info('Checking joker info for ' + user.email);
                scraper.checkForJokerDeal(user.yemeksepetiCredentials.username, user.yemeksepetiCredentials.password, function(err, hasJoker) {
                    callback(err, hasJoker ? user.email : null);
                });
            };

            queue.push(operation);
        });

        /*
            Run the queue.
        */

        async.series(queue, function(err, results) {
            if (err) throw err;

            console.info('Finished checking for jokers, got ' + results.length + ' jokers.');

            mail.sendBatchNotification(results, function(err, success) {
                if (err) throw err;
                console.info('Notifications sent to Postmark!');
            });
        });
    });
};

module.exports = Worker;