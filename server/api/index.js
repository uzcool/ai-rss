import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { getFeed } from './feed.js'
import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import { cors } from 'hono/cors'
import { put, list } from '@vercel/blob';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const app = new Hono()
const ADD_KEY = process.env.ADD_KEY

// 修改环境变量检查
const isVercel = !!process.env.VERCEL_BLOB_STORE_NAME;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 添加 CORS 中间件
app.use('/*', cors({
  origin: '*',  // 允许所有来源，生产环境建议设置具体域名
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'X-Add-Key'],
  exposeHeaders: ['Content-Type']
}))

// 生成唯一key的函数
function generateUniqueKey(url) {
  const urlObj = new URL(url)
  const baseString = `${urlObj.hostname}${urlObj.pathname}`
  return crypto.createHash('md5').update(baseString).digest('hex').substring(0, 8)
}

// 验证SDD格式的函数
function validateSDD(sdd) {
  const requiredFields = ['version', 'url', 'title', 'data_list', 'data_list_elements', 'rss']
  return requiredFields.every(field => field in sdd)
}

app.get('/rss/:name', async (c) => {
  const name = c.req.param('name')
  try {
    const feed = await getFeed(name)
    c.header('Content-Type', 'application/xml')
    return c.body(feed)
  } catch (error) {
    console.error('Error:', error)
    return c.text('Error generating RSS feed', 500)
  }
})

app.get('/', async (c) => {
  return c.text('Hello World')
})

// 新增POST接口用于接收SDD
app.post('/add-sdd', async (c) => {
  // 检查ADD_KEY是否存在且匹配
  if (!ADD_KEY) {
    return c.json({ error: 'ADD_KEY not configured' }, 403)
  }

  const authKey = c.req.header('X-Add-Key')
  if (authKey !== ADD_KEY) {
    return c.json({ error: 'Invalid ADD_KEY' }, 403)
  }

  try {
    const body = await c.req.json()
    const { sdd } = body

    // 验证SDD格式 // save
    if (!validateSDD(sdd)) {
      return c.json({ error: 'Invalid SDD format' }, 400)
    }

    // 生成唯一key
    const uniqueKey = generateUniqueKey(sdd.url)
    
    if (isVercel) {
      // 使用 Vercel Blob 存储，添加 token 和 store 配置
      await put(`${uniqueKey}.sdd.json`, JSON.stringify(sdd, null, 2), {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
        contentType: 'application/json',
        store: process.env.VERCEL_BLOB_STORE_NAME,  // 指定存储名称
        addRandomSuffix: false
      });
    } else {
      // 使用新定义的 __dirname
      const sddDir = path.join(__dirname, 'sdd')
      await fs.mkdir(sddDir, { recursive: true })
      await fs.writeFile(
        path.join(sddDir, `${uniqueKey}.sdd.json`),
        JSON.stringify(sdd, null, 2)
      )
    }

    return c.json({
      success: true,
      key: uniqueKey,
      rss_url: `/rss/${uniqueKey}`
    })
  } catch (error) {
    console.error('Error adding SDD:', error)
    return c.json({ error: error.message }, 500)
  }
})

// 辅助函数：验证 ADD_KEY
function validateAddKey(c) {
  if (!ADD_KEY) {
    return false;
  }

  // 尝试从 header 获取
  const headerKey = c.req.header('X-Add-Key');
  if (headerKey === ADD_KEY) {
    return true;
  }

  // 尝试从 query 获取
  const queryKey = c.req.query('key');
  if (queryKey === ADD_KEY) {
    return true;
  }

  return false;
}

app.get('/list', async (c) => {
  // 使用新的验证函数
  if (!validateAddKey(c)) {
    return c.json({ 
      error: 'Invalid or missing ADD_KEY. Please provide key via X-Add-Key header or ?key=xxx query parameter' 
    }, 403);
  }

  try {
    let items = [];

    const protocol = c.req.header('x-forwarded-proto') || 'http';
    const host = c.req.header('host')
    const origin = `${protocol}://${host}`
    
    if (isVercel) {
      // 使用 Vercel Blob 列表，添加 token 和 store 配置
      const { blobs } = await list({
        token: process.env.BLOB_READ_WRITE_TOKEN,
        store: process.env.VERCEL_BLOB_STORE_NAME  // 指定存储名称
      });
      
      items = await Promise.all(blobs
        .filter(blob => blob.pathname.endsWith('.sdd.json'))
        .map(async (blob) => {
          // 直接使用 blob.url 获取内容
          const response = await fetch(blob.url);
          const content = await response.text();
          const sdd = JSON.parse(content);
          const key = blob.pathname.replace('.sdd.json', '');
          
          return {
            key,
            title: sdd.title,
            // blob_url: blob.url,
            url: sdd.url,
            rss_url: `${origin}/rss/${key}`,
            favicon: sdd.favicon
          };
        }));
    } else {
      // 使用新定义的 __dirname
      const sddDir = path.join(__dirname, 'sdd')
      const files = await fs.readdir(sddDir)
      const sddFiles = files.filter(file => file.endsWith('.sdd.json'))
      
      items = await Promise.all(sddFiles.map(async (file) => {
        const content = await fs.readFile(path.join(sddDir, file), 'utf-8')
        const sdd = JSON.parse(content)
        const key = file.replace('.sdd.json', '')
        
        return {
          key,
          title: sdd.title,
          url: sdd.url,
          rss_url: `${origin}/rss/${key}`,
          favicon: sdd.favicon
        }
      }))
    }

    return c.json({
      success: true,
      total: items.length,
      items
    })
  } catch (error) {
    console.error('Error listing SDDs:', error)
    return c.json({ error: error.message }, 500)
  }
})

const port = 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
}) 