import { execSync } from 'node:child_process'

const run = (name) => {
  console.log(`\n=== ${name} ===`)
  execSync(`node scripts/${name}.mjs`, { cwd: process.cwd(), stdio: 'inherit' })
}

// 各阶段（后续任务逐步追加：genSidebar / buildSearchIndex / generateTagPages）
run('linkContent')