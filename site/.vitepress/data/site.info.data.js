import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

// build 期数据加载器（VitePress *.data.js，default export 需含 load()）：
// 聚合“标签云”与“最新文章”数据，供首页 HomePage.vue import 消费。
// 本文件位于 site/.vitepress/data/，用 import.meta.url 锚定路径，不依赖 process.cwd()——
// 无论 vite 在何处起进程都能正确定位 src/。
const docsRoot = fileURLToPath(new URL('../../src/docs', import.meta.url))
const tagIndexFile = fileURLToPath(new URL('../../src/tags/index.md', import.meta.url))

// 递归收集 .md 文件（含各目录 README，作为分类落地页；仅“最新文章”排除 README）
function listMd(dir) {
  const res = []
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) res.push(...listMd(p))
    else if (e.name.endsWith('.md')) res.push(p)
  }
  return res
}

// 从文件里提取首个 markdown H1 标题，用于文档没有 frontmatter title 时的回退展示。
// 文档普遍以 `# ...` 开篇（frontmatter 后），逐行找 `^# ` 而非 `^## `。
function firstH1(content) {
  for (const line of content.split('\n')) {
    if (/^#\s+\S/.test(line)) return line.replace(/^#\s+/, '').trim()
  }
  return ''
}

// “最新文章”的代表性篇目。站点文档无可靠的时间戳（documents 为同一 checkout 时间），
// 按 mtime 排序无意义；这里选一组有代表性的核心文章，构建时校验路由是否存在，
// 缺失则从扫描结果回退补足，避免 404。
const CURATED_LATEST = [
  ['llm/app/why_rag', '为什么有了大模型还需要 RAG？'],
  ['llm/app/chain_of_rag', 'RAG 完整链路拆解'],
  ['llm/app/finetuning_sft_rlhf_dpo', 'SFT、RLHF、DPO：微调方法全景认知'],
  ['llm/app/lora_qlora', 'LoRA/QLoRA：低秩微调'],
  ['llm/transformer/transformer_base_1', '为什么所有大模型都绕不开 Transformer？'],
  ['llm/intro/model_distillation', '大模型蒸馏是什么？']
]

// 顶层分类卡片元数据。link 在建时动态生成：目录有 README 则指 README（作为目录落地页，
// 路由 /docs/<dir>/README），否则回退到该目录下第一篇 .md，保证卡片永远可点不 404。
const CATEGORY_META = [
  { dir: 'llm', name: '大模型 LLM', desc: '入门 · 应用 · Transformer · 动态' },
  { dir: 'interview', name: '面试', desc: 'LLM / C++ / Java 面试资料' },
  { dir: 'roadmap', name: '学习路线', desc: '从零到进阶的学习路径' },
  { dir: 'topics', name: '专题', desc: 'RAG · Agent · 微调 · 部署' },
  { dir: 'qita', name: '其他', desc: '随手笔记' },
  { dir: 'jianli', name: '简历', desc: '求职简历资料' }
]

export default {
  load() {
    // 标签显示名(原始名) -> 页面 URL(/tags/<slug>)，从 generateTagPages 生成的
    // src/tags/index.md 读取，保证与已产出的标签页路由口径完全一致（含 slugify 消歧）。
    const tagHref = new Map()
    try {
      for (const line of readFileSync(tagIndexFile, 'utf8').split('\n')) {
        const m = line.match(/^-\s*\[(.+)\]\((\/tags\/[^)]+)\)\s*$/)
        if (m) tagHref.set(m[1], m[2])
      }
    } catch {
      // tags 未生成时降级为空（buildSearchIndex/generateTagPages 之前调用本 loader 时）
    }

    // 扫描 docs，产出文档路由 + 标题 + 修改时间，并累计标签计数。
    const docs = []
    const tagCount = new Map()
    for (const f of listMd(docsRoot)) {
      const content = readFileSync(f, 'utf8')
      const { data } = matter(content)
      // 与 genSidebar.mjs 同口径：去 docsRoot 前缀、归一化斜杠、去 .md → /docs/<route>
      const route = f
        .replace(docsRoot, '')
        .replace(/^[/\\]+/, '')
        .replace(/[\\]/g, '/')
        .replace(/\.md$/, '')
      if (!route) continue
      const href = `/docs/${route}`
      const title =
        (data.title && String(data.title).trim()) ||
        firstH1(content) ||
        route.split('/').pop().replace(/[-_]/g, ' ')
      let mtimeMs = 0
      try {
        mtimeMs = statSync(f).mtimeMs
      } catch {}
      docs.push({ route: href, title, mtimeMs })
      for (const t of data.tags || []) tagCount.set(t, (tagCount.get(t) || 0) + 1)
    }

    // 标签云：只保留能跳转的（index.md 已收录），按计数降序、重名升序稳定排列
    const tags = [...tagCount.entries()]
      .map(([name, count]) => ({ name, count, href: tagHref.get(name) }))
      .filter((t) => t.href)
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))

    // 分类卡片：README 优先、否则目录下第一篇，并统计文章数。路由均来自扫到的真实文档，
    // 保证可点不 404。
    const byRoute = new Map(docs.map((d) => [d.route, d]))
    const categories = CATEGORY_META.map((meta) => {
      const prefix = `/docs/${meta.dir}/`
      const dirDocs = docs.filter((d) => d.route.startsWith(prefix))
      const readme = byRoute.get(`${prefix}README`)
      const fallback = dirDocs.find((d) => d.route !== `${prefix}README`)
      return {
        name: meta.name,
        desc: meta.desc,
        link: readme ? readme.route : fallback ? fallback.route : null,
        count: dirDocs.length
      }
    }).filter((c) => c.count > 0)

    // 最新文章：优质篇目优先（校验存在），排除 README 落地页，不足则按 mtime 回退补足。
    const isReadme = (r) => r.endsWith('/README')
    const latest = CURATED_LATEST.map(([r]) => byRoute.get(`/docs/${r}`))
      .filter((d) => d && !isReadme(d.route))
      .map((d) => ({ route: d.route, title: d.title }))
    if (latest.length < 4) {
      const seen = new Set(latest.map((l) => l.route))
      for (const d of docs.sort((a, b) => b.mtimeMs - a.mtimeMs)) {
        if (seen.has(d.route)) continue
        latest.push({ route: d.route, title: d.title })
        if (latest.length >= 6) break
      }
    }

    return { tags, latest, categories }
  }
}