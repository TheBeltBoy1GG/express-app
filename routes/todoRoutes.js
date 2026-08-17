// src/routes/todoRoutes.js
import express from 'express'
const router = express.Router();
import todoController from '../controllers/todoController.js'
import todoValidation from '../validations/todoValidation.js'
import {validate} from '../middlewares/validate.js'
import auth from '../middlewares/auth.js'

// 所有 Todo 路由都需要鉴权
router.use(auth);

router
  .route('/')
  .get(
    todoValidation.query,
    validate,
    todoController.getTodos
  )
  .post(
    todoValidation.create,
    validate,
    todoController.createTodo
  );

router
  .route('/:id')
  .get(
    todoValidation.todoIdParam,
    validate,
    todoController.getTodoById
  )
  .put(
    todoValidation.todoIdParam,
    todoValidation.update,
    validate,
    todoController.updateTodo
  )
  .delete(
    todoValidation.todoIdParam,
    validate,
    todoController.deleteTodo
  );

export default router;