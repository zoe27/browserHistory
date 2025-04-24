import { LlamaChatSession } from "node-llama-cpp";

export interface HistoryItem {
  url: string;
  title: string;
  content: string;
}

function buildSearchPrompt(query: string, historyItems: HistoryItem[]): string {
  const historyList = historyItems.map((item, i) =>
    `【${i + 1}】标题: ${item.title}\n网址: ${item.url}\n摘要: ${item.content}`
  ).join("\n\n");

  return `
你是一个聪明的搜索助手，任务是根据用户的查询，从浏览记录中找出最相关的网页。只返回最相关的网页，输出格式必须是 JSON 数组，如：
[
  { "title": "xxx", "url": "https://example.com/xxx" }
]

用户查询：
"${query}"

用户浏览记录：
${historyList}

请返回相关网页的标题和网址，**不要返回解释说明**，不要添加额外内容。
`;
}

function chunkArray<T>(arr: T[], chunkSize: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    result.push(arr.slice(i, i + chunkSize));
  }
  return result;
}

export async function searchHistory(
  query: string,
  historyItems: HistoryItem[],
  session: LlamaChatSession,
  batchSize: number = 10
): Promise<string> {
  console.log("🤖 正在按批次搜索历史记录...");

  const chunks = chunkArray(historyItems, batchSize);
  let allResults: any[] = [];

  for (let i = 0; i < chunks.length; i++) {
    console.log(`📦 处理第 ${i + 1}/${chunks.length} 批 (${chunks[i].length} 条记录)...`);
    const prompt = buildSearchPrompt(query, chunks[i]);
    
    const startTime = Date.now();
    const response = await session.prompt(prompt, {
      maxTokens: 256,
      temperature: 0.3
    });
    const elapsedTime = Date.now() - startTime;

    console.log(`⏱️ 批次 ${i + 1} 响应时间: ${elapsedTime}ms`);
    console.log("📤 返回内容:\n", response);

    try {
      const parsed = JSON.parse(response);
      if (Array.isArray(parsed)) {
        allResults.push(...parsed);
      }
    } catch (e) {
      console.warn(`⚠️ 第 ${i + 1} 批返回格式异常，跳过`);
    }
  }

  return JSON.stringify(allResults, null, 2);
}
