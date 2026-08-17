// 进阶组织：app.route() 链式写法
// routes/orders.js
const router = require('express').Router();

// 针对 /orders 路径的 GET 和 POST
router.route('/')
  .get((req, res) => {
    res.json({ message: '获取订单列表' });
  })
  .post((req, res) => {
    res.json({ message: '创建新订单' });
  });

// 针对 /orders/:id 的 GET, PUT, DELETE
router.route('/:id')
  .get((req, res) => {
    res.json({ message: `获取订单 ${req.params.id}` });
  })
  .put((req, res) => {
    res.json({ message: `更新订单 ${req.params.id}` });
  })
  .delete((req, res) => {
    res.json({ message: `删除订单 ${req.params.id}` });
  });
// 路由顺序与 404 兜底（必看！）
// Express 按注册顺序从上到下匹配路由。

// 1. 特殊路由要放在动态路由前面
router.get('/me', (req, res) => res.send('我的信息')); // 匹配 /me
router.get('/:id', (req, res) => res.send(`用户${req.params.id}`)); // 匹配 /123

// router.get('/:id', ...); // 先匹配这个，访问 /me 时会被当作 id='me' 捕获！
// router.get('/me', ...); // 这行永远执行不到
module.exports = router;