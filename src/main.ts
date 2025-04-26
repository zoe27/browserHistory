// src/main.ts

import { getLlama, LlamaChatSession } from "node-llama-cpp";
import { searchHistory, HistoryItem } from "./searchHistory.js";
import fs from "fs";

const historyFilePath = "./history_content.json";

// 从文件中读取历史记录
const historyItems: HistoryItem[] = JSON.parse(fs.readFileSync(historyFilePath, 'utf-8'));

const llama = await getLlama();
const model = await llama.loadModel({
    // modelPath: "./model/qwen1_5-1_8b-chat-q5_k_m.gguf",
    modelPath: "/Users/zoe/Documents/web3/ai-agent/zoe/eliza/agent/model.gguf",
});

console.log("🤖 模型加载完成");

// 创建上下文和会话
const context = await model.createContext();
const session = new LlamaChatSession({
    contextSequence: context.getSequence(),
});
 


console.log("🤖 会话创建完成");


export async function main(query: string) {
  // const context = await model.createContext();
  // const session = new LlamaChatSession({
  //   contextSequence: context.getSequence()
  // });
  // console.log("🤖 会话创建完成");
  // console.log("🤖 正在搜索历史记录...");

  const result = await searchHistory(query, historyItems, session);
  console.log("🤖 搜索结果:\n", result);
  return result;
}


export async function processQueryWithModel(query: string, pythonResult: any[]): Promise<string> {
  // 合成 Prompt
  const prompt = `
    用户查询: ${query}
    Python 返回的结果:
    ${pythonResult.map((item, index) => `${index + 1}. ${item.title} (${item.url})，最后访问时间: ${item.last_visit_time}`).join('\n')}

    请根据用户的查询和返回的结果，分析并选择最合适的几个结果，具体几个根据你的判断来定，不需要说明理由。
    格式为一个 JSON的数组，如：
    [{
      "title": "xxx",
      "url": "https://example.com/xxx"
      },
      {"title": "xxx",
      "url": "https://example.com/xxx"
      }]， 如果没有合适的结果，可以返回你的建议，需要标明是你的建议，格式也如上面的json数组，只是单个元素里边title为空就行， url为你的建议内容，前端需要根据统一格式渲染界面。
  `;

  console.log("🤖 生成的 Prompt:", prompt);

  // 使用模型处理 Prompt
  const response = await session.prompt(prompt);
  session.resetChatHistory();

  console.log("🤖 模型处理完成");

  console.log("🤖 模型返回的结果:", response);

  return response;
}

// const query = "我之前看过关于 Web3 钱包安全的文章，是哪个？";
// main(query);