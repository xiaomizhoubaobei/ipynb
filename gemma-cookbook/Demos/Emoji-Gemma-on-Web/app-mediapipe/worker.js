// 此演示需要importScripts，因此我们使用本地预构建的JavaScript包。

importScripts('/mediapipe_genai_bundle.js');              // 来自npm @mediapipe/tasks-genai@0.10.24

const { FilesetResolver, LlmInference } = self.BundledCode;

let llmInference;
let modelPath = './myemoji-gemma-3-270m-it.task';         // 更新以匹配您的模型文件

// 监听来自主线程的消息
self.onmessage = async (event) => {
  const { type, data } = event.data;
  console.log("[Worker] 接收到消息:", { type, data });

  switch (type) {
    case "load":
      try {
        console.log("[Worker] 正在加载模型...");
        // 在worker线程中加载模型
        const genai = await FilesetResolver.forGenAiTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai@latest/wasm');
        llmInference = await LlmInference.createFromOptions(genai, {
          baseOptions: {
            modelAssetPath: modelPath
          },
          maxTokens: 32, 
          temperature: .8,
          forceF32: true,
        });
        console.log("[Worker] 模型加载成功。");
        self.postMessage({ type: "loaded" });
      } catch (error) {
        console.error("[Worker] 加载模型时出错:", error);
        self.postMessage({ type: "error", data: error.message });
      }
      break;

    case "generate":
      if (!llmInference) {
        console.error("[Worker] 生成失败: 模型尚未加载。");
        self.postMessage({ type: "error", data: "模型尚未加载。" });
        return;
      }
      try {
        const generatedResponses = new Set();
        const prompt = `<start_of_turn>user\n将此文本翻译为表情符号: ${data.prompt}<end_of_turn>\n<start_of_turn>model\n`;
        // 从模型请求3个唯一、干净的响应
        for (let i = 0; i < 3; i++) {
          const modifiedPrompt = prompt + ' '.repeat(i);
          const rawResponse = await llmInference.generateResponse(modifiedPrompt);
          const cleanResponse = rawResponse.replace(/[^\p{Emoji}\s\u200D]/gu, '').trim();
          if (cleanResponse) {
            generatedResponses.add(cleanResponse);
          }
        }
        generatedResponses.forEach(response => {
        self.postMessage({ type: "result", data: response + '\n' });
        });
        self.postMessage({ type: "complete" });
      } catch (error) {
        console.error("[Worker] 生成过程中出错:", error);
        self.postMessage({ type: "error", data: error.message });
      }
      break;
  }
};
