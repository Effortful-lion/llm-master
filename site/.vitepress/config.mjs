import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'LLM 学习笔记',
  description: '大模型 / LLM 应用开发学习笔记与面试资料',
  srcDir: 'src',
  cleanUrls: true,
  ignoreDeadLinks: true,
  // 内容经 symlink 接入(site/src/docs -> ../../docs)。默认 Vite 会按 realpath 解析
  // importer，导致 node_modules 定位到 docs/ 上层而失败；preserveSymlinks 让模块按
  // 软链路径(site/src/docs/...)解析，从而命中 site/node_modules。
  vite: {
    resolve: { preserveSymlinks: true }
  }
})