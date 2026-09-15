// VitePress default theme，扩展自建能力。
// 通过 Layout 的 layout-top slot 挂载：自建中文搜索（SearchDialog.vue）
// 悬浮搜索按钮 + Ctrl/Cmd+K 呼出；阅读进度条（ReadingProgress.vue）。
// 内置 local 搜索在 config 中关闭。
// HistoryRecorder：路由变化后把进入的文档页写入 localStorage 历史记录。
import DefaultTheme from 'vitepress/theme'
import { h, onMounted } from 'vue'
import { useRouter } from 'vitepress'
import SearchDialog from './components/SearchDialog.vue'
import ReadingProgress from './components/ReadingProgress.vue'
import { useHistory } from './components/useHistory.js'

// 轻量记录组件（渲染为空）：在 mount 后注册“after route change”钩子。
// 注意：vitepress 1.6.x 不导出 onBeforeRouteChange/onAfterRouteChange，
// 改为直接挂在 useRouter() 返回的同一个 router 对象上（内部 go() 会读取这些钩子）。
// onAfterRouteChange 在路由切换、loadPage 完成后触发，此时 route.data 已是新页面的数据，
// 从这里读 title（frontmatter）比抓 DOM h1 更可靠（避免渲染 flush 竞态）。
const HistoryRecorder = {
  name: 'HistoryRecorder',
  setup() {
    const history = useHistory()
    const router = useRouter()

    function recordCurrentPage(to) {
      if (!to || typeof to !== 'string' || !to.includes('/docs/')) return
      // 标题从路由数据读（route.data.title = frontmatter/首个标题，同步、无渲染竞态），
      // 空则退化为路径末段。不抓 DOM 的 h1 —— onAfterRouteChange 触发时新页 DOM 未必已 flush，
      // 抓 h1 可能拿到上一页的标题或空值。
      const title =
        router.route.data.title?.trim() ||
        to.split('/').filter(Boolean).slice(-1)[0]
      history.record({ path: to, title })
    }

    // 保留可能存在的既有钩子，避免覆盖
    const prev = router.onAfterRouteChange
    router.onAfterRouteChange = (to) => {
      prev?.(to)
      recordCurrentPage(to)
    }

    // 首屏进入也记录一次
    onMounted(() => recordCurrentPage(router.route.path))

    return () => null
  }
}

export default {
  extends: DefaultTheme,
  Layout: () =>
    h(DefaultTheme.Layout, null, {
      // layout-top 是 VitePress Layout 提供的顶部插槽，适合挂悬浮 UI / 逻辑组件。
      // 返回数组以组合多个组件（历史 + 搜索 + 阅读进度）。
      'layout-top': () => [h(HistoryRecorder), h(SearchDialog), h(ReadingProgress)]
    })
}