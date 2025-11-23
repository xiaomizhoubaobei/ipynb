# 使用CrewAI和Gemini的地牢冒险游戏

本项目是一个基于文本的地牢冒险游戏，展示了由CrewAI和Google Gemini驱动的动态、互动式叙事体验。它通过利用AI智能体——一个地下城主（DM）和多个玩家智能体——来创建一个不断发展的故事，超越了静态叙事。该设置展示了CrewAI在编排复杂的多智能体交互以引导奇幻冒险方面的能力。

## 主要功能与能力

*   **智能体驱动的叙事：** 具有持久的地下城主（DM）智能体，负责叙述场景、评估玩家行动并引入挑战，确保叙事连贯性。
*   **动态玩家角色：** 包含多个具有独特角色和目标的玩家智能体，每个智能体每回合能够选择单一行动，简化交互同时增加深度。
*   **CrewAI编排：** 利用CrewAI强大的框架来管理智能体交互，动态创建回合制行动的团队，并传递全面的上下文（游戏历史、玩家角色）以保持叙事一致性。
*   **强大的状态管理：** 使用`GameState`类按时间顺序存储战役详情、玩家行动和场景描述，使DM能够在多个回合间保持上下文。
*   **LLM叙事控制：** 为DM采用精确的提示工程，确保简洁、专注的叙述，仅响应玩家行动并避免创造新角色，减轻LLM常见的漂移倾向。

## 快速开始/使用

本项目设计为在Google Colab笔记本中进行交互式探索。

*   **先决条件：** 您需要一个启用了[Gemini API](https://cloud.google.com/vertex-ai/docs/generative-ai/learn/overview)的Google Cloud项目来运行此项目。
*   **在Colab中启动：**
    [![在Colab中打开](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/google-gemini/workshops/blob/main/adventure/Dungeon_Adventure.ipynb)
*   **在CNB中打开：**
    [![在CNB中打开](https://docs.cnb.cool/images/logo/svg/LogoCnColorfulIcon.svg)](./Dungeon_Adventure.ipynb)
*   **运行笔记本：** 在Google Colab中打开后，只需按顺序运行单元格。笔记本将指导您设置API密钥、初始化智能体并启动游戏循环。
*   **交互与观察：** 游戏按回合进行。在输出中观察展开的叙事和智能体交互。DM将呈现场景，玩家智能体将采取行动，动态推进冒险。

## 技术亮点

本项目很好地展示了：

*   **多智能体架构：** 展示了清晰的关注点分离，具有专门的DM和玩家智能体，每个都有特定的角色和约束，全部由CrewAI编排。
*   **上下文推理：** 实现了强大的上下文传递，DM接收完整的`game_history`和`player_roles`作为输入，以生成连贯的场景，这对于长期运行的叙事至关重要。
*   **用于控制的提示工程：** 强调了精心设计的提示（例如"要简洁"、"不要发明新角色"）对于引导LLM行为、维护叙事完整性以及克服LLM"幻觉"或主题漂移等常见挑战的重要性。
*   **动态团队创建：** 说明了CrewAI团队如何为特定任务动态创建和执行，例如在更大的游戏循环中处理单个活跃玩家的回合。
*   **持久状态管理：** 展示了有效使用`GameState`类来管理不断发展的叙事，允许DM始终参考过去事件并在现有故事基础上构建。

## 详细文档链接

*   **Colab笔记本：** 探索完整代码并交互式运行冒险：
    [Colab](https://colab.research.google.com/github/google-gemini/workshops/blob/main/adventure/Dungeon_Adventure.ipynb)
    [CNB](./Dungeon_Adventure.ipynb)
*   **开发笔记：** 要深入了解开发过程中的设计决策、挑战和架构选择，请参考`NOTES.md`文件：
    [adventure/NOTES.md](NOTES.md)