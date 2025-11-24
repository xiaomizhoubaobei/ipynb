#!/bin/bash

# 更新apt仓库
sudo apt update

# 安装软件
sudo apt install git python3-venv

# 为项目创建虚拟环境
python3 -m venv venv

# 激活虚拟环境
source venv/bin/activate
# 取消激活：
# deactivate

# 检查CUDA驱动版本
nvcc --version