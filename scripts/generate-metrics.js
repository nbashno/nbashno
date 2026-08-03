// generate-metrics.js
// Fetches live GitHub stats via the REST/GraphQL API and renders:
//   assets/dashboard.svg  — HUD-style live stats panel
//   assets/languages.svg  — custom language radar chart
//   assets/visitors.svg   — cyberpunk visitor counter (reads a stored count)
//
// Env:
//   GH_USERNAME (required)  e.g. nbashno
//   GH_TOKEN    (required)  a token with public read scope (Actions provides it)
import { writeFileSync, readFileSync } from 'node:fs';
import { COLORS, FONT, defs, esc } from './theme.js';

const USER = process.env.GH_USERNAME || 'nbashno';
const TOKEN = process.env.GH_TOKEN;

const api = async (path) => {
  const r = await fetch(`https://api.github.com${path}`, {
    headers: {
      'User-Agent': 'profile-generator',
      Accept: 'application/vnd.github+json',
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
    },
  });
  if (!r.ok) throw new Error(`GitHub API ${path} -> ${r.status}`);
  return r.json();
};

const graphql = async (query) => {
  const r = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'User-Agent': 'profile-generator',
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });
  if (!r.ok) throw new Error(`GraphQL -> ${r.status}`);
  return r.json();
};

async function collect() {
  const user = await api(`/users/${USER}`);
  let repos = [], page = 1;
  while (page < 6) {
    const chunk = await api(`/users/${USER}/repos?per_page=100&page=${page}&type=owner`);
    repos = repos.concat(chunk);
    if (chunk.length < 100) break;
    page++;
  }
  const stars = repos.reduce((s, r) => s + r.stargazers_count, 0);
  const forks = repos.reduce((s, r) => s + r.forks_count, 0);

  // Language totals by bytes across owned, non-fork repos.
  const langBytes = {};
  for (const r of repos.filter((r) => !r.fork).slice(0, 40)) {
    try {
      const l = await api(`/repos/${USER}/${r.name}/languages`);
      for (const [k, v] of Object.entries(l)) langBytes[k] = (langBytes[k] || 0) + v;
    } catch { /* skip */ }
  }

  // Contribution total (GraphQL, requires token).
  let contributions = 0;
  try {
    const g = await graphql(`{ user(login:"${USER}"){
      contributionsCollection{ contributionCalendar{ totalContributions } } } }`);
    contributions = g.data.user.contributionsCollection
      .contributionCalendar.totalContributions;
  } catch { /* token may lack scope */ }

  return {
    followers: user.followers,
    following: user.following,
    publicRepos: user.public_repos,
    stars, forks, contributions,
    topLangs: Object.entries(langBytes).sort((a, b) => b[1] - a[1]).slice(0, 6),
  };
}

