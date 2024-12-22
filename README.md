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

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Feasychen%2Fai-rss%2Ftree%2Fmain%2Fserver&env=ADD_KEY,CACHE_MINUTES&envDescription=配置运行所需的环境变量&envLink=https://github.com/easychen/ai-rss/tree/main/server%23环境变量说明)

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

详细的 Docker 部署说明请参考 [server/README.md](server/README.md)。

## API 说明

主要接口：

- `GET /rss/:name`: 获取指定的 RSS feed
- `POST /add-sdd`: 添加新的 SDD 配置（需要 API 密钥）
- `GET /list`: 获取所有可用的 RSS feed 列表（需要 API 密钥）

详细的 API 文档请参考 [server/README.md](server/README.md#api-参考)。

## 许可证

MIT



