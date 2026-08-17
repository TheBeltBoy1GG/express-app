// middlewares/logger.js
import morgan from 'morgan'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// 1. 定义日志格式（使用 Morgan 的预定义格式或自定义）
// 'combined' 格式：包含 IP、时间、方法、URL、状态码、响应大小、用户代理等
// 'dev' 格式：彩色简洁输出，适合开发环境

// 2. 创建写入流（将日志写入文件，同时保留控制台输出）
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, '../logs/access.log'),
  { flags: 'a' } // 'a' 表示追加写入
);

// 3. 创建 Morgan 中间件
// 参数1：格式（'combined' | 'dev' | 'tiny' | 'common' 或自定义）
// 参数2：配置项（可指定 stream）
const logger = morgan('combined', {
  stream: accessLogStream, // 写入文件
  // 同时控制台也输出（默认 Morgan 会输出到 console）
  // 如果只想写文件，可以设置 skip: (req, res) => process.env.NODE_ENV === 'production'
});

// 如果需要控制台彩色输出，可以使用 'dev' 格式单独输出到控制台
// 我们可以组合两个中间件：一个写文件（combined），一个打控制台（dev）
// 这里导出两个中间件，或者直接导出一个组合的

// 更常见的做法：在 app.js 中直接使用 morgan，此处仅封装

// 导出两个版本
export default {
  // 用于控制台（开发环境）
  consoleLogger: morgan('dev'),
  // 用于文件（生产环境）
  fileLogger: morgan('combined', { stream: accessLogStream })
};