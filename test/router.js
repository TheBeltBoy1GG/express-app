// 查询列表	GET / users	获取所有用户
// 查询单个	GET / users / 123	获取 ID 为 123 的用户
// 创建	    POST / users	新增一个用户
// 全量更新	PUT / users / 123	替换 ID 为 123 的用户
// 部分更新	PATCH / users / 123	修改 ID 为 123 的用户的部分字段
// 删除	    DELETE / users / 123	删除 ID 为 123 的用户
// 关键约定：URL 使用复数名词（/users 而不是 /user），统一小写，多个单词用连字符（/order-items）。
const express = require('express');
const router = express.Router();

// 模拟数据库
let users = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
// GET /users - 获取列表
router.get('/', (req, res) => {
  res.json(users);
});

// GET /users/:id - 获取单个
router.get('/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: '用户不存在' });
  res.json(user);
});

// POST /users - 创建用户
router.post('/', (req, res) => {
  const newUser = { id: users.length + 1, name: req.body.name };
  users.push(newUser);
  res.status(201).json(newUser);
});

// DELETE /users/:id - 删除用户
router.delete('/:id', (req, res) => {
  users = users.filter(u => u.id !== parseInt(req.params.id));
  res.status(204).send(); // 204 No Content 表示删除成功无返回体
});

module.exports = router; // 导出这个模块