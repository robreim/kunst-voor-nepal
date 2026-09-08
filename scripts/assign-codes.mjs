// Build-time artwork maintenance.
//
// Assigns a stable code to every artwork whose `number` is empty (the Decap
// preSave hook was unreliable: codes silently stayed empty on live accept).
//
// The code is derived deterministically from the filename (slug), never from
// randomness, so the same file always gets the same code on any machine and
// any build. Codes therefore cannot change between deploys, and the gallery
// sort order is stable. Runs at every build so a new work saved without a
// code gets one on the next deploy.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';

const dir = 'src/content/artworks';
const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // no I/O: avoids 1/0 lookalikes

const files = readdirSync(dir).filter((f) => f.endsWith('.md')).sort();
const taken = {};
const byFile = new Map();

for (const f of files) {
  const text = readFileSync(`${dir}/${f}`, 'utf8');
  // number may be bare (B106) or quoted (""). Match both; empty means no code.
  const m = text.match(/^number:\s*"?([^"]*?)"?\s*$/m);
  const code = m && m[1] ? m[1].trim() : '';
  byFile.set(f, { text, code, slug: f.replace(/\.md$/, '') });
  if (code) taken[code] = true;
}

// FNV-1a — deterministic across runs and platforms.
function hash(s) {
  let h = 2166136261;
  for (const ch of s) {
    h ^= ch.codePointAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Deterministic "L123" code for a slug: hash the slug (then slug:1, slug:2 …
// on the rare collision) until it lands on a code not already in use. Same
// slug → same code, on every build, forever.
function stableCode(slug) {
  for (let i = 0; i < 1000; i++) {
    const l = letters[hash(`${slug}:${i}:l`) % letters.length];
    const n = 105 + (hash(`${slug}:${i}:n`) % 895);
    const c = `${l}${n}`;
    if (!taken[c]) {
      taken[c] = true;
      return c;
    }
  }
  throw new Error(`geen vrije code voor ${slug}`);
}

function writeCode({ text, slug }, out) {
  const c = stableCode(slug);
  writeFileSync(`${dir}/${slug}.md`, text.replace(/^number:[^\n]*/m, `number: "${c}"`));
  out.push(`${c}  ${slug}.md`);
}

const assigned = [];
for (const [f, entry] of byFile) {
  if (!entry.code) writeCode(entry, assigned);
}

// Dedupe: when several files carry the same code (Decap once saved the same
// auto-code for different works), keep the first and re-code the rest
// deterministically so every code is unique.
const seen = {};
const deduped = [];
for (const [f, entry] of byFile) {
  if (!entry.code || seen[entry.code]) {
    if (seen[entry.code]) writeCode(entry, deduped);
    continue;
  }
  seen[entry.code] = true;
}

if (assigned.length) console.log('toegekende codes:\n' + assigned.join('\n'));
if (deduped.length) console.log('dubbele codes hernummerd:\n' + deduped.join('\n'));
if (!assigned.length && !deduped.length) console.log('geen ontbrekende codes');
