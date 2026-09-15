// VitePress default theme，扩展自建能力。
// 通过 Layout 的 layout-top slot 挂载自建中文搜索（SearchDialog.vue），
// 悬浮搜索按钮 + Ctrl/Cmd+K 呼出；内置 local 搜索在 config 中关闭。
// 后续任务（阅读进度 / 历史记录 / 卡片首页 / 标签页）在此追加与组合。
import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import SearchDialog from './components/SearchDialog.vue'

export default {
  extends: DefaultTheme,
  Layout: () =>
    h(DefaultTheme.Layout, null, {
      // layout-top 是 VitePress Layout 提供的顶部插槽，适合挂悬浮 UI
      'layout-top': () => h(SearchDialog)
    })
}