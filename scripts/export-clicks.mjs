// Export click counts per artwork to kliks-<datum>.csv.
//
// Counts come from the live Netlify function; titles/artists from the local
// content files. Artworks whose `number` is still empty locally get the code
// they already have on production (read from the live gallery HTML), so no
// click is attributed to "onbekend".
//
//   node scripts/export-clicks.mjs [https://kunstvoornepal.nl]
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';

const base = (process.argv[2] || 'https://kunstvoornepal.nl').replace(/\/$/, '');
const dir = 'src/content/artworks';

const field = (text, key) => {
  const m = text.match(new RegExp(`^${key}:\\s*"?(.*?)"?\\s*$`, 'm'));
  return m ? m[1].trim() : '';
};
const attr = (block, key) => {
  const m = block.match(new RegExp(`data-art-${key}="([^"]*)"`));
  return m ? m[1].replace(/&#38;/g, '&') : '';
};

const get = async (path) => {
  const res = await fetch(base + path, { redirect: 'follow' });
  if (!res.ok) throw new Error(`${path} → HTTP ${res.status}`);
  return res.text();
};

const counts = JSON.parse(await get('/api/clicks'));

// Codes as they are live, keyed by title — the only handle that survives a
// missing local `number`.
const liveByTitle = new Map();
for (const block of (await get('/galerij')).split('data-art-number="').slice(1)) {
  const code = block.slice(0, block.indexOf('"'));
  liveByTitle.set(attr(block, 'title'), { code, artist: attr(block, 'artist'), price: attr(block, 'price') });
}

const rows = [];
for (const f of readdirSync(dir).filter((f) => f.endsWith('.md'))) {
  const text = readFileSync(`${dir}/${f}`, 'utf8');
  const title = field(text, 'title');
  const local = field(text, 'number');
  if (!local) console.warn(`let op: ${f} heeft lokaal geen code; live code gebruikt`);
  const row = {
    code: local || liveByTitle.get(title)?.code || '',
    title,
    artist: field(text, 'artist'),
    min: field(text, 'minimumprijs'),
    kliks: 0,
  };
  row.kliks = counts[row.code] || 0;
  if (row.code) delete counts[row.code];
  rows.push(row);
}

rows.sort((a, b) => b.kliks - a.kliks || a.title.localeCompare(b.title, 'nl'));

// Codes that no artwork uses any more: removed works or test hits.
for (const [code, n] of Object.entries(counts).sort()) {
  rows.push({ code, title: '(geen artwork met deze code)', artist: '', min: '', kliks: n });
}

const cell = (s) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
const csv = ['rank,kliks,code,titel,kunstenaar,minimumprijs_eur']
  .concat(rows.map((r, i) => [i + 1, r.kliks, r.code, r.title, r.artist, r.min].map(cell).join(',')))
  .join('\n');

const file = `kliks-${new Date().toISOString().slice(0, 10)}.csv`;
writeFileSync(file, csv + '\n');
const total = rows.reduce((s, r) => s + r.kliks, 0);
console.log(`${file}: ${rows.length} rijen, ${total} kliks`);