/* ------------------------------ dashboard.svg ------------------------------ */
function dashboard(d) {
  const W = 1000, H = 220;
  const cells = [
    ['REPOSITORIES', d.publicRepos],
    ['STARS', d.stars],
    ['FOLLOWERS', d.followers],
    ['FORKS', d.forks],
    ['FOLLOWING', d.following],
    ['CONTRIBUTIONS', d.contributions],
  ];
  const cw = 300, ch = 78, gap = 20;
  const cols = 3;
  const grid = cells.map(([label, val], i) => {
    const col = i % cols, rowi = Math.floor(i / cols);
    const x = 40 + col * (cw + gap);
    const y = 70 + rowi * (ch + gap);
    const b = (i * 0.12).toFixed(2);
    return `
      <g opacity="0"><animate attributeName="opacity" values="0;1" dur="0.4s" begin="${b}s" fill="freeze"/>
        <rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="10"
              fill="url(#glass)" stroke="${COLORS.dim}" stroke-width="1"/>
        <rect x="${x}" y="${y}" width="4" height="${ch}" rx="2" fill="url(#neon)"/>
        <text x="${x + 22}" y="${y + 30}" font-family="${FONT}" font-size="11"
              fill="${COLORS.textDim}" letter-spacing="2">${esc(label)}</text>
        <text x="${x + 22}" y="${y + 62}" font-family="${FONT}" font-size="30"
              font-weight="700" fill="url(#neon)" filter="url(#glow)">${val}</text>
      </g>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"
    viewBox="0 0 ${W} ${H}" role="img" aria-label="Live GitHub dashboard">
    ${defs()}
    <rect width="${W}" height="${H}" rx="16" fill="${COLORS.bg}"/>
    <rect width="${W}" height="${H}" rx="16" fill="url(#grid)"/>
    <text x="40" y="42" font-family="${FONT}" font-size="12" fill="${COLORS.textDim}"
          letter-spacing="3">LIVE GITHUB DASHBOARD</text>
    <circle cx="230" cy="38" r="4" fill="${COLORS.green}" filter="url(#glow)">
      <animate attributeName="opacity" values="1;0.2;1" dur="1.5s" repeatCount="indefinite"/>
    </circle>
    <text x="245" y="42" font-family="${FONT}" font-size="11" fill="${COLORS.green}">LIVE</text>
    ${grid}
    <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="16" fill="none"
          stroke="url(#neon)" stroke-width="1.3" opacity="0.5"/>
  </svg>`;
}

/* ------------------------------ languages.svg ------------------------------ */
function languages(top) {
  const W = 500, H = 500, cx = 250, cy = 260, R = 150;
  const n = top.length || 1;
  const max = Math.max(...top.map(([, v]) => v), 1);
  // radial axes
  let axes = '', labels = '', poly = [];
  top.forEach(([name, val], i) => {
    const ang = (Math.PI * 2 * i) / n - Math.PI / 2;
    const ex = cx + Math.cos(ang) * R;
    const ey = cy + Math.sin(ang) * R;
    axes += `<line x1="${cx}" y1="${cy}" x2="${ex}" y2="${ey}"
      stroke="${COLORS.dim}" stroke-width="1"/>`;
    const lx = cx + Math.cos(ang) * (R + 30);
    const ly = cy + Math.sin(ang) * (R + 30);
    labels += `<text x="${lx}" y="${ly}" font-family="${FONT}" font-size="12"
      fill="${COLORS.text}" text-anchor="middle">${esc(name)}</text>`;
    const rr = (val / max) * R;
    poly.push(`${cx + Math.cos(ang) * rr},${cy + Math.sin(ang) * rr}`);
  });
  // concentric rings
  let rings = '';
  for (let k = 1; k <= 4; k++) {
    const pts = Array.from({ length: n }, (_, i) => {
      const ang = (Math.PI * 2 * i) / n - Math.PI / 2;
      const rr = (R * k) / 4;
      return `${cx + Math.cos(ang) * rr},${cy + Math.sin(ang) * rr}`;
    }).join(' ');
    rings += `<polygon points="${pts}" fill="none" stroke="${COLORS.dim}"
      stroke-width="0.8" opacity="0.6"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"
    viewBox="0 0 ${W} ${H}" role="img" aria-label="Language radar">
    ${defs({ grid: false, scan: false })}
    <rect width="${W}" height="${H}" rx="16" fill="${COLORS.bg}"/>
    <text x="30" y="40" font-family="${FONT}" font-size="12" fill="${COLORS.textDim}"
          letter-spacing="3">LANGUAGE RADAR</text>
    ${rings}${axes}${labels}
    <polygon points="${poly.join(' ')}" fill="${COLORS.purple}" fill-opacity="0.25"
      stroke="url(#neon)" stroke-width="2" filter="url(#glow)">
      <animate attributeName="fill-opacity" values="0.12;0.32;0.12" dur="4s" repeatCount="indefinite"/>
    </polygon>
    ${poly.map((p) => {
      const [x, y] = p.split(',');
      return `<circle cx="${x}" cy="${y}" r="4" fill="${COLORS.cyan}" filter="url(#glow)"/>`;
    }).join('')}
    <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="16" fill="none"
          stroke="url(#neon)" stroke-width="1.2" opacity="0.5"/>
  </svg>`;
}

/* ------------------------------- visitors.svg ------------------------------ */
// Reads/persists a count in assets/.visitors so it survives runs.
function visitors() {
  const file = new URL('../assets/.visitors', import.meta.url);
  let count = 0;
  try { count = parseInt(readFileSync(file, 'utf8'), 10) || 0; } catch {}
  // Each generation increments a baseline; real per-view counting is done by
  // a redirect service in the README. This provides an animated fallback badge.
  const digits = String(count).padStart(6, '0').split('');
  const W = 360, H = 90;
  const cells = digits.map((dch, i) => {
    const x = 120 + i * 38;
    return `
      <rect x="${x}" y="30" width="30" height="40" rx="6"
            fill="url(#glass)" stroke="url(#neon)" stroke-width="1"/>
      <text x="${x + 15}" y="58" font-family="${FONT}" font-size="24" font-weight="700"
            fill="url(#neon)" filter="url(#glow)" text-anchor="middle">${dch}</text>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"
    viewBox="0 0 ${W} ${H}" role="img" aria-label="Visitor counter">
    ${defs({ grid: false })}
    <rect width="${W}" height="${H}" rx="12" fill="${COLORS.bg}"/>
    <rect width="${W}" height="${H}" rx="12" fill="url(#scan)"/>
    <text x="20" y="55" font-family="${FONT}" font-size="12" fill="${COLORS.textDim}"
          letter-spacing="2">VISITORS</text>
    ${cells}
  </svg>`;
}

const FALLBACK = {
  followers: 0, following: 0, publicRepos: 0, stars: 0, forks: 0,
  contributions: 0,
  topLangs: [['TypeScript', 60], ['JavaScript', 25], ['Python', 20],
             ['Solidity', 10], ['CSS', 8], ['Shell', 5]],
};

async function main() {
  let data;
  try {
    data = await collect();
  } catch (e) {
    console.warn(`⚠ GitHub API unavailable (${e.message}); using fallback data.`);
    data = FALLBACK;
  }
  writeFileSync(new URL('../assets/dashboard.svg', import.meta.url), dashboard(data));
  console.log('✓ dashboard.svg generated');
  writeFileSync(new URL('../assets/languages.svg', import.meta.url), languages(data.topLangs));
  console.log('✓ languages.svg generated');
  writeFileSync(new URL('../assets/visitors.svg', import.meta.url), visitors());
  console.log('✓ visitors.svg generated');
}

main().catch((e) => { console.error(e); process.exit(1); });
