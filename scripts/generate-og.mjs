#!/usr/bin/env node
// Per-link OG image + HTML stub generator. Runs after `vite build`.
// Reads <OUT>/glnk.yaml and, for each non-wildcard route, emits:
//   <OUT>/og/{slug}.png      — 1200x630 share card (brand + /path + QR + redirect target)
//   <OUT>/{path}/index.html  — bot-facing stub mirroring webapp/index.html's meta shape
//
// Env (matches webapp/action.yaml conventions):
//   GLNK_USERNAME    required for user sites; empty for homepage (script exits 0)
//   GLNK_OUTPUT_DIR  default: build
//   GLNK_INPUT_YAML  default: <GLNK_OUTPUT_DIR>/glnk.yaml
//   GLNK_PUBLIC_URL  honoured only when a full http(s) URL; else falls back to
//                    https://<USERNAME>.glnk.dev (CI passes empty / a Vite --base)
//   GLNK_FAVICON     default: public/favicon.png
//   GLNK_OG_BG       default: public/assets/og-bg.png

import { Resvg } from '@resvg/resvg-js';
import { parse as parseYaml } from 'yaml';
import QRCode from 'qrcode';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

// ---------- config ----------------------------------------------------------

const BRAND = { name: 'glnk.dev', twitter: '@GlnkDev', locale: 'en_US' };
const CARD = { width: 1200, height: 630 };
const FONT_FAMILY = 'Inter, -apple-system, Helvetica, Arial, sans-serif';

const USERNAME = process.env.GLNK_USERNAME ?? '';
const OUT_DIR = process.env.GLNK_OUTPUT_DIR ?? 'build';
const YAML_PATH = process.env.GLNK_INPUT_YAML ?? join(OUT_DIR, 'glnk.yaml');
const FAVICON_PATH = process.env.GLNK_FAVICON ?? 'public/favicon.png';
const OG_BG_PATH = process.env.GLNK_OG_BG ?? 'public/assets/og-bg.png';

// GLNK_PUBLIC_URL is honoured only when it's a full http(s) URL — in CI it's
// often empty (env var still set), or a Vite --base path like "/webapp/".
const rawPublicUrl = process.env.GLNK_PUBLIC_URL ?? '';
const PUBLIC_URL = /^https?:\/\//.test(rawPublicUrl)
  ? rawPublicUrl
  : USERNAME ? `https://${USERNAME}.${BRAND.name}` : '';

if (!USERNAME) {
  console.log('[og] GLNK_USERNAME not set — skipping (homepage mode)');
  process.exit(0);
}
if (!existsSync(YAML_PATH)) {
  console.error(`[og] ${YAML_PATH} not found`);
  process.exit(1);
}

// ---------- helpers ---------------------------------------------------------

const stripProto = (u) => u.replace(/^https?:\/\//, '').replace(/\/$/, '');
const truncate = (s, n = 50) => (s.length <= n ? s : s.slice(0, n - 1) + '…');
const slug = (p) => p.replace(/^\/+/, '').replace(/\//g, '-').replace(/[^a-z0-9-]/gi, '-').toLowerCase() || 'home';
const escapeXml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function wrapDest(text, maxLen = 38, maxLines = 3) {
  const lines = [];
  let rest = text;
  while (rest.length > maxLen && lines.length < maxLines - 1) {
    const idx = rest.lastIndexOf('/', maxLen);
    const split = idx > 0 ? idx + 1 : maxLen;
    lines.push(rest.slice(0, split));
    rest = rest.slice(split);
  }
  lines.push(rest.length > maxLen ? rest.slice(0, maxLen - 1) + '…' : rest);
  return lines;
}

function pngDataUri(path) {
  return existsSync(path) ? `data:image/png;base64,${readFileSync(path).toString('base64')}` : null;
}

const faviconDataUri = pngDataUri(FAVICON_PATH);
const ogBgDataUri = pngDataUri(OG_BG_PATH);

async function makeQrDataUri(url) {
  return QRCode.toDataURL(url, {
    errorCorrectionLevel: 'M',
    margin: 1,
    color: { dark: '#0f172a', light: '#ffffff' },
    width: 600,
  });
}

function writeOut(file, data) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, data);
}

// ---------- SVG composition --------------------------------------------------

function brandRow(userDomain) {
  const icon = faviconDataUri
    ? `<image href="${faviconDataUri}" x="80" y="185" width="40" height="36"/>`
    : '';
  const textX = faviconDataUri ? 134 : 80;
  const fill = faviconDataUri ? '#0f172a' : '#f97316';
  return `${icon}<text x="${textX}" y="214" font-family="${FONT_FAMILY}" font-size="26" font-weight="700" fill="${fill}">${escapeXml(userDomain)}</text>`;
}

function qrCardBlock(qrDataUri) {
  const x = 770, y = 145, size = 340;
  const qrSize = 240;
  const qrX = x + (size - qrSize) / 2;
  const qrY = y + 64;
  const brandInCard = faviconDataUri
    ? `<image href="${faviconDataUri}" x="${x + size / 2 - 64}" y="${y + 22}" width="28" height="25"/>
       <text x="${x + size / 2 - 30}" y="${y + 42}" font-family="${FONT_FAMILY}" font-size="20" font-weight="700" fill="#0f172a">${BRAND.name}</text>`
    : `<text x="${x + size / 2}" y="${y + 42}" font-family="${FONT_FAMILY}" font-size="20" font-weight="700" fill="#0f172a" text-anchor="middle">${BRAND.name}</text>`;
  return `
    <rect x="${x}" y="${y}" width="${size}" height="${size}" rx="28" ry="28" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    ${brandInCard}
    <image href="${qrDataUri}" x="${qrX}" y="${qrY}" width="${qrSize}" height="${qrSize}"/>
    <text x="${x + size / 2}" y="${y + size - 22}" font-family="${FONT_FAMILY}" font-size="15" font-weight="500" fill="#94a3b8" text-anchor="middle">Scan to open</text>
  `;
}

