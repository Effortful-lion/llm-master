// segment.js —— 前端查询分词（SSR 安全）。
//
// 命中口径：索引里存整段文本，查询时把输入分词成若干词，检查每篇文本是否
// 包含“全部查询词”（子串判含）。中文词本身即分词结果，故无需对文档文本二次分词，
// 天然与服务端 nodejieba 口径一致，避免 token 首尾不一致。
//
// 查询分词策略（确定性、零依赖、SSR 安全）：
//   1. 按空白与常见中英文标点把 query 切开；
//   2. 每个“连续单元”（中文连序、英文/数字词）作为一个词；
//   3. 纯标点、单字符英文、无信息量单元会被剔除。
// 这样“检索增强生成”整体作为一个词参与子串匹配，能精确命中标题/正文含该短语的文档；
// “RAG 检索增强生成”拆成 [RAG, 检索增强生成]，要求文档两词都含，中英混查同样准确。
//
// 可选增强：若场景需要更强的逐步切分（例如“上下工程”→想命中“上下文工程”），
// 可引入 @node-rs/jieba 分词。但其完整字典约 5MB 且走 fs.readFileSync 读 dict.txt，
// 打包进浏览器不现实，故这里保持轻量内置分词作为基线；如需升级，改为在 onMounted
const PUNCT_REGEX = /[\s·,，。.!！?？;；:："'""''（）()\[\]【】{}<>《》、|/\\\-_*#]+/u

/**
 * 用户查询 → 查询词数组（每个词为“需要全部命中”的子串）。
 */
export function segmentQuery(query) {
  const raw = String(query || '')
    .trim()
    .toLowerCase()
  if (!raw) return []
  const units = raw.split(PUNCT_REGEX).map((s) => s.trim()).filter(Boolean)
  const seen = new Set()
  return units
    .map(cleanUnit)
    .filter((u) => u.length >= 2)
    .filter((u) => !/^[0-9]/.test(u) && !/^[a-z]$/i.test(u))
    .filter((u) => { if (seen.has(u)) return false; seen.add(u); return true })
}

// 单字符的中文单字（如“检”“索”）信息量低，但在连续单元里保留；仅剔除无意义残片。
function cleanUnit(s) {
  // 全角→半角、大小写归一
  return s
    .replace(/[＀-￯]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .toLowerCase()
}

/**
 * 命中判定：所有查询词都是该篇文本的子串。
 * query 为空 → 返回 false。
 */
export function matchesAll(docText, terms) {
  if (!terms.length) return false
  return terms.every((t) => docText.toLowerCase().includes(t))
}

/**
 * 检索 + 排序。先按“包含全部查询词”过滤，再排序：
 *   - 标题命中权重最高（10）
 *   - 关键词/token（服务端 nodejieba 分词所得）整体命中次之（6）
 *   - 正文命中（2）
 * 累加分数后降序，分数相同时按标题字典序。返回 {doc, score}[]。
 */
export function rankResults(docs, terms, { limit = 8 } = {}) {
  if (!terms.length) return []
  return docs
    .map((d) => {
      const text = d.text.toLowerCase()
      const title = d.title.toLowerCase()
      let score = 0
      let matched = 0
      for (const t of terms) {
        let once = false
        if (d.keywords && d.keywords.some((k) => k.toLowerCase() === t)) { score += 12; once = true }
        if (title.includes(t)) { score += 10; once = true }
        else if (Array.isArray(d.tokens) && d.tokens.some((tk) => tk.toLowerCase() === t)) {
          score += 6; once = true
        }
        if (text.includes(t)) { score += 2; matched++ }
        else if (!once) { matched = -1; break }
        void once
      }
      return { d, score, matched }
    })
    .filter((r) => r.matched === terms.length)
    .sort((a, b) => b.score - a.score || a.d.title.localeCompare(b.d.title, 'zh'))
    .slice(0, limit)
}

