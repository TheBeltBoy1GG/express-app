// src/server.js
import app from './app.js'
import config from './config/index.js'
import logger from './utils/logger.js'
import { closeRedis } from './utils/redis.js';
import { prewarmCache } from './utils/prewarm.js'; // 引入预热函数

const PORT = config.port;
const server = app.listen(PORT, async () => {
  logger.info(`🚀 服务器启动成功`);
  logger.info(`   - 环境: ${config.env}`);
  logger.info(`   - 端口: ${PORT}`);
  logger.info(`   - 访问: http://localhost:${PORT}`);
  logger.info(`   - 健康检查: http://localhost:${PORT}/api/health`);
  try {
    // 触发缓存预热（异步，不阻塞）
    // 使用 setImmediate 或 setTimeout 确保不阻塞事件循环
    setImmediate(() => {
      prewarmCache().catch((err) => {
        // 这里不会执行，因为 prewarmCache 内部已捕获错误，但保留以防万一
        logger.error('[预热] 预热过程发生未捕获错误:', err);
      });
    });
  } catch (error) {
    logger.warn('[预热] 加载失败（不影响服务启动）:', error.message);
  }
});


// 优雅关闭
const gracefulShutdown = async (signal) => {
  logger.info(`收到 ${signal} 信号，正在关闭...`);

  // 关闭 Redis 连接
  await closeRedis();

  server.close(() => {
    logger.info('服务器已关闭');
    process.exit(0);
  });
};


// 优雅关闭
process.on('SIGTERM', gracefulShutdown);

process.on('unhandledRejection', (err) => {
  logger.error('未处理的 Promise Rejection:', err);
  // 生产环境建议退出进程，让 PM2 重启
  if (config.env === 'production') {
    process.exit(1);
  }
});

process.on('uncaughtException', (err) => {
  logger.error('未捕获的异常:', err);
  if (config.env === 'production') {
    process.exit(1);
  }
});