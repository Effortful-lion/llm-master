# LLM 学习笔记文档站 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为仓库 `docs/` 下 172 篇 Markdown 构建一个部署在 GitHub Pages 的私有静态文档站「LLM 学习笔记」，支持 jieba 中文全文搜索、分类/标签导航、阅读进度条、localStorage 历史记录、Notion 卡片式首页与黑白明暗切换、移动端适配。

**Architecture:** 站点工程全部收在新增的 `site/` 目录，现有 `docs/` 内容零改动、单源。构建前脚本把 `../../docs` 软链进 `site/src/docs`，使 VitePress（srcDir=src）渲染全部内容并手动配置多级侧边栏。GitHub Actions 在 push 到 main 时构建（含 jieba 索引 + 标签归档）并 deploy-pages 发布。阅读进度与历史记录为纯前端 Vue 组件 + localStorage。

**Tech Stack:** VitePress、Vue 3 (SFC)、gray-matter（frontmatter 解析）、nodejieba（中文分词）、GitHub Actions (deploy-pages)、Node 26 / npm 11。

---

## 文件结构总览

```
llm-master/
├── .github/workflows/deploy.yml     # 新：GitHub Actions 构建+发布
├── .gitignore                       # 新：根级忽略
├── README.md  LICENSE               # 保留
├── docs/                            # 现有内容，零改动
└── site/
    ├── package.json                 # 新：依赖与脚本
    ├── .gitignore                   # 新：node 产物
    ├── index.md                     # 新：首页入口
    ├── .vitepress/config.mjs        # 新：主配置（标题/侧边栏/搜索/主题）
    ├── .vitepress/theme/
    │   ├── index.mjs                # 新：主题增强注册
    │   ├── chineseSearchProvider.mjs # 新：jieba 搜索提供者（前端查询分词）
    │   └── components/
    │       ├── HomePage.vue         # 新：卡片式首页
    │       ├── ReadingProgress.vue  # 新：阅读进度条
    │       └── useHistory.js        # 新：localStorage 历史组合式函数
    ├── src/                         # 新：VitePress srcDir
    │   └── index.md                 # 新：首页实际落地文件
    └── scripts/
        ├── linkContent.mjs          # 新：软链 ../../docs -> src/docs
        ├── buildSearchIndex.mjs     # 新：jieba 分词建 chinese-search.json
        ├── generateTagPages.mjs     # 新：扫描 tags 生成归档页
        └── prepareBuild.mjs         # 新：串起 link+search+tags 的入口
```

---

### Task 1: 搭建 `site/` 工程骨架与 package.json

**目的**：让 `sane vitepress` 可运行，为后续任务打底。

**Files:**
- Create: `site/package.json`
- Create: `site/.gitignore`
- Create: `llm-master/.gitignore`（根级）

- [ ] **Step 1: 写 `site/package.json`**

```json
{
  "name": "llm-docs-site",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "docs:prepare": "node scripts/prepareBuild.mjs",
    "docs:dev": "vitepress dev --port 5173",
    "docs:build": "npm run docs:prepare && vitepress build src",
    "docs:preview": "vitepress preview src"
  },
  "dependencies": {
    "gray-matter": "^4.0.3",
    "nodejieba": "^2.6.0",
    "unist-util-visit": "^5.0.0"
  },
  "devDependencies": {
    "vitepress": "^1.6.3"
  }
}
```

注意：`docs:dev` 不跑 prepare 会看不到软链内容，因此 dev 前手动 `npm run docs:prepare` 一次即可（软链持久存在）。

- [ ] **Step 2: 写 `site/.gitignore`**

```
node_modules/
.vitepress/dist/
src/docs
.tmp/
```

- [ ] **Step 3: 写根级 `llm-master/.gitignore`**

根级只忽略 node 相关产物，完全不动 `docs/`：

```
site/node_modules/
site/.vitepress/dist/
site/src/docs
```

- [ ] **Step 4: 安装依赖并初始化 VitePress 结构**

Run: `cd site && npm install`
Expected: 成功，生成 `package-lock.json`，`node_modules/vitepress` 存在。

- [ ] **Step 5: 创建最小 `.vitepress/config.mjs` 占位（后续任务填充）**

