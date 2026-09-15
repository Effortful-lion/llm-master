import { execSync } from 'node:child_process'

// 注意：npm scripts 会在 site/ 目录下调用本脚本，故 process.cwd() === site/，
// 上面 scripts/<name>.mjs 的路径以 site/ 为基准。请在 site/ 下运行 docs:prepare。
const run = (name) => {
  console.log(`\n=== ${name} ===`)
  execSync(`node scripts/${name}.mjs`, { cwd: process.cwd(), stdio: 'inherit' })
}

// 各阶段（后续任务逐步追加：generateTagPages）
run('linkContent')
run('genSidebar')
run('buildSearchIndex')
run('generateTagPages')