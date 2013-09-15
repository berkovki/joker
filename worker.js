
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
    async = require('async'),
    colors = require('colors');

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
        console.log(('Got ' + users.length + ' users').yellow);

        if (err) throw err;

        /*
            Queue the joker check operations.
        */

        _.each(users, function(user) {
            var operation = function(callback) {
                console.info(('Checking joker info for ' + user.email).white);
                scraper.checkForJokerDeal(user.yemeksepetiCredentials.username, user.yemeksepetiCredentials.password, function(err, hasJoker) {
                    var log = 'Checked joker deal : ' + hasJoker + ' for user ' + user.email;
                    console.log(hasJoker ? log.green : log.red);

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

            var cleanedResults = [];
            _.each(results, function(result) {
                if (result) cleanedResults.push(result);
            });

            console.info(('Finished checking for jokers, got ' + cleanedResults.length + ' jokers.').green);

            if (cleanedResults.length <= 0) return;

            mail.sendBatchNotification(cleanedResults, function(err, success) {
                if (err) throw err;
                console.info(('Notifications sent to Postmark!').blue);
            });

            self.queue.length = 0; // Clear the operation queue.
        });
    });
};

module.exports = function () {
    return new Worker();
}