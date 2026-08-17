// src/controllers/userController.js
import userService from '../services/userService.js'
import AppError from '../utils/AppError.js'

const userController = {
  // 注册
  register: async (req, res, next) => {
    try {
      const { name, email, password } = req.body;
      const result = await userService.register({ name, email, password });
      res.status(201).json({
        code: 0,
        message: '注册成功',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  // 登录
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const result = await userService.login(email, password);
      res.status(200).json({
        code: 0,
        message: '登录成功',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  // 获取当前用户信息
  getProfile: async (req, res, next) => {
    try {
      const user = await userService.getProfile(req.userId);
      res.status(200).json({
        code: 0,
        message: '获取成功',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  // 更新用户信息
  updateProfile: async (req, res, next) => {
    try {
      const user = await userService.updateProfile(req.userId, req.body);
      res.status(200).json({
        code: 0,
        message: '更新成功',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  // 删除用户
  deleteUser: async (req, res, next) => {
    try {
      await userService.deleteUser(req.userId);
      res.status(200).json({
        code: 0,
        message: '账号已删除',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  },

  // 获取用户列表（管理员）
  getUsers: async (req, res, next) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const result = await userService.getUsers(page, limit);
      res.status(200).json({
        code: 0,
        message: '获取成功',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default userController;