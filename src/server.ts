import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors'; // 引入 cors
import axios from 'axios';

import { main, processQueryWithModel } from "./main.js";


const app = express();
const PORT = 3000;

// 使用 cors 中间件
app.use(cors());

// 使用 body-parser 中间件解析 JSON 请求体
app.use(bodyParser.json());

// 定义查询接口
app.post('/query', async (req: Request, res: Response) => {
  const { query } = req.body;


  const pythonResponse = await axios.post('http://127.0.0.1:5000/search', {
    query: query,
  });

  // 获取 Python 接口返回的结果
  const pythonResult = pythonResponse.data;

  console.log('Python Result:', pythonResponse.data);



  const prompt = `
    用户查询: ${query}
    Python 返回的结果:
    ${pythonResult.results.map((item: any, index: number) => `${index + 1}. ${item.title} (${item.url})，最后访问时间: ${item.last_visit_time}`).join('\n')}

    请根据用户的查询和返回的结果，分析并选择最合适的结果，不需要说明理由。
    格式为一个 JSON的数组，如：
    [{
      "title": "xxx",
      "url": "https://example.com/xxx"
      },
      {"title": "xxx",
      "url": "https://example.com/xxx"
      }]， 如果没有合适的结果，可以返回你的建议，格式也如上面的json数组，只是单个元素里边title为空就行， url为你的建议内容，前端需要根据统一格式渲染界面。
  `;
  
  // 合成 prompt
  // const prompt = `
  //   用户查询: ${query}
  //   Python 返回的结果:
  //   ${pythonResult.results.map((item: any, index: number) => `${index + 1}. ${item.title} (${item.url})，最后访问时间: ${item.last_visit_time}`).join('\n')}
  
  //   请根据用户的查询和返回的结果，分析并选择最合适的结果，并说明理由。
  // `;
  
  console.log('Prompt:', prompt);

  const r = await processQueryWithModel(query, pythonResult.results);
  console.log('最终结果:', r);

  res.status(200).json({ result: r });
});

// 启动服务
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});