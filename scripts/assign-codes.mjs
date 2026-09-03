// Build-time artwork maintenance.
//
// Assigns a unique code to every artwork whose `number` is empty (the Decap
// preSave hook was unreliable: codes silently stayed empty on live accept).
// Runs at every build, so a work saved without a code gets one on the next
// deploy — no fragile runtime hook.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';

const dir = 'src/content/artworks';
const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';

const files = readdirSync(dir).filter((f) => f.endsWith('.md'));
const taken = {};
const byFile = new Map();

for (const f of files) {
  const text = readFileSync(`${dir}/${f}`, 'utf8');
  // number may be bare (B106) or quoted (""). Match both; empty means no code.
  const m = text.match(/^number:\s*"?([^"]*?)"?\s*$/m);
  const code = m && m[1] ? m[1].trim() : '';
  byFile.set(f, { text, code });
  if (code) taken[code] = true;
}

// Random unique code of the form "L123" not already in use.
function freshCode() {
  for (let tries = 0; tries < 500; tries++) {
    const l = letters[Math.floor(Math.random() * letters.length)];
    const n = 105 + Math.floor(Math.random() * 895);
    const c = `${l}${n}`;
    if (!taken[c]) {
      taken[c] = true;
      return c;
    }
  }
  return `X${Date.now()}`;
}

const assigned = [];
for (const [f, { text, code }] of byFile) {
  if (code) continue;
  const c = freshCode();
  // Replace the whole number line (bare or quoted) with a quoted code.
  const out = text.replace(/^number:[^\n]*/m, `number: "${c}"`);
  writeFileSync(`${dir}/${f}`, out);
  assigned.push(`${c}  ${f}`);
}

if (assigned.length) console.log('toegekende codes:\n' + assigned.join('\n'));
else console.log('geen ontbrekende codes');
