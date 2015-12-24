var cache = require('memory-cache')
var Q = require('q')

var getOrLoad = function (key, loadPromise, time) {
  var data = cache.get(key)
  if (data !== null) {
    return Q.resolve(data)
  } else {
    return Q(loadPromise())
      .then(function (data) {
        cache.put(key, data, time || 12 * 60 * 60 * 1000) // defaults to 12 hours cache timeout
        return Q.resolve(data)
      })
  }
}

module.exports = {
  get:getOrLoad,
  clear:cache.clear
}
