# AI RSS

AI RSS 是一个通过 AI 将网页内容转换为 RSS 订阅源的工具。

它包含两部分：

1. 一个浏览器插件，可以选择网页中的列表，并指定每一个数据项，最后生成一个 SDD（结构化数据描述） 文件
2. 一个服务器，可以部署到 Vercel 和 Docker/NAS 上，它读取 SDD 文件，根据配置抓取网页内容并分析，最终生成 RSS 订阅源

在浏览器插件中，用户可以一键发布 SDD 文件到服务器。

## 浏览器插件

### 预备

由于我们使用了AI的能力来分析网页内容，所以需要先注册一个 OpenAI/API2D/SillconFlow 的账号，并获取一个 API Key。

### 安装

插件市场地址


## 服务器

服务器支持两种部署方式：Vercel 和 Docker。

### Vercel 部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Feasychen%2Fai-rss%2Ftree%2Fmain%2Fserver&env=ADD_KEY,CACHE_MINUTES&envDescription=配置运行所需的环境变量&envLink=https://github.com/easychen/ai-rss)

1. 点击上方的 "Deploy with Vercel" 按钮
2. 部署时需要设置以下环境变量：
   - `ADD_KEY`: 设置一个添加 RSS 的 API 访问密钥
   - `CACHE_MINUTES`: 设置缓存时间（分钟），不设置则不缓存
   
3. 创建并连接 Blob 存储：
   - 部署完成后进入 Vercel 项目控制台
   - 转到 "Storage" 标签页
   - 点击 "Create Blob Store"
   - 在项目的 storage 标签页选择新创建的 Blob 存储，点击 "Connect to Project"

### Docker 部署

我们提供两种 Docker 部署方式：使用 Docker Compose 或直接使用 Docker 命令。

#### 使用 Docker Compose（推荐）

1. 创建一个工作目录并进入：

```bash
mkdir -p ai-rss-server
cd ai-rss-server
```

2. 下载 Docker Compose 文件：

```bash
wget https://raw.githubusercontent.com/easychen/ai-rss/main/server/docker-compose.yml
```

3. 创建一个 `.env` 文件，并添加以下环境变量：

```bash
ADD_KEY=your_api_key
CACHE_MINUTES=60
```

或者手工修改 `docker-compose.yml` 文件中的环境变量：

```yaml
  environment:
    - ADD_KEY=your_api_key
    - CACHE_MINUTES=60
```

4. 启动 Docker Compose：

```bash
docker-compose up -d
```

#### 使用 Docker 命令

1. 下载 Docker 镜像：

```bash
docker pull easychen/ai-rss-server:latest
```

2. 运行 Docker 容器：

```bash
docker run -d --name ai-rss-server -e ADD_KEY=your_api_key -e CACHE_MINUTES=5 easychen/ai-rss-server:latest
```

## API 说明

主要接口：

- `GET /rss/:name`: 获取指定的 RSS feed
- `POST /add-sdd`: 添加新的 SDD 配置（需要 API 密钥）
- `GET /list`: 获取所有可用的 RSS feed 列表（需要 API 密钥）

### 授权

API 密钥可以通过以下两种方式传递：

1. 通过 Header 传递：
```http
X-Add-Key: your_api_key
```

2. 通过 URL 查询参数传递：
```
?key=your_api_key
```

### 接口详情

#### 1. 获取 RSS Feed
```http
GET /rss/:name
```

- 参数：
  - `name`: RSS feed 的唯一标识符
- 返回：RSS XML 内容
- 无需授权

#### 2. 添加 SDD 配置
```http
POST /add-sdd
```

- Header：
  - `Content-Type: application/json`
  - `X-Add-Key: your_api_key`（必需）
- 请求体：
```json
{
  "sdd": {
    "version": "1.0",
    "url": "网页URL",
    "title": "标题",
    "data_list": "...",
    "data_list_elements": "...",
    "rss": "..."
  }
}
```
- 返回示例：
```json
{
  "success": true,
  "key": "生成的唯一key",
  "rss_url": "/rss/unique_key"
}
```

#### 3. 获取 RSS Feed 列表
```http
GET /list
```

- 授权：需要通过 Header 或 URL 参数提供 API 密钥
- 返回示例：
```json
{
  "success": true,
  "total": 2,
  "items": [
    {
      "key": "unique_key1",
      "title": "Feed 标题",
      "url": "原始网页URL",
      "rss_url": "RSS feed URL",
      "favicon": "网站图标URL"
    },
    // ...
  ]
}
```

## 许可证

MIT



