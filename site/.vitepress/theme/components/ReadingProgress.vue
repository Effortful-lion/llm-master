<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
const progress = ref(0)
let ticking = false

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