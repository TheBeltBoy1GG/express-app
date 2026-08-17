// repositories/todoRepository.js
import Todo from '../models/TodoModel.js';
import logger from '../utils/logger.js';

const todoRepository = {
  create: async (todoData) => {
    try {
      logger.debug(`[todoRepository.create] 创建 Todo: ${todoData.title}`);
      return await Todo.create(todoData);
    } catch (error) {
      logger.error(`[todoRepository.create] 创建失败: ${error.message}`, {
        stack: error.stack,
        todoData,
      });
      throw error;
    }
  },

  findById: async (id) => {
    try {
      logger.debug(`[todoRepository.findById] 查询 Todo: ${id}`);
      const todo = await Todo.findById(id);
      if (!todo) {
        logger.warn(`[todoRepository.findById] Todo 不存在: ${id}`);
      }
      return todo;
    } catch (error) {
      logger.error(`[todoRepository.findById] 查询失败: ${error.message}`, {
        stack: error.stack,
        id,
      });
      throw error;
    }
  },

  findByUserId: async (userId, options = {}) => {
    const { page = 1, limit = 10, sort = '-createdAt', completed } = options;
    const skip = (page - 1) * limit;
    const filter = { user: userId };

    if (completed !== undefined) {
      filter.completed = completed === 'true' || completed === true;
    }

    try {
      logger.debug(`[todoRepository.findByUserId] 查询用户 Todo: ${userId}`);
      const [data, total] = await Promise.all([
        Todo.find(filter).sort(sort).skip(skip).limit(limit),
        Todo.countDocuments(filter),
      ]);
      logger.debug(`[todoRepository.findByUserId] 查询成功: 共 ${total} 条`);
      return { data, total, page: parseInt(page), limit: parseInt(limit) };
    } catch (error) {
      logger.error(`[todoRepository.findByUserId] 查询失败: ${error.message}`, {
        stack: error.stack,
        userId,
        options,
      });
      throw error;
    }
  },

  updateById: async (id, updateData) => {
    try {
      logger.debug(`[todoRepository.updateById] 更新 Todo: ${id}`);
      const todo = await Todo.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });
      if (!todo) {
        logger.warn(`[todoRepository.updateById] Todo 不存在: ${id}`);
      }
      return todo;
    } catch (error) {
      logger.error(`[todoRepository.updateById] 更新失败: ${error.message}`, {
        stack: error.stack,
        id,
        updateData,
      });
      throw error;
    }
  },

  deleteById: async (id) => {
    try {
      logger.debug(`[todoRepository.deleteById] 删除 Todo: ${id}`);
      const todo = await Todo.findByIdAndDelete(id);
      if (!todo) {
        logger.warn(`[todoRepository.deleteById] Todo 不存在: ${id}`);
      }
      return todo;
    } catch (error) {
      logger.error(`[todoRepository.deleteById] 删除失败: ${error.message}`, {
        stack: error.stack,
        id,
      });
      throw error;
    }
  },

  deleteByUserId: async (userId) => {
    try {
      logger.debug(`[todoRepository.deleteByUserId] 删除用户所有 Todo: ${userId}`);
      const result = await Todo.deleteMany({ user: userId });
      logger.debug(`[todoRepository.deleteByUserId] 删除了 ${result.deletedCount} 条`);
      return result;
    } catch (error) {
      logger.error(`[todoRepository.deleteByUserId] 删除失败: ${error.message}`, {
        stack: error.stack,
        userId,
      });
      throw error;
    }
  },
};

export default todoRepository;