Run: `mkdir -p site/.vitepress/theme/components site/.vitepress/theme site/scripts site/src`
Create `site/.vitepress/config.mjs`:

```js
import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'LLM 学习笔记',
  description: '大模型 / LLM 应用开发学习笔记与面试资料',
  srcDir: 'src',
  cleanUrls: true
})
```

- [ ] **Step 6: 跑通构建验证**

Run: `cd site && npm run docs:build`
Expected: 通过（src 下暂无内容也能构建出占位站点）。

- [ ] **Step 7: Commit**

```bash
git add site/package.json site/package-lock.json site/.gitignore .gitignore site/.vitepress/config.mjs
git commit -m "chore(site): scaffold vitepress project skeleton"
```

---

### Task 2: 内容接入（软链 `docs` → `src/docs`）

**目的**：让 `docs/` 内容单源被 VitePress 渲染，不复制。

**Files:**
- Create: `site/scripts/linkContent.mjs`
- Create: `site/scripts/prepareBuild.mjs`
- (可能) Modify: `site/.vitepress/config.mjs`（如需注释说明）

- [ ] **Step 1: 写 `site/scripts/linkContent.mjs`**

```js
import { symlinkSync, rmSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const siteRoot = join(here, '..')
const docsReal = join(siteRoot, '..', 'docs')   // 真实内容：仓库根/docs
const linkTarget = join(siteRoot, 'src', 'docs') // 软链落点：site/src/docs

if (!existsSync(docsReal)) {
  console.error('[linkContent] 找不到 docs/:', docsReal)
  console.error('  请确认在仓库 llm-master 根下运行构建（docs/ 应与 site/ 同级）。')
  process.exit(1)
}

try {
  rmSync(linkTarget, { recursive: true, force: true })
  symlinkSync(docsReal, linkTarget, 'dir')
  console.log('[linkContent] OK', linkTarget, '->', docsReal)
} catch (e) {
  // 兜底：若平台/环境不支持 symlink（如部分 CI），退化为复制目录
  console.error('[linkContent] symlink 失败，尝试复制：', e.message)
  import('node:fs')
    .then(async ({ cpSync }) => {
      cpSync(docsReal, linkTarget, { recursive: true })
      console.log('[linkContent] 复制 OK', linkTarget)
    })
}
```

- [ ] **Step 2: 写 `site/scripts/prepareBuild.mjs`（串起各脚本）**

```js
import { execSync } from 'node:child_process'

const run = (name) => {
  console.log(`\n=== ${name} ===`)
  execSync(`node scripts/${name}.mjs`, { cwd: process.cwd(), stdio: 'inherit' })
}

// 各阶段（后续任务逐步填 real，这里 link 先生效）
run('linkContent')
```

- [ ] **Step 3: 跑通 prepare**

Run: `cd site && npm run docs:prepare`
Expected: 输出 `[linkContent] OK site/src/docs -> ../docs`，且 `ls site/src/docs` 显示 6 个目录。
Run: `ls site/src/docs`
Expected: `interview jianli llm qita roadmap topics`

- [ ] **Step 4: 本地清理软链副作用（构建产物不入库）**

确认 `site/src/docs` 是软链且被 `.gitignore` 忽略即可，无需额外操作。

- [ ] **Step 5: Commit**

```bash
git add site/scripts/linkContent.mjs site/scripts/prepareBuild.mjs
git commit -m "feat(site): link docs content into build via symlink"
```

---

### Task 3: 多级侧边栏 + 分类导航

**目的**：`docs/` 目录结构 → 多级侧边栏。

**Files:**
- Modify: `site/.vitepress/config.mjs`

- [ ] **Step 1: 写侧边栏配置**

Modify `site/.vitepress/config.mjs`，在 `defineConfig` 内加 `themeConfig.sidebar`。顶层按 6 个分类，每个分类的 items 由该目录下的 `.md`（去掉首级 `docs/` 和 `.md` 后缀）生成。为可维护性用手写静态映射（6 类，量小且稳定）：

