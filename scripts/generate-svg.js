// generate-svg.js
// Produces the remaining static-but-animated assets:
//   architecture.svg, matrix.svg, divider.svg, footer.svg
// All handcrafted, all SMIL-animated, all GitHub-safe.
import { writeFileSync } from 'node:fs';
import { COLORS, FONT, defs, esc } from './theme.js';

const out = (name, svg) => {
  writeFileSync(new URL(`../assets/${name}`, import.meta.url), svg);
  console.log(`✓ ${name} generated`);
};

/* ----------------------------- architecture.svg ---------------------------- */
function architecture() {
  const W = 1000, H = 460;
  // nodes: [id, label, x, y]
  const N = {
    tg:   ['Telegram',   120, 70],
    bot:  ['Bots',       120, 200],
    api:  ['REST API',   380, 135],
    work: ['Workers',    380, 300],
    q:    ['Queues',     620, 300],
    redis:['Redis',      620, 70],
    pg:   ['PostgreSQL', 860, 135],
    sup:  ['Supabase',   860, 300],
    ai:   ['AI Engine',  380, 420],
    cloud:['Cloud',      620, 420],
    mon:  ['Monitoring', 860, 420],
  };
  // edges: [from, to]
  const E = [
    ['tg','api'],['bot','api'],['api','work'],['api','redis'],
    ['work','q'],['q','pg'],['q','sup'],['redis','pg'],
    ['work','ai'],['ai','cloud'],['cloud','mon'],['api','pg'],
  ];
  const NW = 118, NH = 48;
  const cx = (k) => N[k][2] + NW / 2;
  const cy = (k) => N[k][3] + NH / 2;

  const edges = E.map(([a, b], i) => {
    const x1 = cx(a), y1 = cy(a), x2 = cx(b), y2 = cy(b);
    const mx = (x1 + x2) / 2;
    const d = `M${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
    const begin = (i * 0.25).toFixed(2);
    return `
      <path d="${d}" fill="none" stroke="${COLORS.cyan}" stroke-width="1.4"
            opacity="0.35"/>
      <path d="${d}" fill="none" stroke="url(#neon)" stroke-width="2"
            stroke-dasharray="6 220" filter="url(#glow)">
        <animate attributeName="stroke-dashoffset" values="226;0"
          dur="2.4s" begin="${begin}s" repeatCount="indefinite"/>
      </path>`;
  }).join('');

  const nodes = Object.entries(N).map(([k, [label, x, y]], i) => {
    const b = (i * 0.15).toFixed(2);
    return `
      <g opacity="0">
        <animate attributeName="opacity" values="0;1" dur="0.5s" begin="${b}s" fill="freeze"/>
        <rect x="${x}" y="${y}" width="${NW}" height="${NH}" rx="10"
              fill="url(#glass)" stroke="url(#neon)" stroke-width="1.3"/>
        <circle cx="${x + 14}" cy="${y + NH / 2}" r="4" fill="${COLORS.green}" filter="url(#glow)">
          <animate attributeName="opacity" values="1;0.3;1" dur="2s"
            begin="${b}s" repeatCount="indefinite"/>
        </circle>
        <text x="${x + 28}" y="${y + NH / 2 + 4.5}" font-family="${FONT}"
              font-size="13" fill="${COLORS.text}">${esc(label)}</text>
      </g>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"
    viewBox="0 0 ${W} ${H}" role="img" aria-label="System architecture">
    ${defs()}
    <rect width="${W}" height="${H}" rx="16" fill="${COLORS.bg}"/>
    <rect width="${W}" height="${H}" rx="16" fill="url(#grid)"/>
    <text x="30" y="34" font-family="${FONT}" font-size="12"
          fill="${COLORS.textDim}" letter-spacing="3">SYSTEM ARCHITECTURE</text>
    ${edges}
    ${nodes}
    <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="16" fill="none"
          stroke="url(#neon)" stroke-width="1.3" opacity="0.6"/>
  </svg>`;
}

/* -------------------------------- matrix.svg ------------------------------- */
function matrixBg() {
  const W = 1000, H = 160, cols = 60;
  let rain = '';
  for (let i = 0; i < cols; i++) {
    const x = (i / cols) * W + 4;
    const dur = (2 + Math.random() * 4).toFixed(2);
    const delay = (Math.random() * 5).toFixed(2);
    const glyphs = Array.from({ length: 8 },
      () => (Math.random() > 0.5 ? '1' : '0')).join(' ');
    rain += `
      <text x="${x.toFixed(1)}" y="0" font-family="${FONT}" font-size="12"
            fill="${COLORS.green}" opacity="0">${glyphs}
        <animateTransform attributeName="transform" type="translate"
          values="0,-40;0,${H + 40}" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0;0.5;0" dur="${dur}s"
          begin="${delay}s" repeatCount="indefinite"/>
      </text>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"
    viewBox="0 0 ${W} ${H}" role="img" aria-label="Matrix rain">
    ${defs({ glow: false, grid: false })}
    <rect width="${W}" height="${H}" fill="${COLORS.bg}"/>
    ${rain}
  </svg>`;
}

/* ------------------------------- divider.svg ------------------------------- */
function divider() {
  const W = 1000, H = 20;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"
    viewBox="0 0 ${W} ${H}" role="img" aria-label="divider">
    ${defs({ grid: false, scan: false })}
    <line x1="0" y1="10" x2="${W}" y2="10" stroke="url(#neon)" stroke-width="2"
          filter="url(#glow)" opacity="0.9"/>
    <circle cx="0" cy="10" r="4" fill="${COLORS.cyan}" filter="url(#glow)">
      <animate attributeName="cx" values="0;${W};0" dur="6s" repeatCount="indefinite"/>
    </circle>
  </svg>`;
}

/* -------------------------------- footer.svg ------------------------------- */
function footer() {
  const W = 1000, H = 120;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"
    viewBox="0 0 ${W} ${H}" role="img" aria-label="footer">
    ${defs({ scan: false })}
    <rect width="${W}" height="${H}" fill="${COLORS.bg}"/>
    <rect width="${W}" height="${H}" fill="url(#grid)"/>
    <line x1="0" y1="4" x2="${W}" y2="4" stroke="url(#neon)" stroke-width="2" filter="url(#glow)"/>
    <text x="${W / 2}" y="55" font-family="${FONT}" font-size="18" font-weight="700"
          fill="url(#neon)" filter="url(#glow)" text-anchor="middle">
      &lt; keep building &gt;
    </text>
    <text x="${W / 2}" y="82" font-family="${FONT}" font-size="12"
          fill="${COLORS.textDim}" text-anchor="middle">
      designed &amp; generated with SVG · auto-updated via GitHub Actions
    </text>
    <circle cx="${W / 2}" cy="100" r="3" fill="${COLORS.green}" filter="url(#glow)">
      <animate attributeName="opacity" values="1;0.2;1" dur="2s" repeatCount="indefinite"/>
    </circle>
  </svg>`;
}

out('architecture.svg', architecture());
out('matrix.svg', matrixBg());
out('divider.svg', divider());
out('footer.svg', footer());
