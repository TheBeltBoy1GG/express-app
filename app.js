import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs'
const app = express();
import helmet from 'helmet'
import cors from 'cors'
import compression from 'compression'
import rateLimit from 'express-rate-limit'

import cookieParser from 'cookie-parser';
import morgan from "morgan"
import { connectDB } from'./config/database.js'

import errorHandler from './middlewares/errorHandler.js'

import logger from './utils/logger.js'

import routes from "./routes/index.js"
// import useTodo from './routes/todos.js';
// import logger from './middlewares/logger/myLogger.js';
// import morganLogger from './middlewares/logger/morganLogger.js';
// import expressLogger from './utils/winstonLogger.js'
// import userRouter from './routes/users.js';

// 确保日志目录存在
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
const morganStream = { write: (msg) => logger.info(msg.trim()) };
app.use(morgan('combined', { stream: morganStream }));

// 数据库连接（在启动前完成）
connectDB();

// 1. 安全类（最先执行）
app.use(helmet());
app.use(cors());

// 2. 压缩（放在静态资源前，节省带宽）
app.use(compression());

// 3. 解析类
// 解析 JSON 请求体 application/json
app.use(express.json());
// 解析 URL-encoded 请求体 application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));       // 表单格式
app.use(cookieParser()); // 解析 Cookie 中间件

// 4. 限流（防爆破）
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter);

// 5. 静态资源（放在后面，因为不需要额外处理）
app.use(express.static('public'));

// 6. 自定义业务中间件
// app.use(expressLogger)

// 7. 路由
// app.use('/users', userRouter); // 所有 /users 开头的请求交给 userRouter
app.use('/api', routes);

// 8. 404 兜底
// 处理路由匹配不到404
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});


// 9. 错误处理中间件（必须放最后！）
// 错误处理中间件
app.use(errorHandler);

export default app