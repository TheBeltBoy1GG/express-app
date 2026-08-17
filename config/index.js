import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envFile = process.env.NODE_ENV === 'production'? '.env.production' : ".env"
dotenv.config({path:path.join(__dirname, '../../', envFile)})

export default {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,

  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/express_industry_demo',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  log: {
    level: process.env.LOG_LEVEL || 'info',
  },
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || '',
    db: parseInt(process.env.REDIS_DB, 10) || 0,
    keyPrefix: 'myapp:', // 所有 key 的前缀，方便区分
  },
  cache: {
    defaultTTL: 300,           // 默认缓存过期时间（秒）
    maxRetries: 10,            // 获取锁失败最大重试次数
    retryDelay: 50,            // 重试间隔（毫秒）
    timeoutMs: 200,            // 数据获取超时时间（毫秒）
    nullTTL: 60,               // 空值缓存时间（秒）
    lockTTL: 5,                // 分布式锁过期时间（秒）
  },
};