```js
import { defineConfig } from 'vitepress'

const navSidebar = [
  { text: 'LLM 入门', collapsed: false, items: [
      { text: 'Agentic RAG', link: '/docs/llm/intro/agentic_rag' },
      { text: 'AI 编程三层架构', link: '/docs/llm/intro/ai-coding-three-layers' },
      { text: '大模型学习路线', link: '/docs/llm/intro/llm_learning_roadmap' }
    ]}
]

export default defineConfig({
  title: 'LLM 学习笔记',
  description: '大模型 / LLM 应用开发学习笔记与面试资料',
  srcDir: 'src',
  cleanUrls: true,
  themeConfig: {
    search: { provider: 'local', options: { translations: { button: { buttonText: '搜索' } } } },
    sidebar: navSidebar
  }
})
```

这是一个**最小可用示例**；完整 6 分类的 sidebar 在此任务写全（如下）。用下面的完整版替换上面 `navSidebar`：

```js
const top = dir => `/docs/${dir}`
const sidebar = {
  '/docs/llm/': {},
  '/docs/interview/': {},
  '/docs/roadmap/': {},
  '/docs/topics/': {},
  '/docs/qita/': {},
  '/docs/jianli/': {}
}
// 具体 items 在后续验证时，通过遍历 site/src/docs/<dir>/*.md 动态生成即可（见 Step 2）
```

- [ ] **Step 2: 用脚本从目录动态生成 sidebar（避免手写 172 条）**

由于文档量大，改为**构建期脚本生成 sidebar**。新建 `site/scripts/genSidebar.mjs`，在 `docs:build` 前置执行，输出 `site/.vitepress/sidebar.generated.mjs`：

```js
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

const docsRoot = join(process.cwd(), 'src', 'docs')
const out = join(process.cwd(), '.vitepress', 'sidebar.generated.mjs')

const headings = {
  llm: '大模型',
  interview: '面试',
  roadmap: '学习路线',
  topics: '专题',
  qita: '其他',
  jianli: '简历'
}

function build(dir, base) {
  const entries = readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))
  const items = []
  for (const e of entries) {
    const abs = join(dir, e.name)
    const rel = join(base, e.name)
    if (e.isDirectory()) {
      items.push({ text: e.name, collapsed: true, items: build(abs, rel) })
    } else if (e.name.endsWith('.md') && e.name !== 'README.md') {
      items.push({ text: e.name.replace(/\.md$/, ''), link: `/${rel.replace(/\\/g, '/').replace(/\.md$/, '')}` })
    }
  }
  return items
}

const sidebar = {}
for (const [k] of Object.entries(headings)) {
  const full = join(docsRoot, k)
  if (existsSync(full)) sidebar[`/docs/${k}/`] = build(full, `docs/${k}`)
}

import { writeFileSync, existsSync } from 'node:fs'
writeFileSync(out, `export default ${JSON.stringify({ sidebar }, null, 2)}\n`)
console.log('[genSidebar] wrote', out)
```

注：README.md 被排除在 items 外（其作为分类落点由 config 手动指），其余 md 全进侧边栏。

- [ ] **Step 3: config 引入生成的 sidebar**

Modify `site/.vitepress/config.mjs`，顶部 `import generatedSidebar from './sidebar.generated.mjs'`，并把 `themeConfig.sidebar` 设为 `generatedSidebar.sidebar`。

把 `genSidebar` 加进 `prepareBuild.mjs` 的次序（`linkContent` 之后、构建之前）。

- [ ] **Step 4: 验证侧边栏生成**

Run: `cd site && npm run docs:prepare && node scripts/genSidebar.mjs && head -20 .vitepress/sidebar.generated.mjs`
Expected: 侧边栏 JSON 含 6 个分类键，llm 键下有多级 items。

- [ ] **Step 5: Commit**

```bash
git add site/scripts/genSidebar.mjs site/.vitepress/config.mjs site/scripts/prepareBuild.mjs
git commit -m "feat(site): generate multi-level sidebar from docs tree"
```

---

### Task 4: jieba 中文全文搜索

**目的**：构建期用 nodejieba 分词建索引 + 前端运行时中文分词查询。

**Files:**
- Create: `site/scripts/buildSearchIndex.mjs`
- Modify: `site/.vitepress/config.mjs`
- Create: `site/.vitepress/theme/chineseSearchProvider.mjs`
- Modify: `site/scripts/prepareBuild.mjs`

