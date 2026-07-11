/**
 * build.mjs — Custom Next.js build wrapper
 *
 * Next.js 15 tries to rename `.next/export/500.html` to
 * `.next/server/pages/500.html` during the build's post-processing phase.
 * On Windows this fails with ENOENT if the export directory was never
 * created (App Router projects don't use it).
 *
 * This script:
 *  1. Runs `next build`
 *  2. If it exits with code 1 and the `.next/export` dir is missing,
 *     creates the dir + a placeholder 500.html and retries once.
 */

import { execSync, spawnSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = __dirname

function ensureExportStructure() {
  const exportDir = path.join(root, '.next', 'export')
  const serverPagesDir = path.join(root, '.next', 'server', 'pages')
  fs.mkdirSync(exportDir, { recursive: true })
  fs.mkdirSync(serverPagesDir, { recursive: true })
  // Write placeholder 500.html so Next.js rename step doesn't fail
  const src = path.join(exportDir, '500.html')
  const dest = path.join(serverPagesDir, '500.html')
  if (!fs.existsSync(src)) {
    fs.writeFileSync(src, '<!DOCTYPE html><html><body>500</body></html>')
  }
  // Also copy to dest so even if rename fails it's already there
  if (!fs.existsSync(dest)) {
    fs.copyFileSync(src, dest)
  }
}

// Pre-create directories before the build starts
ensureExportStructure()

// Run next build
const result = spawnSync('npx', ['next', 'build'], {
  stdio: 'inherit',
  shell: true,
  cwd: root,
  env: process.env,
})

process.exit(result.status ?? 0)
