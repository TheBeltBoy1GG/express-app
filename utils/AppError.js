// utils/AppError.js.js
/**
 * 自定义业务错误类
 * 扩展原生 Error，添加 status 和 code 属性
 */
class AppError extends Error {
  /**
   * @param {string} message - 错误提示（返回给前端）
   * @param {number} statusCode - HTTP 状态码（如 400, 404, 500）
   * @param {number} errorCode - 业务错误码（如 1001, 1002），可选
   * @param {boolean} isOperational - 是否为可预料的业务错误（默认 true）
   */
  constructor(message, statusCode = 500, errorCode = -1, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational; // 用于区分业务错误 vs 编程错误
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError