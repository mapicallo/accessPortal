import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

/** AccessPortal extension icons — same family as PWA */
const PURPLE_A = { r: 102, g: 126, b: 234 };
const PURPLE_B = { r: 118, g: 75, b: 162 };
const SYMBOL = { r: 255, g: 255, b: 255, a: 255 };

function setRgba(data, w, x, y, c) {
  if (x < 0 || y < 0 || x >= w || y >= w) return;
  const i = (w * y + x) << 2;
  data[i] = c.r;
  data[i + 1] = c.g;
  data[i + 2] = c.b;
  data[i + 3] = c.a ?? 255;
}

function lerp(a, b, t) {
  return Math.round(a + (b - a) * t);
}

function inRoundedRect(x, y, x0, y0, x1, y1, r) {
  if (x < x0 || x > x1 || y < y0 || y > y1) return false;
  const rl = x0 + r;
  const rr = x1 - r;
  const rt = y0 + r;
  const rb = y1 - r;
  if (x >= rl && x <= rr) return true;
  if (y >= rt && y <= rb) return true;
  const cx = x < rl ? rl : rr;
  const cy = y < rt ? rt : rb;
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= r * r;
}

function inCircle(x, y, cx, cy, rad) {
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= rad * rad;
}

function inAccessibilitySymbol(x, y, W) {
  const cx = W * 0.5;
  const cy = W * 0.52;
  const outerR = W * 0.32;
  const innerR = W * 0.26;
  const dist = Math.hypot(x - cx, y - cy);
  if (dist <= outerR && dist >= innerR) return true;

  const headR = W * 0.07;
  const headCy = cy - W * 0.14;
  if (inCircle(x, y, cx, headCy, headR)) return true;

  const bodyW = W * 0.055;
  if (Math.abs(x - cx) <= bodyW && y >= headCy + headR && y <= cy + W * 0.12) return true;

  const armY = cy - W * 0.04;
  const armHalf = W * 0.2;
  if (Math.abs(y - armY) <= W * 0.04 && x >= cx - armHalf && x <= cx + armHalf) return true;

  const legTop = cy + W * 0.04;
  const legBot = cy + W * 0.22;
  const legSpread = W * 0.12;
  const legW = W * 0.045;
  if (y >= legTop && y <= legBot) {
    if (Math.abs(x - cx - legSpread) <= legW) return true;
    if (Math.abs(x - cx + legSpread) <= legW) return true;
  }

  return false;
}

function renderIcon(W) {
  const png = new PNG({ width: W, height: W, colorType: 6, inputColorType: 6, bitDepth: 8 });
  const bgR = Math.max(2, Math.round(W * 0.16));
  const bgPad = Math.max(0, Math.round(W * 0.04));

  for (let y = 0; y < W; y++) {
    for (let x = 0; x < W; x++) {
      if (!inRoundedRect(x, y, bgPad, bgPad, W - bgPad - 1, W - bgPad - 1, bgR)) continue;
      const t = (x + y) / (2 * (W - 1));
      setRgba(png.data, W, x, y, {
        r: lerp(PURPLE_A.r, PURPLE_B.r, t),
        g: lerp(PURPLE_A.g, PURPLE_B.g, t),
        b: lerp(PURPLE_A.b, PURPLE_B.b, t),
        a: 255,
      });
    }
  }

  if (W >= 24) {
    for (let y = 0; y < W; y++) {
      for (let x = 0; x < W; x++) {
        if (inAccessibilitySymbol(x, y, W)) {
          setRgba(png.data, W, x, y, SYMBOL);
        }
      }
    }
  }

  return PNG.sync.write(png);
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'public', 'icons');
fs.mkdirSync(outDir, { recursive: true });

for (const size of [16, 48, 128]) {
  fs.writeFileSync(path.join(outDir, `icon${size}.png`), renderIcon(size));
}

console.log('[icons] AccessPortal extension PNGs → public/icons');
