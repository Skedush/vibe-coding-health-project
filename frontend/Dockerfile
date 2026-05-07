# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

# 接收构建参数
ARG VITE_API_BASE_URL

# 设置环境变量（Vite 需要在 install 和 build 时都能访问）
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm && pnpm install

COPY . .

# 构建（Vite 会读取 ENV 环境变量）
RUN pnpm build

# 运行阶段 - nginx
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
