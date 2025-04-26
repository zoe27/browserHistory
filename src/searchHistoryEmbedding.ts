import * as tf from '@tensorflow/tfjs-node';
import axios from 'axios';

// 模拟历史记录
interface HistoryItem {
  url: string;
  title: string;
  content: string;
}

const historyItems: HistoryItem[] = [
  { url: "https://example.com/1", title: "GPT-4 vs Claude", content: "GPT-4 vs Claude comparison." },
  { url: "https://example.com/2", title: "Llama 2 vs Mistral", content: "Comparing Llama 2 and Mistral models." },
  { url: "https://example.com/3", title: "Deep learning advancements", content: "An overview of deep learning techniques." },
  // 添加更多历史记录
];

// 加载模型并生成嵌入向量
async function loadModelAndGenerateEmbedding(texts: string[]): Promise<Float32Array[]> {
  // 这里你可以加载 TensorFlow.js 支持的预训练模型，例如 BERT 或 MiniLM
  const model = await tf.loadGraphModel('https://storage.googleapis.com/sentence-transformers/bert-base-nli-mean-tokens/model.json');
  
  const embeddings: Float32Array[] = await Promise.all(texts.map(async (text) => {
    const inputTensor = tf.tensor2d([text]);
    const embedding = await model.predict(inputTensor) as tf.Tensor;
    return embedding.dataSync() as Float32Array;
  }));

  return embeddings;
}

// 计算相似度
function cosineSimilarity(vecA: Float32Array, vecB: Float32Array): number {
  const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
  const normA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (normA * normB);
}

// 步骤 2：计算查询与历史记录的相似度
async function searchHistory(query: string, historyItems: HistoryItem[]): Promise<void> {
  const texts = historyItems.map(item => `${item.title} ${item.content}`);
  const queryText = [query]; // 查询文本

  // 生成历史记录和查询的嵌入向量
  const [queryEmbedding, historyEmbeddings] = await Promise.all([
    loadModelAndGenerateEmbedding(queryText),
    loadModelAndGenerateEmbedding(texts),
  ]);

  const queryVector = queryEmbedding[0];
  const historyVectors = historyEmbeddings.map(item => item);

  // 步骤 3：计算相似度
  const similarities = historyVectors.map((vector, index) => {
    const sim = cosineSimilarity(queryVector, vector);
    return { index, sim };
  });

  // 按相似度排序并返回最相关的历史记录
  similarities.sort((a, b) => b.sim - a.sim);
  const topResults = similarities.slice(0, 5).map(item => ({
    title: historyItems[item.index].title,
    url: historyItems[item.index].url,
  }));

  console.log('最相关的历史记录：', topResults);
}

// 执行查询
const query = "GPT-4 vs Claude";
searchHistory(query, historyItems);
