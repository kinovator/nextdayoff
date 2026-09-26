import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

function createCRC32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  return table;
}

const crcTable = createCRC32Table();
function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  }
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(8 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const typeAndData = chunk.subarray(4, 8 + len);
  const crc = crc32(typeAndData);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

function generatePNG(width, height) {
  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = createChunk('IHDR', ihdrData);

  const rawRows = [];
  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.42;

  for (let y = 0; y < height; y++) {
    const row = Buffer.alloc(1 + width * 4);
    row[0] = 0; // filter None
    for (let x = 0; x < width; x++) {
      const idx = 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Rounded squircle app icon
      const cornerR = width * 0.22;
      const qx = Math.max(0, Math.abs(x - cx) - (cx - cornerR));
      const qy = Math.max(0, Math.abs(y - cy) - (cy - cornerR));
      const insideIcon = Math.sqrt(qx * qx + qy * qy) <= cornerR;

      if (!insideIcon) {
        row[idx] = 0;
        row[idx + 1] = 0;
        row[idx + 2] = 0;
        row[idx + 3] = 0;
        continue;
      }

      // Background: Deep charcoal / warm graphite #1c1917
      let r = 28, g = 25, b = 23, a = 255;

      // Inner card simulation
      const cardMargin = width * 0.2;
      const isCard = x >= cardMargin && x <= width - cardMargin && y >= cardMargin && y <= height - cardMargin;
      if (isCard) {
        // Sand card #FAF8F5
        r = 250; g = 248; b = 245;
        // Amber header on card
        if (y <= cardMargin + width * 0.16) {
          r = 217; g = 119; b = 6; // amber-600
        }
        // Center accent dot / star
        const cardCenterDist = Math.sqrt((x - cx) ** 2 + (y - (cy + width * 0.08)) ** 2);
        if (cardCenterDist < width * 0.12) {
          r = 217; g = 119; b = 6;
        }
      }

      row[idx] = r;
      row[idx + 1] = g;
      row[idx + 2] = b;
      row[idx + 3] = a;
    }
    rawRows.push(row);
  }

  const rawData = Buffer.concat(rawRows);
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

const p192 = generatePNG(192, 192);
const p512 = generatePNG(512, 512);

fs.writeFileSync(path.resolve('public/icons/icon-192.png'), p192);
fs.writeFileSync(path.resolve('public/icons/icon-512.png'), p512);
fs.writeFileSync(path.resolve('public/apple-touch-icon.png'), p192);
console.log('Successfully generated icons!');
