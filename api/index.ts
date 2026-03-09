import type { VercelRequest, VercelResponse } from '@vercel/node'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const candidates = [
  join(dirname(fileURLToPath(import.meta.url)), '..', 'public'),
  join(dirname(fileURLToPath(import.meta.url)), 'public'),
  join(process.cwd(), 'public'),
]
const publicDir = candidates.find(d => existsSync(join(d, 'Rubik-Regular.ttf')))
if (!publicDir) throw new Error(`public/ not found. Tried:\n${candidates.join('\n')}`)

const rubikRegularData: ArrayBuffer = readFileSync(join(publicDir, 'Rubik-Regular.ttf')).buffer
const rubikSemiBoldData: ArrayBuffer = readFileSync(join(publicDir, 'Rubik-SemiBold.ttf')).buffer

function svgDataUrl(file: string) {
  return `data:image/svg+xml;base64,${readFileSync(join(publicDir!, file)).toString('base64')}`
}

const svgDataUrls: Record<string, string> = {
  'primary.svg': svgDataUrl('primary.svg'),
  'primary-link.svg': svgDataUrl('primary-link.svg'),
  'accent.svg': svgDataUrl('accent.svg'),
  'accent-link.svg': svgDataUrl('accent-link.svg'),
}

const homepage = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Repo OG Generator</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:            oklch(0.2134 0 0);
      --surface:       oklch(0.3012 0 0);
      --border:        oklch(0.36 0 0);
      --text:          oklch(1 0 0);
      --muted:         oklch(0.6 0 0);
      --input-bg:      oklch(0.245 0 0);
      --primary:       oklch(0.5183 0.137 249.921);
      --primary-hover: oklch(0.6297 0.127 246.13);
      --accent:        oklch(0.7415 0.135 58.279);
      --radius:        0.375rem;
      --font:          'Rubik', sans-serif;
      --mono:          'JetBrains Mono', monospace;
    }

    body {
      font-family: var(--font);
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 4rem 1.25rem 5rem;
    }

    .wrapper {
      width: 100%;
      max-width: 520px;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .header { display: flex; flex-direction: column; gap: 0.3rem; }

    .header-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .gh-link {
      color: var(--muted);
      transition: color 0.15s;
      display: flex;
      align-items: center;
    }

    .gh-link:hover { color: var(--text); }

    .header h1 {
      font-size: 1.35rem;
      font-weight: 600;
      letter-spacing: -0.01em;
    }

    .header p {
      font-size: 0.875rem;
      color: var(--muted);
    }

    .form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    label {
      font-size: 0.8rem;
      font-weight: 500;
      color: oklch(0.72 0 0);
    }

    .optional {
      font-weight: 400;
      color: var(--muted);
      margin-left: 0.2rem;
    }

    input, select, textarea {
      width: 100%;
      background: var(--input-bg);
      border: 1px solid var(--border);
      color: var(--text);
      border-radius: var(--radius);
      padding: 0.5rem 0.75rem;
      font-size: 0.875rem;
      font-family: var(--font);
      outline: none;
      transition: border-color 0.15s;
      appearance: none;
    }

    input::placeholder, textarea::placeholder { color: oklch(0.42 0 0); }

    input:focus, select:focus, textarea:focus { border-color: var(--primary); }

    textarea { resize: vertical; min-height: 72px; line-height: 1.55; }

    select {
      cursor: pointer;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23737373' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.75rem center;
      padding-right: 2rem;
      background-color: var(--input-bg);
    }

    select option { background: var(--surface); }

    .radio-group {
      display: flex;
      gap: 0.5rem;
    }

    .radio-label {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.875rem;
      color: var(--text);
      font-weight: 400;
      cursor: pointer;
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--input-bg);
      transition: border-color 0.15s;
      flex: 1;
      justify-content: center;
    }

    .radio-label:has(input:checked) {
      border-color: var(--primary);
      color: var(--text);
    }

    .radio-label input[type=radio] {
      display: none;
    }

    .row { display: flex; gap: 0.75rem; }
    .row .field { flex: 1; }

    .scale-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.35rem;
    }

    .scale-row label { margin: 0; }

    .scale-val {
      font-size: 0.8rem;
      font-family: var(--mono);
      color: var(--muted);
    }

    input[type=range] {
      -webkit-appearance: none;
      appearance: none;
      padding: 0; border: none; background: none;
      box-shadow: none; cursor: pointer;
      width: 100%; height: 20px;
    }

    input[type=range]::-webkit-slider-runnable-track {
      height: 2px;
      background: var(--border);
      border-radius: 1px;
    }

    input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: var(--text);
      border: none;
      margin-top: -6px;
      transition: background 0.15s;
    }

    input[type=range]:hover::-webkit-slider-thumb {
      background: oklch(0.85 0 0);
    }

    input[type=range]::-moz-range-track {
      height: 2px;
      background: var(--border);
      border-radius: 1px;
    }

    input[type=range]::-moz-range-thumb {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: var(--text);
      border: none;
    }

    .btn {
      background: var(--primary);
      color: #fff;
      border: none;
      border-radius: var(--radius);
      padding: 0.55rem 1rem;
      font-size: 0.875rem;
      font-weight: 500;
      font-family: var(--font);
      cursor: pointer;
      width: 100%;
      transition: background 0.15s;
      margin-top: 0.25rem;
    }

    .btn:hover { background: var(--primary-hover); }
    .btn:active { opacity: 0.9; }

    .preview {
      display: none;
      flex-direction: column;
      gap: 0.75rem;
      border-top: 1px solid var(--border);
      padding-top: 1.5rem;
    }

    .preview img {
      width: 100%;
      border-radius: var(--radius);
      border: 1px solid var(--border);
    }

    .url-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--input-bg);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 0.45rem 0.5rem 0.45rem 0.75rem;
    }

    .url-text {
      flex: 1;
      font-size: 0.72rem;
      color: var(--muted);
      font-family: var(--mono);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .copy-btn {
      flex-shrink: 0;
      background: var(--surface);
      color: oklch(0.8 0 0);
      border: 1px solid var(--border);
      border-radius: calc(var(--radius) * 0.75);
      padding: 0.25rem 0.6rem;
      font-size: 0.72rem;
      font-family: var(--font);
      font-weight: 500;
      cursor: pointer;
      transition: color 0.15s, border-color 0.15s;
    }

    .copy-btn:hover { color: var(--text); border-color: oklch(0.5 0 0); }
    .copy-btn.copied { color: var(--accent); }
  </style>
</head>
<body>
  <div class="wrapper">

    <div class="header">
      <div class="header-top">
        <h1>Repo OG Generator</h1>
        <a href="https://github.com/amansanoj/repo-og-generator" target="_blank" rel="noopener" class="gh-link" aria-label="GitHub">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M216,104v8a56.06,56.06,0,0,1-48.44,55.47A39.8,39.8,0,0,1,176,192v40a8,8,0,0,1-8,8H104a8,8,0,0,1-8-8V216H72a40,40,0,0,1-40-40A24,24,0,0,0,8,152a8,8,0,0,1,0-16,40,40,0,0,1,40,40,24,24,0,0,0,24,24H96v-8a39.8,39.8,0,0,1,8.44-24.53A56.06,56.06,0,0,1,56,112v-8a58.14,58.14,0,0,1,7.69-28.32A59.78,59.78,0,0,1,69.07,28,8,8,0,0,1,76,24a59.75,59.75,0,0,1,48,24h24a59.75,59.75,0,0,1,48-24,8,8,0,0,1,6.93,4,59.74,59.74,0,0,1,5.37,47.68A58,58,0,0,1,216,104Z"></path></svg>
        </a>
      </div>
      <p>Instantly generate beautiful, dynamic social share images for your GitHub projects.</p>
    </div>

    <div class="form">
      <div class="field">
        <label for="reponame">Repository name</label>
        <input id="reponame" type="text" placeholder="my-awesome-project" />
      </div>

      <div class="field">
        <label for="description">Description</label>
        <textarea id="description" placeholder="A short description of your project."></textarea>
      </div>

      <div class="row">
        <div class="field">
          <label for="url">URL <span class="optional">optional</span></label>
          <input id="url" type="text" placeholder="example.com" />
        </div>
        <div class="field">
          <label>Variant</label>
          <div class="radio-group">
            <label class="radio-label">
              <input type="radio" name="variant" value="primary" checked />
              Primary
            </label>
            <label class="radio-label">
              <input type="radio" name="variant" value="accent" />
              Accent
            </label>
          </div>
        </div>
      </div>

      <div class="field">
        <div class="scale-row">
          <label for="scale">Scale</label>
          <span class="scale-val" id="scale-label">1×</span>
        </div>
        <input id="scale" type="range" min="0.1" max="3" step="0.1" value="1"
          oninput="document.getElementById('scale-label').textContent=this.value+'×'" />
      </div>

      <button class="btn" onclick="generate()">Generate</button>
    </div>

    <div class="preview" id="preview-wrap">
      <img id="preview-img" src="" alt="OG Preview" />
      <div class="url-row">
        <span class="url-text" id="url-box"></span>
        <button class="copy-btn" id="copy-btn" onclick="copyUrl()">Copy</button>
      </div>
    </div>

  </div>

  <script>
    function buildUrl() {
      const reponame = document.getElementById('reponame').value.trim() || 'my-project'
      const description = document.getElementById('description').value.trim()
      const url = document.getElementById('url').value.trim()
      const variant = document.querySelector('input[name=variant]:checked').value
      const scale = document.getElementById('scale').value
      const params = new URLSearchParams()
      if (description) params.set('description', description)
      if (url) params.set('url', url)
      if (variant !== 'primary') params.set('variant', variant)
      if (scale !== '1') params.set('scale', scale)
      return \`/\${encodeURIComponent(reponame)}?\${params.toString()}\`
    }

    function generate() {
      const u = buildUrl()
      const wrap = document.getElementById('preview-wrap')
      const img = document.getElementById('preview-img')
      const box = document.getElementById('url-box')
      img.src = u + '&t=' + Date.now()
      box.textContent = window.location.origin + u
      wrap.style.display = 'flex'
    }

    function copyUrl() {
      const text = document.getElementById('url-box').textContent
      const btn = document.getElementById('copy-btn')
      navigator.clipboard.writeText(text).then(() => {
        btn.textContent = 'Copied'
        btn.classList.add('copied')
        setTimeout(() => {
          btn.textContent = 'Copy'
          btn.classList.remove('copied')
        }, 1500)
      })
    }
  </script>
</body>
</html>
`

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const urlPath = req.url?.split('?')[0] ?? '/'
  if (urlPath === '/' || urlPath === '') {
    res.setHeader('Content-Type', 'text/html')
    return res.send(homepage)
  }

  try {
    const reponame = decodeURIComponent((req.query.reponame as string) || (req.url?.split('/').pop()?.split('?')[0] ?? 'repo'))
    const variant = (req.query.variant as string) || 'primary'
    const description = (req.query.description as string) || 'No description provided.'
    const urlText = (req.query.url as string) || ''

    const textColor = variant === 'accent' ? '#FDF1E8' : '#E8F2FB'
    const showLink = urlText.trim().length > 0

    let scale = parseFloat((req.query.scale as string) || '1')
    if (isNaN(scale) || scale <= 0 || scale > 3) scale = 1

    const bgFilename = `${variant}${showLink ? '-link' : ''}.svg`
    const bgUrl = svgDataUrls[bgFilename]

    const children: any[] = [
      {
        type: 'img',
        props: {
          src: bgUrl,
          width: 1200,
          height: 630,
          style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '630px' },
        },
      },
      {
        type: 'div',
        props: {
          style: {
            position: 'absolute',
            left: '210px',
            top: '75px',
            fontSize: '72px',
            lineHeight: '85px',
            fontFamily: 'Rubik',
            fontWeight: 600,
            color: textColor,
            display: 'flex',
          },
          children: reponame,
        },
      },
      {
        type: 'div',
        props: {
          style: {
            position: 'absolute',
            left: '75px',
            top: '210px',
            fontSize: '48px',
            lineHeight: '57px',
            fontFamily: 'Rubik',
            fontWeight: 400,
            color: textColor,
            width: '1050px',
            display: 'flex',
          },
          children: description,
        },
      },
    ]

    if (showLink) {
      children.push({
        type: 'div',
        props: {
          style: {
            position: 'absolute',
            left: '139px',
            top: '502px',
            fontSize: '48px',
            lineHeight: '57px',
            fontFamily: 'Rubik',
            fontWeight: 600,
            color: textColor,
            display: 'flex',
          },
          children: urlText,
        },
      })
    }

    const svg = await satori(
      {
        type: 'div',
        props: {
          style: { display: 'flex', width: '1200px', height: '630px' },
          children,
        },
      },
      {
        width: 1200,
        height: 630,
        fonts: [
          { name: 'Rubik', data: rubikRegularData, weight: 400, style: 'normal' },
          { name: 'Rubik', data: rubikSemiBoldData, weight: 600, style: 'normal' },
        ],
      }
    )

    const resvg = new Resvg(svg, { fitTo: { mode: 'zoom', value: scale } })
    const pngData = resvg.render().asPng()

    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Cache-Control', 'public, max-age=86400')
    res.send(pngData)
  } catch (error: any) {
    console.error('[og-generator]', error)
    res.status(500).send(`Error: ${error?.message ?? String(error)}`)
  }
}