- [ ] **Step 1: 写 `buildSearchIndex.mjs`**

扫描 `src/docs/**/*.md`，解析 frontmatter（gray-matter）取 title/description/tags，正文分段，nodejieba 对每篇标题+正文分词，产出 `src/.vitepress/chinese-search.json` 结构（含每篇的 `title/url/cid/text-with-positions` 或经分词后的 token 集合）。

```js
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import matter from 'gray-matter'
import nodejieba from 'nodejieba'

nodejieba.load()

const root = process.cwd()
const docsRoot = join(root, 'src', 'docs')
const out = join(root, '.vitepress', 'chinese-search.json')

function listMd(dir) {
  const res = []
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) res.push(...listMd(p))
    else if (e.name.endsWith('.md')) res.push(p)
  }
  return res
}

const docs = []
for (const file of listMd(docsRoot)) {
  const raw = readFileSync(file, 'utf8')
  const { data, content } = matter(raw)
  const tokens = nodejieba.cut(`${data.title || ''} ${data.description || ''} ${content}`, true)
  docs.push({
    path: file.replace(docsRoot, '').replace(/\\/g, '/').replace(/^\/+/, '').replace(/\.md$/, ''),
    title: data.title || file.split('/').pop(),
    tags: data.tags || [],
    tokens
  })
}

writeFileSync(out, JSON.stringify({ version: 1, docs }))
console.log(`[buildSearchIndex] wrote ${out} · ${docs.length} docs`)
```

- [ ] **Step 2: 写前端搜索提供者 `chineseSearchProvider.mjs`**

实现快照信息的 `createChineseSearchProvider(options)`，基于本地 `chinese-search.json` + `nodejieba`（浏览器端用 `@node-rs/jieba` 或 web 版分词，见 Step 3）实现 `_search(rawQuery, options)`，查询前先 `nodejieba.cut` 再做包含匹配。

```js
// 浏览器端中文分词用轻量方案；此文件先留接口骨架，Step 3 决定分词库口径
export function createChineseSearchProvider(options) {
  return {
    options,
    search(rawQuery, searchOptions) {
      const query = rawQuery.trim()
      if (!query) return []
      // 简化：标题/标签/描述做大小写不敏感子串匹配，命中即返回
      // （最终实现由 Step 3 的 nodejieba 分词改进，这里保证可运行）
      const hits = []
      const q = query.toLowerCase()
      for (const d of INDEX.docs) {
        const title = (d.title || '').toLowerCase()
        const desc = (d.tags || []).join(' ').toLowerCase()
        if (title.includes(q) || desc.includes(q)) {
          hits.push({ route: d.route, title: d.title })
        }
      }
      return hits
    }
  }
}
```

- [ ] **Step 3: 选定并接入浏览器端中文分词**

在 config 引入 provider 前，先将最终方案固定：服务端索引已用 nodejieba 分词（构建期）。浏览器端查询分词用 **`@node-rs/jieba`**（WASM，无需原生编译）满足 Chinese 查询。

Run: `cd site && npm install @node-rs/jieba`
再在 config 的 `themeConfig.search` 改为自定义 provider（`provider: 'custom'` + `plugin` 返回 buildSearchIndex 的快照信息；查询实现用手写 provider）。

Modify `site/.vitepress/config.mjs`，`search` 改为：

```js
import { createChineseSearchProvider } from './theme/chineseSearchProvider.mjs'
search: {
  provider: 'custom',
  options: { appId: 'local', apiKey: 'local', indexName: 'llm' },
  // 构建期：把建好的索引作为快照信息注入
}
```

（注：VitePress 1.6 的 local 搜索不可直接注入自定义分词，因此采用 provider:'custom' 接管，实现完整 `_search`。若 1.6 的 custom provider 与文档版本细节有出入，以 VitePress 当前文档 `theme-search` 为准微调挂载点，目标不变：中文可精确搜连词。）

- [ ] **Step 4: 把 `buildSearchIndex` 加入 `prepareBuild.mjs` 次序**

在 `genSidebar` 之后追加 `run('buildSearchIndex')`。

- [ ] **Step 5: 验证搜索索引 + 中文连词命中**

