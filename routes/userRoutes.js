// src/routes/userRoutes.js
import express from 'express'
const router = express.Router();
import userController from '../controllers/userController.js'
import userValidation from '../validations/userValidation.js'
import {validate} from '../middlewares/validate.js'
import auth from '../middlewares/auth.js'


// 公开路由
router.post(
  '/register',
  userValidation.register,
  validate,
  userController.register
);

router.post(
  '/login',
  userValidation.login,
  validate,
  userController.login
);

// 需要鉴权的路由
router.use(auth); // 以下所有路由都需要登录

router.get(
  '/profile',
  userController.getProfile
);

router.put(
  '/profile',
  userValidation.updateProfile,
  validate,
  userController.updateProfile
);

router.delete(
  '/profile',
  userController.deleteUser
);

// 管理员功能（获取用户列表）
router.get(
  '/',
  userValidation.pagination,
  validate,
  userController.getUsers
);

export default router;