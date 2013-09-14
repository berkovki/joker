
/**
 * app.js
 * Bootstraps & runs Joker.
 *
 * Joker
 * Mert Dümenci 2013
 * MIT License
 */

var express = require('express'),
    api = require('./routes/api'),
    frontend = require('./routes/frontend'),
    subscription = require('./subscription'),
    http = require('http'),
    path = require('path'),
    mongoose = require('mongoose');

var app = express(),
    worker = require('./worker')();

worker.batchCheckJoker();

mongoose.connect('mongodb://localhost/joker');

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('check interval', 5); // In minutes
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.compress());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.static(path.join(__dirname, 'bower_components')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

/*
 *  Routes
 *  API routes for the device registration process.
 */

app.post('/api/watch', api.watch);
app.get('/api/unwatch', api.unwatch);

/*
 *  Frontend routes for easy registration.
 */

app.get('/', frontend.index);

http.createServer(app).listen(app.get('port'), function() {
  console.log("Joker listening on port " + app.get('port'));
});