Run: `cd site && npm run docs:prepare`
Run: `node -e "const idx=require('./.vitepress/chinese-search.json'); console.log('docs', idx.docs.length); const hit=idx.docs.find(d=>JSON.stringify(d.tokens).includes('检索增强生成')); console.log('连词命中:', hit && hit.title)"`
Expected: 打印 `docs <n>`，且命中一篇含"检索增强生成"的标题（如 why_rag 篇）。

- [ ] **Step 6: Commit**

```bash
git add site/scripts/buildSearchIndex.mjs site/.vitepress/config.mjs site/.vitepress/theme/chineseSearchProvider.mjs site/scripts/prepareBuild.mjs site/package.json site/package-lock.json
git commit -m "feat(site): add jieba-powered Chinese full-text search"
```

---

### Task 5: 标签归档页

**目的**：扫描 frontmatter `tags`，生成 `src/tags/<tag>.md` 归档页。

**Files:**
- Create: `site/scripts/generateTagPages.mjs`
- Modify: `site/scripts/prepareBuild.mjs`
- (可能) Modify: `site/.vitepress/config.mjs`（把 `/tags/` 加入 sidebar）

- [ ] **Step 1: 写 `generateTagPages.mjs`**

扫描 `src/docs/**/*.md`，汇总所有 `tags`，为每个 tag 生成 `src/tags/<slug>.md`：

```js
import { readdirSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import matter from 'gray-matter'

const docsRoot = join(process.cwd(), 'src', 'docs')
const tagDir = join(process.cwd(), 'src', 'tags')
mkdirSync(tagDir, { recursive: true })

function listMd(dir) {
  const res = []
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) res.push(...listMd(p))
    else if (e.name.endsWith('.md')) res.push(p)
  }
  return res
}

const byTag = new Map()
for (const file of listMd(docsRoot)) {
  const { data } = matter(readFileSync(file, 'utf8'))
  for (const tag of data.tags || []) {
    if (!byTag.has(tag)) byTag.set(tag, [])
    byTag
      .get(tag)
      .push(file.replace(docsRoot, '').replace(/^\/+/, '').replace(/\.md$/, ''))
  }
}

for (const [tag, files] of byTag) {
  const body = files.map(f => `- [${f.split('/').pop()}](${f})`).join('\n')
  writeFileSync(
    join(tagDir, `${tag}.md`),
    `# 标签：${tag}\n\n${body}\n`
  )
}

// 额外生成所有标签的总索引页
const allTags = [...byTag.keys()].sort()
writeFileSync(
  join(tagDir, `index.md`),
  `# 全部分类标签\n\n${allTags.map(t => `- [${t}](./${t}.md)`).join('\n')}\n`
)
console.log(`[generateTagPages] wrote ${byTag.size} tag pages + index`)
```

注：tag 名若含路径非法字符需做 slug 化（此任务先假设 tag 为中文/英文单词，符合现状；若出现非法字符，见 self-review 后修正为 encodeURIComponent 形式）。

- [ ] **Step 2: `generateTagPages` 加入 `prepareBuild.mjs` 次序**

在 `buildSearchIndex` 之后追加 `run('generateTagPages')`。

- [ ] **Step 3: config 把 `/tags/` 挂进导航（可选）**

Modify `site/.vitepress/config.mjs`，在 themeConfig.nav 或 sidebar 增加「标签」入口 `{ text: '标签', link: '/tags/index' }`。

- [ ] **Step 4: 验证标签归档生成**

Run: `cd site && npm run docs:prepare`
Expected: `site/src/tags/index.md` 存在；含如 `RAG.md`、`大模型应用.md` 等（取决于实际 tags）。

- [ ] **Step 5: Commit**

```bash
git add site/scripts/generateTagPages.mjs site/scripts/prepareBuild.mjs site/.vitepress/config.mjs
git commit -m "feat(site): auto-generate tag archive pages from frontmatter"
```

---

### Task 6: 阅读进度条组件

**目的**：每篇文章顶部细进度线，随滚动更新。

**Files:**
- Create: `site/.vitepress/theme/components/ReadingProgress.vue`
- Modify: `site/.vitepress/theme/index.mjs`

- [ ] **Step 1: 写 `ReadingProgress.vue`**

```vue
<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
const progress = ref(0)
let ticking = false

