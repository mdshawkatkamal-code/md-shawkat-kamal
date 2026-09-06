import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Create public/icon.svg
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="96" fill="#141414"/>
  <rect x="48" y="48" width="416" height="416" rx="64" fill="#202020" stroke="#383838" stroke-width="6"/>
  
  <!-- Building Silhouette -->
  <path d="M120 400 V160 H260 V400 Z" fill="#E4E3E0" stroke="#141414" stroke-width="4"/>
  <path d="M260 220 H392 V400 H260 Z" fill="#D2E3D8" stroke="#141414" stroke-width="4"/>
  
  <!-- Windows -->
  <rect x="148" y="190" width="36" height="36" rx="4" fill="#141414"/>
  <rect x="196" y="190" width="36" height="36" rx="4" fill="#141414"/>
  <rect x="148" y="246" width="36" height="36" rx="4" fill="#141414"/>
  <rect x="196" y="246" width="36" height="36" rx="4" fill="#141414"/>
  <rect x="148" y="302" width="36" height="36" rx="4" fill="#141414"/>
  <rect x="196" y="302" width="36" height="36" rx="4" fill="#141414"/>

  <!-- Shop Windows / Door -->
  <rect x="288" y="250" width="32" height="32" rx="4" fill="#141414"/>
  <rect x="336" y="250" width="32" height="32" rx="4" fill="#141414"/>
  <rect x="288" y="310" width="80" height="90" rx="4" fill="#141414"/>
  
  <!-- Bengali Taka / Currency Symbol or Badge -->
  <circle cx="390" cy="140" r="54" fill="#EBDCB2" stroke="#8C6600" stroke-width="8"/>
  <text x="390" y="158" font-size="52" font-family="sans-serif" font-weight="900" text-anchor="middle" fill="#5C4300">৳</text>
  
  <!-- Ground Line -->
  <rect x="80" y="400" width="352" height="12" rx="6" fill="#E4E3E0"/>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgIcon, 'utf8');

// CRC32 table & helper for valid PNG chunks
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[i] = c;
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = data.length;
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(len, 0);

  const crcPayload = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(crcPayload);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function createPng(width, height, isMaskable = false) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8 bit depth
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10); // deflate compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace none
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Raw pixel data with filter byte (0) per row
  const rowBytes = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowBytes);

  const cx = width / 2;
  const cy = height / 2;
  const outerR = width * 0.46;
  const badgeR = width * 0.16;
  const badgeX = width * 0.76;
  const badgeY = height * 0.28;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes;
    rawData[rowOffset] = 0; // Filter None

    for (let x = 0; x < width; x++) {
      const pOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const distFromCenter = Math.sqrt(dx * dx + dy * dy);

      // Default background: #141414
      let r = 20, g = 20, b = 20, a = 255;

      if (!isMaskable && distFromCenter > outerR) {
        // Transparent outside for non-maskable rounded icon
        const cornerMargin = width * 0.18;
        const inRoundedRect =
          x >= cornerMargin && x <= width - cornerMargin &&
          y >= cornerMargin && y <= height - cornerMargin;
        if (!inRoundedRect) {
          const cornerX = x < cornerMargin ? x - cornerMargin : (x > width - cornerMargin ? x - (width - cornerMargin) : 0);
          const cornerY = y < cornerMargin ? y - cornerMargin : (y > height - cornerMargin ? y - (height - cornerMargin) : 0);
          if (Math.sqrt(cornerX * cornerX + cornerY * cornerY) > cornerMargin) {
            a = 0;
          }
        }
      }

      if (a > 0) {
        // Main Building Body (Left tower)
        const b1Left = width * 0.24;
        const b1Right = width * 0.54;
        const b1Top = height * 0.32;
        const b1Bottom = height * 0.78;

        // Second Building Body (Right tower)
        const b2Left = width * 0.54;
        const b2Right = width * 0.78;
        const b2Top = height * 0.44;
        const b2Bottom = height * 0.78;

        // Base ground bar
        const gLeft = width * 0.16;
        const gRight = width * 0.84;
        const gTop = height * 0.78;
        const gBottom = height * 0.83;

        // Badge distance
        const bdx = x - badgeX;
        const bdy = y - badgeY;
        const bDist = Math.sqrt(bdx * bdx + bdy * bdy);

        if (bDist <= badgeR) {
          // Gold Taka Badge (#EBDCB2 / #8C6600)
          if (bDist > badgeR - width * 0.02) {
            r = 140; g = 102; b = 0; // gold border
          } else {
            r = 235; g = 220; b = 178; // gold inner
          }
        } else if (y >= gTop && y <= gBottom && x >= gLeft && x <= gRight) {
          // Ground bar
          r = 228; g = 227; b = 224;
        } else if (x >= b1Left && x <= b1Right && y >= b1Top && y <= b1Bottom) {
          // Main tower #E4E3E0
          r = 228; g = 227; b = 224;
          // Windows grid
          const relX = (x - b1Left) / (b1Right - b1Left);
          const relY = (y - b1Top) / (b1Bottom - b1Top);
          const inCol1 = relX >= 0.18 && relX <= 0.42;
          const inCol2 = relX >= 0.58 && relX <= 0.82;
          const inRow1 = relY >= 0.15 && relY <= 0.32;
          const inRow2 = relY >= 0.42 && relY <= 0.59;
          const inRow3 = relY >= 0.69 && relY <= 0.86;

          if ((inCol1 || inCol2) && (inRow1 || inRow2 || inRow3)) {
            r = 20; g = 20; b = 20; // dark window
          }
        } else if (x >= b2Left && x <= b2Right && y >= b2Top && y <= b2Bottom) {
          // Side shop #D2E3D8
          r = 210; g = 227; b = 216;
          // Shop door / window
          const relX = (x - b2Left) / (b2Right - b2Left);
          const relY = (y - b2Top) / (b2Bottom - b2Top);
          if (relX >= 0.2 && relX <= 0.8 && relY >= 0.45 && relY <= 0.95) {
            r = 20; g = 20; b = 20; // Shop glass door
          } else if (relX >= 0.25 && relX <= 0.75 && relY >= 0.15 && relY <= 0.35) {
            r = 20; g = 20; b = 20; // Shop top window
          }
        }
      }

      rawData[pOffset] = r;
      rawData[pOffset + 1] = g;
      rawData[pOffset + 2] = b;
      rawData[pOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Write icons
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPng(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180, false));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createPng(64, 64, false));

console.log('Successfully generated all PWA icons & assets in /public');
