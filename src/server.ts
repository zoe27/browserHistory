import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors'; // 引入 cors

import { main } from "./main.js";


const app = express();
const PORT = 3000;

// 使用 cors 中间件
app.use(cors());

// 使用 body-parser 中间件解析 JSON 请求体
app.use(bodyParser.json());

// 定义查询接口
app.post('/query', (req: Request, res: Response) => {
  const { query } = req.body;

  const result = main(query);

  // // 模拟数据库查询结果
  // const mockResult = [
  //   { id: 1, url: 'https://example.com', title: 'Example', last_visit_time: '2023-01-01' },
  //   { id: 2, url: 'https://test.com', title: 'Test', last_visit_time: '2023-01-02' },
  // ];

  // // 根据查询条件过滤结果
  // const filteredResult = mockResult.filter((item) =>
  //   item.title.includes(query) || item.url.includes(query)
  // );

  res.json(result);
});

// 启动服务
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});