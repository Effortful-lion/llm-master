<script>
// SearchDialog.vue —— 自建中文全文搜索（方向A）。
// 索引在构建期由 scripts/buildSearchIndex.mjs 生成，vendored 到 public/search-index.json；
// 查询期在前端用 segment.js 分词 + “包含全部查询词（子串判含）”匹配。
// 仅客户端逻辑（onMounted 内 fetch / 绑定事件），SSR 安全。
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter, withBase } from 'vitepress'
import { segmentQuery, rankResults } from '../lib/segment.js'

const INDEX_URL = `${import.meta.env.BASE_URL}search-index.json`

export default {
  name: 'SearchDialog',
  setup() {
    const router = useRouter()
    const open = ref(false)
    const loading = ref(false)
    const query = ref('')
    const results = ref([])
    const indexDocs = ref([])
    const inputEl = ref(null)
    const activeIdx = ref(-1)

    const loadIndex = async () => {
      if (indexDocs.value.length) return
      loading.value = true
      try {
        const res = await fetch(INDEX_URL, { cache: 'force-cache' })
        if (!res.ok) throw new Error(`${res.status}`)
        const json = await res.json()
        indexDocs.value = Array.isArray(json.docs) ? json.docs : []
      } catch (e) {
        // 索引缺失或网络异常：展示联想命中里降级为空（空态由 UI 提示）
        indexDocs.value = []
        console.warn('[search] 索引加载失败：', e.message)
      } finally {
        loading.value = false
      }
    }

    const doSearch = (keyword) => {
      const terms = segmentQuery(keyword)
      results.value = rankResults(indexDocs.value, terms, { limit: 8 })
      activeIdx.value = -1
    }

    const onInput = () => {
      const q = query.value.trim()
      if (!q) { results.value = []; return }
      doSearch(q)
    }

    const openDialog = async () => {
      open.value = true
      await loadIndex()
      await nextTick()
      inputEl.value?.focus()
    }
    const closeDialog = () => { open.value = false; query.value = ''; results.value = []; activeIdx.value = -1 }

    const go = (route) => {
      closeDialog()
      // 搜索结果路由为 root-absolute（如 /docs/...）；base 部署下 router 需要 base 前缀，
      // 经 withBase() 补上，链接在 GitHub Pages 才能命中。
      if (route) router.go(withBase(route))
    }

    const onKeydown = (e) => {
      if (!open.value) return
      const n = results.value.length
      if (e.key === 'ArrowDown') { e.preventDefault(); activeIdx.value = (activeIdx.value + 1) % Math.max(n, 1) }
      else if (e.key === 'ArrowUp') { e.preventDefault(); activeIdx.value = (activeIdx.value - 1 + Math.max(n, 1)) % Math.max(n, 1) }
      else if (e.key === 'Enter' && activeIdx.value >= 0 && results.value[activeIdx.value]) go(results.value[activeIdx.value].d.route)
      else if (e.key === 'Escape') closeDialog()
    }

    // 全局快捷键 Ctrl/Cmd+K 打开；Esc/点遮罩关闭
    const onGlobalKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault()
        if (open.value) closeDialog(); else openDialog()
      }
    }
    const onOverlayClick = (e) => { if (e.target === e.currentTarget) closeDialog() }

    onMounted(() => {
      window.addEventListener('keydown', onGlobalKey)
      window.addEventListener('keydown', onKeydown, true)
    })
    onBeforeUnmount(() => {
      window.removeEventListener('keydown', onGlobalKey)
      window.removeEventListener('keydown', onKeydown, true)
    })

    return { open, loading, query, results, inputEl, activeIdx, openDialog, closeDialog, onInput, go, onOverlayClick }
  }
}
</script>

<template>
  <!-- 右上角搜索按钮 -->
  <button class="zh-search-btn" type="button" aria-label="搜索（Ctrl+K）" title="搜索（Ctrl+K）" @click="openDialog">
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
    <span class="zh-search-btn-txt">搜索</span>
  </button>

  <!-- 弹层 -->
  <Teleport to="body">
    <div v-if="open" class="zh-search-overlay" :class="{ 'zh-search-open': open }" @click.self="onOverlayClick">
      <div class="zh-search-dialog">
        <div class="zh-search-input-row">
          <input
            ref="inputEl"
            v-model="query"
            class="zh-search-input"
            placeholder="搜索文章 / RAG / 检索增强生成..."
            autocomplete="off"
            spellcheck="false"
            @input="onInput"
          />
          <button class="zh-search-esc" type="button" @click="closeDialog">Esc</button>
        </div>

        <div v-if="loading" class="zh-search-state">索引加载中…</div>
        <div v-else-if="!query.trim()" class="zh-search-state">输入关键词开始搜索（支持中文连词）</div>
        <div v-else-if="results.length === 0" class="zh-search-state">未找到相关文章</div>

        <ul v-else class="zh-search-results">
          <li
            v-for="(r, i) in results"
            :key="r.d.route"
            class="zh-search-item"
            :class="{ 'zh-search-item-active': i === activeIdx }"
            @click="go(r.d.route)"
            @mouseenter="activeIdx = i"
          >
            <div class="zh-search-item-title">{{ r.d.title }}</div>
            <div class="zh-search-item-meta">
              <span>{{ r.d.route }}</span>
              <span v-if="r.score >= 12" class="zh-search-hot">优先</span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.zh-search-btn {
  position: fixed;
  right: 1.25rem;
  bottom: 1.25rem;
  z-index: 60;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.85rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  font-size: 0.85rem;
}
.zh-search-btn:hover { border-color: var(--vp-c-brand); color: var(--vp-c-brand); }
@media (max-width: 768px) { .zh-search-btn-txt { display: none; } }

.zh-search-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: max(12vh, 4rem) 1rem 2rem;
  background: rgba(0, 0, 0, 0.4);
  transition: opacity 0.15s ease;
}
.zh-search-dialog {
  width: min(680px, 100%);
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}
.zh-search-input-row {
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--vp-c-divider);
}
.zh-search-input {
  flex: 1;
  padding: 0.95rem 1rem;
  border: none;
  outline: none;
  background: transparent;
  color: var(--vp-c-text-1);
  font-size: 1rem;
}
.zh-search-esc {
  margin-right: 0.75rem;
  padding: 0.15rem 0.55rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: transparent;
  color: var(--vp-c-text-2);
  font-size: 0.72rem;
  cursor: pointer;
}
.zh-search-state { padding: 2rem 1rem; text-align: center; color: var(--vp-c-text-2); }
.zh-search-results { list-style: none; margin: 0; padding: 0.4rem; overflow-y: auto; }
.zh-search-item { padding: 0.6rem 0.8rem; border-radius: 8px; cursor: pointer; }
.zh-search-item-active { background: var(--vp-c-brand-soft); }
.zh-search-item-title { color: var(--vp-c-text-1); font-size: 0.95rem; line-height: 1.4; }
.zh-search-item-meta { display: flex; gap: 0.5rem; align-items: center; margin-top: 0.2rem; font-size: 0.72rem; color: var(--vp-c-text-2); word-break: break-all; }
.zh-search-hot { color: var(--vp-c-brand); }
</style>