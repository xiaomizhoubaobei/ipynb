// 设置DOM引用
const generateBtn = document.getElementById("generate-btn");
const promptInput = document.getElementById("prompt-input");
const responseOutput = document.getElementById("response-output");
const statusMessageContainer = document.getElementById("status-message");

const workerPath = './worker.js';
let worker;
let modelReady = false;

// 处理表情符号翻译结果的点击复制事件
function handleEmojiButtonClick(result) {
  navigator.clipboard.writeText(result);
  statusMessageContainer.textContent = `已复制到剪贴板: ${result}`;
  console.log(`[UI] 已将"${result}"复制到剪贴板。`);
}

// 为表情符号翻译结果创建并附加按钮
function createEmojiButton(result) {
  const button = document.createElement("button");
  button.textContent = result;
  button.onclick = () => handleEmojiButtonClick(result);
  responseOutput.appendChild(button);
}

// 检查WebGPU可用性，如果不可用则显示错误消息
function checkWebGPU() {
  if (!navigator.gpu) {
    statusMessageContainer.innerHTML = `
      此应用程序需要WebGPU才能在浏览器中运行模型。
      请更新您的浏览器以启用WebGPU支持，尝试使用不同的浏览器（如Chrome或Edge，版本113+），或确保您的GPU驱动程序是最新的。</br></br>
      更多详情，请阅读<a href="https://github.com/gpuweb/gpuweb/wiki/Implementation-Status" target="_blank" style="f; color: #286aac">WebGPU实现状态</a>。
    `;
    generateBtn.disabled = true;
    return false;
  }
  return true;
}

// 运行worker的主函数
async function initializeModelInWorker() {
  console.log("[UI] 正在初始化应用程序...");
  
  // 创建一个模拟进度加载器，模型加载完成后清除
  if (!checkWebGPU()) {
    return;
  }
  let loadingInterval;
  let progress = 0;
  statusMessageContainer.textContent = "正在加载模型 (0%)";
  loadingInterval = setInterval(() => {
    if (progress < 99) {
      progress++;
    }
    statusMessageContainer.textContent = `正在加载模型 (${progress}%)`;
  }, 70);

  // 创建一个新的worker在单独的线程中运行模型
  worker = new Worker(workerPath);
  console.log("[UI] Worker已创建。");

  // 监听来自worker的消息
  worker.onmessage = (event) => {
    const { type, data } = event.data;
    console.log("[UI] 从worker接收到消息:", { type, data });

    switch (type) {
      case "loaded":
        clearInterval(loadingInterval); // 停止假加载器
        statusMessageContainer.textContent = `正在加载模型 (100%)`; // 简短显示100%
        modelReady = true;
        generateBtn.disabled = false;             // 模型加载完成后启用生成按钮
        setTimeout(() => { 
          statusMessageContainer.innerHTML = ``;  // 然后清空状态消息
        }, 500);
        break;
      
      case "result":
        const line = data.trim();
        if (line) {
          createEmojiButton(line);
        }
        break;
        
      case "complete":
        responseComplete();
        break;
      case "error":
        clearInterval(loadingInterval);
        console.error("Worker错误:", data);
        if (modelReady) {
          // 生成过程中的错误
          generateBtn.classList.remove('generating');
          statusMessageContainer.textContent =
            "生成响应失败。请检查控制台中的错误。";
          generateBtn.disabled = false; // 重新启用按钮
        } else {
          // 模型加载过程中的错误
          statusMessageContainer.textContent = "加载模型失败。请刷新页面。";
        }
        break;
    }
  };

  // 在worker中开始加载模型
  console.log('[UI] 向worker发送"load"消息。');
  worker.postMessage({ type: "load" });
}

function responseComplete() {
  generateBtn.classList.remove('generating');
  generateBtn.disabled = false;
  
  if (responseOutput.childElementCount === 0) {
    statusMessageContainer.textContent = "无结果";
  } else {
    // 如果有结果，清除状态消息
    statusMessageContainer.textContent = "点击复制表情符号";
    // 为了可访问性，将焦点移动到第一个结果，以便键盘用户可以导航它们。
    responseOutput.firstChild.focus();
  }
}

function resetUI() {
  console.log("[UI] 重置UI状态。");
  generateBtn.classList.add('generating');
  generateBtn.disabled = true;
  responseOutput.innerHTML = ""; // 清除之前的按钮
  statusMessageContainer.textContent = "正在生成..."; // 设置生成状态
}

async function generateResponse() {
  const prompt = promptInput.value.trim();
  if (!prompt) {
    statusMessageContainer.textContent = "请输入提示词。";
    return;
  }

  if (!worker || !modelReady) {
    statusMessageContainer.textContent = "模型尚未准备好。请稍候。";
    return;
  }

  resetUI();

  // 向worker发送提示词以开始生成
  console.log(
    `[UI] 向worker发送"generate"消息，提示词为: "${prompt}"`
  );
  worker.postMessage({ type: "generate", data: { prompt } });
}

// 脚本加载后，初始化文本生成器。
async function initializeAndAttachListeners() {
  console.log("[UI] 开始初始化并附加监听器。");

  await initializeModelInWorker();

  generateBtn.addEventListener("click", generateResponse);

  // 为提示词输入字段中的"Enter"键按下添加事件监听器
  promptInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && !event.shiftKey && !generateBtn.disabled) {
      console.log('[UI] 按下"Enter"键，触发生成。');
      event.preventDefault(); // 阻止默认操作（表单提交/新行）
      generateResponse();
    }
  });
}

initializeAndAttachListeners();
