// utils/prewarm.js
import logger from './logger.js';
import userRepository from '../repositories/userRepository.js';
import config from '../config/index.js';
import pLimit from 'p-limit';
// 🔥 缓存预热（Cache Pre-warming）系统刚启动或发布时，缓存是空的。此时大量用户涌入，所有请求穿透缓存，瞬间压垮 DB。

/**
 * 缓存预热主入口
 * 可在服务启动时调用，异步执行，不阻塞启动流程
 */
export async function prewarmCache() {
  logger.info('[预热] 开始缓存预热...');

  try {
      if(config.env==='development'){
        // 策略一：预热固定管理员（可选）
        // await prewarmAdmin(); 
    }else{
        // 策略二：预热最近活跃用户（推荐）
        await prewarmActiveUsers(3); // 预热 3 个活跃用户
    }
    await prewarmActiveUsers(3); // 预热 3 个活跃用户

    logger.info('[预热] 缓存预热完成');
  } catch (error) {
    // 预热失败只记录警告，不抛出异常（不影响服务启动）
    logger.warn('[预热] 缓存预热出现错误（不影响服务运行）:', error.message);
  }
}

/**
 * 预热指定管理员（如有固定管理员账号）
 */
async function prewarmAdmin() {
  try {
    const adminEmail = 'admin@example.com';
    // 注意：这里需要 userService.getUserByEmail，若未实现可先用 repository
    const userService = (await import('../services/userService.js')).default; // 动态导入避免循环依赖
    const adminUser = await userService.getUserByEmail({ email: adminEmail });

    if (!adminUser) {
      logger.warn('[预热] 未找到管理员账号，跳过管理员预热');
      return;
    }
    const todoService = (await import('../services/todoService.js')).default // 动态导入避免循环依赖
    await todoService.getTodos(adminUser._id.toString(), { page: 1, limit: 10 });
    logger.info(`[预热] 管理员 ${adminEmail} 的待办列表已缓存`);
  } catch (error) {
    logger.error('[预热] 管理员预热失败:', error.message);
  }
}

/**
 * 预热最近活跃的 N 个用户
 * @param {number} count - 预热用户数量
 */
async function prewarmActiveUsers(count = 5) {
  const users = await userRepository.findRecentlyActive(count);

  if (!users || users.length === 0) {
    logger.warn('[预热] 没有找到活跃用户，跳过活跃用户预热');
    return;
  }

  logger.info(`[预热] 找到 ${users.length} 个活跃用户，开始预热待办列表...`);

  // 并行预热每个用户的待办列表（注意控制并发，此处使用 Promise.all）
  // 若用户过多，可使用 p-limit 控制并发数，这里简单处理
  const todoService = (await import('../services/todoService.js')).default // 动态导入避免循环依赖
  const limit = pLimit(3); // 同时最多 3 个并发
  const prewarmPromises = users.map((user) => {
    limit(() => todoService.getTodos(user._id.toString(), { page: 1, limit: 10 }))
  });

  await Promise.all(prewarmPromises);
  logger.info(`[预热] 活跃用户预热完成`);
}