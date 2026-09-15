import { ref } from 'vue'

const KEY = 'llm-reading-history'
const MAX = 50

// 历史阅读记录（localStorage）：
// 打开文档页时把 { path, title, ts } 写入 localStorage（键 llm-reading-history），
// 最新在前、按 path 去重、截断到 MAX 条。
// 供首页「最近读过」通过同一 useHistory() 读取展示。
export function useHistory() {
  const items = ref([])

  function load() {
    try {
      items.value = JSON.parse(localStorage.getItem(KEY) || '[]')
    } catch {
      items.value = []
    }
  }

  function record(entry) {
    const list = (() => {
      try {
        return JSON.parse(localStorage.getItem(KEY) || '[]')
      } catch {
        return []
      }
    })()
    // 最新在前，去重（同 path 只留最新），截断到 MAX 条
    const next = [
      { ...entry, ts: Date.now() },
      ...list.filter((e) => e.path !== entry.path)
    ].slice(0, MAX)
    localStorage.setItem(KEY, JSON.stringify(next))
    items.value = next
  }

  return { items, load, record }
}