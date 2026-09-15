import { readdirSync, existsSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const cwd = process.cwd()
const docsRoot = join(cwd, 'src', 'docs')
const out = join(cwd, '.vitepress', 'sidebar.generated.mjs')

// 顶层分类的中文文案
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
      // 递归子目录；有内容的子目录才生成
      const children = build(abs, rel)
      if (children.length) items.push({ text: e.name, collapsed: true, items: children })
    } else if (e.name.endsWith('.md') && e.name !== 'README.md') {
      const label = e.name.replace(/\.md$/, '')
      const link = `/${rel.replace(/\\/g, '/').replace(/\.md$/, '')}`
      items.push({ text: label, link })
    }
  }
  return items
}

const sidebar = {}
for (const key of Object.keys(headings)) {
  const full = join(docsRoot, key)
  if (existsSync(full)) {
    const items = build(full, `docs/${key}`)
    if (items.length) sidebar[`/docs/${key}/`] = items
  }
}

const meta = `// 本文件由 scripts/genSidebar.mjs 自动生成，请勿手改；重新生成请运行 npm run docs:prepare。\n`
writeFileSync(out, meta + `export default ${JSON.stringify({ sidebar }, null, 2)}\n`)
console.log(`[genSidebar] wrote ${out}`)