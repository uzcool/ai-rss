# AiRSS Server - Vercel 部署指南


[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Feasychen%2Fai-rss%2Ftree%2Fmaster%2Fserver&env=ADD_KEY,CACHE_MINUTES&envDescription=配置运行所需的环境变量&envLink=https://github.com/easychen/ai-rss/tree/master/server%23服务器)
- 支持 Vercel Blob 存储
- 支持 API 密钥认证

## 部署步骤

### 方式一：一键部署
1. 点击上方的 "Deploy with Vercel" 按钮
2. 部署过程中需要设置以下环境变量：
   - `ADD_KEY`: 设置一个添加 RSS 的 API 访问密钥
   - `CACHE_MINUTES`: 设置缓存时间，单位为分钟，不设置则不缓存
   
3. 创建 Blob 存储：
   - 部署完成后，进入 Vercel 项目控制台
   - 转到 "Storage" 标签页
   - 点击 "Create Blob Store"
   - 回到项目的 storage 标签页，选中刚创建的 Blob 存储，点击 "Connect to Project"

### 方式二：手动部署
1. Fork 或克隆仓库
2. 安装依赖
   ```bash
   pnpm install
   ```
3. 配置环境变量
   在项目根目录创建 `.env` 文件：
   ```
   ADD_KEY=your_api_key
   VERCEL_BLOB_STORE_NAME=your_blob_store_name
   ```

4. 本地开发
   ```bash
   pnpm dev
   ```

## API 参考

### 主要端点
- `GET /rss/:name`: 获取指定 RSS feed
  - 参数: name (SDD配置的唯一标识)
  - 返回: RSS/Atom/JSON Feed

- `POST /add-sdd`: 添加新的 SDD 配置
  - 请求头: `X-Add-Key: your_api_key`
  - 请求体: 
    ```json
    {
      "sdd": {
        "version": 1,
        "url": "https://example.com",
        "title": "Feed Title",
        "data_list": {
          "selector": {
            "css": "article"
          }
        },
        "data_list_elements": {
          "title": {
            "selector": {
              "css": "h1"
            }
          }
        }
      }
    }
    ```
  - 返回:
    ```json
    {
      "success": true,
      "key": "unique_key",
      "rss_url": "https://your-domain.com/rss/unique_key"
    }
    ```

- `GET /list`: 获取所有可用的 RSS feed 列表
  - 请求头: `X-Add-Key: your_api_key` 或 URL参数 `?key=your_api_key`
  - 返回: Feed列表数组

## 注意事项
- 确保设置了正确的环境变量
- 生产环境建议配置具体的 CORS 域名
- 请妥善保管 `ADD_KEY`，避免泄露
- Vercel Blob 存储有使用限制，请参考 Vercel 官方文档
- Headless 浏览器抓取会消耗更多资源，请谨慎使用

## 许可证
MIT