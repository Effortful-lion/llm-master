# LLM 学习笔记 —— 文档静态站设计

日期：2026-09-15
状态：已批准（供实现参考）

## 背景与目标

为仓库 `/Users/lion/workspace/opensource/llm-master` 下现存 **172 篇 Markdown 文档**（`docs/` 目录）
构建一个**可长期增量的静态文档网站**，部署到 **GitHub Pages**，私有使用。

核心目标：
- 内容与站点工程**完全隔离**：现有 `docs/` 目录**一个字节都不改动**，站点工程全部收在新增的 `site/` 目录。
- **易于增量**：后续往 `docs/` 新增 `.md` 即可发布（push → CI 自动构建 → 发布），无需手改配置。
- 纯静态、无后端，满足阅读型文档站的全部诉求。

## 需求清单（已与用户确认）

| 需求 | 决定 |
|------|------|
| 站点框架 | VitePress（Vite/Vue） |
| 部署 | GitHub Pages + GitHub Actions 自动构建发布 |
| 站点名称 | LLM 学习笔记 |
| 可见性 | 公开 |
| 内容接入 | `site/` 配置通过构建脚本引用 `../docs`，内容只在 `docs/` 一份 |
| 全文搜索 | 内置本地搜索 + **jieba 中文分词**（nodejieba 构建期建索引） |
| 分类导航 | 由 `docs/` 目录结构自动生成多级侧边栏 |
| 标签归档 | 扫描 frontmatter `tags` 自动生成 `tags/<tag>.md` 归档页 |
| 阅读进度条 | 每篇文章顶部细进度线，随滚动显示百分比 |
| 历史记录 | localStorage 存最近打开文章，首页「最近读过」展示 |
| 首页风格 | Notion 式卡片网格（分类磁贴/最近读过/标签云/最新文章） |
| 主题 | 黑白明暗切换（跟随系统，可手动覆盖） |
| 响应式 | 移动端 + 平板适配，侧边栏折叠抽屉 |

## 非目标（YAGNI）

- 不做用户系统、评论、多用户协作。
- 不做 Algolia / 外部搜索服务。
- 不做内容管理后台。

## 架构

```
llm-master/
├── docs/                      # 现有 172 md，零改动
│   ├── llm/  interview/  roadmap/  topics/  qita/  jianli/
├── site/                      # 【新增】站点工程
│   ├── .vitepress/
│   │   ├── config.mjs         # 主配置
│   │   └── theme/
│   │       ├── index.mjs      # 主题增强注册
│   │       └── components/    # 首页/进度条/历史记录组件
│   ├── index.md               # 首页入口
│   ├── scripts/               # 内容接入 / 标签归档 / 搜索索引构建
│   ├── package.json
│   └── .gitignore
├── .github/workflows/deploy.yml   # GH Pages 自动部署
├── .gitignore                 # 根级忽略（仅 node 产物）
├── README.md                  # 保留
└── LICENSE                    # 保留
```

### 内容接入（srcRoot 方案）

- VitePress 通过 `srcDir` 决定渲染哪些 md。
- `site/scripts/link-content.mjs`（或配置等价物）在构建前把 `../docs` 接入构建路径，
  使 `site/` 与 `docs/` 都能被 VitePress 索引，**不复制、不破坏** `docs/` 结构。
- `docs/` 各子目录的 `README.md` 保留，作为对应分类的中文落点页。
- CI 与本地构建共用同一脚本，保证行为一致。

### 搜索（jieba 中文分词）

- 构建阶段：用 `nodejieba` 对每篇标题/正文分词，生成 `chinese-search.json` 索引。
- 前端：查询同样按 jieba 分词后命中，支持中文连词/短语（如"上下文工程"）精确命中。
- 英文/代码词（RAG、LLM）同样按词命中。
- 无外部服务、无 key，纯静态。

### 阅读进度 + 历史记录（纯前端 localStorage）

- 进度条：文档页顶部细线，滚动时更新百分比。
- 历史：打开文章时将 `{path, title, ts}` 写入 localStorage（键 `llm-history`）；
  首页读回展示最近 N 篇。仅本机浏览器生效，可配置上限条数。

### 首页（卡片网格）

`site/index.md` 注册自定义组件渲染卡片网格（深蓝主题）：
1. 分类磁贴 —— 由 `docs/` 目录结构生成。
2. 最近读过 —— 读 localStorage。
3. 标签云 —— 聚合 frontmatter `tags`。
4. 最新文章 —— 按层级粗排展示最近几篇。

### 标签归档

构建脚本扫描所有 md 的 frontmatter `tags`，生成 `docs/…/tags/<tag>.md`（或站内 `src/` 对应路径）
归档页，列出该标签下全部文章，并相互链接。

## 数据流

1. 开发者向 `docs/` 新增/修改 `.md`（含 frontmatter：`title/description/keywords/tags`）。
2. `git push` main → GitHub Actions 触发。
3. CI：`npm ci` → 内容接入 → 构建搜索索引(jieba) → 生成标签归档 → `npm run docs:build`。
4. `actions/deploy-pages` 发布静态产物到 GitHub Pages。
5. 用户打开网站：首页(卡片/最近读过/标签云) → 选择分类/搜索 → 阅读（进度条）→ 写入本地历史。

## 错误处理

- 搜索索引缺字段：跳过该篇，不影响构建。
- 无 frontmatter 的 md（约 18 篇）：仍保留在目录导航中，标题回退为文件名；无 `tags` 的归类"未分类"。
- localStorage 不可用或被清空：首页「最近读过」安静降级为空块，不报错。
- 构建脚本找不到 `../docs`（如首次 clone 未拉全）：给出明确报错提示，终止构建并输出排查指引。

## 测试 / 验证策略

- 本地：`npm run docs:build`（含 jieba 索引 + 标签归档）→ `vitepress preview` 起服务自查。
- 搜索验证：用一段含中文长句的示例文档，验证连词/短语能命中。
- CI：`actions/deploy-pages` 用官方 id-token 授权，**无需手动配置 secret**。
- 响应式：DevTools 模拟平板/手机尺寸，检查卡片堆叠与侧边栏折叠抽屉。

## 打开问题（如需再议）

- 无。所有已确认项均在本设计已定稿；实现细节（见 writing-plans 计划）允许在不改动本设计目标的前提下微调。