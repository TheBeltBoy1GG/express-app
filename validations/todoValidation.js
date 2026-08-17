// src/validations/todoValidation.js
import {body, param, query} from 'express-validator'

const todoValidation = {
  // 创建 Todo 验证
  create: [
    body('title')
      .notEmpty().withMessage('标题不能为空')
      .isLength({ max: 100 }).withMessage('标题不能超过100个字符')
      .trim(),
    body('description')
      .optional()
      .isLength({ max: 500 }).withMessage('描述不能超过500个字符')
      .trim(),
    body('completed')
      .optional()
      .isBoolean().withMessage('completed 必须为布尔值')
      .toBoolean(),
  ],

  // 更新 Todo 验证
  update: [
    body('title')
      .optional()
      .isLength({ max: 100 }).withMessage('标题不能超过100个字符')
      .trim(),
    body('description')
      .optional()
      .isLength({ max: 500 }).withMessage('描述不能超过500个字符')
      .trim(),
    body('completed')
      .optional()
      .isBoolean().withMessage('completed 必须为布尔值')
      .toBoolean(),
  ],

  // Todo ID 参数验证
  todoIdParam: [
    param('id')
      .isMongoId().withMessage('无效的待办事项ID格式'),
  ],

  // Todo 查询验证
  query: [
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('页码必须为正整数')
      .toInt(),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间')
      .toInt(),
    query('completed')
      .optional()
      .isBoolean().withMessage('completed 必须为布尔值')
      .toBoolean(),
  ],
};

export default todoValidation;