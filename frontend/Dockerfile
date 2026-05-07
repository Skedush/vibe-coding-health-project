# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm && pnpm install

COPY . .
RUN pnpm build

# 运行阶段 - nginx
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
