/**
 * Generates the Dark Yaksha placeholder artwork for every image slot.
 * All files are original SVGs — no copyrighted assets are used.
 * Run: node scripts/generate-placeholders.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'public/images';
const dirs = ['xiao', 'chibis', 'scrapbook', 'decorations'];
for (const d of dirs) mkdirSync(join(ROOT, d), { recursive: true });

const svg = (width, height, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">${body}</svg>`;

/** Shared gradient defs */
const defs = (id, from, to, vertical = false) => `
<defs><linearGradient id="${id}" x1="0" y1="0" x2="${vertical ? 0 : 1}" y2="1">
<stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>`;

const star = (cx, cy, r, fill, opacity = 1) => {
  const p = [];
  for (let i = 0; i < 10; i++) {
    const rad = (i % 2 === 0 ? r : r * 0.382) * 1;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    p.push(`${(cx + rad * Math.cos(a)).toFixed(1)},${(cy + rad * Math.sin(a)).toFixed(1)}`);
  }
  return `<polygon points="${p.join(' ')}" fill="${fill}" opacity="${opacity}"/>`;
};

const label = (x, y, text, fill = '#a6b3b0', size = 15) =>
  `<text x="${x}" y="${y}" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="${size}" fill="${fill}" letter-spacing="2">${text}</text>`;

/* ─────────────────────────── Hero portrait (2:3 · 800×1200) ──────────── */
const portrait = svg(
  800,
  1200,
  defs('sky', '#123a36', '#101719', true) +
    defs('peak1', '#16423d', '#0e2422') +
    defs('peak2', '#0f2f2c', '#0a1d1b') +
    defs('glow', 'rgba(70,199,178,0.5)', 'rgba(70,199,178,0)') +
    `<rect width="800" height="1200" fill="url(#sky)"/>
  <circle cx="620" cy="210" r="150" fill="url(#glow)"/>
  ${star(620, 210, 26, '#e8cd92')}
  ${star(620, 210, 44, 'none', 0)}
  <circle cx="620" cy="210" r="58" fill="none" stroke="#c9a45c" stroke-dasharray="5 7" opacity="0.5"/>
  <circle cx="620" cy="210" r="80" fill="none" stroke="#c9a45c" opacity="0.25"/>
  ${star(180, 150, 10, '#46c7b2', 0.8)}
  ${star(90, 340, 7, '#c9a45c', 0.7)}
  ${star(700, 480, 8, '#46c7b2', 0.6)}
  <g opacity="0.9">
    <path d="M0 980 L140 760 L260 930 L410 700 L560 900 L700 740 L800 880 L800 1200 L0 1200 Z" fill="url(#peak1)" opacity="0.85"/>
    <path d="M0 1080 L120 900 L300 1060 L470 840 L640 1040 L800 880 L800 1200 L0 1200 Z" fill="url(#peak2)"/>
  </g>
  <g>
    <polygon points="400,520 800,900 800,1200 0,1200 0,900" fill="#0b1917" opacity="0.55"/>
    <path d="M400 540 Q340 545 332 610 L318 800 L296 1150 L360 1150 L376 940 L424 940 L440 1150 L504 1150 L482 800 L468 610 Q460 545 400 540 Z" fill="#0e201d"/>
    <path d="M400 470 Q352 474 346 530 L454 530 Q448 474 400 470 Z" fill="#0e201d"/>
    <circle cx="400" cy="500" r="34" fill="#0e201d"/>
    <path d="M372 470 L364 436 L382 462 Z M428 470 L436 436 L418 462 Z" fill="#0e201d"/>
    <path d="M352 574 Q400 604 448 574 L448 640 Q400 668 352 640 Z" fill="#0e201d" opacity="0.85"/>
    <circle cx="400" cy="560" r="6" fill="#46c7b2"/>
    <circle cx="400" cy="700" r="5" fill="#c9a45c" opacity="0.9"/>
    <path d="M400 640 L400 800" stroke="#0e201d" stroke-width="0"/>
    <path d="M330 520 Q310 700 300 900 L332 900 Q336 690 352 560 Z" fill="#123833" opacity="0.9"/>
    <path d="M470 520 Q490 700 500 900 L468 900 Q464 690 448 560 Z" fill="#123833" opacity="0.9"/>
    <path d="M310 880 Q400 830 490 880 L470 1140 Q400 1180 330 1140 Z" fill="#0c221f"/>
    <path d="M330 1140 Q360 1104 400 1150 Q440 1104 470 1140" fill="none" stroke="#101719" stroke-width="14" opacity="0.9"/>
  </g>
  <ellipse cx="400" cy="1150" rx="330" ry="70" fill="rgba(70,199,178,0.10)"/>
  <ellipse cx="400" cy="800" rx="280" ry="40" fill="rgba(241,245,242,0.05)"/>
  <circle cx="400" cy="560" r="230" fill="none" stroke="#c9a45c" stroke-opacity="0.28" stroke-dasharray="2 10"/>
  <path d="M120 120 L168 120 L144 144 Z" fill="none" stroke="#c9a45c" stroke-opacity="0.5"/>
  <path d="M680 1080 L632 1080 L656 1056 Z" fill="none" stroke="#c9a45c" stroke-opacity="0.5"/>
  ${label(400, 1105, 'XIAO — ARTWORK PLACEHOLDER', '#7fe0d0', 26)}
  ${label(400, 1140, 'replace: public/images/xiao/xiao-portrait.svg', '#a6b3b0', 17)}`,
);
writeFileSync(join(ROOT, 'xiao/xiao-portrait.svg'), portrait);

