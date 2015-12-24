var client = require('extrade-cz-api');
var express = require('express');
var cache = require('./cache');
var Q = require('q');
var _ = require('lodash');

var router = express.Router();

var filter = function (result, query) {
    query = query || '';
    var regex = new RegExp('^(.*)(' + query + ')(.*)$', 'i');
    var result = _.pick(result, function(value, key) {
      return regex.test(key) || regex.test(value);
    });
    return result;
};

var respond = function(req, res, promise) {
  promise
    .then(function(result) {
      res.jsonp(result);
    })
    .fail(function(ex) {
      res.status(500).send(ex);
      console.error(ex); // prints to the error on the stdout
    })
    .done();
}

router.get('/data', function(req, res) {
  var criteria = _.cloneDeep(req.query);
  criteria.countries = criteria.countries || []; // in case of not defined countries in request
  respond(req, res, client.getStats(criteria));
})

router.get('/products-preload', function(req, res) {
  respond(req, res, cache.get('products', client.getProducts).then(function(results) {return Object.keys(results).length;}));
})

router.get('/products', function(req, res) {
  var promise = cache.get('products', client.getProducts)
    .then(function(results){
      return filter(results, req.query.q);
    })
  respond(req, res, promise);
})

router.get('/countries', function(req, res) {
  var promise = cache.get('countries', client.getCountries)
    .then(function(results){
      return filter(results, req.query.q);
    })
  respond(req, res, promise);
})

router.get('/last-date', function(req, res) {
  respond(req, res, cache.get('last-date', client.getLastDate));
})

module.exports = router;
