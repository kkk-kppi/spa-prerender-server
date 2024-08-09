module.exports = {
  apps: [
    {
      // 应用名称
      name: 'prerender-base',
      // 脚本入口
      script: './src/index.js',
      env: {
				NODE_ENV: 'development',
        // 开发环境缓存时间，30s
				CACHE_TTL: 30,
			},
			env_production: {
				NODE_ENV: 'production',
        // 生产环境缓存时间，60s
				CACHE_TTL: 60
			},
      // 应用实例数
      instances: 1,
      // 是否自动重启
      autorestart: true,
      // 启动时的内存限制
      max_memory_restart: '512M',
      // 重启延时
      restart_delay: 6000,
      // 配置日志文件
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    }
  ]
}