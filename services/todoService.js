// src/services/todoService.js
import AppError from '../utils/AppError.js'
import todoRepository from '../repositories/todoRepository.js'
import cache from '../utils/redis.js';
import logger from '../utils/logger.js';

// 数据一致性（Data Consistency）

import { setTimeout } from 'timers/promises'; // Node.js 原生支持

// 缓存 TTL（秒）
// 缓存雪崩（Cache Avalanche）缓存中大量 Key 在同一时间过期，导致请求瞬间全部打到 DB。
const CACHE_TTL = {
  // 列表缓存：基准 60 秒 + 随机 0~30 秒，避免同时失效
  TODOS_LIST: () => 60 + Math.floor(Math.random() * 30),      // 列表缓存 1 分钟
  // 详情缓存：基准 300 秒 + 随机 0~60 秒
  TODOS_DETAIL: () => 300 + Math.floor(Math.random() * 60),   // 详情缓存 5 分钟
};
// 生成缓存键
const getTodosCacheKey = (userId, options) => {
  const { page = 1, limit = 10, completed } = options;
  return `todos:user:${userId}:page:${page}:limit:${limit}:completed:${completed || 'all'}`;
};

const getTodoDetailCacheKey = (userId, todoId) => {
  return `todos:detail:${userId}:${todoId}`;
};

const todoService = {

  // 获取用户的 Todo 列表（热门接口，加缓存）
  getTodos: async (userId, options) => {
    // 生成缓存键
    const cacheKey = getTodosCacheKey(userId, options);

    // 使用 cache.getOrSet 模式
    const result = await cache.getOrSet(
      cacheKey,
      async () => {
        logger.debug(`[TodoService] 缓存未命中，查询数据库: ${cacheKey}`);
        return await todoRepository.findByUserId(userId, options);
      },
      {
        ttl:CACHE_TTL.TODOS_LIST()
      }
    );

    return result;
  },

  // 获取单个 Todo（加缓存）
  getTodoById: async (userId, todoId) => {
    const cacheKey = getTodoDetailCacheKey(userId, todoId);

    const todo = await cache.getOrSet(
      cacheKey,
      async () => {
        logger.debug(`[TodoService] 缓存未命中，查询数据库: ${cacheKey}`);
        const todo = await todoRepository.findById(todoId);
        if (!todo) {
          throw new AppError('待办事项不存在', 404, 2001);
        }
        // 验证所有权
        if (todo.user.toString() !== userId) {
          throw new AppError('无权限访问该待办事项', 403, 2002);
        }
        return todo;
      },
      {
        ttl:CACHE_TTL.TODOS_DETAIL()
      }
    );

    return todo;
  },


  // 创建 Todo
  create: async (userId, todoData) => {
    const todo = await todoRepository.create({
      ...todoData,
      user: userId,
    });

    // 清除该用户的列表缓存
    await cache.delByPattern(`todos:user:${userId}:*`);
    logger.info(`[TodoService] 创建 Todo，清除用户 ${userId} 的列表缓存`);

    return todo;
  },

  // 更新 Todo
  // 进阶加固方案：延迟双删（Delay Double Delete）在执行更新后，稍微延迟（几百毫秒）再删一次缓存，确保并发读请求留下的脏数据被清掉。
  updateTodo: async (userId, todoId, updateData) => {
    // 1. 先删除缓存（第一次删）
    await cache.del(getTodoDetailCacheKey(userId, todoId));
    await cache.delByPattern(`todos:user:${userId}:*`);

    // 2. 更新数据库
    const todo = await todoRepository.updateById(todoId, updateData);

    // 3. 延迟 500ms 后再删一次（第二次删），清除并发读造成的脏缓存
    await setTimeout(500);
    await cache.del(getTodoDetailCacheKey(userId, todoId));
    await cache.delByPattern(`todos:user:${userId}:*`);

    logger.info(`[TodoService] 更新 Todo ${todoId}，清除相关缓存`);

    return todo;
  },

  // 删除 Todo
  deleteTodo: async (userId, todoId) => {
    await todoService.getTodoById(userId, todoId);

    const todo = await todoRepository.deleteById(todoId);
    if (!todo) {
      throw new AppError('待办事项不存在', 404, 2001);
    }

    // 清除该详情的缓存
    await cache.del(getTodoDetailCacheKey(userId, todoId));
    // 清除该用户的列表缓存
    await cache.delByPattern(`todos:user:${userId}:*`);
    logger.info(`[TodoService] 删除 Todo ${todoId}，清除相关缓存`);

    return todo;
  },
};

export default todoService;