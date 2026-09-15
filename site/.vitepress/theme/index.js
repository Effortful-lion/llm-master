// VitePress default theme，扩展自建能力。
// 通过 Layout 的 layout-top slot 挂载：自建中文搜索（SearchDialog.vue）
// 悬浮搜索按钮 + Ctrl/Cmd+K 呼出；阅读进度条（ReadingProgress.vue）。
// 内置 local 搜索在 config 中关闭。
import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import SearchDialog from './components/SearchDialog.vue'
import ReadingProgress from './components/ReadingProgress.vue'

export default {
  extends: DefaultTheme,
  Layout: () =>
    h(DefaultTheme.Layout, null, {
      // layout-top 是 VitePress Layout 提供的顶部插槽，适合挂悬浮 UI。
      // 返回数组以组合多个组件（搜索 + 阅读进度）。
      'layout-top': () => [h(SearchDialog), h(ReadingProgress)]
    })
}