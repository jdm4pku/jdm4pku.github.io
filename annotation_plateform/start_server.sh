#!/bin/bash

# 数据检查系统 - 本地服务器启动脚本

echo "=================================="
echo "  数据检查系统 - 启动本地服务器"
echo "=================================="
echo ""

# 获取当前脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# 检查 Python 是否可用
if command -v python3 &> /dev/null; then
    echo "✓ 检测到 Python 3"
    echo ""
    echo "正在启动服务器..."
    echo "服务器地址: http://localhost:8002"
    echo ""
    echo "按 Ctrl+C 停止服务器"
    echo ""
    python3 -m http.server 8002
elif command -v python &> /dev/null; then
    echo "✓ 检测到 Python"
    echo ""
    echo "正在启动服务器..."
    echo "服务器地址: http://localhost:8000"
    echo ""
    echo "按 Ctrl+C 停止服务器"
    echo ""
    python -m http.server 8000
else
    echo "✗ 未检测到 Python"
    echo ""
    echo "请安装 Python 3，或使用以下命令："
    echo "  npx http-server -p 8002"
    exit 1
fi

