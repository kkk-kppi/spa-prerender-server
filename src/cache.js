var cacheManager = require("cache-manager");
cacheManager.createCache

module.exports = {
  init: function () {
    this.cache = cacheManager.caching({
      store: "memory",
      max: process.env.CACHE_MAXSIZE || 100,
      // 60s缓存
      ttl: process.env.CACHE_TTL || 60 /*seconds*/,
    });
    console.log(`🛒 Cache init in prerender`)
  },

  requestReceived: function (req, res, next) {
    this.cache.get(req.prerender.url, function (err, result) {
      if (!err && result) {
        console.log(`⚡️ Return Cache: ${req.prerender.url}`);
        req.prerender.cacheHit = true;
        res.send(200, result);
      } else {
        next();
      }
    });
  },

  beforeSend: function (req, res, next) {
    if (!req.prerender.cacheHit && req.prerender.statusCode == 200) {
      console.log(`🎉 Cache Hit: ${req.prerender.url}`)
      this.cache.set(req.prerender.url, req.prerender.content);
    }
    next();
  },
};
