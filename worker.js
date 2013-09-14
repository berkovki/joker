
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
    var self = this;

    this.job = new cron(config.settings.workerCronDate, function(){
        self.batchCheckJoker();
    }, null, true, "Europe/Istanbul");
    this.queue = [];
}

Worker.prototype.batchCheckJoker = function() {
    console.info('Started checking jokers');

    var self = this;
    schema.User.find({}, function(err, users) {
        if (err) throw err;

        /*
            Queue the joker check operations.
        */

        _.each(users, function(user) {
            var operation = function(callback) {
                console.info('Checking joker info for ' + user.email);
                scraper.checkForJokerDeal(user.yemeksepetiCredentials.username, user.yemeksepetiCredentials.password, function(err, hasJoker) {
                    callback(err, hasJoker ? user.email : null);
                });
            };

            self.queue.push(operation);
        });

        /*
            Run the queue.
        */

        async.series(self.queue, function(err, results) {
            if (err) throw err;

            results = results.join('').split(''); // Hacky way of getting rid of null objects in the array.

            console.info('Finished checking for jokers, got ' + results.length + ' jokers.');

            if (results.length <= 0) return;

            mail.sendBatchNotification(results, function(err, success) {
                if (err) throw err;
                console.info('Notifications sent to Postmark!');
            });
        });
    });
};

module.exports = function () {
    return new Worker();
}