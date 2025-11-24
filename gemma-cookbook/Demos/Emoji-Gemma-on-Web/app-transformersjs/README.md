# 使用Transformers.js在浏览器中运行微调的Gemma 3 270M模型

此应用演示如何使用直接在浏览器中运行的微调Gemma 3 270M模型，从文本输入生成表情符号。在此演示中，您只需更改一行代码来指向您的ONNX模型。

## 运行演示
1. 下载此目录中的应用文件。
2. 在worker.js文件中，将`pipeline()`函数调用中的模型字符串更新为Hugging Face Hub上的模型。
    1. 或者，下载模型文件并将其放置在新的子目录中，即`app-transformersjs/myemoji-gemma-3-270m-it-onnx/`，以实现完全离线使用。
3. 在计算机上打开终端并导航（`cd`）到应用文件夹。
4. 运行`npx serve`启动本地服务器。
5. 在浏览器中打开提供的`localhost`地址来运行应用。

**要求：** 支持[WebGPU](https://caniuse.com/webgpu)的浏览器

## 工作原理
此演示设置了一个简单的Web服务器来托管前端，用户可以在其中输入文本提示。这会在Web Worker中启动生成过程，以避免阻塞主UI线程。Worker使用[Transformers.js](https://huggingface.co/docs/transformers.js/index)从模型生成响应并将其发送回用户。
 
## 资源
* [笔记本：微调Gemma 3 270M](../resources/Fine_tune_Gemma_3_270M_for_emoji_generation.ipynb)
* [笔记本：将Gemma 3 270M转换为ONNX](../resources/Convert_Gemma_3_270M_to_ONNX.ipynb)
* [Hugging Face Transformers.js文档](https://huggingface.co/docs/transformers.js/index)