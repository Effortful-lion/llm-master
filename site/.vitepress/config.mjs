import { defineConfig } from 'vitepress'
import generatedSidebar from './sidebar.generated.mjs'

export default defineConfig({
  title: 'LLM 学习笔记',
  description: '大模型 / LLM 应用开发学习笔记与面试资料',
  srcDir: 'src',
  cleanUrls: true,

  themeConfig: {
    sidebar: generatedSidebar.sidebar,
    // 关闭内置 search（默认 provider:'local'，MiniSearch 不支持注入中文连词分词，
    // 无法可靠命中“检索增强生成”这类短语）。自建搜索见
    // scripts/buildSearchIndex.mjs + SearchDialog.vue + theme/components/SearchDialog.vue。
    search: false,
    nav: [
      { text: '标签', link: '/tags/index' }
    ]
  },
  // ignoreDeadLinks 的忽略回调只接收 href（拿不到来源页面路径），无法按“链接是否来自
  // docs/ 子树”精确过滤。外来 docs/ 内容既有外部 URL 误报（hhf.../docs/...，都被判为
  // “死链”），又有真实损坏的相对 index 链接（../java/index 等）。当前所有页面均为外来
  // 单源 docs/，尚无站内自研页面，故只能整体关闭死链检查；待 Task 8 加入站内首页后再收紧。
  ignoreDeadLinks: true,
  // 内容经 symlink 接入(site/src/docs -> ../../docs)。默认 Vite 会按 realpath 解析
  // importer，导致 node_modules 定位到 docs/ 上层而失败；preserveSymlinks 让模块按
  // 软链路径(site/src/docs/...)解析，从而命中 site/node_modules。
  vite: {
    resolve: { preserveSymlinks: true }
  }
})