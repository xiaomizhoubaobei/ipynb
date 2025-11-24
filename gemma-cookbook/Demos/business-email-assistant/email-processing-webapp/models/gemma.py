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
import os
import re
from dotenv import load_dotenv

# 在导入Keras之前设置后端
os.environ["KERAS_BACKEND"] = "jax"
# 避免在JAX后端上出现内存碎片。
os.environ["XLA_PYTHON_CLIENT_MEM_FRACTION"] = "1.00"
import keras_nlp

# 在基础模型和调优模型之间切换
use_tuned_weights = False # 默认为False：使用基础Gemma模型，不进行调优

def initialize_model():
    """加载环境变量并配置Gemma模型。"""
    load_dotenv()
    # 加载Kaggle账户信息以下载Gemma
    kaggle_username = os.getenv('KAGGLE_USERNAME')
    if not kaggle_username:
        raise ValueError("未找到KAGGLE_USERNAME环境变量。您是否在.env文件中设置了它？")
    kaggle_key = os.getenv('KAGGLE_KEY')
    if not kaggle_key:
        raise ValueError("未找到KAGGLE_KEY环境变量。您是否在.env文件中设置了它？")

    # 使用Gemma 2 2B指令调优模型创建实例
    gemma = keras_nlp.models.GemmaCausalLM.from_preset("gemma2_instruct_2b_en")

    if use_tuned_weights:
        # 加载并编译调优后的模型权重
        gemma.backbone.enable_lora(rank=4)
        gemma.backbone.load_lora_weights(f"./weights/gemma2-2b_inquiry_tuned.lora.h5")

    # 对于此用例，贪心采样是最佳选择
    gemma.compile(sampler="greedy")
    #gemma.summary() # 仅用于测试

    return gemma  # 返回初始化的模型

def create_message_processor():
    """创建一个带有持久模型的消息处理器函数。"""
    model = initialize_model()

    def process_message(prompt_text):
        """使用本地Gemma模型处理消息。"""
        print("Bite: 正在处理AI请求...")

        input = f"<start_of_turn>user\n{prompt_text}<end_of_turn>\n<start_of_turn>model\n"
        response = model.generate(input, max_length=512)
        # 移除响应标签
        response = trim_response(input, response)

        #print(response) # 仅用于测试
        return response

    return process_message

def trim_response(prefix, response_text):
  """移除提示符前缀和后缀"<end_of_turn>"。
  参数:
      prefix: 提示符前缀文本。
      response_text: 响应文本。
  返回:
      修剪后的子字符串，如果未找到字符串前缀和后缀则返回原始文本。
  """
  response_text = response_text.removeprefix(prefix)
  response_text = response_text.removesuffix("<end_of_turn>")
  return response_text

# 默认方法
if __name__ == "__main__":
    process_message = create_message_processor()
    process_message("roses are red")
