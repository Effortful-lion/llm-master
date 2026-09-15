<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vitepress'
const progress = ref(0)
let ticking = false

// 路由切换时 VitePress 会归零滚动但不一定触发 scroll 事件，需手动重置进度条宽度。
// 挂在 useRouter() 返回的同一 router 对象上的 before 钩子，切换前清空。
const router = useRouter()
const prevBeforeRouteChange = router.onBeforeRouteChange
router.onBeforeRouteChange = (to) => {
  progress.value = 0
  return prevBeforeRouteChange?.(to)
}

function onScroll() {
  if (ticking) return
  ticking = true
  requestAnimationFrame(() => {
    const el = document.documentElement
    const total = el.scrollHeight - el.clientHeight
    progress.value = total > 0 ? (el.scrollTop / total) * 100 : 0
    ticking = false
  })
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <div class="vp-reading-progress" :style="{ width: progress + '%' }" />
</template>

<style scoped>
.vp-reading-progress {
  position: fixed;
  top: 0; left: 0; height: 3px;
  background: var(--vp-c-brand-1);
  z-index: 999;
  transition: width 0.1s ease;
}
</style>