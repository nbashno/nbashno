// generate-banner.js
// Produces assets/banner.svg: a cyberpunk boot-screen header with
// scanning grid, matrix rain, animated boot log, and a rotating title.
import { writeFileSync } from 'node:fs';
import { COLORS, FONT, defs, esc } from './theme.js';

const W = 1000, H = 280;

const TITLES = [
  'AI Systems Architect',
  'Telegram Platform Builder',
  'WebApp Engineer',
  'Automation Engineer',
  'Open Source Builder',
];

const BOOT = [
  'Initializing kernel...',
  'Loading AI engine...',
  'Mounting infrastructure...',
  'Spinning up projects...',
  'Establishing uplink...',
  'SYSTEM ONLINE',
];

// Matrix rain columns — pure SVG, staggered opacity animation.
function matrix() {
  let out = '';
  const cols = 40;
  for (let i = 0; i < cols; i++) {
    const x = (i / cols) * W + 6;
    const delay = (Math.random() * 4).toFixed(2);
    const dur = (3 + Math.random() * 3).toFixed(2);
    const chars = '01'.repeat(3).split('').map((_, k) =>
      Math.random() > 0.5 ? '1' : '0').join('');
    out += `
    <text x="${x.toFixed(1)}" y="-20" font-family="${FONT}" font-size="11"
          fill="${COLORS.green}" opacity="0">
      ${chars.split('').join(' ')}
      <animateTransform attributeName="transform" type="translate"
        values="0,-20; 0,${H + 40}" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0;0.35;0" dur="${dur}s"
        begin="${delay}s" repeatCount="indefinite"/>
    </text>`;
  }
  return `<g opacity="0.5">${out}</g>`;
}

// Boot log lines fade in sequentially, last line glows green.
function bootLog() {
  return BOOT.map((line, i) => {
    const y = 70 + i * 26;
    const begin = (i * 0.5).toFixed(2);
    const isLast = i === BOOT.length - 1;
    const col = isLast ? COLORS.green : COLORS.text;
    return `
    <text x="60" y="${y}" font-family="${FONT}" font-size="15"
          fill="${col}" opacity="0.15" ${isLast ? 'filter="url(#glow)" font-weight="700"' : ''}>
      <tspan fill="${COLORS.cyan}">${isLast ? '✓' : '›'}</tspan> ${esc(line)}
      <animate attributeName="opacity" values="0.15;1" dur="0.4s" begin="${begin}s" fill="freeze"/>
    </text>`;
  }).join('');
}

// Rotating title using discrete opacity keyframes (SMIL, GitHub-safe).
function rotatingTitle() {
  const n = TITLES.length;
  const cycle = n * 2.4;
  return TITLES.map((t, i) => {
    const begin = (i * 2.4).toFixed(2);
    const first = i === 0;
    return `
    <text x="600" y="150" font-family="${FONT}" font-size="26" font-weight="700"
          fill="url(#neon)" filter="url(#glow)" opacity="${first ? 1 : 0}" text-anchor="start">
      ${esc(t)}<tspan fill="${COLORS.cyan}">_</tspan>
      <animate attributeName="opacity"
        values="0;1;1;0;0" keyTimes="0;0.05;0.35;0.42;1"
        dur="${cycle}s" begin="${begin}s" repeatCount="indefinite"/>
    </text>`;
  }).join('');
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"
  viewBox="0 0 ${W} ${H}" role="img" aria-label="Profile banner">
  ${defs()}
  <rect width="${W}" height="${H}" rx="16" fill="${COLORS.bg}"/>
  <rect width="${W}" height="${H}" rx="16" fill="url(#grid)"/>
  ${matrix()}
  <rect width="${W}" height="${H}" rx="16" fill="url(#scan)"/>
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="16" fill="none"
        stroke="url(#neon)" stroke-width="1.5" opacity="0.7"/>

  <!-- Boot log region divider -->
  <line x1="500" y1="40" x2="500" y2="240" stroke="${COLORS.dim}" stroke-width="1"/>

  <text x="60" y="42" font-family="${FONT}" font-size="12" fill="${COLORS.textDim}"
        letter-spacing="3">BOOT SEQUENCE</text>
  ${bootLog()}

  <text x="600" y="42" font-family="${FONT}" font-size="12" fill="${COLORS.textDim}"
        letter-spacing="3">IDENTITY</text>
  ${rotatingTitle()}

  <!-- Loading progress bar -->
  <rect x="600" y="180" width="330" height="8" rx="4" fill="${COLORS.dim}"/>
  <rect x="600" y="180" width="0" height="8" rx="4" fill="url(#neon)" filter="url(#glow)">
    <animate attributeName="width" values="0;330" dur="3s" fill="freeze"/>
  </rect>
  <text x="600" y="212" font-family="${FONT}" font-size="11" fill="${COLORS.green}">
    <animate attributeName="opacity" values="0;1" dur="0.3s" begin="3s" fill="freeze"/>
    ▓▓▓▓▓▓▓▓▓▓ 100%  READY
  </text>
</svg>`;

writeFileSync(new URL('../assets/banner.svg', import.meta.url), svg);
console.log('✓ banner.svg generated');
