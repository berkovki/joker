
/**
 *  scraper.js
 *  Interfaces with Yemeksepeti.com.
 */

var config = require('./config');

/*
    Yemeksepeti related
 */

exports.checkForJokerDeal = function(username, password, callback) {
    login(username, password, function(success, page) {
        if (success) {
            /*
                Wait for #JOKER_TIMEOUT to check if the joker div exists, because the joker div is filled with an AJAX call in the web page.
            */

            setTimeout(function() {
                page.evaluate(function() {
                    var jokerEl = document.getElementById('UyariPopUpJokerHtml');
                    return (jokerEl.innerHTML && jokerEl.innerHTML.length > 0) ? true : false;
                }, function(hasJoker) {
                    callback(null, hasJoker);
                });
            }, config.settings.jokerTimeout);
        } else {
            callback(new Error("Invalid login credentials"));
        }
    });
};

function login(username, password, callback) {
    phantom(function(phantom) {
        phantom.clearCookies(); // Creating a new Phantom instance isn't cheap, but clearing cookies is!

        ph.createPage(function(page) {
            page.open(config.urlWithPath('AnonymouseDefault.aspx'), function(status) {
                /*
                    Set the load started callback before trying to log in.
                    If the page tries to load after we submit the login form, it means that the login succeeded.

                    But we call the function callback when the page finishes the load, since we don't want to return a half-baked page.
                */

                page.set('onLoadStarted', function(success) {
                    clearTimeout(errorTimer);
                });

                page.set('onLoadFinished', function(success) {
                    callback(true, page);
                });

                /*
                    Fill in the appropriate fields, submit the login form.
                */

                page.evaluate(function(username, password) {
                    var usernameField = document.getElementById('ctl00_ctl00_SmallBasket_Login1_Login1_LoginForm_UserName');
                    var passwordField = document.getElementById('ctl00_ctl00_SmallBasket_Login1_Login1_LoginForm_Password');

                    usernameField.value = username;
                    passwordField.value = password;

                    __doPostBack('ctl00$ctl00$SmallBasket$Login1$Login1$LoginForm$Button1'); // Invoke login handler, Yemeksepeti wat
                }, null, username, password);

                /*
                    If the page doesn't load anything after we submitted the form, and it's been #ERROR_TIMEOUT seconds, check if the login failure div is in the DOM tree.
                */

                var errorTimer = setTimeout(function() {
                    page.evaluate(function() {
                        return document.getElementById('AlertDiv') ? true : false;
                    }, function(errored) {
                        if (errored) {
                            callback(false, page);
                        }
                    });
                }, config.settings.errorTimeout);
            });
        });
    });
}

/*
    Phantom.js related
 */

var ph;
function phantom(callback) {
    if (ph) callback(ph);

    else {
        require('phantom').create('--load-images=no', function(phantom) { // No images, yes speed.
            ph = phantom;
            callback(ph);
        });
    }
}