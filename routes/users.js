const express = require('express');
const router = express.Router();
const { getUsers, createUser, getUserById, updateUser, deleteUser } = require('../controllers/userController');

// 模拟数据库
let users = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
// GET /users/:id - 获取单个
router.get('/:id', getUserById).put(updateUser);

// POST /users - 创建用户
router.route('/').get(getUsers).post(createUser);

// DELETE /users/:id - 删除用户
router.delete('/:id', deleteUser);

// 全量更新
router.put('/:id', updateUser);

// 部分更新
router.patch('/:id', updateUser);
// 同一个路由分开写重复书写路径，容易漏改，但是可以单独加中间件
// 链式调用，路径只写一次，集中管理，所有方法共享同一个路径，无法为某个方法单独加中间件（除非在函数内部判断）
// 方式一：在控制器内部判断（不推荐，污染业务逻辑）
// router.route('/:id')
//   .get(getUserById)
//   .delete((req, res, next) => {
//     // 在这里做权限校验，通过后调用 deleteUser
//     if (req.user.role === 'admin') {
//       deleteUser(req, res, next);
//     } else {
//       res.status(403).json({ error: '权限不足' });
//     }
//   });

// // 方式二：分开写（更清晰，推荐）
// router.get('/:id', getUserById);
// router.delete('/:id', authMiddleware, deleteUser); // 单独加中间件
// router.put('/:id', authMiddleware, updateUser);

module.exports = router;