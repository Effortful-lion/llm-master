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

// sidebar 生成完毕，先做完整性校验再落盘：docsRoot 下若出现未在 headings 登记的顶层目录，
// 说明忘了维护中文标题，静默缺子树是隐患，这里显式报错（fail-fast，不写残缺的 sidebar）。
const srcDirs = readdirSync(docsRoot, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name)
  .sort()
const unregistered = srcDirs.filter(d => !(d in headings))
if (unregistered.length) {
  console.error('[genSidebar] 以下顶层目录未在 headings 中登记中文标题，将不会进入侧边栏:', unregistered)
  process.exit(1)
}

const meta = `// 本文件由 scripts/genSidebar.mjs 自动生成，请勿手改；重新生成请运行 npm run docs:prepare。\n`
writeFileSync(out, meta + `export default ${JSON.stringify({ sidebar }, null, 2)}\n`)
console.log(`[genSidebar] wrote ${out}`)