/* ─────────────────────────── Chibi cards (1:1 · 480×480) ─────────────── */
const chibiPalettes = [
  { bg1: '#123a36', bg2: '#101719', hair: '#17302c', skin: '#224039', accent: '#46c7b2', blush: 'rgba(70,199,178,0.28)', mood: 'pout' },
  { bg1: '#16423d', bg2: '#0d2321', hair: '#12302b', skin: '#25453e', accent: '#c9a45c', blush: 'rgba(201,164,92,0.3)', mood: 'shy' },
  { bg1: '#0e2f2b', bg2: '#101719', hair: '#1a3530', skin: '#224039', accent: '#7fe0d0', blush: 'rgba(70,199,178,0.25)', mood: 'sleepy' },
  { bg1: '#123a36', bg2: '#142422', hair: '#153029', skin: '#264339', accent: '#e8cd92', blush: 'rgba(201,164,92,0.26)', mood: 'grump' },
  { bg1: '#143f3a', bg2: '#0f1d1c', hair: '#12332c', skin: '#24423a', accent: '#46c7b2', blush: 'rgba(70,199,178,0.3)', mood: 'soft' },
];

const mouths = {
  pout: '<path d="M205 320 Q240 306 275 320" fill="none" stroke="#0f1d1c" stroke-width="7" stroke-linecap="round"/>',
  shy: '<path d="M215 318 Q240 336 265 318" fill="none" stroke="#0f1d1c" stroke-width="7" stroke-linecap="round"/>',
  sleepy: '<path d="M212 318 L268 318" stroke="#0f1d1c" stroke-width="7" stroke-linecap="round"/>',
  grump: '<path d="M206 326 Q240 300 274 326" fill="none" stroke="#0f1d1c" stroke-width="7" stroke-linecap="round"/>',
  soft: '<path d="M222 316 Q240 330 258 316" fill="none" stroke="#0f1d1c" stroke-width="7" stroke-linecap="round"/>',
};
const eyes = {
  pout: '<circle cx="188" cy="268" r="11"/><circle cx="292" cy="268" r="11"/>',
  shy: '<circle cx="188" cy="268" r="11"/><circle cx="292" cy="268" r="11"/>',
  sleepy: '<path d="M175 270 Q188 258 201 270 M279 270 Q292 258 305 270" stroke="#0f1d1c" stroke-width="9" fill="none" stroke-linecap="round"/>',
  grump: '<circle cx="188" cy="270" r="11"/><circle cx="292" cy="270" r="11"/>',
  soft: '<circle cx="188" cy="268" r="11"/><circle cx="292" cy="268" r="11"/>',
};
const brows = {
  pout: '<path d="M170 240 L206 250 M310 240 L274 250" stroke="#0f1d1c" stroke-width="8" stroke-linecap="round"/>',
  shy: '<path d="M172 242 L206 246 M308 242 L274 246" stroke="#0f1d1c" stroke-width="8" stroke-linecap="round"/>',
  sleepy: '<path d="M174 246 L204 242 M306 246 L276 242" stroke="#0f1d1c" stroke-width="8" stroke-linecap="round"/>',
  grump: '<path d="M168 236 L206 252 M312 236 L274 252" stroke="#0f1d1c" stroke-width="9" stroke-linecap="round"/>',
  soft: '<path d="M172 242 L206 244 M308 242 L274 244" stroke="#0f1d1c" stroke-width="8" stroke-linecap="round"/>',
};

