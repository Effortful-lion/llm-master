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

// 缓存已生成的 tag 页，避免重复写同名文件（tag 名经 encodeURIComponent 后作为文件名）
const writtenFiles = new Set()

function slugifyTag(tag) {
  // VitePress 本地文件用原 tag 名即可（中文/英文单词无路径分隔符风险）。
  // 注意不能用 encodeURIComponent：生成含 "%XX" 的文件名会让 VitePress 的
  // .temp 模块引入时解码不一致而报 ERR_MODULE_NOT_FOUND。标签值均为单词。
  return tag
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

for (const [tag, routes] of byTag) {
  // route 相对 src/（无 docs/ 前缀，如 llm/app/why_rag）。VitePress srcDir=src，
  // 页面 URL 为 /docs/llm/app/why_rag，故链接必须加绝对前缀 /docs/（相对链接会
  // 落在 /tags/... 下而 404）。
  const body = routes
    .map((r) => `- [${r.split('/').pop()}](/docs/${r})`)
    .join('\n')
  const fname = slugifyTag(tag)
  writeFileSync(join(tagDir, `${fname}.md`), `# ${tag}\n\n${body}\n`)
  writtenFiles.add(fname)
}

const allTags = [...byTag.keys()].sort()
const indexBody = allTags
  .map((t) => `- [${t}](${slugifyTag(t)}.md)`)
  .join('\n')
writeFileSync(join(tagDir, 'index.md'), `# 全部分类标签\n\n${indexBody}\n`)

console.log(`[generateTagPages] ${byTag.size} 个标签 + 索引页写入 ${tagDir}`)