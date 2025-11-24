#!/bin/bash
# 安装Python组件

# 激活虚拟环境
source venv/bin/activate

pip install -r requirements.txt

# 注意：按以下方式记录Python安装
# pip freeze > requirements.txt
