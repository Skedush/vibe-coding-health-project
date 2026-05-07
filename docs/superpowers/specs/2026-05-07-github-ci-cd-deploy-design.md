# GitHub CI/CD 自动部署设计

## 目标

通过 GitHub Actions 将代码自动部署到服务器，实现 push 到 main 分支后自动触发部署。

## 部署策略

采用 **服务器构建** 策略：
- GitHub Actions 通过 SSH 连接服务器
- 服务器上执行 `git pull` 拉取最新代码
- 服务器上执行 `docker-compose build && up -d`

## 架构流程

```
GitHub Push (main)
    ↓
GitHub Actions 触发
    ↓
SSH 连接到服务器
    ↓
git pull 最新代码
    ↓
docker-compose build
    ↓
docker-compose up -d
    ↓
部署完成
```

## 触发条件

- 事件：`push`
- 分支：`main`

## 环境要求

### 服务器
- Docker 已安装
- Docker Compose 已安装
- Git 已安装
- SSH 服务运行中
- SSH 公钥认证已配置

### GitHub 仓库 Secrets
| 名称 | 描述 | 示例 |
|------|------|------|
| `SSH_HOST` | 服务器 IP 或域名 | `192.168.1.100` 或 `example.com` |
| `SSH_PORT` | SSH 端口 | `22` |
| `SSH_USER` | 服务器用户名 | `root` |
| `SSH_PRIVATE_KEY` | SSH 私钥 | `-----BEGIN OPENSSH PRIVATE KEY-----...` |

## GitHub Actions Workflow

路径：`.github/workflows/deploy.yml`

```yaml
name: Deploy to Server

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: SSH to server and deploy
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.SSH_HOST }}
          port: ${{ secrets.SSH_PORT }}
          username: ${{ secrets.SSH_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /path/to/project-new
            git pull origin main
            docker-compose build
            docker-compose up -d
```

## 部署步骤（服务器端）

1. SSH 连接成功
2. 进入项目目录：`cd /path/to/project-new`
3. 拉取代码：`git pull origin main`
4. 构建镜像：`docker-compose build`
5. 启动服务：`docker-compose up -d`
6. 等待容器启动完成

## 错误处理

- SSH 连接失败：部署标记失败，不影响运行中的服务
- Docker 构建失败：保留旧容器，运行中的服务继续运行
- 服务启动失败：查看日志定位问题

## 项目文件

- `.github/workflows/deploy.yml` - GitHub Actions 工作流配置

## 注意事项

1. 服务器上需要先手动克隆一次项目并配置好 Docker 环境
2. 确保 SSH 私钥有正确的权限（600 或 400）
3. 建议在服务器上配置 git config 避免交互式输入
4. 生产环境建议添加 `docker-compose build --no-cache` 确保完全重建