function onScroll() {
  if (ticking) return
  ticking = true
  requestAnimationFrame(() => {
    const el = document.documentElement
    const total = el.scrollHeight - el.clientHeight
    progress.value = total > 0 ? (el.scrollTop / total) * 100 : 0
    ticking = false
  })
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <div class="vp-reading-progress" :style="{ width: progress + '%' }" />
</template>

<style scoped>
.vp-reading-progress {
  position: fixed;
  top: 0; left: 0; height: 3px;
  background: var(--vp-c-brand-1, #3e63dd);
  z-index: 999;
  transition: width 0.1s ease;
}
</style>
```

- [ ] **Step 2: 在 `theme/index.mjs` 全局挂载**

```js
import DefaultTheme from 'vitepress/theme'
import ReadingProgress from './components/ReadingProgress.vue'

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component('ReadingProgress', ReadingProgress)
  },
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'layout-top': () => h(ReadingProgress)
    })
  }
}
```

注：`h` 需从 `vue` 引入。补全为 `import { h } from 'vue'`。

- [ ] **Step 3: 写 `site/.vitepress/theme/index.mjs`（完整版）**

```js
import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import ReadingProgress from './components/ReadingProgress.vue'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'layout-top': () => h(ReadingProgress)
    })
  }
}
```

- [ ] **Step 4: 验证**

Run: `cd site && npm run docs:build`
Expected: 构建通过；preview 时滚动文章页顶部见蓝色细进度线。

- [ ] **Step 5: Commit**

```bash
git add site/.vitepress/theme/index.mjs site/.vitepress/theme/components/ReadingProgress.vue
git commit -m "feat(site): add reading progress bar"
```

---

### Task 7: 历史阅读记录（localStorage）

**目的**：打开文章时写入本地历史，供首页「最近读过」读取。

**Files:**
- Create: `site/.vitepress/theme/components/useHistory.js`

- [ ] **Step 1: 写 `useHistory.js`**

```js
import { ref } from 'vue'

const KEY = 'llm-reading-history'
const MAX = 50

export function useHistory() {
  const items = ref([])

  function load() {
    try {
      items.value = JSON.parse(localStorage.getItem(KEY) || '[]')
    } catch {
      items.value = []
    }
  }

  function record(entry) {
    const list = (() => {
      try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
    })()
    const next = [{ ...entry, ts: Date.now() }, ...list.filter(e => e.path !== entry.path)].slice(0, MAX)
    localStorage.setItem(KEY, JSON.stringify(next))
    items.value = next
  }

  return { items, load, record }
}
```

- [ ] **Step 2: 在文章页记录**

需要 VitePress `onBeforeRouteChange`/`onAfterRouteChange` 钩子写入当前文章路径。Modify `site/.vitepress/theme/index.mjs`，加：

```js
import { onBeforeRouteChange } from 'vitepress'
import { useHistory } from './components/useHistory.js'

const history = useHistory()
onBeforeRouteChange((to) => {
  if (to.includes('/docs/')) history.record({ path: to, title: to.split('/').pop() })
})
```

（标题取路径最后一段为兜底；首页「最近读过」展示真实 title 见 Task 8 从 docs 映射，或在 record 时抓页面 `<title>`。）

- [ ] **Step 3: 验证（浏览器控制台）**

Run: `cd site && npm run docs:build && npm run docs:preview`
打开一篇文章后，DevTools → Application → LocalStorage，可见 `llm-reading-history` 写入一条。

- [ ] **Step 4: Commit**

```bash
git add site/.vitepress/theme/components/useHistory.js site/.vitepress/theme/index.mjs
git commit -m "feat(site): track reading history in localStorage"
```

---

### Task 8: 卡片式首页

**目的**：Notion 风格卡片网格：分类磁贴 / 最近读过 / 标签云 / 最新文章。

**Files:**
- Create: `site/.vitepress/theme/components/HomePage.vue`
- Modify: `site/index.md` 与 `site/src/index.md`

- [ ] **Step 1: 写 `HomePage.vue`（card 网格 + 四模块）**

```vue
<script setup>
import { ref, onMounted } from 'vue'
import { data as navData } from '../../../scripts/siteData.data.js' // 若用 data loader 提供分类/标签/最新
  
