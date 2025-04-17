const fs = require('fs');
const path = require('path');
const sqlite3 = require('better-sqlite3');
const puppeteer = require('puppeteer');


console.log('User Home Directory:', process.env.HOME || process.env.USERPROFILE);

// 修改为实际的 Chrome 历史数据库路径
const chromeHistoryPath = path.resolve(
  process.env.HOME || process.env.USERPROFILE,
  'Library/Application Support/Google/Chrome/Default/History' // macOS 路径
  // Windows 可能是：'AppData/Local/Google/Chrome/User Data/Default/History'
);

// 检查文件是否存在
if (!fs.existsSync(chromeHistoryPath)) {
  console.error('Chrome history file not found at:', chromeHistoryPath);
  process.exit(1);
}

// 复制数据库（避免被 Chrome 占用锁）
const tempCopy = './history_copy.db';
fs.copyFileSync(chromeHistoryPath, tempCopy);

// 打开数据库
const db = new sqlite3(tempCopy);
const stmt = db.prepare(`
  SELECT url, title, last_visit_time 
  FROM urls 
  ORDER BY last_visit_time DESC 
  LIMIT 10
`);

const rows = stmt.all();

async function fetchPageContent(url) {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });

    const content = await page.evaluate(() => {
      // 提取页面的主内容部分（可以根据需求自定义选择器）
      return document.querySelector('main')?.innerText ||
             document.querySelector('article')?.innerText ||
             document.body?.innerText || '';
    });

    await browser.close();
    return content.trim();
  } catch (err) {
    console.error(`❌ Error fetching ${url}:`, err.message);
    return '';
  }
}

(async () => {
  const results = [];

  // 遍历浏览器历史记录
  for (const row of rows) {
    // console.log(`Fetching content from: ${row.url}`);
    const content = await fetchPageContent(row.url);
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
