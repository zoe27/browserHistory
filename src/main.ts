// src/main.ts

import { getLlama, LlamaChatSession } from "node-llama-cpp";
import { searchHistory, HistoryItem } from "./searchHistory.js";
import fs from "fs";

const query = "我之前看过关于 Web3 钱包安全的文章，是哪个？";

// mock 一下浏览记录，或者从数据库/抓取模块加载
// const historyItems: HistoryItem[] = [
//   {
//     url: "https://example.com/web3-wallet-security",
//     title: "Web3 钱包安全指南",
//     content: "这篇文章介绍了 Web3 钱包的种类、常见风险、防范方法……"
//   },
//   {
//     url: "https://news.com/ai-llms",
//     title: "最新大模型发展趋势",
//     content: "OpenAI、Anthropic、Mistral 等大模型公司正在快速发展……"
//   }
// ];

// 从文件中读取历史记录
const historyFilePath = "./history_content.json";
const historyItems: HistoryItem[] = JSON.parse(fs.readFileSync(historyFilePath, 'utf-8'));


async function main() {
  const llama = await getLlama();
  const model = await llama.loadModel({
    modelPath: "/Users/zoe/Documents/web3/ai-agent/zoe/eliza/agent/model.gguf",
  });

  console.log("🤖 模型加载完成");

  const context = await model.createContext();
  const session = new LlamaChatSession({
    contextSequence: context.getSequence()
  });
  console.log("🤖 会话创建完成")
  console.log("🤖 正在搜索历史记录...");

  const result = await searchHistory(query, historyItems, session);
  console.log("🤖 搜索结果:\n", result);
}

main();