// 分类磁贴：写死 6 个（与 genSidebar 的 headings 一致）
const categories = [
  { name: '大模型 LLM', desc: '入门·应用·Transformer·动态', link: '/docs/llm/' },
  { name: '面试', desc: 'LLM/C++/Java 面试资料', link: '/docs/interview/' },
  { name: '学习路线', desc: '从零到进阶路线', link: '/docs/roadmap/' },
  { name: '专题', desc: 'RAG/Agent/微调/部署', link: '/docs/topics/' },
  { name: '其他', desc: '随手笔记', link: '/docs/qita/' },
  { name: '简历', desc: '求职简历资料', link: '/docs/jianli/' }
]

// 最近读过：来自 useHistory
import { useHistory } from './useHistory.js'
const { items, load: loadHistory } = useHistory()
onMounted(loadHistory)

// 标签云：构建期 data loader 注入（Step 2 实现）
const tags = ref([])
onMounted(async () => {
  const res = await import('/tags.json')
  tags.value = res.default
})
</script>

<template>
  <div class="home">
    <h1>LLM 学习笔记</h1>
    <section class="grid">
      <a v-for="c in categories" :key="c.name" class="card" :href="c.link">
        <h3>{{ c.name }}</h3><p>{{ c.desc }}</p>
      </a>
    </section>
    <section v-if="items.length">
      <h2>最近读过</h2>
      <ul class="history-list"><li v-for="i in items.slice(0,5)" :key="i.path"><a :href="i.path">{{ i.title }}</a></li></ul>
    </section>
    <section v-if="tags.length">
      <h2>标签</h2>
      <div class="tag-cloud"><a v-for="t in tags" :key="t.name" class="tag" :href="t.href">{{ t.name }}</a></div>
    </section>
  </div>
</template>

