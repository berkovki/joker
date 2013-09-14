
/**
 *  config.js
 *  Application configuration.
 */

 module.exports = {
    defaults: {
        baseURL: 'http://istanbul.yemeksepeti.com/',
        postmarkAPIKey: '',
        email: {
            from: '',
            subject: 'Joker\'iniz hazır!'
        }
    },

    settings: {
        errorTimeout: 2000,
        jokerTimeout: 1500,
        workerCronDate: '*/10 * * * * *'
    },

    urlWithPath: function(path) {
        return this.defaults.baseURL + path;
    }
};