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

# 进度条函数
show_progress() {
    local current=$1
    local total=$2
    local width=40
    local percent=$((current * 100 / total))
    local filled=$((current * width / total))
    
    printf "\r["
    for ((i=0; i<filled; i++)); do printf "="; done
    for ((i=filled; i<width; i++)); do printf " "; done
    printf "] %d%%" "$percent"
}

# 检查命令是否存在
command_exists() {
    command -v "$1" &> /dev/null
}

# 错误处理
error_exit() {
    echo -e "\n${RED}错误: $1${NC}" >&2
    exit 1
}

# 确认函数
confirm() {
    read -p "$1 (y/N): " -n 1 -r
    echo
    [[ $REPLY =~ ^[Yy]$ ]]
}

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  物业助手健康管理系统 - 一键部署${NC}"
echo -e "${GREEN}========================================${NC}\n"

# 项目根目录
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR" || error_exit "无法进入项目目录"

# 检查是否为 macOS
if [[ "$(uname -s)" != "Darwin" ]]; then
    error_exit "此脚本仅适用于 macOS"
fi

total_steps=7
current_step=0

# 1. 配置国内镜像源
current_step=$((current_step + 1))
show_progress "$current_step" "$total_steps"
echo -e "\n${YELLOW}[${current_step}/${total_steps}] 配置国内镜像加速...${NC}"

# Docker 镜像
echo -e "${CYAN}  配置 Docker 镜像...${NC}"
mkdir -p ~/.docker
cat > ~/.docker/daemon.json << 'EOF'
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com",
    "https://mirror.baidubce.com"
  ],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m"
  }
}
EOF
echo -e "${GREEN}  ✓ Docker 镜像配置完成${NC}"

# Homebrew 镜像 (使用中科大镜像，清华源已失效)
echo -e "${CYAN}  配置 Homebrew 镜像...${NC}"
export HOMEBREW_API_DOMAIN="https://mirrors.ustc.edu.cn/homebrew-api"
export HOMEBREW_BREW_GIT_REMOTE="https://mirrors.ustc.edu.cn/brew.git"
export HOMEBREW_CORE_GIT_REMOTE="https://mirrors.ustc.edu.cn/homebrew-core.git"
export HOMEBREW_BOTTLE_DOMAIN="https://mirrors.ustc.edu.cn/homebrew-bottles"
echo -e "${GREEN}  ✓ Homebrew 镜像配置完成${NC}"

# 2. 安装必要工具
current_step=$((current_step + 1))
show_progress "$current_step" "$total_steps"
echo -e "\n${YELLOW}[${current_step}/${total_steps}] 检查/安装必要工具...${NC}"

# 安装 Homebrew
if ! command_exists brew; then
    echo -e "${CYAN}  安装 Homebrew (使用中科大镜像)...${NC}"
    if ! /bin/bash -c "$(curl -fsSL https://mirrors.ustc.edu.cn/misc/brew-install.sh)"; then
        error_exit "Homebrew 安装失败，请检查网络或手动安装"
    fi
    # 刷新 PATH
    if [[ -x /opt/homebrew/bin/brew ]]; then
        eval "$(/opt/homebrew/bin/brew shellenv)"
    elif [[ -x /usr/local/bin/brew ]]; then
        eval "$(/usr/local/bin/brew shellenv)"
    fi
else
    echo -e "${CYAN}  更新 Homebrew...${NC}"
    brew update > /dev/null 2>&1 || echo -e "${YELLOW}  ⚠ Homebrew 更新失败，继续执行${NC}"
fi
echo -e "${GREEN}  ✓ Homebrew 已安装/更新${NC}"

# 安装 Docker
if ! command_exists docker; then
    echo -e "${CYAN}  安装 Docker Desktop...${NC}"
    brew install --cask docker --quiet || error_exit "Docker 安装失败"
    echo -e "${YELLOW}  ⚠ 请在 Launchpad 中点击 Docker 图标启动${NC}"
    echo -e "${YELLOW}  ⚠ 首次启动需要登录 Apple ID${NC}"
    read -p "  Docker 启动后按回车继续: " -s
    echo
fi
echo -e "${GREEN}  ✓ Docker 已安装${NC}"

