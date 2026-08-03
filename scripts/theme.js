// theme.js
// Single source of truth for the cyberpunk visual system.
// Every generator imports from here so colors/fonts never drift.

export const COLORS = {
  bg:       '#05060A',
  bgPanel:  '#0A0E17',
  cyan:     '#00F5FF',
  purple:   '#8A2BE2',
  green:    '#39FF14',
  dim:      '#1a2332',
  text:     '#C6D3E3',
  textDim:  '#5A6B82',
};

export const FONT =
  "'JetBrains Mono','SF Mono',ui-monospace,'Cascadia Code',Menlo,Consolas,monospace";

// Reusable SVG defs: glass gradient, neon glow filter, scanline pattern, grid.
// Injected once per SVG. Keeps every file consistent and small.
export function defs({ glow = true, grid = true, scan = true } = {}) {
  return `
  <defs>
    <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${COLORS.bgPanel}" stop-opacity="0.92"/>
      <stop offset="1" stop-color="${COLORS.bg}" stop-opacity="0.98"/>
    </linearGradient>
    <linearGradient id="neon" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0"   stop-color="${COLORS.cyan}"/>
      <stop offset="0.5" stop-color="${COLORS.purple}"/>
      <stop offset="1"   stop-color="${COLORS.green}"/>
    </linearGradient>
    ${glow ? `
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2.2" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="softglow" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="4" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>` : ''}
    ${grid ? `
    <pattern id="grid" width="34" height="34" patternUnits="userSpaceOnUse">
      <path d="M34 0H0V34" fill="none" stroke="${COLORS.cyan}" stroke-width="0.4" stroke-opacity="0.10"/>
    </pattern>` : ''}
    ${scan ? `
    <pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse">
      <rect width="4" height="1" fill="${COLORS.cyan}" opacity="0.03"/>
    </pattern>` : ''}
  </defs>`;
}

// Rounded glass panel with animated neon border stroke.
export function panel(x, y, w, h, r = 14) {
  return `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"
        fill="url(#glass)" stroke="url(#neon)" stroke-width="1.3" opacity="0.96"/>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"
        fill="none" stroke="${COLORS.cyan}" stroke-width="1.3" opacity="0.5">
    <animate attributeName="opacity" values="0.15;0.6;0.15" dur="3.5s" repeatCount="indefinite"/>
  </rect>`;
}

// Fake window traffic-light dots (terminal chrome).
export function dots(x, y) {
  const c = ['#FF5F56', '#FFBD2E', '#27C93F'];
  return c.map((col, i) =>
    `<circle cx="${x + i * 18}" cy="${y}" r="5" fill="${col}" opacity="0.9"/>`
  ).join('');
}

// Escape text for safe SVG embedding.
export const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
