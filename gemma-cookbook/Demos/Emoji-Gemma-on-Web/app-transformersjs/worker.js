import { env, pipeline } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.6.3";

// 跳过检查本地模型
env.allowLocalModels = false;                     // 如果您使用本地模型文件，请切换为`true`

let pipe;
// 更新以匹配您在HUGGING FACE HUB上的模型仓库
const modelPath = 'kr15t3n/my-emojigemma-onnx';
// const modelPath = './modelname-onnx'           // 如果您使用本地模型文件，请更新

// 监听来自主线程的消息
self.onmessage = async (event) => {
  const { type, data } = event.data;

  switch (type) {
    case "load":
      try {
        console.log("[Worker] 正在加载模型...");
        
        // 检查WebGPU支持，如果不可用则显示消息 
        const hasWebGPU = !!navigator.gpu;
        if (!hasWebGPU) {
          self.postMessage({ 
            type: "status_update", 
            data: "此浏览器或设备不支持WebGPU。使用较慢的(WASM)回退" 
          });
        }

        // 设置WebGPU和WASM(CPU)回退的管道选项
        const pipelineOptions = {
          dtype: "q4",                            // 指定要使用的onnx模型的量化版本
          device: hasWebGPU ? "webgpu" : "wasm",  // 如果可用则使用WebGPU，否则回退到WASM(CPU)
          progress_callback: (progress) => {
            // 报告主模型文件的下载进度
            if (progress.status === "progress" && progress.file?.endsWith?.("onnx_data")) {
              const reportedProgress = Math.floor(progress.progress);
              self.postMessage({ type: "progress", data: { progress: reportedProgress } });
            }
          },
        };  

        pipe = await pipeline(
          "text-generation", 
          modelPath,
          pipelineOptions
        );
        
        console.log("[Worker] 模型加载成功。");
        self.postMessage({ type: "loaded" });
      } catch (error) {
        console.error("[Worker] 模型加载失败:", error);
        self.postMessage({ type: "error", data: error.message });
      }
      break;

    case "generate":
      try {
        const messages = [
          { "role": "system", "content": "将此文本翻译为表情符号: " },
          { "role": "user", "content": data.prompt },
        ];
        const generatedResponses = new Set();
        // 从模型请求3个唯一、干净的响应
        for (let i = 0; i < 3; i++) {
          const results = await pipe(messages, { 
              max_new_tokens: 16, 
              do_sample: true, 
              temperature: 0.1, 
              top_p: 0.2, 
              top_k: 3, 
              num_return_sequences: 1, 
              repetition_penalty: 1.2,
              return_full_text: false 
          });
          
          let rawResponse = results[0].generated_text;
          console.log(`[Worker] 原始模型输出 (尝试 ${i + 1}):`, rawResponse);
          
          let assistantResponse = '';

          if (Array.isArray(rawResponse)) {
              const lastMessage = rawResponse[rawResponse.length - 1];
              if (lastMessage && lastMessage.role === 'assistant' && typeof lastMessage.content === 'string') {
                  assistantResponse = lastMessage.content;
              }
          } else if (typeof rawResponse === 'string') {
              assistantResponse = rawResponse;
          }
          if (assistantResponse) {
              const cleanResponse = assistantResponse.replace(/[^\p{Emoji}\s\u200D]/gu, '').trim();
              if (cleanResponse && !generatedResponses.has(cleanResponse)) {
                  generatedResponses.add(cleanResponse);
                  self.postMessage({ type: "result", data: cleanResponse });
              }
          }
        }
        
        console.log("[Worker] 生成完成。");
        self.postMessage({ type: "complete" });
      } catch (error) {
        console.error("[Worker] 生成失败:", error);
        self.postMessage({ type: "error", data: error.message });
      }
      break;
  }
};