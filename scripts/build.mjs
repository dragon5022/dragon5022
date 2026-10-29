/* =========================================================================
   Builds the SVG cards in assets/ from the data below.
   Edit the data, then run:  node scripts/build.mjs
   Skills mirror src/data/portfolio.ts in the portfolio repo.
   ========================================================================= */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "assets");

const SKILLS = {
  Languages: [
    ["Java 21", 92],
    ["Python 3.12", 90],
    ["TypeScript / JavaScript", 88],
    ["SQL", 82],
    ["Kotlin / Swift", 62],
  ],
  "Java ecosystem": [
    ["Spring Boot / Spring Cloud", 90],
    ["Hibernate / JPA", 85],
    ["Maven & Gradle", 85],
    ["JUnit 5 / Mockito / Testcontainers", 88],
    ["Apache Kafka", 75],
  ],
  "Python ecosystem": [
    ["FastAPI / Django", 88],
    ["Pandas / NumPy", 85],
    ["SQLAlchemy / Alembic", 80],
    ["pytest / Hypothesis", 86],
    ["asyncio / Celery", 74],
  ],
  "Web & mobile": [
    ["Next.js / React", 90],
    ["Tailwind CSS / GSAP / Three.js", 82],
    ["React Native / Flutter", 78],
    ["Unity / Cocos (mobile games)", 72],
    ["WordPress / headless CMS", 70],
  ],
  "AI & infrastructure": [
    ["LLM APIs (OpenAI, Anthropic, Gemini)", 88],
    ["Vector search / semantic caching", 80],
    ["Docker & Kubernetes", 80],
    ["PostgreSQL / Redis", 84],
    ["AWS / Vercel / GitHub Actions", 80],
  ],
};

const HIGHLIGHTS = [
  ["6+", "Years coding"],
  ["30+", "Sites & apps shipped"],
  ["12", "Mobile games live"],
  ["40–70%", "LLM token cost saved"],
];

const CERTS = [
  { year: 2019, title: "Java Programming", detail: "Certification" },
  { year: 2021, title: "AWS Certification", detail: "Amazon Web Services" },
  { year: 2023, title: "Python Developer", detail: "Udemy" },
];

const ROLES = [
  "Full-Stack & AI Engineer",
  "Java · Spring Boot · Kafka",
  "Python · FastAPI · LLM systems",
  "Automated trading bots, 24/7",
];

/* Colors: one accent hue for every bar (validated >= 3:1 on each surface),
   text in neutral ink, tracks and borders one step off the surface. */
const THEMES = {
  dark: {
    surface: "#0b1230", glow: "#172660", border: "#1f2a5a", track: "#1a2552",
    text: "#eef2ff", text2: "#aeb8dc", muted: "#8590ba", accent: "#3987e5",
  },
  light: {
    surface: "#f7f9fd", glow: "#e4edfb", border: "#dbe3f1", track: "#e2e9f6",
    text: "#0b1230", text2: "#46507a", muted: "#5f6890", accent: "#2a78d6",
  },
};

const FONT = `-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif`;
const W = 880;
const PAD = 28;

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Bar with a rounded data end and a square baseline. */
const bar = (x, y, w, h) => {
  const r = h / 2;
  return `M${x},${y}H${x + w - r}A${r},${r} 0 0 1 ${x + w},${y + r}A${r},${r} 0 0 1 ${x + w - r},${y + h}H${x}Z`;
};

const card = (t, h) => `
  <defs>
    <radialGradient id="glow" cx="100%" cy="0%" r="70%">
      <stop offset="0" stop-color="${t.glow}"/>
      <stop offset="1" stop-color="${t.surface}"/>
    </radialGradient>
  </defs>
  <rect x="0.5" y="0.5" width="${W - 1}" height="${h - 1}" rx="16" fill="url(#glow)" stroke="${t.border}"/>`;