for (let i = 0; i < 5; i++) {
  const p = chibiPalettes[i];
  const n = i + 1;
  const chibi = svg(
    480,
    480,
    defs(`chbg${n}`, p.bg1, p.bg2, true) +
      `<rect width="480" height="480" fill="url(#chbg${n})"/>
    <circle cx="240" cy="280" r="150" fill="${p.accent}" opacity="0.08"/>
    <circle cx="240" cy="280" r="176" fill="none" stroke="${p.accent}" stroke-opacity="0.3" stroke-dasharray="3 10"/>
    ${star(96, 110, 9, p.accent, 0.75)}
    ${star(388, 92, 7, '#c9a45c', 0.8)}
    ${star(402, 350, 8, p.accent, 0.5)}
    <g>
      <path d="M118 300 Q108 168 240 132 Q372 168 362 300 L376 388 Q330 402 322 356 Q322 420 240 424 Q158 420 158 356 Q150 402 104 388 Z" fill="${p.hair}"/>
      <ellipse cx="240" cy="300" rx="104" ry="96" fill="${p.skin}"/>
      <path d="M136 262 Q150 190 240 184 Q330 190 344 262 Q300 236 240 240 Q180 236 136 262 Z" fill="${p.hair}"/>
      <path d="M196 190 L186 152 L212 182 Z M284 190 L294 152 L268 182 Z" fill="${p.hair}"/>
      ${brows[p.mood] ?? brows.pout}
      ${eyes[p.mood] ?? eyes.pout}
      <circle cx="184.5" cy="264.5" r="3.4" fill="#dfeeeb"/><circle cx="288.5" cy="264.5" r="3.4" fill="#dfeeeb"/>
      <ellipse cx="163" cy="296" rx="17" ry="10" fill="${p.blush}"/>
      <ellipse cx="317" cy="296" rx="17" ry="10" fill="${p.blush}"/>
      ${mouths[p.mood] ?? mouths.pout}
      <path d="M170 396 Q240 372 310 396 L312 420 L168 420 Z" fill="${p.accent}" opacity="0.85"/>
      <rect x="296" y="396" width="26" height="52" rx="12" fill="${p.accent}" opacity="0.7"/>
      <rect x="158" y="396" width="26" height="52" rx="12" fill="${p.accent}" opacity="0.7"/>
    </g>
    <rect x="0" y="432" width="480" height="48" fill="rgba(0,0,0,0.35)"/>
    ${label(240, 460, `CHIBI ${n} — placeholder · replace in /images/chibis/`, '#a6b3b0', 14)}`,
  );
  writeFileSync(join(ROOT, `chibis/chibi-${n}.svg`), chibi);
}

