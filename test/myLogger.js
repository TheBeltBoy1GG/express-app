import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, '../logs/access.log'),
  { flags: 'a' } // 'a' 表示追加写入
);

/**
 * 自定义日志中间件
 * 记录：请求方法、URL、状态码、响应时间、IP、用户代理
 */
const logger = (req, res, next) => {
    const start = Date.now();
    const originalEnd = res.end;

    res.end = function (chunk, encoding) {
        // 恢复原始 end 方法，避免递归
        res.end = originalEnd;
        // 计算响应时间（毫秒）
        const responseTime = Date.now() - start;
        // 获取客户端 IP（注意：如果经过代理，需取 X-Forwarded-For）
        const ip = req.get('X-Forwarded-For') || req.socket.remoteAddress;

        // 构造日志信息
        const logEntry = {
            timestamp: new Date().toISOString(),
            method: req.method,
            url: req.originalUrl || req.url,
            status: res.statusCode,
            responseTime: `${responseTime}ms`,
            ip: ip,
            userAgent: req.get('user-agent') || '-'
        };
        // 打印到控制台（彩色输出更易读）
        const logColor = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m'; // 红色错误，绿色成功
        console.log(
            `${logColor}[${logEntry.timestamp}] ${logEntry.method} ${logEntry.url} ${logEntry.status} - ${logEntry.responseTime} ${logEntry.ip}\x1b[0m`
        );

        // 可选：写入日志文件（生产环境建议使用 winston/pino，此处仅示例）
        // fs.appendFileSync(path.join(__dirname, '../logs/access.log'), JSON.stringify(logEntry) + '\n');
        // 调用原始的 end 方法，让响应真正结束
        // accessLogStream.write(JSON.stringify(logEntry) + '\n');
        originalEnd.call(this, chunk, encoding);
    }
    next();
}
export default logger;