# ============ 阶段 1：构建依赖 ============
FROM node:22-alpine AS builder

WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装所有依赖（含 devDependencies）
RUN npm ci

# 复制源码
COPY . .

# ============ 阶段 2：生产运行 ============
FROM node:22-alpine

WORKDIR /app

# 安装生产依赖（只安装 production 依赖）
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# 从 builder 阶段复制源码
COPY --from=builder /app/src ./src
COPY --from=builder /app/.env.example ./.env.example

# 创建日志目录
RUN mkdir -p /app/logs && chown -R node:node /app/logs

# 切换到非 root 用户
USER node

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["node", "src/server.js"]