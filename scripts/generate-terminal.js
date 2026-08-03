// generate-terminal.js
// Produces assets/terminal.svg: a realistic animated terminal where
// commands "type" out and produce output, on a loop, with a blinking cursor.
import { writeFileSync } from 'node:fs';
import { COLORS, FONT, defs, dots, esc } from './theme.js';

const W = 780, H = 420;

// Each entry: prompt command + output lines. Timing is derived automatically.
const SESSION = [
  { cmd: 'whoami', out: ['nbashno — AI Systems Architect'] },
  { cmd: 'cat profile.json', out: [
      '{ "role": "Senior Engineer",',
      '  "stack": ["TS","Node","Next","Solana"],',
      '  "focus": "AI infra • automation • bots" }' ] },
  { cmd: 'status', out: ['● all systems operational'] },
  { cmd: 'docker ps', out: [
      'CONTAINER   IMAGE            STATUS',
      'a1f3   hunter-engine    Up 14d',
      'b7c2   guardian-v2      Up 14d',
      'c9d4   manara-bot       Up 30d' ] },
  { cmd: 'kubectl get pods', out: [
      'NAME              READY   STATUS',
      'api-gateway-0     1/1     Running',
      'worker-queue-2    1/1     Running' ] },
  { cmd: 'uptime', out: ['up 412 days, load avg: 0.14 0.09 0.05'] },
];

const CHAR = 0.055;   // seconds per typed char
const LINE = 0.35;    // pause per output line
const ROW = 20;       // px per row
const START_X = 26;
const START_Y = 90;

let t = 0;            // running timeline (seconds)
let row = 0;          // running row index
let body = '';

function commandLine(cmd) {
  const y = START_Y + row * ROW;
  const typeDur = cmd.length * CHAR;
  // prompt
  body += `<text x="${START_X}" y="${y}" font-family="${FONT}" font-size="13.5"
      fill="${COLORS.text}" opacity="0">
      <tspan fill="${COLORS.green}">➜</tspan>
      <tspan fill="${COLORS.cyan}"> ~</tspan>
      <tspan fill="${COLORS.text}"> </tspan>`;
  // reveal command char-by-char via clip-like width trick: animate opacity of spans
  const chars = cmd.split('').map((c, i) => {
    const b = (t + i * CHAR).toFixed(3);
    return `<tspan opacity="0">${esc(c)}<animate attributeName="opacity"
      values="0;1" dur="0.01s" begin="${b}s" fill="freeze"/></tspan>`;
  }).join('');
  body += chars + `
      <animate attributeName="opacity" values="0;1" dur="0.01s" begin="${t.toFixed(3)}s" fill="freeze"/>
    </text>`;
  t += typeDur + 0.2;
  row++;
}

function outputLines(lines) {
  for (const ln of lines) {
    const y = START_Y + row * ROW;
    body += `<text x="${START_X}" y="${y}" font-family="${FONT}" font-size="13"
        fill="${COLORS.textDim}" opacity="0">${esc(ln)}
        <animate attributeName="opacity" values="0;1" dur="0.15s" begin="${t.toFixed(3)}s" fill="freeze"/>
      </text>`;
    t += LINE;
    row++;
  }
  row += 0.4; // small gap
}

for (const s of SESSION) {
  commandLine(s.cmd);
  outputLines(s.out);
}

const total = (t + 2).toFixed(2);
// Blinking cursor that follows the end, then whole thing resets via a group loop.
const cursorY = START_Y + row * ROW;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"
  viewBox="0 0 ${W} ${H}" role="img" aria-label="Animated terminal">
  ${defs({ grid: false })}
  <rect width="${W}" height="${H}" rx="14" fill="url(#glass)"
        stroke="url(#neon)" stroke-width="1.3"/>
  <rect width="${W}" height="${H}" rx="14" fill="url(#scan)"/>

  <!-- title bar -->
  ${dots(26, 26)}
  <text x="${W / 2}" y="31" font-family="${FONT}" font-size="12"
        fill="${COLORS.textDim}" text-anchor="middle">nbashno@dashboard: ~/profile</text>
  <line x1="0" y1="52" x2="${W}" y2="52" stroke="${COLORS.dim}" stroke-width="1"/>

  <!-- session (loops) -->
  <g>
    ${body}
    <rect x="${START_X}" y="${cursorY - 12}" width="8" height="15" fill="${COLORS.cyan}" opacity="0">
      <animate attributeName="opacity" values="0;0;1" keyTimes="0;${(t / (t + 2)).toFixed(2)};1"
        dur="${total}s" fill="freeze"/>
      <animate attributeName="opacity" values="1;0;1" dur="1s"
        begin="${t.toFixed(2)}s" repeatCount="indefinite"/>
    </rect>
    <!-- reset the whole session -->
    <animate attributeName="opacity" values="1;1;0;1" keyTimes="0;0.94;0.97;1"
      dur="${total}s" repeatCount="indefinite"/>
  </g>
</svg>`;

writeFileSync(new URL('../assets/terminal.svg', import.meta.url), svg);
console.log('✓ terminal.svg generated');
