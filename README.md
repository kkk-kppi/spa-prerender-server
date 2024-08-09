# Prerender

Prerender is a node server that uses Headless Chrome to render HTML, screenshots, PDFs, and HAR files out of any web page. The Prerender server listens for an http request, takes the URL and loads it in Headless Chrome, waits for the page to finish loading by waiting for the network to be idle, and then returns your content.

### Prerender是给SPA爬虫服务的node服务，用于预渲染，可以解决SPA的SEO问题

### 本服务是基于prerender的Node服务 + Nginx转发实现，在原本的SPA应用中，启动一个Prerender服务，然后通过Nginx转发到Prerender服务，实现预渲染

### 需要注意，Prerender服务需要安装Headless Chrome，在Windows下，需要安装chromium，在Linux下，需要安装chrome

### 安装好chrome后，需要在src/index.js中配置chromeLocation，指向chrome的安装路径

### 使用prerender进行预渲染的node服务

### 注意：本项目Node版本需大于16；开发测试使用版本为16.16.0；建议本地和生产的Node版本保持一致（测试npm install时Node版本不为16.16.0，启动服务时报错了！）

#### 安装依赖

```bash
npm install
```

#### 快速启动

```bash
npm run start
```

#### 测试预渲染

```bash
# your_site_full_path：如本地服务的 http://localhost:15512/home
# your_site_full_path：如线上服务的 http://testing:15512/home

# 爬虫触发预渲染
$ curl --user-agent "googlebot" your_site_full_path
# 主动触发预渲染关键字_escaped_fragment_, nginx中配置判断转发
$ curl your_site_full_path?_escaped_fragment_
```

#### 同时，做了简单的缓存处理

```bash
# 安装cache-manager
$ npm install cache-manager

# 配置cache-manager
# 详见 config/cache.js
# 配置编码完成后，在index.js中引入，并在prerender实例中使用
$ const cache = require('./config/cache');
$ prerender.use(cache);

# 配置cache-manager的缓存时间，默认60s（src/cache.js）
# 引入缓存并使用后，此时使用curl测试预渲染，会看到第二次的请求返回非常快
```

#### 为了保证上生产后，服务不会无故停止，可以配置pm2

#### pm2可自动重启服务，可进程守护

```bash
# 首先，应用安装pm2
$ npm install pm2
# 并全局安装pm2
$ npm install -g pm2
# 编写pm2的配置文件，详见

# 配置pm2启动脚本
$ pm2 start ecosystem.config.js
# 如果需要指定环境变量，可在启动脚本中添加环境变量参数
# 如生产环境，则使用production参数
$ pm2 start ecosystem.config.js --env production
# 开发环境，则使用development参数
$ pm2 start ecosystem.config.js --env development
```

#### 配置nginx

```nginx
server {
        listen       15512;
        server_name  localhost;

        #charset koi8-r;

        #access_log  logs/host.access.log  main;

        location / {
            root   html;
            index  index.html index.htm;
            try_files $uri $uri/ /index.html;

            # proxy_set_header Host $http_host;

            # 表示是否需要代理
            set $prerender 0;
            # 预渲染服务的地址
            set $prerender_url "http://127.0.0.1:3000";
            # 请求的全路径 协议+域名+端口+请求路径
            set $request_full_url $scheme://$http_host$request_uri;

            # 判断请求是否来自蜘蛛，如果是则表示需要代理
            if ($http_user_agent ~* "baiduspider|Googlebot|360Spider|Bingbot|Sogou Spider|Yahoo! Slurp China|Yahoo! Slurp|twitterbot|facebookexternalhit|rogerbot|embedly|quora link preview|showyoubot|outbrain|pinterest|slackbot|vkShare|W3C_Validator") {
                set $prerender 1;
            }

            # 若爬虫不可用，则通过判断url包含指定字符去做代理
            # 暂时用于sitemap生成网站模拟爬虫不可用时，携带关键字判断走代理
            if ($args ~ "_escaped_fragment_") {
                set $prerender 1;
            }
        
            # 代理到预渲染服务
            if ($prerender = 1) {
                proxy_pass $prerender_url/$request_full_url;
            }
        }

        # redirect server error pages to the static page /50x.html
        #
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }
    }
```
