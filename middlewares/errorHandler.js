// middlewares/errorHandler.js
import AppError from '../utils/AppError.js'
import logger from '../utils/logger.js'
import config from '../config/index.js'
/**
 * 全局错误处理中间件
 * 注意：必须有 4 个参数 (err, req, res, next)
 */
const errorHandler = (err, req, res, next) => {
  // 1. 确保 err 是 AppError 实例（如果不是则包装）
  let error = err;
  if (!(error instanceof AppError)) {
    // 对于未知错误（编程错误或第三方库抛出的错误），设置默认值
    const statusCode = error.statusCode || 500;
    const message = error.message || '服务器内部错误';
    error = new AppError(message, statusCode, -1, false);
  }
  // 2. 记录日志
  const logContext = {
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.userId,
  };
  // 3. 记录日志（按级别区分）
  if (error.isOperational) {
    // 业务错误（如参数错误、资源不存在）—— 用 info 级别
    logger.warn(`[业务错误] ${error.message}`, {
      statusCode: error.statusCode,
      errorCode: error.errorCode,
      path: req.originalUrl,
      method: req.method,
      ip: req.ip
    });
  } else {
    // 编程错误或未捕获的异常 —— 用 error 级别，打印完整堆栈
    logger.error(`[系统错误] ${error.stack}`);
    // 可选：接入日志系统（如 Winston）发送告警
  }

  // 4. 准备返回给前端的响应（生产环境隐藏敏感信息）
  const isDevelopment = config.env === 'development';
  const response = {
    code: error.errorCode || -1,
    message: error.message || '服务器内部错误',
    data: null
  };

  // 开发环境下返回堆栈信息（便于调试），生产环境绝不返回
  if (isDevelopment && !error.isOperational) {
    response.stack = error.stack;
  }

  // 如果是 500 且是业务错误（比如数据库异常），统一返回“服务器繁忙”，不暴露底层错误信息
  if (error.statusCode === 500 && !isDevelopment) {
    response.message = '服务器繁忙，请稍后重试';
  }

  // 5. 返回响应
  res.status(error.statusCode || 500).json(response);
};


export default errorHandler;