/* ─────────────────────────── Polaroids (4:5 · 600×750) ───────────────── */
const polaroidScenes = [
  ['#1d4a44', '#0d2b29', 'sunrise'],
  ['#123a36', '#101719', 'moon'],
  ['#16423d', '#0e2321', 'wind'],
  ['#0f332f', '#101719', 'stars'],
];
const sceneDetails = {
  sunrise:
    '<circle cx="300" cy="270" r="120" fill="rgba(201,164,92,0.5)"/><path d="M0 420 L120 320 L230 400 L360 300 L520 390 L600 330 L600 600 L0 600 Z" fill="#0a1c1a"/><path d="M0 460 L160 380 L320 460 L480 370 L600 440 L600 600 L0 600 Z" fill="#081513"/>' +
    star(460, 200, 14, '#e8cd92'),
  moon:
    '<circle cx="440" cy="180" r="66" fill="#f1f5f2" opacity="0.85"/><circle cx="420" cy="168" r="10" fill="#d8e6e2" opacity="0.6"/><circle cx="452" cy="196" r="7" fill="#d8e6e2" opacity="0.5"/><path d="M0 430 L140 340 L280 430 L430 330 L600 420 L600 600 L0 600 Z" fill="#0a1c1a"/>' +
    star(120, 150, 9, '#c9a45c', 0.8),
  wind:
    '<path d="M60 240 Q220 160 380 240 T600 230" stroke="#7fe0d0" stroke-width="10" fill="none" opacity="0.55" stroke-linecap="round"/><path d="M100 300 Q240 230 420 300 T600 290" stroke="#46c7b2" stroke-width="8" fill="none" opacity="0.45" stroke-linecap="round"/><path d="M0 440 L180 350 L340 440 L500 340 L600 400 L600 600 L0 600 Z" fill="#0a1c1a"/>' +
    star(520, 170, 11, '#46c7b2', 0.8),
  stars:
    star(140, 180, 12, '#c9a45c', 0.85) + star(320, 130, 9, '#7fe0d0', 0.8) + star(470, 220, 13, '#c9a45c', 0.75) + star(390, 320, 8, '#46c7b2', 0.6) +
    '<path d="M0 450 L200 360 L360 450 L500 350 L600 420 L600 600 L0 600 Z" fill="#0a1c1a"/>',
};

for (let i = 0; i < 4; i++) {
  const [c1, c2, scene] = polaroidScenes[i];
  const n = i + 1;
  const polaroid = svg(
    600,
    750,
    defs(`pb${n}`, c1, c2, true) +
      `<rect width="600" height="750" fill="#f7f1e3"/>
    <rect x="40" y="40" width="520" height="600" fill="url(#pb${n})"/>
    ${sceneDetails[scene]}
    <rect x="40" y="40" width="520" height="600" fill="none" stroke="rgba(0,0,0,0.18)"/>
    ${label(300, 692, 'polaroid placeholder · images/scrapbook/polaroid-' + n + '.svg', '#77837f', 15)}`,
  );
  writeFileSync(join(ROOT, `scrapbook/polaroid-${n}.svg`), polaroid);
}

/* ─────────────────────────── Vintage frames (3:2 · 800×534) ──────────── */
const vintageScenes = [
  `${star(600, 120, 16, '#c9a45c', 0.9)}<circle cx="600" cy="120" r="90" fill="rgba(201,164,92,0.16)"/><path d="M0 400 L170 280 L330 380 L520 260 L680 370 L800 300 L800 534 L0 534 Z" fill="#0a1c1a"/><path d="M0 460 L200 370 L380 470 L560 360 L800 450 L800 534 L0 534 Z" fill="#07110f"/>` +
    star(160, 150, 10, '#46c7b2', 0.7) + star(340, 110, 8, '#c9a45c', 0.6),
  `<path d="M0 120 Q200 30 400 120 T800 110" stroke="#7fe0d0" stroke-width="9" fill="none" opacity="0.4"/><circle cx="180" cy="220" r="60" fill="rgba(70,199,178,0.25)"/><path d="M0 380 L240 270 L440 380 L620 260 L800 350 L800 534 L0 534 Z" fill="#0a1c1a"/>` +
    star(620, 140, 12, '#46c7b2', 0.6) + star(100, 240, 8, '#c9a45c', 0.7),
];

