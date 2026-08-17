// src/middlewares/auth.js
import AppError from '../utils/AppError.js'
import {verifyToken} from '../utils/jwt.js'
import userRepository from '../repositories/userRepository.js'

/**
 * JWT 鉴权中间件
 * 验证请求头中的 Authorization: Bearer <token>
 * 验证通过后将用户信息挂载到 req.user
 */
const auth = async (req, res, next) => {
  try {
    // 1. 获取 Authorization 头
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('请先登录', 401, 4001);
    }

    // 2. 提取 token
    const token = authHeader.split(' ')[1];

    // 3. 验证 token
    const decoded = verifyToken(token);
    if (!decoded) {
      throw new AppError('登录凭证无效或已过期，请重新登录', 401, 4002);
    }

    // 4. 检查用户是否还存在
    const user = await userRepository.findById(decoded.id);
    if (!user) {
      throw new AppError('用户不存在，请重新登录', 401, 4003);
    }

    // 5. 挂载用户信息到 req（后续路由可以直接使用 req.user）
    req.user = user;
    req.userId = user._id.toString();

    next();
  } catch (error) {
    next(error);
  }
};

export default auth