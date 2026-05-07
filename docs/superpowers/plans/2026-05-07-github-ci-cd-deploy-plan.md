# GitHub CI/CD 自动部署实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 创建 GitHub Actions Workflow，实现 push 到 main 分支后自动部署到服务器。

**Architecture:** 使用 appleboy/ssh-action 连接服务器，在服务器上执行 git pull 和 docker-compose 部署命令。

**Tech Stack:** GitHub Actions, SSH, Docker, Docker Compose

---

## 任务清单

### Task 1: 创建 GitHub Actions Workflow 文件

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: 创建 .github/workflows 目录**

```bash
mkdir -p .github/workflows
```

- [ ] **Step 2: 创建 deploy.yml 文件**

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
      - name: Deploy to server via SSH
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
            docker-compose up -d --remove-orphans
```

- [ ] **Step 3: 提交文件**

```bash
git add .github/workflows/deploy.yml
git commit -m "feat: add GitHub Actions deploy workflow"
```

---

## GitHub Secrets 配置清单

部署前需要在 GitHub 仓库设置以下 Secrets：

| Secret 名称 | 说明 | 示例值 |
|-------------|------|--------|
| `SSH_HOST` | 服务器 IP 或域名 | `192.168.1.100` |
| `SSH_PORT` | SSH 端口 | `22` |
| `SSH_USER` | 服务器用户名 | `root` |
| `SSH_PRIVATE_KEY` | SSH 私钥内容 | `-----BEGIN OPENSSH PRIVATE KEY-----...` |

### 配置步骤

1. 打开 GitHub 仓库页面
2. 进入 Settings → Secrets and variables → Actions
3. 点击 "New repository secret" 逐个添加

---

## 服务器初始配置清单

首次部署前需要确保服务器完成以下配置：

1. **安装 Docker 和 Docker Compose**
2. **克隆项目到服务器**
   ```bash
   cd /path/to
   git clone https://github.com/YOUR_USERNAME/project-new.git
   ```
3. **配置服务器 Git**
   ```bash
   git config --global user.name "GitHub Actions"
   git config --global user.email "actions@github.com"
   ```
4. **添加 SSH 公钥到 GitHub**
   - 本地生成密钥对：`ssh-keygen -t ed25519 -C "deploy@github"`
   - 公钥添加到 GitHub Settings → SSH Keys
5. **测试 SSH 连接**
   ```bash
   ssh -T git@github.com
   ```

---

## 验证步骤

部署完成后验证：

1. 检查 GitHub Actions 日志确认部署成功
2. 访问应用确认服务正常运行
3. 检查服务器容器状态：
   ```bash
   docker-compose ps
   docker-compose logs -f
   ```
