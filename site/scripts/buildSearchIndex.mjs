// buildSearchIndex.mjs
//
// 构建期中文全文搜索索引：扫描 src/docs/**/*.md（软链自 ../../docs），
// 用 nodejieba 对 title/description/keywords/tags + 正文开头做分词，
// 产出 site/.vitepress/search-index.json，供自建搜索 UI（方向A）在客户端读取。
//
// 匹配口径（与前端一致，避免“首尾不一致”）：
//   - 索引里存的是“全文窗口字符串”（title+description+keywords+tags+正文前 N 字），
//     而非预先存死的 token。
//   - 查询时把用户输入分词成若干词，检查每篇这段文本是否“包含全部查询词”（子串判含）。
//     中文词本身已是分词结果，无需再对文档文本二次分词，天然规避服务端/前端 token 不一致。
//   - 这里额外用 nodejieba 分词一份 tokens（仅用于前端排序加权，不影响命中判定）。
//
// 权衡：172 篇 × 正文前 1400 字 + 头尾元数据，索引 JSON 控制在 ~1MB 内，对本地站点可接受。

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'
import nodejieba from 'nodejieba'

const here = dirname(fileURLToPath(import.meta.url))
const cwd = process.cwd() // scripts 在 site/ 下运行
const srcRoot = join(cwd, 'src')
const docsRoot = join(srcRoot, 'docs')
// 主产物：.vitepress/search-index.json（供自验脚本/CI 读取）；
// src/public/search-index.json 供站点运行时 /search-index.json 按需 fetch。
// 注意：VitePress 的 publicDir = resolve(srcDir,'public') = <root>/src/public ，
// 故要写到 src/public 下，Vite 才会复制到构建产物根目录。
const out = join(cwd, '.vitepress', 'search-index.json')
const outPublic = join(cwd, 'src', 'public', 'search-index.json')

// 正文收录的前缀长度（字符）。仅收录正文开头可显著控制索引体积；
// 命中判断基于子串包含，标题/描述/关键词里出现的短语几乎都会被覆盖。
const BODY_PREFIX = 1400

nodejieba.load()

// 去 markdown 源里最常见的句法噪音，尽量保留正文可读文本。
const stripMarkdown = (src) =>
  src
    // 代码块整段去掉（含围栏本身）
    .replace(/```[\s\S]*?```/g, ' ')
    // inline code
    .replace(/`[^`]*`/g, ' ')
    // 行内链接/图片：取链接文字或 alt 文本
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    // 标题/列表标记
    .replace(/^#+\s*/gm, ' ')
    .replace(/^[-*+]\s+/gm, ' ')
    .replace(/^\s*\d+[.、)]\s*/gm, ' ')
    // 引用块
    .replace(/^>\s*/gm, ' ')
    // 强调/删除线
    .replace(/[*_~]+/g, ' ')
    // HTML 注释/标签
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<\/?[a-zA-Z][^>]*>/g, ' ')
    // 统一空白
    .replace(/\s+/g, ' ')
    .trim()

// 过滤停用词与单字噪声，避免无意义 token 干扰排序
const STOP = new Set([
  '的', '了', '是', '和', '与', '及', '在', '到', '为', '对', '有', '就', '都', '而', '并',
  '也', '这', '那', '把', '被', '一个', '一些', '这个', '那个', '我们', '你们', '他们',
  '可以', '需要', '如何', '为什么', '什么', '以及', '或者', '等', '从', '对于', '通过',
  '使用', '了解', '学习', '进行', '能够', 'a', 'an', 'the', 'and', 'or', 'of', 'to', 'for'
])
const isJunkToken = (t) => {
  const s = String(t).trim()
  if (!s || s.length < 2) return true
  if (STOP.has(s)) return true
  return /^[\s\W_]+$/.test(s) // 纯标点/符号/下划线
}

function walk(dir, base, outArr) {
  const entries = readdirSorted(dir)
  for (const name of entries) {
    const abs = join(dir, name)
    const rel = join(base, name)
    const st = statSyncSafe(abs)
    if (!st) continue
    if (st.isDirectory()) {
      walk(abs, rel, outArr)
    } else if (st.isFile() && name.endsWith('.md')) {
      outArr.push(abs)
    }
  }
}

const readdirSorted = (dir) => readdirSync(dir, { withFileTypes: true }).map((d) => d.name).sort((a, b) => a.localeCompare(b))
const statSyncSafe = (p) => { try { return statSync(p) } catch { return null } }

if (!existsSync(docsRoot)) {
  console.error('[buildSearchIndex] 找不到 src/docs（需先 linkContent）:', docsRoot)
  process.exit(1)
}

const mdFiles = []
walk(docsRoot, '', mdFiles)

const routeOf = (abs, srcRoot) => {
  // VitePress 以 srcDir('src') 为路由根：src/docs/llm/app/why_rag.md → /docs/llm/app/why_rag
  let relPosix = abs.replace(/\\/g, '/')
  const src = srcRoot.replace(/\\/g, '/')
  if (relPosix.startsWith(src)) relPosix = relPosix.slice(src.length)
  if (!relPosix.startsWith('/')) relPosix = `/${relPosix}`
  // 去掉 README.md → 目录本身；其余去 .md
  const noExt = relPosix.replace(/\.md$/, '')
  if (/\/README$/.test(noExt)) return noExt.replace(/\/README$/, '') || '/'
  return noExt
}

const docs = []
for (const abs of mdFiles) {
  const src = readFileSync(abs, 'utf8')
  const { data, content } = matter(src)
  const title = (data.title || '') .trim()
  const description = String(data.description || '').trim()
  const keywords = Array.isArray(data.keywords) ? data.keywords.map(String).join(' ') : String(data.keywords || '')
  const tags = Array.isArray(data.tags) ? data.tags.map(String).join(' ') : String(data.tags || '')
  const bodyText = stripMarkdown(content).slice(0, BODY_PREFIX)

  // 全文窗口：命中判定的唯一依据（子串包含全部查询词）
  const text = [title, description, keywords, tags, bodyText]
    .map((s) => s.trim()).filter(Boolean).join('\n')

  // 排序加权用的 token（nodejieba 对标题/关键词/描述分词）
  const segSource = [title, description, keywords, tags].filter(Boolean).join(' ')
  const tokens = nodejieba.cut(segSource, true).filter((t) => !isJunkToken(t))

  // 关键词/标签（规范化成字符串数组），排序时用于“词=精确关键词”加权
  const kwTags = []
  for (const f of [data.keywords, data.tags]) {
    if (Array.isArray(f)) kwTags.push(...f.map(String))
    else if (f != null && String(f).trim()) kwTags.push(String(f).trim())
  }

  docs.push({
    title: title || bodyText.slice(0, 40),
    route: routeOf(abs, srcRoot),
    text,
    keywords: kwTags,
    tokens
  })
}

const payload = JSON.stringify({ generatedAt: new Date().toISOString(), docs })
writeFileSync(out, payload)
mkdirSync(dirname(outPublic), { recursive: true })
writeFileSync(outPublic, payload)
const kb = Math.round((Buffer.byteLength(payload, 'utf8') / 1024))
console.log(`[buildSearchIndex] wrote ${out} (${docs.length} 篇, size ~${Math.max(1, kb)} KB)`)
console.log(`[buildSearchIndex] copied to ${outPublic}`)