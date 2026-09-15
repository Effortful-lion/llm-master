import { readdirSync, readFileSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import matter from 'gray-matter'

// 注意：npm scripts 会在 site/ 下调用本脚本，故 process.cwd() === site/，
// 相对 src/ 的路径以 site/ 为基准。srcDir=src，故 src/tags/foo.md 对应 /tags/foo。
const cwd = process.cwd()
const docsRoot = join(cwd, 'src', 'docs')
const tagDir = join(cwd, 'src', 'tags')
// 清空旧产物，避免标签集缩小后残留陈旧页面
rmSync(tagDir, { recursive: true, force: true })
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

// 把 tag 转成 URL/文件名安全且 VitePress 能正确路由的 slug：
//   - 空格/非字母数字(除 -) → '-'；保留中英文与数字。
//   - 不能全盘保留原始 tag（如 "Claude Code"）作文件名——裸空格会让 markdown 链接
//     无法解析；也不能用 encodeURIComponent（"%XX" 文件名在 VitePress .temp 模块
//     引入时解码不一致而报 ERR_MODULE_NOT_FOUND）。
//   - slug 同时用于页面文件名(src/tags/<slug>.md → URL /tags/<slug>)与索引链接，
//     二者必须一致，VitePress 按文件路径路由。
function slugifyTag(tag) {
  return String(tag).trim().replace(/\s+/g, '-').replace(/[^\p{L}\p{N}-]/gu, '-')
}

// 收集原 tag 名 → slug 的映射，并保证 slug 唯一（macOS 默认大小写不敏感，避免
// 仅大小写不同的同名文件；若真冲突，追加序号）。
function makeSlugMap(rawTags) {
  const used = new Map() // slug -> count
  const map = new Map() // tag -> slug
  for (const tag of rawTags) {
    const base = slugifyTag(tag) || 'untagged'
    let slug = base
    let n = 2
    while (used.has(slug)) slug = `${base}-${n++}`
    used.set(slug, true)
    map.set(tag, slug)
  }
  return map
}

const byTag = new Map()
for (const file of listMd(docsRoot)) {
  const { data } = matter(readFileSync(file, 'utf8'))
  const route = file.replace(docsRoot, '').replace(/^[/\\]+/, '').replace(/\.md$/, '')
  for (const tag of data.tags || []) {
    if (!byTag.has(tag)) byTag.set(tag, [])
    byTag.get(tag).push(route)
  }
}

const tagSlug = makeSlugMap(byTag.keys())

for (const [tag, routes] of byTag) {
  // route 相对 src/（无 docs/ 前缀，如 llm/app/why_rag）。VitePress srcDir=src，
  // 页面 URL 为 /docs/llm/app/why_rag，故链接必须加绝对前缀 /docs/（相对链接会
  // 落在 /tags/... 下而 404）。
  const body = routes
    .map((r) => `- [${r.split('/').pop()}](/docs/${r})`)
    .join('\n')
  // <h1> 用原始 tag 展示；文件名用 slug
  writeFileSync(join(tagDir, `${tagSlug.get(tag)}.md`), `# ${tag}\n\n${body}\n`)
}

const allTags = [...byTag.keys()].sort()
// 索引链接必须用 URL 形式（/tags/<slug>，绝对路径、无空格），否者含空格的
// markdown 链接目的地无法被解析，会以字面文本 [x](y) 渲染成不可点击。
const indexBody = allTags
  .map((t) => `- [${t}](/tags/${tagSlug.get(t)})`)
  .join('\n')
writeFileSync(join(tagDir, 'index.md'), `# 全部分类标签\n\n${indexBody}\n`)

console.log(`[generateTagPages] ${byTag.size} 个标签 + 索引页写入 ${tagDir}`)