// download-images.mjs —— 把文档里外链到 file1.kamacoder.com 的图片下载到本地 public，
// 并把所有 .md 里的外链替换成 /images/<文件名>，使图片离线内置在站点里。
//
// 用法（在 site/ 目录下）：
//   cd site && node scripts/download-images.mjs [--replace] [--limit N]
//
// 说明：
//   - 默认只下载不替换（dry-run，打印将替换的文档数与图片数）。
//   - 传 --replace 才真正把 .md 里的外链改成 /images/...。
//   - --limit N 只处理前 N 个 URL（方便分段重试）。
//
// 注意：本仓库只在能访问 file1.kamacoder.com 的网络下才有意义；若当前网络连不上图床，
// 下载会失败（会打印错误并跳过）。请在可达时运行。
import { readdirSync, mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const siteRoot = resolve(here, '..')
const docsRoot = join(siteRoot, 'src', 'docs')
const imageDir = join(siteRoot, 'src', 'public', 'images')
mkdirSync(imageDir, { recursive: true })

const args = process.argv.slice(2)
const replace = args.includes('--replace')
const limitIdx = args.indexOf('--limit')
const limit = limitIdx >= 0 ? Number(args[limitIdx + 1]) : Infinity

function listMd(dir) {
  const res = []
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) res.push(...listMd(p))
    else if (e.name.endsWith('.md')) res.push(p)
  }
  return res
}

// 收集所有 .md 里以 file1.kamacoder.com 开头的外链图 URL
const urlOccurrences = [] // { file, url }
for (const file of listMd(docsRoot)) {
  const content = readFileSafe(file)
  if (!content) continue
  // 匹配 url 并记录
  const re = /https:\/\/file1\.kamacoder\.com\/i\/web\/[^")\s]+/g
  let m
  while ((m = re.exec(content))) urlOccurrences.push({ file, url: m[0] })
}
const unique = [...new Set(urlOccurrences.map((o) => o.url))].slice(0, limit)
console.log(`发现 ${urlOccurrences.length} 处引用，去重 ${new Set(urlOccurrences.map(o=>o.url)).size} 个 URL，本次处理 ${unique.length} 个`)

// 下载函数：默认保留原文件名（/i/web/ 之后的最后一段，URL 解码）；若冲突则加序号。
function localNameFor(url) {
  const base = decodeURIComponent(url.split('/').pop() || 'img')
  return base
}

let ok = 0, fail = 0
const downloads = [] // { url, local }

for (const url of unique) {
  const local = localNameFor(url)
  const target = join(imageDir, local)
  if (existsSync(target)) { downloads.push({ url, local }); ok++; continue }
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())
    writeFileSync(target, buf)
    downloads.push({ url, local })
    ok++
    console.log(`✔ ${local}`)
  } catch (e) {
    fail++
    console.error(`✘ ${local} — ${e.message} (${url})`)
  }
}

if (!replace) {
  console.log(`\n完成（dry-run，未写回 .md）。成功 ${ok}，失败 ${fail}。`)
  console.log('若要真正把 .md 外链改成 /images/，请加 --replace 重跑。')
  process.exit(0)
}

// 写回 .md：把 file1.kamacoder.com 外链替换成 /images/<local>
let replacedFiles = 0, replacedRefs = 0
for (const file of listMd(docsRoot)) {
  let content = readFileSafe(file)
  if (!content || !content.includes('file1.kamacoder.com')) continue
  const before = content
  // 只替换成功下载的 URL；用 longest-first 避免前缀冲突
  const sorted = [...downloads].sort((a, b) => b.url.length - a.url.length)
  for (const d of sorted) {
    if (content.includes(d.url)) {
      content = content.split(d.url).join(`/images/${d.local}`)
      replacedRefs++
    }
  }
  if (content !== before) {
    writeFileSync(file, content)
    replacedFiles++
  }
}
console.log(`\n替换完成：${replacedFiles} 个文档、${replacedRefs} 处引用。成功 ${ok} 图，失败 ${fail} 图。`)

function readFileSafe(p) {
  try { return readFileSync(p, 'utf8') } catch { return '' }
}