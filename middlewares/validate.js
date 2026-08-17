// src/middlewares/validate.js
import {validationResult} from 'express-validator'
import AppError from '../utils/AppError.js'

/**
 * 校验结果处理中间件
 * 用于所有验证规则之后，自动检查并返回错误
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // 取出第一个错误信息
    const firstError = errors.array()[0];
    throw new AppError(firstError.msg, 400, 1000);
  }
  next();
};
