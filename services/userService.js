// src/services/userService.js
import AppError from '../utils/AppError.js'
import userRepository from '../repositories/userRepository.js'
import { signToken } from '../utils/jwt.js'

const userService = {
  // 用户注册
  register: async (userData) => {
    const { email } = userData;

    // 检查邮箱是否已存在
      const existingUser = await userRepository.findByEmail(email);
      if (existingUser) {
        throw new AppError('该邮箱已被注册', 409, 1001);
      }
      
      // 创建用户

      const user = await userRepository.create(userData);
      console.log(user)
      // 生成 JWT
      const token = signToken({ id: user._id, email: user.email });
  
      return { user, token };
  },

  // 用户登录
  login: async (email, password) => {
    // 查找用户（包含密码）
    const user = await userRepository.findByEmail(email, true);
    if (!user) {
      throw new AppError('邮箱或密码错误', 401, 1002);
    }

    // 验证密码
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('邮箱或密码错误', 401, 1002);
    }

    // 生成 JWT
    const token = signToken({ id: user._id, email: user.email });

    // 移除密码再返回
    const userObj = user.toJSON();

    return { user: userObj, token };
  },

  // 获取当前用户信息
  getProfile: async (userId) => {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('用户不存在', 404, 1003);
    }
    return user;
  },

  // 更新用户信息
  updateProfile: async (userId, updateData) => {
    // 如果更新邮箱，检查是否被占用
    if (updateData.email) {
      const existingUser = await userRepository.findByEmail(updateData.email);
      if (existingUser && existingUser._id.toString() !== userId) {
        throw new AppError('该邮箱已被其他用户使用', 409, 1004);
      }
    }

    const user = await userRepository.updateById(userId, updateData);
    if (!user) {
      throw new AppError('用户不存在', 404, 1003);
    }
    return user;
  },

  // 删除用户（连带删除其 Todos）
  deleteUser: async (userId) => {
    const user = await userRepository.deleteById(userId);
    if (!user) {
      throw new AppError('用户不存在', 404, 1003);
    }
    // 删除该用户的所有 Todo（调用 todoService 的方法会循环依赖，这里直接使用仓储）
    const todoRepository = require('../repositories/todoRepository');
    await todoRepository.deleteByUserId(userId);
    return user;
  },

  // 获取用户列表（管理员功能）
  getUsers: async (page, limit) => {
    return await userRepository.findAll({}, { page, limit });
  },

  /**
   * 根据邮箱获取用户（用于预热等场景）
   */
  getUserByEmail: async (email) => {
    return await userRepository.findByEmail(email);
  },
};

export default userService;