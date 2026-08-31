# Jankin's Timeline
个人时间线博客：纵向时间线 + 横向维度矩阵，记录多维度人生历程。
## 特性
- **纯静态**：HTML + CSS + 原生 JS，零构建，零服务器依赖
- **数据驱动**：内容存在 `data/posts.json`，Git 提交即更新
- **维度可配置**：在 `data/config.json` 中定义维度，每个维度独立配置颜色/图标/边框/背景
- **标签化内容**：一条内容可跨多个维度
- **双纪年系统**：公元纪年 / 干支纪年月日时 / 里程碑视图，一键切换
- **双视图**：时间线视图（混合）/ 矩阵视图（按维度分列）
- **维度主题**：选中某维度时，全站主色调切换为该维度颜色
- **搜索与筛选**：全文搜索 + 维度筛选 + 里程碑筛选
- **响应式**：桌面端横向矩阵，移动端单列 + 下拉筛选
- **可访问性**：语义化 HTML、键盘导航、焦点状态
## 快速开始
### 1. 部署
将整个项目目录上传到任何静态文件服务器（Nginx / GitHub Pages / Vercel / Netlify / 阿里云 OSS）。
> **注意**：不能直接用 `file://` 打开，因为 `fetch()` 加载 JSON 需要 HTTP 协议。本地预览可用 `python -m http.server 8000` 或 `npx serve`。
### 2. 添加内容
编辑 `data/posts.json`，添加新条目：
```json
{
  "id": "2024-004",
  "title": "标题",
  "date": "2024-08-15T14:30:00",
  "tags": ["books", "tech"],
  "milestone": false,
  "summary": "摘要（卡片上显示）",
  "content": "<p>完整内容，支持 HTML</p>",
  "image": "assets/images/xxx.jpg",
  "links": [{"text": "链接文字", "url": "https://..."}]
}
```