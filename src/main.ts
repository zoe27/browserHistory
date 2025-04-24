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

export async function main(query: string) {
  const context = await model.createContext();
  const session = new LlamaChatSession({
    contextSequence: context.getSequence()
  });
  console.log("🤖 会话创建完成");
  console.log("🤖 正在搜索历史记录...");

  const result = await searchHistory(query, historyItems, session);
  console.log("🤖 搜索结果:\n", result);
  return result;
}


// const query = "我之前看过关于 Web3 钱包安全的文章，是哪个？";
// main(query);