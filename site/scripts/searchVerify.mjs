// searchVerify.mjs —— 无浏览器自证：镜像前端搜索逻辑，对真实索引跑若干查询。
// 前置：node scripts/buildSearchIndex.mjs（或 npm run docs:prepare）已产出索引。
// 用途：CI/本地确认“中文连词/中英混合”能命中预期文档（核心验收）。
// 用法：node scripts/searchVerify.mjs   （site/ 下）
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { segmentQuery, rankResults } from '../.vitepress/theme/lib/segment.js'

const cwd = process.cwd()
const indexFile = join(cwd, '.vitepress', 'search-index.json')
if (!existsSync(indexFile)) {
  console.error('[searchVerify] 找不到索引，请先运行 node scripts/buildSearchIndex.mjs 或 npm run docs:prepare')
  process.exit(1)
}
const { docs } = JSON.parse(readFileSync(indexFile, 'utf8'))

// 用例：{ 描述, 查询, 期望命中（标题包含任一）}。全部命中才算 PASS。
const cases = [
  { desc: '中文连词精确命中 RAG 文档', query: '检索增强生成', expect: '为什么有了大模型还需要RAG' },
  { desc: '中英混合命中', query: 'RAG 切片策略', expect: '切片策略' },
  { desc: '英文缩写命中', query: 'RAG', expect: 'RAG' },
  { desc: '上下文工程命中', query: '上下文工程', expect: '上下文工程' },
  // 回归：以数字开头的查询不得被丢弃（"2026"）→ 应命中含年份的文档，而非空结果
  { desc: '以数字开头的查询命中', query: '2026', expect: '2026' }
]

let failed = 0
for (const c of cases) {
  const terms = segmentQuery(c.query)
  const ranked = rankResults(docs, terms, { limit: 8 })
  const hit = ranked.find((r) => r.d.title.includes(c.expect))
  const anyHit = Boolean(hit)
  const topOk = ranked.length && ranked[0].d.title.includes(c.expect)
  console.log(
    `${anyHit ? 'PASS' : 'FAIL'}  ${c.desc} | query="${c.query}" terms=${JSON.stringify(terms)} 命中 ${ranked.length} 篇 ` +
      `| top=${topOk ? 'Y' : 'N'} | 目标=${hit ? hit.d.title : '(未命中)'}`
  )
  if (!anyHit) failed++
}

if (failed) {
  console.error(`\n[searchVerify] ${failed}/${cases.length} 个用例未命中`)
  process.exit(1)
}
console.log(`\n[searchVerify] 全部 ${cases.length} 个用例通过 ✔ 中文连词/中英混合搜索可用`)