function skillsSvg(t) {
  const colW = (W - PAD * 2 - 32) / 2;
  const rowH = 34;
  const panelH = 28 + rowH * 5;
  const gapY = 28;
  const top = PAD + 40;
  const panels = [...Object.entries(SKILLS), ["At a glance", null]];
  const H = top + Math.ceil(panels.length / 2) * (panelH + gapY) - gapY + PAD;

  let delay = 0;
  const body = panels.map(([group, rows], i) => {
    const x = PAD + (i % 2) * (colW + 32);
    const y = top + Math.floor(i / 2) * (panelH + gapY);
    const heading = `<text x="${x}" y="${y + 12}" class="group">${esc(group.toUpperCase())}</text>`;

    if (!rows) {
      const tileW = (colW - 12) / 2;
      const tileH = (rowH * 5 - 12) / 2;
      return heading + HIGHLIGHTS.map(([value, label], k) => {
        const tx = x + (k % 2) * (tileW + 12);
        const ty = y + 28 + Math.floor(k / 2) * (tileH + 12);
        return `
    <rect x="${tx}" y="${ty}" width="${tileW}" height="${tileH}" rx="10" fill="${t.track}" fill-opacity="0.55"/>
    <text x="${tx + 16}" y="${ty + 38}" class="kpi">${esc(value)}</text>
    <text x="${tx + 16}" y="${ty + 60}" class="label2">${esc(label)}</text>`;
      }).join("");
    }

    return heading + rows.map(([name, level], k) => {
      const ry = y + 28 + k * rowH;
      const d = (delay++ * 0.04).toFixed(2);
      return `
    <text x="${x}" y="${ry + 13}" class="label">${esc(name)}</text>
    <text x="${x + colW}" y="${ry + 13}" class="value" text-anchor="end">${level}</text>
    <path d="${bar(x, ry + 19, colW, 8)}" fill="${t.track}"/>
    <path d="${bar(x, ry + 19, (colW * level) / 100, 8)}" fill="${t.accent}" class="bar" style="animation-delay:${d}s"/>`;
    }).join("");
  }).join("\n");

  const desc = Object.entries(SKILLS)
    .map(([g, rows]) => `${g}: ${rows.map(([n, l]) => `${n} ${l}`).join(", ")}`)
    .join(". ");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title desc">
  <title id="title">Skills: self-rated proficiency, 0 to 100</title>
  <desc id="desc">${esc(desc)}.</desc>
  <style>
    text { font-family: ${FONT}; }
    .sub { font-size: 13px; fill: ${t.text2}; }
    .group { font-size: 11.5px; font-weight: 600; letter-spacing: 1.2px; fill: ${t.muted}; }
    .label { font-size: 13px; fill: ${t.text}; }
    .label2 { font-size: 12.5px; fill: ${t.text2}; }
    .value { font-size: 13px; font-weight: 600; fill: ${t.text}; font-variant-numeric: tabular-nums; }
    .kpi { font-size: 26px; font-weight: 600; fill: ${t.text}; }
    .bar { transform-box: fill-box; transform-origin: left center; animation: grow 1.1s cubic-bezier(.2,.7,.2,1) both; }
    @keyframes grow { from { transform: scaleX(0); } }
    @media (prefers-reduced-motion: reduce) { .bar { animation: none; } }
  </style>${card(t, H)}
  <text x="${PAD}" y="${PAD + 12}" class="sub">Self-rated proficiency, 0–100</text>
${body}
</svg>
`;
}

function certsSvg(t) {
  const top = PAD + 4;
  const axisY = top + 112;
  const H = axisY + 54;
  const x0 = PAD + 36;
  const x1 = W - PAD - 36;
  const from = CERTS[0].year;
  const to = new Date().getFullYear();
  const xOf = (year) => x0 + ((year - from) / (to - from)) * (x1 - x0);

  const ticks = [];
  for (let y = from; y <= to; y++) {
    ticks.push(`
    <line x1="${xOf(y)}" y1="${axisY - 4}" x2="${xOf(y)}" y2="${axisY + 4}" stroke="${t.border}"/>
    <text x="${xOf(y)}" y="${axisY + 24}" class="tick" text-anchor="middle">${y}</text>`);
  }

  const nodes = CERTS.map((c, i) => {
    const x = xOf(c.year);
    const d = (0.5 + i * 0.35).toFixed(2);
    return `
    <g class="node" style="animation-delay:${d}s">
      <line x1="${x}" y1="${axisY - 12}" x2="${x}" y2="${top}" stroke="${t.border}"/>
      <text x="${x + 12}" y="${top + 12}" class="year">${c.year}</text>
      <text x="${x + 12}" y="${top + 34}" class="name">${esc(c.title)}</text>
      <text x="${x + 12}" y="${top + 54}" class="detail">${esc(c.detail)}</text>
      <circle cx="${x}" cy="${axisY}" r="8" fill="${t.accent}" stroke="${t.surface}" stroke-width="3"/>
    </g>`;
  }).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title desc">
  <title id="title">Certifications timeline</title>
  <desc id="desc">${esc(CERTS.map((c) => `${c.year}: ${c.title} (${c.detail})`).join(". "))}.</desc>
  <style>
    text { font-family: ${FONT}; }
    .tick { font-size: 12px; fill: ${t.muted}; font-variant-numeric: tabular-nums; }
    .year { font-size: 12.5px; font-weight: 600; letter-spacing: 1px; fill: ${t.text2}; }
    .name { font-size: 15px; font-weight: 600; fill: ${t.text}; }
    .detail { font-size: 13px; fill: ${t.text2}; }
    .axis { stroke-dasharray: 1000; animation: draw 1.4s ease-out both; }
    .node { opacity: 0; animation: rise .6s ease-out forwards; }
    @keyframes draw { from { stroke-dashoffset: 1000; } to { stroke-dashoffset: 0; } }
    @keyframes rise { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
    @media (prefers-reduced-motion: reduce) { .axis, .node { animation: none; opacity: 1; } }
  </style>${card(t, H)}
  <line x1="${x0}" y1="${axisY}" x2="${x1}" y2="${axisY}" stroke="${t.border}" stroke-width="2" class="axis"/>
  ${ticks.join("")}
  ${nodes}
</svg>
`;
}

