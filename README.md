# AI RSS

AI RSS 是一个通过 AI 将网页内容转换为 RSS 订阅源的工具。



https://github.com/user-attachments/assets/5c5f7fc2-ccec-47d8-90b0-6ee323aca237


[完整使用教程请移步B站](https://www.bilibili.com/video/BV1GJkdYdE9i)

它包含两部分：

1. 一个浏览器插件，可以选择网页中的列表，并指定每一个数据项，最后生成一个 SDD（结构化数据描述） 文件
2. 一个服务器端，可以部署到 Vercel 和 Docker/NAS 上，它读取 SDD 文件，根据配置抓取网页内容并分析，最终生成 RSS 订阅源

本仓库：
1. 提供服务器端源代码，按MIT协议开源
2. 提供浏览器插件zip包下载，插件部分不开源

在浏览器插件中，用户可以一键发布 [结构化数据描述SDD](https://github.com/easychen/sdd) 格式文件到服务器，并用其生成RSS。

## 浏览器插件

### 准备工作

由于我们使用了AI的能力来分析网页内容，所以需要先注册一个 [OpenAI](https://platform.openai.com)/[API2D](https://api2d.com/r/186008)/[SillconFlow](https://cloud.siliconflow.cn/i/GKAoff2O) 的账号，并获取一个 API Key。

### 安装

支持 Chrome 和 Edge 浏览器。

1. 插件商店：[Chrome商店](https://chromewebstore.google.com/detail/airss/hhconojkeohomnfbpbioamldompinckh?authuser=0&hl=en&pli=1) | [Edge商店](https://microsoftedge.microsoft.com/addons/detail/airss/kgbiogeimnehnobgjpbebphdgmflijgl)
2. 在Releases页面下载插件包，解压后，在浏览器中打开 `chrome://extensions/` 页面，点击 "加载已解压的扩展程序"，选择解压后的文件夹。


## 服务器

服务器支持两种部署方式：Vercel 和 Docker。

### Vercel 部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Feasychen%2Fai-rss%2Ftree%2Fmaster%2Fserver&env=ADD_KEY,CACHE_MINUTES&envDescription=配置运行所需的环境变量&envLink=https://github.com/easychen/ai-rss/tree/master/server%23服务器)

1. 点击上方的 "Deploy with Vercel" 按钮
2. 部署时需要设置以下环境变量：
   - `ADD_KEY`: 设置一个添加 RSS 的 API 访问密钥
   - `CACHE_MINUTES`: 设置缓存时间（分钟），不设置则不缓存
   
3. 创建并连接 Blob 存储：
   - 部署完成后进入 Vercel 项目控制台
   - 转到 "Storage" 标签页
   - 点击 "Create Blob Store"
   - 在项目的 storage 标签页选择新创建的 Blob 存储，点击 "Connect to Project"

注意：

1. 如果连接 storage 以后，首页依然是 "blob_storage_configured": false，请到 vercel 控制台中 redeploy 一次以使其强制生效 
2. vercel 默认提供的 *.vercel.app 二级域名在中国大陆网络可能无法访问，可绑定自己的域名后使用

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
wget https://raw.githubusercontent.com/easychen/ai-rss/master/server/docker-compose.yml
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

注意：

1. 由于浏览器插件是注入到网页中执行的，因此，受浏览器限制，使用HTTPS的网站只能往HTTPS下的服务器端发送信息，你需要为服务器端配置SSL证书

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



