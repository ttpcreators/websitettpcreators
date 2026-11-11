// Image d'attente du studio 3D (public/assets/studio-*.webp), à refaire si le roster change.
// Prérequis : `npm run dev` lancé. Usage :
//   node scripts/capture-poster.mjs "http://localhost:5173/?poster=1" 1600 1000 1 public/assets/studio-desktop.webp 0
//   node scripts/capture-poster.mjs "http://localhost:5173/?poster=1" 390 844 2 public/assets/studio-mobile.webp 1
import { spawn } from 'node:child_process'
import { writeFileSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
const [url, w, h, scale, out, mobile] = process.argv.slice(2)
const C = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const prof = mkdtempSync(join(tmpdir(), 'ttp-shot-'))
const ch = spawn(C, ['--headless=new', '--remote-debugging-port=9333', `--user-data-dir=${prof}`, '--use-angle=metal', '--enable-gpu', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
let target
for (let i = 0; i < 40 && !target; i++) {
  await sleep(250)
  try { target = (await (await fetch('http://127.0.0.1:9333/json')).json()).find((t) => t.type === 'page') } catch {}
}
const ws = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((r) => (ws.onopen = r))
let id = 0
const pending = new Map()
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id) } }
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })) })
await send('Emulation.setDeviceMetricsOverride', { width: +w, height: +h, deviceScaleFactor: +scale, mobile: mobile === '1' })
await send('Page.enable')
await send('Page.navigate', { url })
await sleep(14000)
const shot = await send('Page.captureScreenshot', { format: 'webp', quality: 72 })
writeFileSync(out, Buffer.from(shot.result.data, 'base64'))
ws.close(); ch.kill()
console.log('ok', out)
