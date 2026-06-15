#!/usr/bin/env node
// Per-link OG image + HTML stub generator.
// Runs after `vite build`. Reads build/glnk.yaml, emits:
//   build/og/{slug}.png        — per-link OG image (1200x630), brand-matched
//   build/{path}/index.html    — stub bot-scrapers receive, with per-link meta
//
// Inputs (env, matches webapp/action.yaml conventions):
//   GLNK_USERNAME      required for user sites; empty for homepage (script exits 0)
//   GLNK_OUTPUT_DIR    default: build
//   GLNK_INPUT_YAML    default: <GLNK_OUTPUT_DIR>/glnk.yaml
//   GLNK_PUBLIC_URL    default: https://<GLNK_USERNAME>.glnk.dev
//   GLNK_FAVICON       default: public/favicon.png (path to brand mark PNG)

import { Resvg } from '@resvg/resvg-js';
import { parse as parseYaml } from 'yaml';
import QRCode from 'qrcode';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const USERNAME = process.env.GLNK_USERNAME ?? '';
const OUT_DIR = process.env.GLNK_OUTPUT_DIR ?? 'build';
const YAML_PATH = process.env.GLNK_INPUT_YAML ?? join(OUT_DIR, 'glnk.yaml');
// GLNK_PUBLIC_URL is honoured only when it's a full http(s) URL — in CI it's
// often empty (env var still set), or a Vite --base path like "/webapp/".
const rawPublicUrl = process.env.GLNK_PUBLIC_URL ?? '';
const PUBLIC_URL = /^https?:\/\//.test(rawPublicUrl)
  ? rawPublicUrl
  : USERNAME ? `https://${USERNAME}.glnk.dev` : '';
const FAVICON_PATH = process.env.GLNK_FAVICON ?? 'public/favicon.png';
const BRAND_CARD_PATH = process.env.GLNK_BRAND_CARD ?? 'public/assets/og.png';
const OG_BG_PATH = process.env.GLNK_OG_BG ?? 'public/assets/og-bg.png';

if (!USERNAME) {
  console.log('[og] GLNK_USERNAME not set — skipping (homepage mode)');
  process.exit(0);
}
if (!existsSync(YAML_PATH)) {
  console.error(`[og] ${YAML_PATH} not found`);
  process.exit(1);
}

