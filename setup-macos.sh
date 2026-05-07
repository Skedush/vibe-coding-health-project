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

echo -e "${GREEN}=== 物业助手健康管理系统 - macOS 一键部署 ===${NC}\n"

# 1. 检查 Homebrew
echo -e "${YELLOW}[1/8] 检查 Homebrew...${NC}"
if ! command -v brew &> /dev/null; then
    echo -e "${YELLOW}Homebrew 未安装，正在安装...${NC}"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
else
    echo -e "${GREEN}Homebrew 已安装${NC}"
fi

# 2. 安装 Docker
echo -e "${YELLOW}[2/8] 检查 Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Docker 未安装，正在安装（请输入密码）...${NC}"
    brew install --cask docker
    echo -e "${YELLOW}请启动 Docker Desktop 后按回车继续${NC}"
    echo -e "${YELLOW}提示：在 Launchpad 中找到 Docker 图标并点击启动${NC}"
    read -p "Docker 启动后按回车继续: "
else
    echo -e "${GREEN}Docker 已安装${NC}"
fi

# 3. 确认 Docker 运行
echo -e "${YELLOW}[3/8] 确认 Docker 运行中...${NC}"
while ! docker info &> /dev/null; do
    echo -e "${RED}Docker 未运行，请启动 Docker Desktop 后按回车重试${NC}"
    read -p "按回车继续: "
done
echo -e "${GREEN}Docker 运行中${NC}"

# 4. 克隆项目
echo -e "${YELLOW}[4/8] 克隆项目${NC}"
read -p "请输入 GitHub 仓库地址（或直接回车使用当前目录）: " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo -e "${YELLOW}使用当前目录${NC}"
    cd "$(dirname "$0")"
else
    read -p "请输入项目目录名 [health-system]: " PROJECT_DIR
    PROJECT_DIR=${PROJECT_DIR:-health-system}

    if [ -d "$PROJECT_DIR" ]; then
        echo -e "${YELLOW}项目已存在，进入目录${NC}"
        cd "$PROJECT_DIR"
    else
        echo -e "${YELLOW}克隆项目到 $PROJECT_DIR ...${NC}"
        git clone "$REPO_URL" "$PROJECT_DIR"
        cd "$PROJECT_DIR"
    fi
fi

# 5. 配置环境变量
echo -e "${YELLOW}[5/8] 配置环境变量${NC}"

if [ -f .env ]; then
    echo -e "${YELLOW}.env 文件已存在，跳过创建${NC}"
else
    echo -e "${YELLOW}创建 .env 文件...${NC}"
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
    echo -e "${GREEN}.env 文件已创建${NC}"
fi

# 6. 启动服务
echo -e "${YELLOW}[6/8] 启动 Docker 服务${NC}"
docker compose up -d --build

# 等待 MySQL 就绪
echo -e "${YELLOW}等待 MySQL 启动...${NC}"
sleep 15

# 7. 导入数据库
echo -e "${YELLOW}[7/8] 导入数据库...${NC}"

# 获取容器名
CONTAINER_NAME=$(docker compose ps -q db)
if [ -z "$CONTAINER_NAME" ]; then
    CONTAINER_NAME="health-db-1"
fi

echo -e "${YELLOW}导入分类数据...${NC}"
docker exec -i "$CONTAINER_NAME" mysql -uroot -proot --default-character-set=utf8mb4 health < h_category.sql 2>/dev/null || \
    docker exec -i "$CONTAINER_NAME" mysql -uroot -p$MYSQL_ROOT_PASSWORD --default-character-set=utf8mb4 health < h_category.sql

echo -e "${YELLOW}导入条目数据...${NC}"
docker exec -i "$CONTAINER_NAME" mysql -uroot -proot --default-character-set=utf8mb4 health < h_entry.sql 2>/dev/null || \
    docker exec -i "$CONTAINER_NAME" mysql -uroot -p$MYSQL_ROOT_PASSWORD --default-character-set=utf8mb4 health < h_entry.sql

echo -e "${YELLOW}导入关联数据...${NC}"
docker exec -i "$CONTAINER_NAME" mysql -uroot -proot --default-character-set=utf8mb4 health < h_entry_ship.sql 2>/dev/null || \
    docker exec -i "$CONTAINER_NAME" mysql -uroot -p$MYSQL_ROOT_PASSWORD --default-character-set=utf8mb4 health < h_entry_ship.sql

echo -e "${GREEN}数据库导入完成${NC}"

# 8. 创建管理员账户
echo -e "${YELLOW}[8/8] 创建管理员账户...${NC}"

# 获取后端容器名
BACKEND_NAME=$(docker compose ps -q backend)
if [ -z "$BACKEND_NAME" ]; then
    BACKEND_NAME="health-backend-1"
fi

# 生成 bcrypt 密码哈希
ADMIN_PASSWORD="admin123"
PASSWORD_HASH=$(docker exec "$BACKEND_NAME" python3 -c "
import bcrypt
password = '$ADMIN_PASSWORD'
hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
print(hashed)
" 2>/dev/null || echo "\$2b\$12\$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqYo5POE/K")

# 创建管理员用户（表名可能是 h_user 或 user）
docker exec -i "$CONTAINER_NAME" mysql -uroot -proot health -e "
INSERT INTO h_user (username, password, is_superuser, is_staff, is_active, is_title, is_vip, is_delete, created, updated)
VALUES ('admin', '$PASSWORD_HASH', 1, 1, 1, 0, 0, 0, NOW(), NOW())
ON DUPLICATE KEY UPDATE is_superuser=1;
" 2>/dev/null || docker exec -i "$CONTAINER_NAME" mysql -uroot -p$MYSQL_ROOT_PASSWORD health -e "
INSERT INTO h_user (username, password, is_superuser, is_staff, is_active, is_title, is_vip, is_delete, created, updated)
VALUES ('admin', '$PASSWORD_HASH', 1, 1, 1, 0, 0, 0, NOW(), NOW())
ON DUPLICATE KEY UPDATE is_superuser=1;
"

echo -e "${GREEN}管理员账户创建完成${NC}"

# 检查状态
echo -e "${YELLOW}检查服务状态...${NC}"
docker compose ps

echo ""
echo -e "${GREEN}=== 部署完成 ===${NC}"
echo ""
echo "访问地址："
echo "  - 前端: http://localhost:3001"
echo "  - 后端 API: http://localhost:8000"
echo "  - API 文档: http://localhost:8000/docs"
echo "  - Admin: http://localhost:8000/admin"
echo ""
echo -e "${YELLOW}管理员账号: admin / admin123${NC}"
echo ""
echo "常用命令："
echo "  查看日志: docker compose logs -f"
echo "  重启服务: docker compose restart"
echo "  停止服务: docker compose down"
echo "  更新代码: git pull && docker compose up -d --build"
