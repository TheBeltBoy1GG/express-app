// src/validations/userValidation.js
import {body, param, query} from 'express-validator'

const userValidation = {
  // 注册验证
  register: [
    body('name')
      .notEmpty().withMessage('姓名不能为空')
      .isLength({ max: 50 }).withMessage('姓名不能超过50个字符')
      .trim(),
    body('email')
      .notEmpty().withMessage('邮箱不能为空')
      .isEmail().withMessage('邮箱格式不正确')
      .normalizeEmail(),
    body('password')
      .notEmpty().withMessage('密码不能为空')
      .isLength({ min: 6 }).withMessage('密码至少6位'),
  ],

  // 登录验证
  login: [
    body('email')
      .notEmpty().withMessage('邮箱不能为空')
      .isEmail().withMessage('邮箱格式不正确')
      .normalizeEmail(),
    body('password')
      .notEmpty().withMessage('密码不能为空'),
  ],

  // 更新用户资料
  updateProfile: [
    body('name')
      .optional()
      .isLength({ max: 50 }).withMessage('姓名不能超过50个字符')
      .trim(),
    body('email')
      .optional()
      .isEmail().withMessage('邮箱格式不正确')
      .normalizeEmail(),
  ],

  // 用户ID参数验证
  userIdParam: [
    param('id')
      .isMongoId().withMessage('无效的用户ID格式'),
  ],

  // 分页查询验证
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('页码必须为正整数')
      .toInt(),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间')
      .toInt(),
  ],
};

export default userValidation;