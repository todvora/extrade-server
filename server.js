var express = require('express');
var path = require('path');
var fs = require('fs');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var api = require('./lib/api');
var Q = require('q');

var app = express();

var ip = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
var port = process.env.OPENSHIFT_NODEJS_PORT || 5000;

app.set('port', port);

app.listen(app.get('port'),ip, function() {
  console.log('%s: Node server started on %s:%d ...', Date(Date.now() ), ip, port);
});

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1/', api);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  var status = err.status || 500;
  res.status(status);
  Q.nfcall(fs.readFile, path.join(__dirname, 'public', 'error.html'), 'utf-8')
    .then(function(text) {
      res.write(text
        .replace('{statusCode}', status)
        .replace('{message}', err.message || '')
      );
      res.end();
    })
});

module.exports = app;