for (let i = 0; i < 2; i++) {
  const n = i + 1;
  const vintage = svg(
    800,
    534,
    defs(`vt${n}`, '#20504a', '#0c1e1c', true) +
      defs(`vts${n}`, '#e8cd92', '#9c7a3f') +
      `<rect width="800" height="534" fill="#26200f"/>
    <rect width="800" height="534" fill="url(#vts${n})" opacity="0.55"/>
    <rect x="26" y="26" width="748" height="482" fill="url(#vt${n})"/>
    ${vintageScenes[i]}
    <rect x="26" y="26" width="748" height="482" fill="none" stroke="#c9a45c" stroke-width="3"/>
    <rect x="40" y="40" width="720" height="454" fill="none" stroke="rgba(232,205,146,0.5)" stroke-width="1"/>
    <circle cx="40" cy="40" r="9" fill="url(#vts${n})"/><circle cx="760" cy="40" r="9" fill="url(#vts${n})"/>
    <circle cx="40" cy="494" r="9" fill="url(#vts${n})"/><circle cx="760" cy="494" r="9" fill="url(#vts${n})"/>
    ${label(400, 510, 'vintage frame placeholder · images/scrapbook/vintage-' + n + '.svg', '#a6b3b0', 15)}`,
  );
  writeFileSync(join(ROOT, `scrapbook/vintage-${n}.svg`), vintage);
}

/* ─────────────────────────── Decorations ─────────────────────────────── */
/* Gold mandala (square, used at low opacity as backdrop ornament) */
let petals = '';
for (let k = 0; k < 8; k++) {
  petals += `<g transform="rotate(${k * 45} 300 300)"><path d="M300 70 Q340 150 300 240 Q260 150 300 70 Z" fill="none" stroke="#c9a45c" stroke-width="3"/><path d="M300 100 L300 240" stroke="#c9a45c" stroke-width="1.5" opacity="0.6"/></g>`;
}
const mandala = svg(
  600,
  600,
  `<circle cx="300" cy="300" r="286" fill="none" stroke="#c9a45c" stroke-width="2" opacity="0.9"/>
  <circle cx="300" cy="300" r="236" fill="none" stroke="#c9a45c" stroke-width="1.4" stroke-dasharray="4 9" opacity="0.8"/>
  <circle cx="300" cy="300" r="132" fill="none" stroke="#c9a45c" stroke-width="2" opacity="0.9"/>
  ${petals}
  ${star(300, 300, 66, 'rgba(201,164,92,0.9)')}
  ${star(300, 300, 26, 'rgba(241,245,242,0.9)')}`,
);
writeFileSync(join(ROOT, 'decorations/mandala-gold.svg'), mandala);

/* Vinyl-style album art (1:1 · 600×600) */
const album = svg(
  600,
  600,
  defs('albg', '#1a4a44', '#0d2b29', true) +
    defs('alring', '#e8cd92', '#9c7a3f') +
    `<rect width="600" height="600" fill="#0f1d1c"/>
  <circle cx="300" cy="300" r="252" fill="#0a1413"/>
  <circle cx="300" cy="300" r="252" fill="none" stroke="rgba(201,164,92,0.35)" stroke-width="2"/>
  ${Array.from({ length: 7 }, (_, i) => `<circle cx="300" cy="300" r="${150 + i * 14}" fill="none" stroke="rgba(241,245,242,0.08)" stroke-width="1.4"/>`).join('')}
  <circle cx="300" cy="300" r="118" fill="url(#albg)" stroke="url(#alring)" stroke-width="5"/>
  ${star(300, 300, 40, 'rgba(201,164,92,0.95)')}
  <circle cx="300" cy="300" r="6" fill="#0a1413"/>
  <text x="300" y="420" text-anchor="middle" font-family="Georgia, serif" font-size="17" letter-spacing="3" fill="#a6b3b0">ALBUM ART PLACEHOLDER</text>
  <text x="300" y="446" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="13" letter-spacing="2" fill="#6d7f7b">replace: images/decorations/album-art.svg</text>`,
);
writeFileSync(join(ROOT, 'decorations/album-art.svg'), album);

console.log('Placeholders generated into public/images/{xiao,chibis,scrapbook,decorations}');
