// src/searchHistory.ts

import { LlamaChatSession } from "node-llama-cpp";

// 你的历史记录数据结构
export interface HistoryItem {
  url: string;
  title: string;
  content: string;
}

// 构造 Prompt：根据 query 和历史记录拼接
function buildSearchPrompt(query: string, historyItems: HistoryItem[]): string {
  const historyList = historyItems.map((item, i) =>
    `【${i + 1}】标题: ${item.title}\n网址: ${item.url}\n内容摘要: ${item.content}`
  ).join("\n\n");

  return `
你是一个智能搜索助手。以下是用户最近浏览过的一些网页。用户现在想找回他之前看过的一篇内容，请根据用户的查询，在以下网页中找出最相关的内容，并返回对应的标题和网址（越简洁越好）。

用户查询：${query}

浏览记录：
${historyList}

请你只返回最相关的一个或几个网页的标题和网址（不要返回不相关的内容）。
`;
}

// 主函数：接入模型 session，生成回答
export async function searchHistory(
  query: string,
  historyItems: HistoryItem[],
  session: LlamaChatSession
): Promise<string> {
  
  const prompt = buildSearchPrompt(query, historyItems);
  console.log("🤖 Prompt 构建完成\n", prompt);
  const response = await session.prompt(prompt);
  console.log("🤖 返回结果");
  return response;
}
