import fs from "fs";
import path from "path";
import zlib from "zlib";

function createPNGBuffer(width, height, drawPixel) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bits per channel
  ihdr[9] = 6; // RGBA color type
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter method
  ihdr[12] = 0; // interlace method

  const ihdrChunk = createChunk("IHDR", ihdr);

  // IDAT chunk (raw image data)
  const rowSize = width * 4 + 1;
  const rawData = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // No filter for row

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = drawPixel(x, y, width, height);
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk("IDAT", compressedData);

  // IEND chunk
  const iendChunk = createChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(8 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4);
  data.copy(buf, 8);

  const crc = crc32(Buffer.concat([Buffer.from(type), data]));
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

// CRC32 table & function
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[i] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Pixel drawer for HD Security Shield & Lock Icon
function drawShieldIcon(x, y, width, height) {
  const cx = width / 2;
  const cy = height / 2;
  const nx = (x - cx) / (width / 2);
  const ny = (y - cy) / (height / 2);

  // Background rounded square (Dark Slate #0B0F17)
  const distCenter = Math.max(Math.abs(nx), Math.abs(ny));

  // Shield Geometry
  const shieldWidth = 0.65;
  const inShieldX = Math.abs(nx) <= shieldWidth;
  const inShieldY = ny >= -0.7 && ny <= 0.7;

  // Curved shield bottom
  const shieldBottomCurve = 0.7 - Math.pow(nx / shieldWidth, 2) * 0.9;
  const isShieldBody = inShieldX && ny >= -0.7 && ny <= shieldBottomCurve;

  // Lock Icon geometry in center
  const isLockBody = Math.abs(nx) <= 0.25 && ny >= 0.05 && ny <= 0.35;
  const isLockShackle = Math.abs(nx) <= 0.18 && ny >= -0.25 && ny <= 0.05 && Math.abs(nx) >= 0.1;

  if (isLockBody || isLockShackle) {
    // Emerald green lock highlight (#10B981)
    return [16, 185, 129, 255];
  }

  if (isShieldBody) {
    // Cyan Brand Blue Shield (#0284C7 to #0369A1 gradient)
    const strokeBorder = Math.abs(nx) > shieldWidth - 0.08 || ny < -0.62 || ny > shieldBottomCurve - 0.08;
    if (strokeBorder) {
      return [56, 189, 248, 255]; // Cyan border #38BDF8
    }
    return [2, 132, 199, 255]; // Darker cyan fill #0284C7
  }

  // Dark background rounded box
  if (distCenter <= 0.9) {
    return [11, 15, 23, 255]; // #0B0F17
  }

  // Transparent padding around icon
  return [0, 0, 0, 0];
}

const publicIconsDir = path.resolve("public/icons");
const distIconsDir = path.resolve("dist/icons");

for (const dir of [publicIconsDir, distIconsDir]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const sizes = [16, 48, 128];
for (const size of sizes) {
  const buffer = createPNGBuffer(size, size, drawShieldIcon);
  fs.writeFileSync(path.join(publicIconsDir, `icon${size}.png`), buffer);
  fs.writeFileSync(path.join(distIconsDir, `icon${size}.png`), buffer);
  console.log(`Generated HD PNG icon: icon${size}.png (${size}x${size} px)`);
}

console.log("All extension icons created successfully!");
