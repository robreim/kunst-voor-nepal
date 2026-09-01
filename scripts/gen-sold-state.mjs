// Reads artwork frontmatter, emits public/sold-state.js with sold codes.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
const dir = 'src/content/artworks';
const sold = {};
for (const f of readdirSync(dir).filter(f => f.endsWith('.md'))) {
  const text = readFileSync(`${dir}/${f}`, 'utf8');
  const m = text.match(/number:\s*"([^"]+)"/);
  const s = /sold:\s*true/.test(text);
  if (m && s) sold[m[1]] = true;
}
writeFileSync('public/sold-state.js', `window.SOLD_STATE = ${JSON.stringify(sold)};\n`);
console.log('sold-state.js:', JSON.stringify(sold));
