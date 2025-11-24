# 使用MediaPipe LLM推理API在浏览器中运行微调的Gemma 3 270M模型

此应用演示如何使用直接在浏览器中运行的微调Gemma 3 270M模型，从文本输入生成表情符号。在此演示中，您只需更改一行代码来指向您的MediaPipe任务模型包。

## 运行演示
1. 下载此目录中的应用文件，并将您的.task模型包包含在本地应用文件夹中。
2. 在worker.js文件中，更新`modelPath`以指向.task文件。
3. 在计算机上打开终端并导航（`cd`）到应用文件夹。
4. 运行`npx serve`启动本地服务器。
5. 在浏览器中打开提供的`localhost`地址来运行应用。

## 工作原理
此演示设置了一个简单的Web服务器来托管前端，用户可以在其中输入文本提示。这会在Web Worker中启动生成过程，以避免阻塞主UI线程。Worker使用MediaPipe Tasks GenAI包的捆绑版本（[@mediapipe/tasks-genai](https://www.npmjs.com/package/@mediapipe/tasks-genai)）从模型生成响应并将其发送回用户。

**要求：** 支持[WebGPU](https://caniuse.com/webgpu)的浏览器

## 资源
* [笔记本：微调Gemma 3 270M](../Demos/Emoji-Gemma-on-Web/resources/Fine_tune_Gemma_3_270M_for_emoji_generation.ipynb)
* [笔记本：转换Gemma 3 270M以用于MediaPipe](../resources/Convert_Gemma_3_270M_to_LiteRT_for_MediaPipe_LLM_Inference_API.ipynb)
* [MediaPipe LLM推理Web文档](https://ai.google.dev/edge/mediapipe/solutions/genai/llm_inference/web_js)