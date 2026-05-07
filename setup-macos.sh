#!/bin/bash
#
# macOS 一键部署脚本
# 适用于没有任何开发环境的 Mac
#

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  物业助手健康管理系统 - 一键部署${NC}"
echo -e "${GREEN}========================================${NC}\n"

# 项目根目录
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# 1. 配置国内镜像源
echo -e "${YELLOW}[1/6] 配置国内镜像加速...${NC}"

# Docker 镜像
mkdir -p ~/.docker
cat > ~/.docker/daemon.json << 'EOF'
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com"
  ]
}
EOF
echo -e "${GREEN}  ✓ Docker 镜像配置完成${NC}"

# Homebrew 镜像
export HOMEBREW_API_DOMAIN="https://mirrors.tuna.tsinghua.edu.cn/homebrew-api"
export HOMEBREW_BREW_GIT_REMOTE="https://mirrors.tuna.tsinghua.edu.cn/git/homebrew/brew.git"
export HOMEBREW_CORE_GIT_REMOTE="https://mirrors.tuna.tsinghua.edu.cn/git/homebrew/homebrew-core.git"
export HOMEBREW_BOTTLE_DOMAIN="https://mirrors.tuna.tsinghua.edu.cn/homebrew-bottles"
echo -e "${GREEN}  ✓ Homebrew 镜像配置完成${NC}"

# 2. 安装必要工具
echo -e "${YELLOW}[2/6] 检查/安装必要工具...${NC}"

# 安装 Homebrew
if ! command -v brew &> /dev/null; then
    echo -e "${CYAN}  安装 Homebrew...${NC}"
    /bin/bash -c "$(curl -fsSL https://mirrors.tuna.tsinghua.edu.cn/install/brew.sh)"
fi
echo -e "${GREEN}  ✓ Homebrew 已安装${NC}"

# 安装 Docker
if ! command -v docker &> /dev/null; then
    echo -e "${CYAN}  安装 Docker Desktop...${NC}"
    brew install --cask docker
    echo -e "${YELLOW}  请在 Launchpad 中点击 Docker 图标启动，然后按回车继续${NC}"
    read -p "  Docker 启动后按回车: "
fi
echo -e "${GREEN}  ✓ Docker 已安装${NC}"

# 3. 等待 Docker 运行
echo -e "${YELLOW}[3/6] 等待 Docker 运行...${NC}"
while ! docker info &> /dev/null; do
    echo -e "${RED}  Docker 未运行，请启动后按回车${NC}"
    read -p "  按回车继续: "
done
echo -e "${GREEN}  ✓ Docker 运行中${NC}"

# 4. 检查项目文件
echo -e "${YELLOW}[4/6] 检查项目文件...${NC}"

if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}  错误：找不到 docker-compose.yml${NC}"
    echo "  请确保在项目根目录运行此脚本"
    exit 1
fi
echo -e "${GREEN}  ✓ 项目文件检查通过${NC}"

# 5. 配置并启动服务
echo -e "${YELLOW}[5/6] 配置并启动服务...${NC}"

# 创建 .env 文件
if [ ! -f .env ]; then
    cat > .env << 'EOF'
# MySQL 配置
MYSQL_ROOT_PASSWORD=root
MYSQL_DATABASE=health

# 后端配置
DATABASE_URL=mysql+pymysql://root:root@db:3306/health
SECRET_KEY=dev-secret-key
JWT_SECRET_KEY=dev-jwt-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=480
REFRESH_TOKEN_EXPIRE_MINUTES=1440

# 前端配置
VITE_API_BASE_URL=http://localhost:8000
EOF
    echo -e "${GREEN}  ✓ 环境配置文件已创建${NC}"
else
    echo -e "${GREEN}  ✓ 环境配置文件已存在${NC}"
fi

# 构建并启动
echo -e "${CYAN}  构建并启动 Docker 服务（首次可能需要几分钟）...${NC}"
docker compose up -d --build
echo -e "${GREEN}  ✓ Docker 服务启动完成${NC}"

# 6. 初始化数据库和账户
echo -e "${YELLOW}[6/6] 初始化数据库和账户...${NC}"

