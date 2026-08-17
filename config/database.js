import mongoose from 'mongoose'
import config from './index.js'
import logger from '../utils/logger.js';
let isConnected = false;

export const connectDB = async function () {
    if (isConnected) {
        logger.info('MongoDB 已连接，跳过重复连接');
        return;
    }
    try {
        await mongoose.connect(config.mongodb.uri);
        isConnected = true;
        logger.info(`MongoDB 连接成功: ${config.mongodb.uri}`);
    } catch (error) {
        logger.error(`MongoDB 连接失败: ${error.message}`);
        process.exit(1);
    }
}

// 监听连接事件
mongoose.connection.on('disconnected', () => {
  isConnected = false;
  logger.warn('MongoDB 连接断开');
});