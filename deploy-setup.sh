#!/bin/bash
#
# 服务器部署脚本
# 用于在服务器上部署项目
#
# 用法:
#   ./deploy-setup.sh          # 交互式部署（选择环境）
#   ./deploy-setup.sh --env prod   # 生产环境自动部署
#

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# 解析参数
ENVIRONMENT="dev"
for arg in "$@"; do
    case $arg in
        --env)
            ENVIRONMENT="$2"
            shift 2
            ;;
        --env=*)
            ENVIRONMENT="${arg#*=}"
            shift
            ;;
    esac
done

echo -e "${GREEN}=== 物业助手健康管理系统 - 部署脚本 ===${NC}\n"
echo -e "部署环境: ${CYAN}$ENVIRONMENT${NC}\n"

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}请使用 root 用户运行此脚本${NC}"
    echo "或者使用: sudo bash deploy-setup.sh"
    exit 1
fi

# 1. 检查 Docker 是否安装
echo -e "${YELLOW}[1/7] 检查 Docker 环境...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker 未安装，正在安装...${NC}"
    apt-get update && apt-get install -y docker.io docker-compose
    systemctl start docker
    systemctl enable docker
else
    echo -e "${GREEN}Docker 已安装${NC}"
fi

# 2. 检查 Git 是否安装
echo -e "${YELLOW}[2/7] 检查 Git 环境...${NC}"
if ! command -v git &> /dev/null; then
    echo -e "${RED}Git 未安装，正在安装...${NC}"
    apt-get update && apt-get install -y git
else
    echo -e "${GREEN}Git 已安装${NC}"
fi

# 3. 询问项目路径
echo -e "${YELLOW}[3/7] 配置项目路径${NC}"
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
echo -e "${YELLOW}[4/7] 克隆/更新项目${NC}"
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
echo -e "${YELLOW}[5/7] 配置环境变量${NC}"

if [ "$ENVIRONMENT" = "prod" ]; then
    ENV_FILE="$PROJECT_PATH/.env.production"
    if [ -f "$ENV_FILE" ]; then
        echo -e "${YELLOW}使用已有的 .env.production${NC}"
    else
        echo -e "${RED}生产环境需要配置文件！${NC}"
        echo "请先创建 $ENV_FILE 文件"
        exit 1
    fi

    # 设置环境变量
    set -a
    source "$ENV_FILE"
    set +a

    COMPOSE_FILE="docker-compose.prod.yml"
else
    ENV_FILE="$PROJECT_PATH/backend/.env"
    if [ -f "$ENV_FILE" ]; then
        echo -e "${YELLOW}.env 文件已存在，跳过创建${NC}"
    else
        echo -e "${YELLOW}创建 .env 文件...${NC}"
        cat > "$ENV_FILE" << 'EOF'
# 数据库配置
DATABASE_URL=mysql+pymysql://root:root@db:3306/health

# 安全配置（生产环境必须修改为安全的值）
SECRET_KEY=dev-secret-key-change-in-production
JWT_SECRET_KEY=dev-jwt-secret-key-change-in-production

# Token 过期时间（分钟）
ACCESS_TOKEN_EXPIRE_MINUTES=480
REFRESH_TOKEN_EXPIRE_MINUTES=1440

# 管理员账号
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
EOF
        echo -e "${GREEN}.env 文件已创建${NC}"
    fi

    COMPOSE_FILE="docker-compose.yml"
fi

# 7. 配置 Git
echo -e "${YELLOW}[6/7] 配置 Git${NC}"
git config --global user.name "Server Deploy"
git config --global user.email "deploy@server"

# 8. 构建并启动容器
echo -e "${YELLOW}[7/7] 构建并启动 Docker 容器${NC}"
docker-compose -f "$COMPOSE_FILE" up -d --build

# 9. 初始化数据库（仅首次）
if [ "$ENVIRONMENT" = "dev" ]; then
    echo -e "${YELLOW}检查是否需要初始化数据库...${NC}"
    sleep 10

    # 检查数据库是否已有数据
    DB_EXISTS=$(docker-compose -f "$COMPOSE_FILE" exec -T db mysql -uroot -proot health -sse "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'health'" 2>/dev/null || echo "0")

    if [ "$DB_EXISTS" = "0" ] || [ -z "$DB_EXISTS" ]; then
        echo -e "${YELLOW}初始化数据库...${NC}"
        docker-compose -f "$COMPOSE_FILE" exec -T db mysql -uroot -proot health < h_category.sql
        docker-compose -f "$COMPOSE_FILE" exec -T db mysql -uroot -proot health < h_entry.sql
        docker-compose -f "$COMPOSE_FILE" exec -T db mysql -uroot -proot health < h_entry_ship.sql
        echo -e "${GREEN}数据库初始化完成${NC}"
    else
        echo -e "${GREEN}数据库已有数据，跳过初始化${NC}"
    fi
fi

# 10. 检查容器状态
echo -e "${YELLOW}检查容器状态...${NC}"
docker-compose -f "$COMPOSE_FILE" ps

echo ""
echo -e "${GREEN}=== 部署完成 ===${NC}"
echo ""
echo "访问地址："
if [ "$ENVIRONMENT" = "prod" ]; then
    echo "  - 前端: http://localhost:80"
else
    echo "  - 前端: http://localhost:3001"
fi
echo "  - 后端 API: http://localhost:8000"
echo "  - API 文档: http://localhost:8000/docs"
echo "  - Admin: http://localhost:8000/admin"
echo ""
echo -e "${YELLOW}管理后台账号: admin / admin123${NC}"
echo ""
echo "常用命令："
echo "  查看日志: docker-compose -f $COMPOSE_FILE logs -f"
echo "  重启服务: docker-compose -f $COMPOSE_FILE restart"
echo "  停止服务: docker-compose -f $COMPOSE_FILE down"
echo "  更新部署: cd $PROJECT_PATH && git pull && docker-compose -f $COMPOSE_FILE up -d --build"
