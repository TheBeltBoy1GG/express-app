// utils/redis.js
import Redis from 'ioredis';
import config from '../config/index.js';
import logger from './logger.js';
// import Redlock from 'redlock'; // 处理多节点redis使用

let redisClient = null;
// 从配置中提取缓存相关默认值
const {
    defaultTTL,
    maxRetries:defaultMaxRetries,
    retryDelay:defaultRetryDelay,
    timeoutMs:defaultTimeoutMs,
} = config.cache;

/**
 * 创建 Redis 连接
 */
export const createRedisClient = () => {
    if (redisClient) return redisClient;

    const { host, port, password, db, keyPrefix } = config.redis;

    redisClient = new Redis({
        host,
        port,
        password: password || undefined,
        db,
        keyPrefix,
        retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            logger.warn(`[Redis] 重连中，第 ${times} 次尝试，延迟 ${delay}ms`);
            return delay;
        },
        maxRetriesPerRequest: 3,
    });

    redisClient.on('connect', () => {
        logger.info(`[Redis] 连接成功: ${host}:${port}`);
    });

    redisClient.on('error', (error) => {
        logger.error(`[Redis] 连接错误: ${error.message}`);
    });

    redisClient.on('close', () => {
        logger.warn('[Redis] 连接关闭');
    });

    return redisClient;
};

/**
 * 获取 Redis 客户端（懒加载）
 */
export const getRedisClient = () => {
    if (!redisClient) {
        return createRedisClient();
    }
    return redisClient;
};

/**
 * 关闭 Redis 连接
 */
export const closeRedis = async () => {
    if (redisClient) {
        await redisClient.quit();
        redisClient = null;
        logger.info('[Redis] 连接已关闭');
    }
};

/**
 * 缓存工具函数
 */
export const cache = {
    /**
     * 获取缓存
     */
    get: async (key) => {
        try {
            const client = getRedisClient();
            const data = await client.get(key);
            if (data) {
                logger.debug(`[Cache] 命中: ${key}`);
                return JSON.parse(data);
            }
            logger.debug(`[Cache] 未命中: ${key}`);
            return null;
        } catch (error) {
            logger.error(`[Cache] 获取失败: ${key}`, { error: error.message });
            return null;
        }
    },

    /**
     * 设置缓存
     * @param {string} key - 缓存键
     * @param {any} value - 缓存值
     * @param {number} ttl - 过期时间（秒），默认 300（5分钟）
     */
    set: async (key, value, ttl = 300) => {
        try {
            const client = getRedisClient();
            const data = JSON.stringify(value);
            await client.set(key, data, 'EX', ttl);
            logger.debug(`[Cache] 写入成功: ${key}, TTL: ${ttl}s`);
            return true;
        } catch (error) {
            logger.error(`[Cache] 写入失败: ${key}`, { error: error.message });
            return false;
        }
    },

    /**
     * 删除缓存
     */
    del: async (key) => {
        try {
            const client = getRedisClient();
            await client.del(key);
            logger.debug(`[Cache] 删除成功: ${key}`);
            return true;
        } catch (error) {
            logger.error(`[Cache] 删除失败: ${key}`, { error: error.message });
            return false;
        }
    },

    /**
     * 按模式删除缓存（使用 SCAN 避免阻塞）
     */
    delByPattern: async (pattern) => {
        try {
            const client = getRedisClient();
            const keys = await client.keys(pattern);
            if (keys.length > 0) {
                await client.del(keys);
                logger.debug(`[Cache] 批量删除: ${keys.length} 个键，模式: ${pattern}`);
            }
            return keys.length;
        } catch (error) {
            logger.error(`[Cache] 批量删除失败: ${pattern}`, { error: error.message });
            return 0;
        }
    },

    /**
     * 获取或设置缓存（通用模式）
     * @param {string} key - 缓存键
     * @param {Function} fetchFn - 获取数据的函数
     * @param {number} ttl - 过期时间（秒）
     */
    // 缓存穿透（Cache Penetration）解决方案：缓存空值（Null Cache）
    getOrSet: async (key, fetchFn, options={}) => {
        const {
            ttl = defaultTTL,
            maxRetries = defaultMaxRetries,
            retryDelay = defaultRetryDelay,
            timeoutMs = defaultTimeoutMs,
        } = options;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {

            // 1. 先查缓存
            const cached = await cache.get(key);
            if (cached !== null) {
                return cached;
            }
            // 2. 尝试获取分布式锁，防止击穿
            const lockKey = `lock:${key}`;
            const client = getRedisClient();

            // 使用 SET NX EX 实现简单锁
            const lockAcquired = await client.set(lockKey, 'locked', 'EX', 5, 'NX');
            if (lockAcquired) {
                try {
                    const data = await withTimeout(
                        fetchFn(),                     // 异步任务
                        timeoutMs,                     // 超时时间（默认 200ms）
                        `获取数据超时 (${timeoutMs}ms)` // 错误信息
                    );

                    // 3. 处理空值和正常值
                    if (data === null || data === undefined) {
                        await cache.set(key, '__NULL__', 60);
                        return null;
                    }
                    await cache.set(key, data, ttl);
                    return data;
                } catch (error) {
                    // 如果超时或 fetchFn 内部报错，记录日志并重新抛出
                    logger.error(`[Cache] fetchFn 执行失败 (key=${key}):`, error.message);
                    throw error; // 向上抛出，由控制器的 catch 捕获处理
                } finally {
                    // 无论成功还是失败（包括超时），都必须释放锁！
                    await client.del(lockKey);
                }
            }
            // 4. 没拿到锁，等待后重试
            if (attempt < maxRetries) {
                logger.debug(`[Cache] 获取锁失败，${retryDelay}ms 后重试 (${attempt + 1}/${maxRetries})`);
                await sleep(retryDelay);
            }

        }
        // 5. 降级：直接查 DB（不加锁，不写缓存）
        logger.warn(`[Cache] 获取锁超时，降级查 DB: ${key}`);
        return await fetchFn();
    },
};

/**
 * 带超时的 Promise 包装器
 * @param {Promise} promise - 要执行的异步任务
 * @param {number} timeoutMs - 超时时间（毫秒）
 * @param {string} errorMsg - 自定义错误信息
 */
const withTimeout = (promise, timeoutMs = 200, errorMsg = '操作超时') => {
    const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(errorMsg)), timeoutMs)
    );
    return Promise.race([promise, timeout]);
};

export default cache;