const stripProto = (u) => u.replace(/^https?:\/\//, '').replace(/\/$/, '');
const truncate = (s, n = 50) => (s.length <= n ? s : s.slice(0, n - 1) + '…');
const slug = (p) => p.replace(/^\/+/, '').replace(/\//g, '-').replace(/[^a-z0-9-]/gi, '-').toLowerCase() || 'home';
const escapeXml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const faviconDataUri = existsSync(FAVICON_PATH)
  ? `data:image/png;base64,${readFileSync(FAVICON_PATH).toString('base64')}`
  : null;
const brandCardDataUri = existsSync(BRAND_CARD_PATH)
  ? `data:image/jpeg;base64,${readFileSync(BRAND_CARD_PATH).toString('base64')}`
  : null;
const ogBgDataUri = existsSync(OG_BG_PATH)
  ? `data:image/png;base64,${readFileSync(OG_BG_PATH).toString('base64')}`
  : null;

function wrapTitle(text, maxLen = 30) {
  if (text.length <= maxLen) return [text];
  const idx = text.lastIndexOf('/', maxLen);
  const split = idx > 0 ? idx : maxLen;
  return [text.slice(0, split), text.slice(split)];
}

function wrapDest(text, maxLen = 38, maxLines = 3) {
  const lines = [];
  let rest = text;
  while (rest.length > maxLen && lines.length < maxLines - 1) {
    const idx = rest.lastIndexOf('/', maxLen);
    const split = idx > 0 ? idx + 1 : maxLen;
    lines.push(rest.slice(0, split));
    rest = rest.slice(split);
  }
  if (rest.length > maxLen) {
    rest = rest.slice(0, maxLen - 1) + '…';
  }
  lines.push(rest);
  return lines;
}

async function makeQrDataUri(url) {
  return await QRCode.toDataURL(url, {
    errorCorrectionLevel: 'M',
    margin: 1,
    color: { dark: '#0f172a', light: '#ffffff' },
    width: 600,
  });
}

function ogSvg(shortLink, destShort, path, userDomain, qrDataUri) {
  const destLines = wrapDest(destShort, 38, 3);
  const titleLines = wrapTitle(shortLink, 30);
  const brandMark = faviconDataUri
    ? `<image href="${faviconDataUri}" x="80" y="185" width="40" height="36"/>
       <text x="134" y="214" font-family="Inter, -apple-system, Helvetica, Arial, sans-serif" font-size="26" font-weight="700" fill="#0f172a">${escapeXml(userDomain)}</text>`
    : `<text x="80" y="214" font-family="Inter, -apple-system, Helvetica, Arial, sans-serif" font-size="26" font-weight="700" fill="#f97316">${escapeXml(userDomain)}</text>`;

  // Smaller white QR card positioned more centrally on the right to keep wave corners visible
  const cardX = 770, cardY = 145, cardSize = 340;
  const qrSize = 240;
  const qrX = cardX + (cardSize - qrSize) / 2;
  const qrY = cardY + 64;
  const brandInCard = faviconDataUri
    ? `<image href="${faviconDataUri}" x="${cardX + cardSize / 2 - 64}" y="${cardY + 22}" width="28" height="25"/>
       <text x="${cardX + cardSize / 2 - 30}" y="${cardY + 42}" font-family="Inter, -apple-system, Helvetica, Arial, sans-serif" font-size="20" font-weight="700" fill="#0f172a">glnk.dev</text>`
    : `<text x="${cardX + cardSize / 2}" y="${cardY + 42}" font-family="Inter, -apple-system, Helvetica, Arial, sans-serif" font-size="20" font-weight="700" fill="#0f172a" text-anchor="middle">glnk.dev</text>`;
  const qrCard = `
    <rect x="${cardX}" y="${cardY}" width="${cardSize}" height="${cardSize}" rx="28" ry="28" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    ${brandInCard}
    <image href="${qrDataUri}" x="${qrX}" y="${qrY}" width="${qrSize}" height="${qrSize}"/>
    <text x="${cardX + cardSize / 2}" y="${cardY + cardSize - 22}" font-family="Inter, -apple-system, Helvetica, Arial, sans-serif" font-size="15" font-weight="500" fill="#94a3b8" text-anchor="middle">Scan to open</text>
  `;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="aura" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.55"/>
      <stop offset="60%" stop-color="#3b82f6" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="warmSoft" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fed7aa" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="#fdba74" stop-opacity="0.85"/>
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="#fffaf5"/>

  <!-- Background: pre-cleaned og-bg.png (waves at corners, center cleared) -->
  ${ogBgDataUri ? `<image href="${ogBgDataUri}" x="0" y="0" width="1200" height="630" preserveAspectRatio="xMidYMid slice"/>` : ''}

  <!-- Left blue accent line -->
  <rect x="0" y="0" width="8" height="630" fill="#2563eb"/>

  <!-- Brand mark top-left -->
  ${brandMark}

  <!-- Big title: just the /path (hostname lives in the brand row above) -->
  <text x="80" y="290" font-family="Inter, -apple-system, Helvetica, Arial, sans-serif" font-size="56" font-weight="700" fill="#f97316">${escapeXml(path)}</text>

  <!-- Tagline label -->
  <text x="80" y="355" font-family="Inter, -apple-system, Helvetica, Arial, sans-serif" font-size="20" fill="#94a3b8">Redirects to</text>
  <!-- Destination (wraps to up to 3 lines) -->
  ${destLines.map((line, i) => `<text x="80" y="${390 + i * 30}" font-family="Inter, -apple-system, Helvetica, Arial, sans-serif" font-size="22" font-weight="600" fill="#0f172a">${escapeXml(line)}</text>`).join('\n  ')}


  <!-- Right-side QR card -->
  ${qrCard}
</svg>`;
}

function stubHtml({ path, ogImage, title, description, destination }) {
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<title>${escapeXml(title)}</title>
<meta name="description" content="${escapeXml(description)}">
<meta property="og:title" content="${escapeXml(title)}">
<meta property="og:description" content="${escapeXml(description)}">
<meta property="og:url" content="${PUBLIC_URL}${path}">
<meta property="og:image" content="${ogImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta http-equiv="refresh" content="0;url=${escapeXml(destination)}">
<link rel="canonical" href="${escapeXml(destination)}">
</head><body>
<script>window.location.replace(${JSON.stringify(destination)});</script>
<p>Redirecting to <a href="${escapeXml(destination)}">${escapeXml(destination)}</a>...</p>
</body></html>`;
}

function writeOut(file, data) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, data);
}

const routes = parseYaml(readFileSync(YAML_PATH, 'utf8')) ?? {};
let generated = 0, skipped = 0;

for await (const [path, dest] of Object.entries(routes)) {
  if (path.includes('{$') || String(dest).includes('{$')) {
    console.log(`[og] ${path}  (wildcard — falls back to default OG)`);
    skipped++;
    continue;
  }
  const s = slug(path);
  const shortLink = `${stripProto(PUBLIC_URL)}${path}`;
  const destShort = stripProto(String(dest));
  const title = truncate(destShort, 40);
  const description = `via ${shortLink}`;

  const qrDataUri = await makeQrDataUri(String(dest));
  const png = new Resvg(ogSvg(shortLink, destShort, path, stripProto(PUBLIC_URL), qrDataUri), {
    fitTo: { mode: 'width', value: 1200 },
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
  }).render().asPng();
  writeOut(join(OUT_DIR, 'og', `${s}.png`), png);
  writeOut(
    join(OUT_DIR, path, 'index.html'),
    stubHtml({ path, ogImage: `${PUBLIC_URL}/og/${s}.png`, title, description, destination: String(dest) }),
  );

  console.log(`[og] ${path}  →  ${title}`);
  generated++;
}

console.log(`[og] done — ${generated} generated, ${skipped} skipped`);
