// src/routes/index.js
import express from 'express'
const router = express.Router();
import userRoutes from './userRoutes.js'
import todoRoutes from './todoRoutes.js'

// API 版本前缀（便于后续升级）
router.use('/users', userRoutes);
router.use('/todos', todoRoutes);

// 健康检查
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default router;