# 等待 MySQL 就绪
echo -e "${CYAN}  等待 MySQL 就绪...${NC}"
sleep 10

# 获取容器名
DB_CONTAINER=$(docker compose ps -q db 2>/dev/null | head -1)
[ -z "$DB_CONTAINER" ] && DB_CONTAINER="health-db-1"

BACKEND_CONTAINER=$(docker compose ps -q backend 2>/dev/null | head -1)
[ -z "$BACKEND_CONTAINER" ] && BACKEND_CONTAINER="health-backend-1"

# 导入 SQL（使用 utf8mb4 字符集）
echo -e "${CYAN}  导入数据库...${NC}"
docker exec -i "$DB_CONTAINER" mysql -uroot -proot --default-character-set=utf8mb4 health < h_category.sql 2>/dev/null \
    || docker exec -i "$DB_CONTAINER" mysql -uroot -p$MYSQL_ROOT_PASSWORD --default-character-set=utf8mb4 health < h_category.sql
echo -e "${GREEN}  ✓ 分类数据导入完成${NC}"

docker exec -i "$DB_CONTAINER" mysql -uroot -proot --default-character-set=utf8mb4 health < h_entry.sql 2>/dev/null \
    || docker exec -i "$DB_CONTAINER" mysql -uroot -p$MYSQL_ROOT_PASSWORD --default-character-set=utf8mb4 health < h_entry.sql
echo -e "${GREEN}  ✓ 条目数据导入完成${NC}"

docker exec -i "$DB_CONTAINER" mysql -uroot -proot --default-character-set=utf8mb4 health < h_entry_ship.sql 2>/dev/null \
    || docker exec -i "$DB_CONTAINER" mysql -uroot -p$MYSQL_ROOT_PASSWORD --default-character-set=utf8mb4 health < h_entry_ship.sql
echo -e "${GREEN}  ✓ 关联数据导入完成${NC}"

# 创建超级管理员
echo -e "${CYAN}  创建管理员账户...${NC}"
ADMIN_PASSWORD="admin123"
PASSWORD_HASH=$(docker exec "$BACKEND_CONTAINER" python3 -c "
import bcrypt
hashed = bcrypt.hashpw(b'$ADMIN_PASSWORD', bcrypt.gensalt()).decode()
print(hashed)
" 2>/dev/null)

if [ -z "$PASSWORD_HASH" ]; then
    PASSWORD_HASH='\$2b\$12\$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqYo5POE/K'
fi

docker exec -i "$DB_CONTAINER" mysql -uroot -proot health -e "
INSERT INTO h_user (username, password, is_superuser, is_staff, is_active, is_title, is_vip, is_delete, created, updated)
VALUES ('admin', '$PASSWORD_HASH', 1, 1, 1, 0, 0, 0, NOW(), NOW())
ON DUPLICATE KEY UPDATE is_superuser=1, password='$PASSWORD_HASH';
" 2>/dev/null || docker exec -i "$DB_CONTAINER" mysql -uroot -p$MYSQL_ROOT_PASSWORD health -e "
INSERT INTO h_user (username, password, is_superuser, is_staff, is_active, is_title, is_vip, is_delete, created, updated)
VALUES ('admin', '$PASSWORD_HASH', 1, 1, 1, 0, 0, 0, NOW(), NOW())
ON DUPLICATE KEY UPDATE is_superuser=1, password='$PASSWORD_HASH';
"
echo -e "${GREEN}  ✓ 管理员账户创建完成${NC}"

# 检查服务状态
echo -e "${YELLOW}检查服务状态...${NC}"
docker compose ps

# 完成
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  部署完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${CYAN}访问地址：${NC}"
echo "  前端:      http://localhost:3001"
echo "  后端 API:  http://localhost:8000"
echo "  API 文档:  http://localhost:8000/docs"
echo "  Admin:     http://localhost:8000/admin"
echo ""
echo -e "${YELLOW}管理员账号: admin / admin123${NC}"
echo ""
echo -e "${CYAN}常用命令：${NC}"
echo "  查看日志:   docker compose logs -f"
echo "  重启服务:   docker compose restart"
echo "  停止服务:   docker compose down"
echo "  重新构建:   docker compose up -d --build"