function ogSvg({ path, destShort, userDomain, qrDataUri }) {
  const destLines = wrapDest(destShort, 38, 3);
  const bg = ogBgDataUri
    ? `<image href="${ogBgDataUri}" x="0" y="0" width="${CARD.width}" height="${CARD.height}" preserveAspectRatio="xMidYMid slice"/>`
    : '';
  const destBlock = destLines
    .map((line, i) => `<text x="80" y="${390 + i * 30}" font-family="${FONT_FAMILY}" font-size="22" font-weight="600" fill="#0f172a">${escapeXml(line)}</text>`)
    .join('\n  ');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD.width}" height="${CARD.height}" viewBox="0 0 ${CARD.width} ${CARD.height}">
  <rect width="${CARD.width}" height="${CARD.height}" fill="#fffaf5"/>
  ${bg}
  <rect x="0" y="0" width="8" height="${CARD.height}" fill="#2563eb"/>

  ${brandRow(userDomain)}

  <text x="80" y="290" font-family="${FONT_FAMILY}" font-size="56" font-weight="700" fill="#f97316">${escapeXml(path)}</text>

  <text x="80" y="355" font-family="${FONT_FAMILY}" font-size="20" fill="#94a3b8">Redirects to</text>
  ${destBlock}

  ${qrCardBlock(qrDataUri)}
</svg>`;
}

// ---------- HTML stub --------------------------------------------------------

// Mirrors the meta shape of webapp/index.html so per-link stubs unfurl
// consistently with the site root.
function stubHtml({ pageUrl, ogImage, shortLink, destination }) {
  const destShort = stripProto(destination);
  const title = `${shortLink} · ${truncate(destShort, 48)}`;
  const description = `Short link ${shortLink} redirects to ${destShort} — managed via ${BRAND.name}.`;
  const imageAlt = `${shortLink} → ${destShort}`;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />

  <title>${escapeXml(title)}</title>
  <meta name="title" content="${escapeXml(title)}" />
  <meta name="description" content="${escapeXml(description)}" />
  <meta name="author" content="${BRAND.name}" />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />

  <link rel="canonical" href="${escapeXml(destination)}" />

  <meta property="og:type" content="website" />
  <meta property="og:url" content="${escapeXml(pageUrl)}" />
  <meta property="og:title" content="${escapeXml(title)}" />
  <meta property="og:description" content="${escapeXml(description)}" />
  <meta property="og:image" content="${escapeXml(ogImage)}" />
  <meta property="og:image:alt" content="${escapeXml(imageAlt)}" />
  <meta property="og:image:width" content="${CARD.width}" />
  <meta property="og:image:height" content="${CARD.height}" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:site_name" content="${BRAND.name}" />
  <meta property="og:locale" content="${BRAND.locale}" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="${escapeXml(pageUrl)}" />
  <meta name="twitter:title" content="${escapeXml(title)}" />
  <meta name="twitter:description" content="${escapeXml(description)}" />
  <meta name="twitter:image" content="${escapeXml(ogImage)}" />
  <meta name="twitter:image:alt" content="${escapeXml(imageAlt)}" />
  <meta name="twitter:creator" content="${BRAND.twitter}" />
  <meta name="twitter:site" content="${BRAND.twitter}" />

  <meta http-equiv="refresh" content="0;url=${escapeXml(destination)}" />
</head>
<body>
  <script>window.location.replace(${JSON.stringify(destination)});</script>
  <p>Redirecting to <a href="${escapeXml(destination)}">${escapeXml(destination)}</a>...</p>
</body>
</html>`;
}

// ---------- rendering --------------------------------------------------------

const RESVG_OPTS = {
  fitTo: { mode: 'width', value: CARD.width },
  font: {
    fontFiles: [
      'node_modules/@fontsource/inter/files/inter-latin-400-normal.woff2',
      'node_modules/@fontsource/inter/files/inter-latin-700-normal.woff2',
    ],
    loadSystemFonts: true,
    defaultFontFamily: 'Inter',
    serifFamily: 'Inter',
    sansSerifFamily: 'Inter',
  },
};

async function renderRoute(path, dest) {
  const destination = String(dest);
  const userDomain = stripProto(PUBLIC_URL);
  const shortLink = `${userDomain}${path}`;
  const destShort = stripProto(destination);
  const s = slug(path);

  const qrDataUri = await makeQrDataUri(destination);
  const png = new Resvg(
    ogSvg({ path, destShort, userDomain, qrDataUri }),
    RESVG_OPTS,
  ).render().asPng();
  writeOut(join(OUT_DIR, 'og', `${s}.png`), png);
  writeOut(
    join(OUT_DIR, path, 'index.html'),
    stubHtml({
      pageUrl: `${PUBLIC_URL}${path}`,
      ogImage: `${PUBLIC_URL}/og/${s}.png`,
      shortLink,
      destination,
    }),
  );
  console.log(`[og] ${path}  →  ${destShort}`);
}

// ---------- main ------------------------------------------------------------

const routes = parseYaml(readFileSync(YAML_PATH, 'utf8')) ?? {};
let generated = 0, skipped = 0;

for (const [path, dest] of Object.entries(routes)) {
  if (path.includes('{$') || String(dest).includes('{$')) {
    console.log(`[og] ${path}  (wildcard — falls back to default OG)`);
    skipped++;
    continue;
  }
  await renderRoute(path, dest);
  generated++;
}

console.log(`[og] done — ${generated} generated, ${skipped} skipped`);
