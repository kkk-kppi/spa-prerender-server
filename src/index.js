const prerender = require('prerender')
// 加入缓存模块
const cache = require('./cache')
const server = prerender({
  // 指定chrome浏览器的路径
  chromeLocation: 'C:/Program Files/Google/Chrome/Application/chrome.exe'
})

server.use(prerender.sendPrerenderHeader())
server.use(prerender.browserForceRestart())
server.use(prerender.blockResources())
server.use(prerender.removeScriptTags())
server.use(prerender.httpHeaders())
server.use(cache)

server.start()