# 安装 docker-compose (确保安装)
if ! command_exists docker-compose && ! docker compose &> /dev/null; then
    echo -e "${CYAN}  安装 Docker Compose...${NC}"
    brew install docker-compose --quiet || error_exit "Docker Compose 安装失败"
fi
echo -e "${GREEN}  ✓ Docker Compose 已安装${NC}"

# 3. 等待 Docker 运行
current_step=$((current_step + 1))
show_progress "$current_step" "$total_steps"
echo -e "\n${YELLOW}[${current_step}/${total_steps}] 等待 Docker 运行...${NC}"

max_wait=30
wait_count=0
while ! docker info &> /dev/null; do
    if [[ $wait_count -ge $max_wait ]]; then
        error_exit "Docker 启动超时，请手动启动 Docker Desktop"
    fi
    echo -e "${CYAN}  等待 Docker 启动... ($((wait_count * 2))s)${NC}"
    sleep 2
    wait_count=$((wait_count + 1))
done
echo -e "${GREEN}  ✓ Docker 运行中${NC}"

# 4. 检查项目文件
current_step=$((current_step + 1))
show_progress "$current_step" "$total_steps"
echo -e "\n${YELLOW}[${current_step}/${total_steps}] 检查项目文件...${NC}"

required_files=("docker-compose.yml" "backend" "frontend" "h_category.sql" "h_entry.sql" "h_entry_ship.sql")
for file in "${required_files[@]}"; do
    if [[ ! -e "$file" ]]; then
        if [[ -d "$file" ]]; then
            error_exit "找不到目录: $file"
        else
            error_exit "找不到文件: $file"
        fi
    fi
done
echo -e "${GREEN}  ✓ 项目文件检查通过${NC}"

# 5. 配置环境变量
current_step=$((current_step + 1))
show_progress "$current_step" "$total_steps"
echo -e "\n${YELLOW}[${current_step}/${total_steps}] 配置环境变量...${NC}"

# 创建 .env 文件
if [[ ! -f .env ]]; then
    echo -e "${CYAN}  创建环境配置文件...${NC}"
    # 生成随机密钥
    SECRET_KEY=$(openssl rand -hex 32 2>/dev/null || echo "dev-secret-key-change-in-production")
    JWT_SECRET_KEY=$(openssl rand -hex 32 2>/dev/null || echo "dev-jwt-secret-key-change-in-production")
    
    cat > .env << EOF
# MySQL 配置
MYSQL_ROOT_PASSWORD=root
MYSQL_DATABASE=health

# 后端配置
DATABASE_URL=mysql+pymysql://root:root@db:3306/health
SECRET_KEY=$SECRET_KEY
JWT_SECRET_KEY=$JWT_SECRET_KEY
ACCESS_TOKEN_EXPIRE_MINUTES=480
REFRESH_TOKEN_EXPIRE_MINUTES=1440

# 前端配置
VITE_API_BASE_URL=http://localhost:8000
EOF
    echo -e "${GREEN}  ✓ 环境配置文件已创建${NC}"
else
    echo -e "${YELLOW}  ⚠ 环境配置文件已存在，跳过创建${NC}"
    if confirm "是否重新生成环境配置文件？"; then
        rm .env
        exec "$0" "$@"
    fi
fi

# 6. 配置并启动服务
current_step=$((current_step + 1))
show_progress "$current_step" "$total_steps"
echo -e "\n${YELLOW}[${current_step}/${total_steps}] 构建并启动服务...${NC}"

echo -e "${CYAN}  构建并启动 Docker 服务（首次可能需要几分钟）...${NC}"
echo -e "${YELLOW}  ⚠ 此过程可能需要下载较大的 Docker 镜像${NC}"

if ! docker compose up -d --build; then
    error_exit "Docker 服务启动失败，请检查日志"
fi
echo -e "${GREEN}  ✓ Docker 服务启动完成${NC}"

# 7. 初始化数据库和账户
current_step=$((current_step + 1))
show_progress "$current_step" "$total_steps"
echo -e "\n${YELLOW}[${current_step}/${total_steps}] 初始化数据库和账户...${NC}"