/** Decorative header: night sky, moon, a glowing dragon ribbon and cycling roles. */
function bannerSvg() {
  const H = 240;
  let seed = 5022;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  const stars = Array.from({ length: 46 }, () => {
    const x = (rand() * W).toFixed(1);
    const y = (rand() * (H - 40) + 8).toFixed(1);
    const r = (0.5 + rand() * 1.2).toFixed(2);
    const d = (rand() * 4).toFixed(2);
    return `<circle cx="${x}" cy="${y}" r="${r}" class="star" style="animation-delay:${d}s"/>`;
  }).join("");

  const petals = Array.from({ length: 7 }, (_, i) => {
    const x = (420 + rand() * 420).toFixed(0);
    const y = (rand() * 140 + 20).toFixed(0);
    const d = (i * 1.3).toFixed(1);
    return `<ellipse cx="${x}" cy="${y}" rx="5" ry="2.2" class="petal" style="animation-delay:${d}s"/>`;
  }).join("");

  const ribbon = "M-40,214 C90,150 190,250 330,198 S560,118 680,170 S850,230 930,150";
  const ribbon2 = "M380,250 C470,200 560,236 640,206 S780,140 920,176";

  const roles = ROLES.map((r, i) =>
    `<text x="48" y="168" class="role${i ? "" : " first"}" style="animation-delay:${i * 3}s">${esc(r)}</text>`
  ).join("\n  ");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title">
  <title id="title">dragon5022: ${esc(ROLES.join(", "))}</title>
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#050a1f"/>
      <stop offset="1" stop-color="#0e1d52"/>
    </linearGradient>
    <radialGradient id="moon" cx="40%" cy="40%" r="65%">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="1" stop-color="#bcd2ff"/>
    </radialGradient>
    <linearGradient id="scale" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#1e3a8a" stop-opacity="0"/>
      <stop offset=".35" stop-color="#3b82f6"/>
      <stop offset=".7" stop-color="#93c5fd"/>
      <stop offset="1" stop-color="#dbeafe"/>
    </linearGradient>
    <filter id="blur" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="7"/></filter>
    <filter id="halo" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="16"/></filter>
    <clipPath id="frame"><rect width="${W}" height="${H}" rx="16"/></clipPath>
  </defs>
  <style>
    text { font-family: ${FONT}; }
    .hello { font-size: 14px; font-weight: 600; letter-spacing: 3px; fill: #8fb3ff; }
    .name { font-size: 50px; font-weight: 700; letter-spacing: 1px; fill: #f4f7ff; }
    .role { font-size: 20px; fill: #c9d8ff; opacity: 0; animation: role 12s ease-in-out infinite both; }
    .star { fill: #dbe7ff; animation: twinkle 4s ease-in-out infinite; }
    .petal { fill: #5b9dff; opacity: 0; animation: drift 9s linear infinite; }
    .flow { stroke-dasharray: 2 16; animation: flow 3s linear infinite; }
    @keyframes role { 0% { opacity: 0; transform: translateY(8px); } 4%, 21% { opacity: 1; transform: none; } 25%, 100% { opacity: 0; transform: translateY(-8px); } }
    @keyframes twinkle { 0%, 100% { opacity: .25; } 50% { opacity: 1; } }
    @keyframes drift { 0% { opacity: 0; transform: translate(0, 0) rotate(0deg); } 15% { opacity: .9; } 100% { opacity: 0; transform: translate(-160px, 70px) rotate(220deg); } }
    @keyframes flow { to { stroke-dashoffset: -36; } }
    @media (prefers-reduced-motion: reduce) {
      .role, .star, .petal, .flow { animation: none; }
      .role.first { opacity: 1; }
    }
  </style>
  <g clip-path="url(#frame)">
    <rect width="${W}" height="${H}" fill="url(#sky)"/>
    ${stars}
    <circle cx="760" cy="70" r="40" fill="#7fa8ff" opacity=".45" filter="url(#halo)"/>
    <circle cx="760" cy="70" r="30" fill="url(#moon)"/>
    <path d="${ribbon}" fill="none" stroke="#3b82f6" stroke-width="14" opacity=".45" filter="url(#blur)"/>
    <path d="${ribbon}" fill="none" stroke="url(#scale)" stroke-width="3"/>
    <path d="${ribbon}" fill="none" stroke="#e0ecff" stroke-width="2" class="flow"/>
    <path d="${ribbon2}" fill="none" stroke="#60a5fa" stroke-width="8" opacity=".3" filter="url(#blur)"/>
    <path d="${ribbon2}" fill="none" stroke="url(#scale)" stroke-width="1.5" opacity=".8"/>
    ${petals}
  </g>
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="16" fill="none" stroke="#1f2a5a"/>
  <text x="48" y="74" class="hello">HI, I'M</text>
  <text x="46" y="128" class="name">dragon5022</text>
  ${roles}
</svg>
`;
}

mkdirSync(OUT, { recursive: true });
const files = {
  "banner.svg": bannerSvg(),
  "skills-dark.svg": skillsSvg(THEMES.dark),
  "skills-light.svg": skillsSvg(THEMES.light),
  "certs-dark.svg": certsSvg(THEMES.dark),
  "certs-light.svg": certsSvg(THEMES.light),
};
for (const [name, svg] of Object.entries(files)) {
  writeFileSync(join(OUT, name), svg);
  console.log("wrote assets/" + name);
}

/* The README carries a table view of the skills chart; keep it in sync. */
const README = join(OUT, "..", "README.md");
const table = [
  "| Area | Skill | Level |",
  "| --- | --- | ---: |",
  ...Object.entries(SKILLS).flatMap(([group, rows]) => rows.map(([name, level]) => `| ${group} | ${name} | ${level} |`)),
].join("\n");
const readme = readFileSync(README, "utf8").replace(
  /(<!-- skills-table:start -->)[\s\S]*?(<!-- skills-table:end -->)/,
  (_, start, end) => `${start}\n${table}\n${end}`,
);
writeFileSync(README, readme);
console.log("updated README.md skills table");
