/**
 * Downscale inventory photos into public/inventory/.
 *
 * Phone shots arrive at 1-3 MB each and the inventory grows a batch at a time,
 * so they get resized on the way in rather than accumulating in the repo.
 *
 *   node scripts/ingest-inventory.mjs <source>=<name> [<source>=<name> ...]
 *
 * Example:
 *   node scripts/ingest-inventory.mjs /tmp/IMG_1.jpg=pump-kamoer-nkp
 *
 * The name is the part id from src/lib/inventory.ts; .jpg is added for you.
 */
import sharp from 'sharp';
import { mkdir, stat } from 'node:fs/promises';
import path from 'node:path';

const OUT = path.resolve(import.meta.dirname, '..', 'public', 'inventory');
const MAX_EDGE = 1100;
const QUALITY = 82;

const pairs = process.argv.slice(2).map((arg) => {
  const i = arg.lastIndexOf('=');
  if (i < 1) throw new Error(`Expected <source>=<name>, got: ${arg}`);
  return [arg.slice(0, i), arg.slice(i + 1).replace(/\.jpg$/i, '')];
});

if (pairs.length === 0) {
  console.error('Usage: node scripts/ingest-inventory.mjs <source>=<name> ...');
  process.exit(1);
}

await mkdir(OUT, { recursive: true });

const kb = (n) => `${(n / 1024).toFixed(0).padStart(5)} KB`;
let saved = 0;

for (const [src, name] of pairs) {
  const dst = path.join(OUT, `${name}.jpg`);
  const before = (await stat(src)).size;
  await sharp(src)
    // Honour the EXIF orientation phones write, then strip metadata.
    .rotate()
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toFile(dst);
  const after = (await stat(dst)).size;
  saved += before - after;
  console.log(`${name.padEnd(24)} ${kb(before)} -> ${kb(after)}`);
}

console.log(`\n${pairs.length} imagen(es) · ${(saved / 1048576).toFixed(1)} MB ahorrados`);
