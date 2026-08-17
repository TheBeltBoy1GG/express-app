// src/controllers/todoController.js
import todoService from '../services/todoService.js'

const todoController = {
  // 获取 Todo 列表
  getTodos: async (req, res, next) => {
    try {
      const { page = 1, limit = 10, completed } = req.query;
      const result = await todoService.getTodos(req.userId, {
        page,
        limit,
        completed,
      });
      res.status(200).json({
        code: 0,
        message: '获取成功',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  // 获取单个 Todo
  getTodoById: async (req, res, next) => {
    try {
      const todo = await todoService.getTodoById(req.userId, req.params.id);
      res.status(200).json({
        code: 0,
        message: '获取成功',
        data: todo,
      });
    } catch (error) {
      next(error);
    }
  },

  // 创建 Todo
  createTodo: async (req, res, next) => {
    try {
      const todo = await todoService.create(req.userId, req.body);
      res.status(201).json({
        code: 0,
        message: '创建成功',
        data: todo,
      });
    } catch (error) {
      next(error);
    }
  },

  // 更新 Todo
  updateTodo: async (req, res, next) => {
    try {
      const todo = await todoService.updateTodo(req.userId, req.params.id, req.body);
      res.status(200).json({
        code: 0,
        message: '更新成功',
        data: todo,
      });
    } catch (error) {
      next(error);
    }
  },

  // 删除 Todo
  deleteTodo: async (req, res, next) => {
    try {
      await todoService.deleteTodo(req.userId, req.params.id);
      res.status(200).json({
        code: 0,
        message: '删除成功',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default todoController;