# 等待 MySQL 就绪
echo -e "${CYAN}  等待 MySQL 就绪...${NC}"
max_wait=60
wait_count=0
while ! docker compose exec -T db mysqladmin ping -h localhost --silent &> /dev/null; do
    if [[ $wait_count -ge $max_wait ]]; then
        error_exit "MySQL 启动超时，请检查容器日志"
    fi
    sleep 1
    wait_count=$((wait_count + 1))
    if [[ $((wait_count % 5)) -eq 0 ]]; then
        echo -e "${CYAN}  等待中... ($wait_count/$max_wait)${NC}"
    fi
done
echo -e "${GREEN}  ✓ MySQL 就绪${NC}"

# 获取容器名
DB_CONTAINER=$(docker compose ps -q db 2>/dev/null | head -1)
BACKEND_CONTAINER=$(docker compose ps -q backend 2>/dev/null | head -1)

# 导入 SQL
echo -e "${CYAN}  导入数据库...${NC}"
for sql_file in h_category.sql h_entry.sql h_entry_ship.sql; do
    echo -e "${CYAN}    导入 $sql_file...${NC}"
    if ! docker compose exec -T db mysql -uroot -proot --default-character-set=utf8mb4 health < "$sql_file"; then
        echo -e "${YELLOW}    ⚠ $sql_file 导入失败，可能已存在${NC}"
    else
        echo -e "${GREEN}    ✓ $sql_file 导入完成${NC}"
    fi
done

# 创建超级管理员
echo -e "${CYAN}  创建管理员账户...${NC}"
ADMIN_PASSWORD="admin123"
PASSWORD_HASH=$(docker compose exec -T "$BACKEND_CONTAINER" python3 -c "
import bcrypt
hashed = bcrypt.hashpw(b'$ADMIN_PASSWORD', bcrypt.gensalt()).decode()
print(hashed)
" 2>/dev/null)

if [[ -z "$PASSWORD_HASH" ]]; then
    echo -e "${YELLOW}  ⚠ 使用默认密码哈希${NC}"
    PASSWORD_HASH='$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqYo5POE/K'
fi

docker compose exec -T db mysql -uroot -proot health -e "
INSERT INTO h_user (username, password, is_superuser, is_staff, is_active, is_title, is_vip, is_delete, created, updated)
VALUES ('admin', '$PASSWORD_HASH', 1, 1, 1, 0, 0, 0, NOW(), NOW())
ON DUPLICATE KEY UPDATE is_superuser=1, password='$PASSWORD_HASH';
" 2>/dev/null || echo -e "${YELLOW}  ⚠ 管理员账户可能已存在${NC}"
echo -e "${GREEN}  ✓ 管理员账户创建完成${NC}"

# 检查服务状态
echo -e "\n${YELLOW}检查服务状态...${NC}"
echo "──────────────────────────────────────────────────────"
docker compose ps
echo "──────────────────────────────────────────────────────"

# 等待服务完全启动
echo -e "\n${CYAN}  等待服务启动完成...${NC}"
sleep 5

# 完成
show_progress "$total_steps" "$total_steps"
echo -e "\n\n${GREEN}========================================${NC}"
echo -e "${GREEN}  部署完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${CYAN}访问地址：${NC}"
echo "  ${GREEN}前端:      ${NC}http://localhost:3001"
echo "  ${GREEN}后端 API:  ${NC}http://localhost:8000"
echo "  ${GREEN}API 文档:  ${NC}http://localhost:8000/docs"
echo "  ${GREEN}管理后台:  ${NC}http://localhost:8000/admin"
echo ""
echo -e "${YELLOW}管理员账号: admin / admin123${NC}"
echo ""
echo -e "${CYAN}常用命令：${NC}"
echo "  ${YELLOW}查看日志:   ${NC}docker compose logs -f"
echo "  ${YELLOW}重启服务:   ${NC}docker compose restart"
echo "  ${YELLOW}停止服务:   ${NC}docker compose down"
echo "  ${YELLOW}重新构建:   ${NC}docker compose up -d --build"
echo "  ${YELLOW}查看状态:   ${NC}docker compose ps"
echo ""
echo -e "${YELLOW}注意：${NC}首次访问可能需要等待前端构建完成，约1-2分钟"
echo ""