<style scoped>
.home { max-width: 960px; margin: 0 auto; padding: 24px; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
.card { display:block; padding: 20px; border-radius: 12px; border:1px solid var(--vp-c-divider); background: var(--vp-c-bg-soft); text-decoration:none; }
.card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,.06); }
.card h3 { margin:0 0 8px; color: var(--vp-c-brand-1); }
.card p { margin:0; color: var(--vp-c-text-2); font-size: .88em; }
.history-list li { margin: 6px 0; }
.tag-cloud { display:flex; flex-wrap:wrap; gap:8px; }
.tag { padding:4px 10px; border-radius:999px; background:var(--vp-c-bg-soft); border:1px solid var(--vp-c-divider); font-size:.85em; }
</style>
```

注：此文件依赖 `siteData.data.js`（data loader）提供 tags 等；若 data loader 方案在 1.6 兼容性上有阻碍，退化为把 tags 由 `generateTagPages` 一并写一个 `src/tags.json` 供首页 fetch。Step 2 定可行性。

- [ ] **Step 2: 写 data loader 或 tags.json fallback**

优先：新建 `site/scripts/siteData.data.js`（VitePress data loader）聚合分类/标签/最新文章供 HomePage import。若该 API 与 1.6 不匹配，改为让 `generateTagPages.mjs` 顺带写 `src/tags.json`：

```js
// generateTagPages.mjs 追加：
writeFileSync(join(tagDir, 'tags.json'), JSON.stringify([...byTag.entries()].map(([name, files]) => ({ name, href: `/tags/${name}`, count: files.length })))
```
并把 HomePage 的 `import tags.json` 指向该文件。**以实际跑通为准，二选一，不并存。**

- [ ] **Step 3: 把首页落地为 `site/src/index.md` + `site/index.md`**

Create `site/index.md`：内容最简单的落地（VitePress 会用 site root 的 index.md 作为 `/`）：

```md
---
layout: home
---

<script setup>
import HomePage from './.vitepress/theme/components/HomePage.vue'
</script>

<HomePage />
```

（把 HomePage 真正渲染；src/index.md 若与 root index 冲突，保留 root index.md 为准、删去 src 下重复入口。）

- [ ] **Step 4: 验证首页**

Run: `cd site && npm run docs:build`
Expected: 构建通过；preview 时 `/` 显示卡片网格（分类/最近读过/标签）。

- [ ] **Step 5: Commit**

```bash
git add site/index.md site/src/index.md site/.vitepress/theme/components/HomePage.vue site/scripts/generateTagPages.mjs site/scripts/siteData.data.js
git commit -m "feat(site): build notion-style card homepage"
```

---

### Task 9: 黑白明暗切换 + 移动端/平板适配

**目的**：跟随系统明暗切换（内置），响应式确认。

**Files:**
- Modify: `site/.vitepress/config.mjs`

- [ ] **Step 1: 确认内置明暗切换**

VitePress 默认提供外观切换（跟随系统/浅/深）。在 config 加：

```js
appearance: true   // 开启外观切换（默认即 true，显式声明以明示）
```

- [ ] **Step 2: 首页卡片响应式微调**

Modify `HomePage.vue` 的 `.grid` 已用 `auto-fill, minmax(240px,1fr)`，在窄屏自动单列。补充平板断点（若需要）：

```css
@media (max-width: 720px) {
  .grid { grid-template-columns: 1fr; }
  .home { padding: 16px; }
}
```

（移动端侧边栏折叠抽屉为 VitePress 内置能力，无需自写。）

- [ ] **Step 3: DevTools 验证**

Run: `npm run docs:preview`
用浏览器 DevTools 切换 320px / 768px / 1280px 宽度，确认：卡片单列 ↔ 多列、侧边栏抽屉可展开、明暗切换正常。

- [ ] **Step 4: Commit**

```bash
git add site/.vitepress/config.mjs site/.vitepress/theme/components/HomePage.vue
git commit -m "feat(site): enable appearance toggle and responsive tuning"
```

---

### Task 10: GitHub Actions 自动部署到 GH Pages

**目的**：push main → 构建 → deploy-pages。

**Files:**
- Create: `llm-master/.github/workflows/deploy.yml`

- [ ] **Step 1: 写 `deploy.yml`**

```yaml
name: Deploy VitePress site to Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: site/package-lock.json
      - name: Install deps
        working-directory: site
        run: npm ci
      - name: Build
        working-directory: site
        run: npm run docs:build
      - name: Upload pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: site/.vitepress/dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: 仓库启用 GitHub Pages**

（用户操作，需手动在 GitHub 仓库 Settings → Pages → Source 设为 GitHub Actions。）

- [ ] **Step 3: 推送并观察 CI**

Run: `git add .github/workflows/deploy.yml && git commit -m "ci: deploy site to github pages" && git push`
到 GitHub Actions 标签页查看 build/deploy 成功，站点地址形如 `https://<用户名>.github.io/llm-master/`。

- [ ] **Step 4: 验证线上**

打开线上地址，确认首页卡片、搜索、进度条、历史记录、明暗切换均正常。

- [ ] **Step 5: Commit（若 push 前未含此文件）**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: deploy vitepress site to github pages on push"
```

---

## 收尾验证清单

- [ ] `git add`/commit 均在对应 task 内完成（DRY）。
- [ ] `docs/` 目录零改动（`git status docs/` 干净）。
- [ ] 构建通过：`cd site && npm run docs:build`。
- [ ] 搜索能精确命中中文连词（如"检索增强生成"）。
- [ ] 首页四模块渲染正常；明暗切换生效；平板单列/多列正确。
- [ ] 阅读记录写入 localStorage 并在首页显示。
- [ ] CI 部署成功，线上可访问。

## 打开问题/风险（self-review 留下的实现提示）

- VitePress 1.6 的 `provider:'custom'` + 手动 `_search` 为本计划假设接口；若版本不一致，以 VitePress 官方 `theme-search` 文档为准调整挂载点，**搜索目标不回退**。
- `nodejieba` 为原生模块，在 `ubuntu-latest` CI 需能编译源码（有 prebuild 通常可）；若 CI 编译失败，浏览器端查询分词退回 `@node-rs/jieba`（WASM）或先走子串匹配，索引构建期分词不变。
- 首页 data loader 与 1.6 兼容性未定；fallback（生成 `src/tags.json` 供 fetch）已列，二选一实现。
- 软链 `src/docs` 在部分 Windows/CI 环境需 `cp` 兜底（linkContent.mjs 已含退化分支）。