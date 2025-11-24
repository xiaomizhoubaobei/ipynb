# 版权所有 2024 Google LLC
#
# 根据 Apache 许可证 2.0 版（“许可证”）授权；
# 除非遵守许可证，否则您不得使用此文件。
# 您可以在以下网址获取许可证副本：
#
#     http://www.apache.org/licenses/LICENSE-2.0 
#
# 除非适用法律要求或书面同意，否则
# 根据许可证分发的软件按“原样”分发，
# 不附带任何明示或暗示的保证或条件。
# 有关许可证下特定语言的管理权限和
# 限制，请参阅许可证。
#
import google.generativeai as genai
from dotenv import load_dotenv
import os

def initialize_model():
    """加载环境变量并配置GenAI客户端。"""
    load_dotenv()
    api_key = os.getenv('API_KEY')
    if not api_key:
        raise ValueError("未找到API_KEY环境变量。您是否在.env文件中设置了它？")
    genai.configure(api_key=api_key)
    return genai.GenerativeModel('gemini-1.5-flash')  # 返回初始化的模型

def create_message_processor():
    """创建一个带有持久模型的消息处理器函数。"""
    model = initialize_model()

    def process_message(message):
        """使用GenAI模型处理消息。"""
        response = model.generate_content(message)
        print(response.text) # 移除：仅用于测试
        return response.text
    return process_message