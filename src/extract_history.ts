import fs from 'fs';
import path from 'path';
import sqlite3 from 'better-sqlite3';
import puppeteer from 'puppeteer';

// 获取用户主目录
const userHome: string = process.env.HOME || process.env.USERPROFILE || '';
console.log('User Home Directory:', userHome);

// Chrome 历史数据库路径
const chromeHistoryPath: string = path.resolve(
  userHome,
  'Library/Application Support/Google/Chrome/Default/History' // macOS 路径
  // Windows 可能是：'AppData/Local/Google/Chrome/User Data/Default/History'
);

// 检查文件是否存在
if (!fs.existsSync(chromeHistoryPath)) {
  console.error('Chrome history file not found at:', chromeHistoryPath);
  process.exit(1);
}

// 复制数据库（避免被 Chrome 占用锁）
const tempCopy: string = './history_copy.db';
fs.copyFileSync(chromeHistoryPath, tempCopy);

// 打开数据库
const db = new sqlite3(tempCopy);
const stmt = db.prepare(`
  SELECT url, title, last_visit_time 
  FROM urls 
  ORDER BY last_visit_time DESC 
  LIMIT 100
`);

// 定义历史记录的类型
interface HistoryRow {
  url: string;
  title: string;
  last_visit_time: number;
}

const rows: HistoryRow[] = stmt.all() as HistoryRow[];
// 定义结果类型
interface Result {
  url: string;
  title: string;
  content: string;
}

// 提取页面内容
async function fetchPageContent(url: string): Promise<string> {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });

    const content: string = await page.evaluate(() => {
      // 提取页面的主内容部分（可以根据需求自定义选择器）
      return (
        document.querySelector('main')?.innerText ||
        document.querySelector('article')?.innerText ||
        document.body?.innerText ||
        ''
      );
    });

    await browser.close();
    return content.trim();
  } catch (err: any) {
    console.error(`❌ Error fetching ${url}:`, err.message);
    return '';
  }
}

// 主函数
(async () => {
  const results: Result[] = [];

  // 遍历浏览器历史记录
  for (const row of rows) {
    const content: string = await fetchPageContent(row.url);
    results.push({
      url: row.url,
      title: row.title,
      content: content.slice(0, 1000), // 控制内容输出的最大长度
    });
  }

  // 保存结果到文件
  fs.writeFileSync('./history_content.json', JSON.stringify(results, null, 2));
  console.log('✅ 数据已保存到 history_content.json');
})();