// src/repositories/userRepository.js
import User from '../models/UserModel.js';
import logger from '../utils/logger.js';

const userRepository = {
  // 创建用户
  create: async (userData) => {
    try {
      logger.debug(`[userRepository.create] 创建用户: ${userData.email}`);
      const user = await User.create(userData);
      logger.debug(`[userRepository.create] 用户创建成功: ${user._id}`);
      return user
    } catch (error) {
      logger.error(`[userRepository.create] 创建用户失败: ${error.message}`, {
        stack: error.stack,
        email: userData?.email,
      });
      throw error;  // ✅ 必须重新抛出，让上层捕获
    }
  },

  // 通过 ID 查找（排除密码）
  findById: async (id) => {
    try {
      logger.debug(`[userRepository.findById] 查询用户: ${id}`);
      const user = await User.findById(id).select('-password');
      if (!user) {
        logger.warn(`[userRepository.findById] 用户不存在: ${id}`);
      }
      return user;
    } catch (error) {
      logger.error(`[userRepository.findById] 查询失败: ${error.message}`, {
        stack: error.stack,
        id,
      });
      throw error;
    }
  },

  // 通过邮箱查找（包含密码，用于登录验证）
  findByEmail: async (email, includePassword = false) => {
    try {
      logger.debug(`[userRepository.findByEmail] 查询邮箱: ${email}`);
      const query = User.findOne({ email });
      if (!includePassword) {
        return query.select('-password');
      }
      return query.select('+password');
    } catch (error) {
      logger.error(`[userRepository.findByEmail] 查询失败: ${error.message}`, {
        stack: error.stack,
        email,
      });
      throw error;  // 重新抛出
    }
  },

  // 通过 ID 更新
  updateById: async (id, updateData) => {
     try {
      logger.debug(`[userRepository.updateById] 更新用户: ${id}`);
      const user = await User.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      }).select('-password');
      if (!user) {
        logger.warn(`[userRepository.updateById] 用户不存在: ${id}`);
      }
      return user;
    } catch (error) {
      logger.error(`[userRepository.updateById] 更新失败: ${error.message}`, {
        stack: error.stack,
        id,
        updateData,
      });
      throw error;
    }
  },

  // 删除用户
  deleteById: async (id) => {
    try {
      logger.debug(`[userRepository.deleteById] 删除用户: ${id}`);
      const user = await User.findByIdAndDelete(id);
      if (!user) {
        logger.warn(`[userRepository.deleteById] 用户不存在: ${id}`);
      }
      return user;
    } catch (error) {
      logger.error(`[userRepository.deleteById] 删除失败: ${error.message}`, {
        stack: error.stack,
        id,
      });
      throw error;
    }
  },

  // 获取用户列表（分页）
  findAll: async (filter = {}, options = {}) => {
    const { page = 1, limit = 10, sort = '-createdAt' } = options;
    const skip = (page - 1) * limit;

    try {
      logger.debug(`[userRepository.findAll] 查询用户列表: page=${page}, limit=${limit}`);
      const [data, total] = await Promise.all([
        User.find(filter).sort(sort).skip(skip).limit(limit).select('-password'),
        User.countDocuments(filter),
      ]);
      logger.debug(`[userRepository.findAll] 查询成功: 共 ${total} 条，返回 ${data.length} 条`);
      return { data, total, page: parseInt(page), limit: parseInt(limit) };
    } catch (error) {
      logger.error(`[userRepository.findAll] 查询失败: ${error.message}`, {
        stack: error.stack,
        filter,
        options,
      });
      throw error;
    }
  },

  /**
   * 获取最近活跃的用户（用于缓存预热）
   * @param {number} limit - 获取数量
   * @returns {Promise<Array>} 用户数组（只包含 _id 和 email）
   */
  findRecentlyActive: async (limit = 5) => {
    try {
      // 假设 User 模型有 lastLoginAt 字段，按此排序
      // 如果没有，可改为 updatedAt 或 createdAt
      return await User.find()
        .sort({ lastLoginAt: -1, updatedAt: -1 }) // 优先按最近登录排序
        .limit(limit)
        .select('_id email name');
    } catch (error) {
      logger.error(`[userRepository.findRecentlyActive] 查询失败: ${error.message}`);
      throw error;
    }
  },
};

export default userRepository;