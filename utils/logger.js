// utils/logger.js.js
import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import config from "../config/index.js"
import path from "path"
import fs from "fs"
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 确保日志目录存在（如果不存在则创建）
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 定义日志格式
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // 添加时间戳[reference:4]
    winston.format.errors({ stack: true }),                      // 捕获错误堆栈[reference:5]
    winston.format.splat(),                                      // 支持字符串插值
    winston.format.json()                                        // 输出为 JSON 格式[reference:6]
);

// 创建 Winston Logger 实例
const logger = winston.createLogger({
    level: config.log.level ,                      // 日志级别，可由环境变量控制[reference:7]
    format: logFormat,
    transports: [
        // --- 生产环境日志文件（按天切割） ---
        new DailyRotateFile({
            filename: 'logs/error-%DATE%.log',
            level: 'error',                                      // 只记录 error 及以上级别[reference:8]
            datePattern: 'YYYY-MM-DD',
            maxFiles: '14d'                                      // 保留14天的日志
        }),
        new DailyRotateFile({
            filename: 'logs/combined-%DATE%.log',                // 记录所有级别的日志[reference:9]
            datePattern: 'YYYY-MM-DD',
            maxFiles: '14d'
        })
    ],
    // --- 处理未捕获的异常 ---
    exceptionHandlers: [
        new DailyRotateFile({
            filename: 'logs/exceptions-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxFiles: '14d'
        })
    ]
});

// --- 非生产环境：额外输出到控制台，便于开发调试 ---
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),                           // 给日志着色[reference:10]
            winston.format.simple()                              // 简单格式输出[reference:11]
        )
    }));
}

export default logger