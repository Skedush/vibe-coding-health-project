#!/bin/bash
#
# 首次服务器部署脚本
# 用于在服务器上首次部署项目
#

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== 物业助手健康管理系统 - 首次部署脚本 ===${NC}\n"

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}请使用 root 用户运行此脚本${NC}"
    echo "或者使用: sudo bash deploy-setup.sh"
    exit 1
fi

# 1. 检查 Docker 是否安装
echo -e "${YELLOW}[1/6] 检查 Docker 环境...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker 未安装，正在安装...${NC}"
    apt-get update && apt-get install -y docker.io docker-compose
    systemctl start docker
    systemctl enable docker
else
    echo -e "${GREEN}Docker 已安装${NC}"
fi

# 2. 检查 Git 是否安装
echo -e "${YELLOW}[2/6] 检查 Git 环境...${NC}"
if ! command -v git &> /dev/null; then
    echo -e "${RED}Git 未安装，正在安装...${NC}"
    apt-get update && apt-get install -y git
else
    echo -e "${GREEN}Git 已安装${NC}"
fi

# 3. 询问项目路径
echo -e "${YELLOW}[3/6] 配置项目路径${NC}"
read -p "请输入项目部署路径 [/opt/health-system]: " PROJECT_PATH
PROJECT_PATH=${PROJECT_PATH:-/opt/health-system}

# 4. 询问 GitHub 仓库地址
echo ""
read -p "请输入 GitHub 仓库地址: " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo -e "${RED}仓库地址不能为空${NC}"
    exit 1
fi

# 5. 克隆或更新项目
echo -e "${YELLOW}[4/6] 克隆/更新项目${NC}"
if [ -d "$PROJECT_PATH" ]; then
    echo -e "${YELLOW}项目已存在，正在更新...${NC}"
    cd "$PROJECT_PATH"
    git pull origin main
else
    echo -e "${YELLOW}正在克隆项目到 $PROJECT_PATH ...${NC}"
    mkdir -p "$PROJECT_PATH"
    git clone "$REPO_URL" "$PROJECT_PATH"
    cd "$PROJECT_PATH"
fi

# 6. 配置环境变量
echo -e "${YELLOW}[5/6] 配置环境变量${NC}"
ENV_FILE="$PROJECT_PATH/backend/.env"

if [ -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}.env 文件已存在，跳过创建${NC}"
else
    echo -e "${YELLOW}创建 .env 文件...${NC}"
    cat > "$ENV_FILE" << 'EOF'
# 数据库配置
DATABASE_URL=mysql+pymysql://root:root@db:3306/health

# 安全配置（生产环境必须修改为安全的值）
SECRET_KEY=your-secret-key-here-change-in-production
JWT_SECRET_KEY=your-jwt-secret-key-here-change-in-production

# Token 过期时间（分钟）
ACCESS_TOKEN_EXPIRE_MINUTES=480
REFRESH_TOKEN_EXPIRE_MINUTES=1440

# 管理员账号
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
EOF
    echo -e "${GREEN}.env 文件已创建${NC}"
fi

# 7. 配置 Git
echo -e "${YELLOW}[6/6] 配置 Git${NC}"
git config --global user.name "Server Deploy"
git config --global user.email "deploy@server"

# 8. 构建并启动容器
echo -e "${YELLOW}[7/7] 构建并启动 Docker 容器${NC}"
docker-compose up -d --build

# 9. 等待 MySQL 就绪
echo -e "${YELLOW}等待 MySQL 启动...${NC}"
sleep 10

# 10. 初始化数据库
echo -e "${YELLOW}初始化数据库...${NC}"
docker-compose exec -T db mysql -uroot -proot health < h_category.sql
docker-compose exec -T db mysql -uroot -proot health < h_entry.sql
docker-compose exec -T db mysql -uroot -proot health < h_entry_ship.sql

echo -e "${GREEN}数据库初始化完成${NC}"

# 11. 检查容器状态
echo -e "${YELLOW}检查容器状态...${NC}"
docker-compose ps

echo ""
echo -e "${GREEN}=== 部署完成 ===${NC}"
echo ""
echo "访问地址："
echo "  - 前端: http://localhost:3001"
echo "  - 后端 API: http://localhost:8000"
echo "  - API 文档: http://localhost:8000/docs"
echo "  - Admin: http://localhost:8000/admin"
echo ""
echo -e "${YELLOW}管理后台账号: admin / admin123${NC}"
echo ""
echo "常用命令："
echo "  查看日志: docker-compose logs -f"
echo "  重启服务: docker-compose restart"
echo "  停止服务: docker-compose down"
echo "  更新部署: cd $PROJECT_PATH && git pull && docker-compose up -d --build"
