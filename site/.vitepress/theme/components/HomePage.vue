<script setup>
import { onMounted, ref } from 'vue'
import { withBase } from 'vitepress'
import { data as siteInfo } from '../../../.vitepress/data/site.info.data.js'
import { useHistory } from './useHistory.js'

const { items, load: loadHistory } = useHistory()
const history = ref([])
onMounted(async () => {
  loadHistory()
  history.value = items.value
})

// 分类卡片由 build 期 loader 动态计算（README 落地页优先、否则目录首篇），保证可点不 404。
const categories = siteInfo.categories
</script>

<template>
  <div class="home">
    <h1>LLM 学习笔记</h1>
    <p class="subtitle">大模型 / LLM 应用开发学习笔记与面试资料</p>

    <section class="block">
      <h2>分类</h2>
      <div class="grid">
        <a v-for="c in categories" :key="c.link" class="card" :href="withBase(c.link)">
          <h3>{{ c.name }}</h3><p>{{ c.desc }}</p>
        </a>
      </div>
    </section>

    <section class="block">
      <h2>最近读过</h2>
      <ul v-if="history.length" class="plain-list">
        <li v-for="h in history.slice(0, 5)" :key="h.path"><a :href="withBase(h.path)">{{ h.title }}</a></li>
      </ul>
      <p v-else class="muted">暂无阅读记录</p>
    </section>

    <section class="block">
      <h2>标签</h2>
      <div class="tag-cloud">
        <a v-for="t in siteInfo.tags" :key="t.href" class="tag" :href="withBase(t.href)">{{ t.name }}<span class="count">{{ t.count }}</span></a>
      </div>
    </section>

    </div>
</template>

<style scoped>
.home { max-width: 960px; margin: 0 auto; padding: 32px 24px; }
.home h1 { margin: 0 0 4px; }
.subtitle { color: var(--vp-c-text-2); margin-top: 0; }
.block { margin-top: 28px; }
.block h2 { font-size: 1.1em; border-bottom: 1px solid var(--vp-c-divider); padding-bottom: 8px; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
.card { display: block; padding: 20px; border-radius: 12px; border: 1px solid var(--vp-c-divider); background: var(--vp-c-bg-soft); text-decoration: none; transition: transform .15s, box-shadow .15s; }
.card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0, 0, 0, .06); }
.card h3 { margin: 0 0 8px; color: var(--vp-c-brand-1); }
.card p { margin: 0; color: var(--vp-c-text-2); font-size: .88em; }
.plain-list { list-style: none; padding: 0; margin: 8px 0; }
.plain-list li { padding: 6px 0; border-bottom: 1px dashed var(--vp-c-divider); }
.muted { color: var(--vp-c-text-3); }
.tag-cloud { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
.tag { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 999px; background: var(--vp-c-bg-soft); border: 1px solid var(--vp-c-divider); font-size: .85em; text-decoration: none; }
.tag:hover { border-color: var(--vp-c-brand-1); }
.count { font-size: .72em; color: var(--vp-c-text-3); }

@media (max-width: 720px) {
  .home { padding: 20px 16px; }
  .grid { grid-template-columns: 1fr; }
}
</style>