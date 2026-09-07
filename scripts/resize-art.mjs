// Downscale + compress artwork photos so the fullscreen modal never loads a giant file.
// Copies originals to public/art/originals/ first, so nothing is destroyed.
import { cpSync, mkdirSync, readdirSync, renameSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const SRC = 'public/art';
const MAX_EDGE = 1600;
const BACKUP = join(SRC, 'originals');
mkdirSync(BACKUP, { recursive: true });

for (const file of readdirSync(SRC)) {
  if (!/\.(jpe?g|png|webp)$/i.test(file) || existsSync(join(BACKUP, file))) continue;

  const path = join(SRC, file);
  const meta = await sharp(path).metadata();
  const long = Math.max(meta.width, meta.height);
  const scale = long > MAX_EDGE ? MAX_EDGE / long : 1;
  const heavy = statSync(path).size > 400_000;

  if (scale === 1 && !heavy) continue; // already fine

  cpSync(path, join(BACKUP, file));
  const out = join(SRC, 'opt-' + file);
  await sharp(path)
    .resize({ width: Math.round(meta.width * scale), height: Math.round(meta.height * scale), withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(out);
  renameSync(out, path);
  console.log('optimized', file, `${meta.width}x${meta.height} ->`, Math.round(long * scale), 'long edge');
}
console.log('done — originals backed up in public/art/originals/');
