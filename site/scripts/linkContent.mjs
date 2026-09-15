import { symlinkSync, rmSync, existsSync, cpSync } from 'node:fs'
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
  try {
    cpSync(docsReal, linkTarget, { recursive: true })
    console.log('[linkContent] 复制 OK', linkTarget)
  } catch (copyErr) {
    console.error('[linkContent] 复制也失败：', copyErr.message)
    process.exit(1)
  }
}
