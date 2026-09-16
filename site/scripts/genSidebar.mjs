import { readdirSync, existsSync, writeFileSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

// 取一篇文档的显示标题：优先 frontmatter title，其次文档首个一级 H1，最后回退文件名。
// 这样侧边栏显示中文章节名而不是 raw snake_case 文件名，提升中文阅读体验。
function docTitle(absFile, fallback) {
  const raw = readFileSync(absFile, 'utf8')
  // frontmatter 的 title 字段（YAML 简单形式）
  const fm = raw.match(/^title:\s*(.+)$/m)
  if (fm && fm[1].trim()) return fm[1].trim().replace(/^["'“”]+|["'“”]+$/g, '')
  // 首个 # 一级标题
  const h1 = raw.match(/^#\s+(.+)$/m)
  if (h1) return h1[1].trim()
  return fallback
}

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

// 二级子目录的中文文案（补充 headings 覆盖不到的中间层目录，提升侧边栏可读性）
const subdirLabels = {
  llm: { app: '应用开发', claude: 'Claude Code', intro: '入门', news: '动态', transformer: 'Transformer' },
  interview: { cpp: 'C++', java: 'Java', llm: '大模型' }
}

function build(dir, base, topKey) {
  const entries = readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))
  const items = []
  for (const e of entries) {
    const abs = join(dir, e.name)
    const rel = join(base, e.name)
    if (e.isDirectory()) {
      // 递归子目录；有内容的子目录才生成。子目录名优先用中文映射，其次保留原名。
      const children = build(abs, rel, topKey)
      if (children.length) {
        const subMap = subdirLabels[topKey] || {}
        items.push({ text: subMap[e.name] || e.name, collapsed: true, items: children })
      }
    } else if (e.name.endsWith('.md') && e.name !== 'README.md') {
      const link = `/${rel.replace(/\\/g, '/').replace(/\.md$/, '')}`
      const label = docTitle(abs, e.name.replace(/\.md$/, ''))
      items.push({ text: label, link })
    }
  }
  return items
}

const sidebar = {}
for (const key of Object.keys(headings)) {
  const full = join(docsRoot, key)
  if (existsSync(full)) {
    const items = build(full, `docs/${key}`, key)
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