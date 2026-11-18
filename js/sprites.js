// ===== ピクセルスプライト生成 =====
'use strict';

// ---- 色ユーティリティ ----
function hex2rgb(h) { h = h.replace('#', ''); return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)]; }
function rgb2hex(r, g, b) { return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join(''); }
function shade(h, a) { // a: -1..1
  const [r, g, b] = hex2rgb(h);
  if (a >= 0) return rgb2hex(r + (255 - r) * a, g + (255 - g) * a, b + (255 - b) * a);
  return rgb2hex(r * (1 + a), g * (1 + a), b * (1 + a));
}
function rgb2hsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s = 0; const l = (mx + mn) / 2;
  if (mx !== mn) {
    const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h /= 6;
  }
  return [h, s, l];
}
function hsl2rgb(h, s, l) {
  if (s === 0) return [l * 255, l * 255, l * 255];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
  const f = t => { if (t < 0) t += 1; if (t > 1) t -= 1; if (t < 1 / 6) return p + (q - p) * 6 * t; if (t < 1 / 2) return q; if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6; return p; };
  return [f(h + 1 / 3) * 255, f(h) * 255, f(h - 1 / 3) * 255];
}
function hueShift(h, deg, satBoost) {
  const [r, g, b] = hex2rgb(h); let [hh, s, l] = rgb2hsl(r, g, b);
  if (s < 0.12) { // 無彩色は金色・銀色寄りに
    return l > 0.6 ? rgb2hex(...hsl2rgb((deg / 360 + 0.12) % 1, 0.55, Math.min(0.85, l))) : rgb2hex(...hsl2rgb((deg / 360 + 0.6) % 1, 0.45, Math.max(0.2, l)));
  }
  hh = (hh + deg / 360 + 1) % 1; s = Math.min(1, s * (satBoost || 1.1));
  return rgb2hex(...hsl2rgb(hh, s, l));
}

// ---- 乱数・ノイズ ----
function hash2(x, y, seed) {
  let h = (x * 374761393 + y * 668265263 + (seed || 0) * 2147483647) | 0;
  h = (h ^ (h >>> 13)) * 1274126177 | 0; h = h ^ (h >>> 16);
  return ((h >>> 0) % 10000) / 10000;
}
function vnoise(x, y, seed) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const s = t => t * t * (3 - 2 * t);
  const a = hash2(xi, yi, seed), b = hash2(xi + 1, yi, seed), c = hash2(xi, yi + 1, seed), d = hash2(xi + 1, yi + 1, seed);
  return (a + (b - a) * s(xf)) * (1 - s(yf)) + (c + (d - c) * s(xf)) * s(yf);
}
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// ---- ピクセルグリッド ----
class Grid {
  constructor(w, h) { this.w = w; this.h = h; this.d = new Array(w * h).fill(null); this.noOutline = new Set(); }
  set(x, y, c) { x |= 0; y |= 0; if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.d[y * this.w + x] = c; }
  get(x, y) { if (x < 0 || y < 0 || x >= this.w || y >= this.h) return null; return this.d[y * this.w + x]; }
  toCanvas(outline, alpha) {
    // 1pxの余白を足して輪郭を描く
    const W = this.w + 2, H = this.h + 2;
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d'); const img = ctx.createImageData(W, H);
    const put = (x, y, c, a) => { const [r, g, b] = hex2rgb(c); const i = (y * W + x) * 4; img.data[i] = r; img.data[i + 1] = g; img.data[i + 2] = b; img.data[i + 3] = a; };
    for (let y = -1; y <= this.h; y++) for (let x = -1; x <= this.w; x++) {
      const c = this.get(x, y);
      if (c) { put(x + 1, y + 1, c, c === '#fff38a' || c === '#6af8ff' ? 255 : Math.round(255 * (alpha || 1))); continue; }
      if (outline === false) continue;
      const n = this.get(x - 1, y) || this.get(x + 1, y) || this.get(x, y - 1) || this.get(x, y + 1);
      if (n && !this.noOutline.has(n)) put(x + 1, y + 1, outline || shade(n, -0.68), Math.round(255 * Math.min(1, (alpha || 1) + 0.15)));
    }
    ctx.putImageData(img, 0, 0);
    return cv;
  }
}

// 文字マップからグリッド
function mapGrid(rows, pal) {
  const w = Math.max(...rows.map(r => r.length)), g = new Grid(w, rows.length);
  rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) { const ch = r[x]; if (ch !== '.' && ch !== ' ' && pal[ch]) g.set(x, y, pal[ch]); } });
  return g;
}

// ---- 魚の形プリセット ----
const PRE = {
  std:    { L: 16, H: 8,  tail: 'fork',  tl: 5, dor: 1 },
  small:  { L: 11, H: 6,  tail: 'round', tl: 4, dor: 1 },
  tiny:   { L: 8,  H: 4,  tail: 'fork',  tl: 3, dor: 1 },
  slim:   { L: 20, H: 6,  tail: 'fork',  tl: 5, dor: 1, eb: 1.6 },
  tall:   { L: 13, H: 12, tail: 'round', tl: 4, dor: 2 },
  angel:  { L: 10, H: 10, tail: 'lyre',  tl: 6, dor: 3, ven: 'long' },
  round:  { L: 12, H: 10, tail: 'fan',   tl: 8, dor: 1 },
  ranchu: { L: 12, H: 9,  tail: 'fan',   tl: 6, dor: 0 },
  puffer: { L: 13, H: 10, tail: 'round', tl: 3, dor: 0 },
  box:    { L: 12, H: 9,  tail: 'round', tl: 3, dor: 0, e: 4, eb: 4 },
  long:   { L: 26, H: 6,  tail: 'round', tl: 5, dor: 3 },
  eel:    { L: 30, H: 4,  tail: 'none',  tl: 0, dor: 5, eel: true, eb: 1.3 },
  betta:  { L: 11, H: 6,  tail: 'flow',  tl: 9, dor: 3, ven: 'flow' },
  guppy:  { L: 8,  H: 4,  tail: 'fan',   tl: 7, dor: 1 },
  cat:    { L: 18, H: 6,  tail: 'round', tl: 4, dor: 1, wh: true, bottom: true, e: 1.6 },
  goby:   { L: 12, H: 5,  tail: 'round', tl: 3, dor: 2, bottom: true, eyeTop: true },
  shark:  { L: 28, H: 8,  tail: 'shark', tl: 9, dor: 4, eb: 1.5, e: 1.6 },
  big:    { L: 24, H: 11, tail: 'fork',  tl: 7, dor: 1 },
  tuna:   { L: 26, H: 9,  tail: 'tuna',  tl: 8, dor: 4, eb: 1.4 },
};
const SPECIAL = new Set(['seahorse', 'crab', 'shrimp', 'turtle', 'ray', 'isopod', 'squid', 'dumbo']);

function speciesPal(sp, shiny) {
  const c = sp.c;
  if (!shiny) return { b: c.b, l: c.l, f: c.f, t: c.t, pat: sp.pat };
  const deg = sp.shinyHue || (100 + (sp.idx * 47) % 160);
  const hs = x => hueShift(x, deg, 1.15);
  return { b: hs(c.b), l: hs(c.l), f: hs(c.f), t: hs(c.t), pat: sp.pat.map(p => p.map((v, i) => (typeof v === 'string' && v[0] === '#' && i > 0) ? hs(v) : v)) };
}

// ---- 汎用の魚（2倍の細かさで描く） ----
const D = 2;
function disk(g, cx, cy, r, c) {
  for (let y = Math.floor(cy - r - 1); y <= Math.ceil(cy + r + 1); y++)
    for (let x = Math.floor(cx - r - 1); x <= Math.ceil(cx + r + 1); x++)
      if ((x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2 <= r * r) g.set(x, y, c);
}
function genFish(sp, pal, frame) {
  const P = Object.assign({}, PRE[sp.shape] || PRE.std, sp.o);
  const L = P.L * D, H = P.H * D, tl = (P.tl || 0) * D;
  const tailH = P.tail === 'flow' ? H * 2.0 : P.tail === 'fan' ? H * 1.25 : P.tail === 'lyre' ? H * 1.5 : P.tail === 'shark' ? H * 1.5 : P.tail === 'tuna' ? H * 1.5 : P.tail === 'none' ? 0 : H * 0.9;
  const finUp = { 0: 0, 1: 2 * D, 2: Math.ceil(H * 0.45), 3: Math.ceil(H * 0.7), 4: Math.ceil(H * 0.55), 5: D, 6: 3 * D }[P.dor] || 0;
  const finDown = (P.ven === 'long' || P.ven === 'flow') ? Math.ceil(H * 0.9) : 2 * D;
  const bodyBand = Math.max(H, tailH);
  const lurePad = P.lure ? 6 * D : 0, humpPad = P.hump ? 2 * D : 0;
  const snoutPad = ((P.snout || 0) + 3) * D;
  const W = L + tl + snoutPad + 2, GH = Math.ceil(bodyBand + finUp + finDown + 3 + lurePad + humpPad);
  const g = new Grid(W, GH);
  const x0 = tl + 1, cx = x0 + L / 2, cy = 1 + lurePad + finUp + humpPad + bodyBand / 2;
  const top = {}, bot = {};
  const finC = pal.f, tailC = pal.t;
  const fin = (x, y, c) => { if (!g.get(x, y)) g.set(x, y, (P.finRays && x % 2 === 0) ? shade(c, -0.28) : (x % 3 === 0 ? shade(c, -0.09) : c)); };
  const wave = x => P.eel ? Math.round(Math.sin(x * 0.42 / D + frame * Math.PI) * 1.2 * D) : 0;

  // 体
  for (let x = x0; x < x0 + L; x++) {
    const t = ((x + 0.5) - cx) / (L / 2);
    const e = t > 0 ? (P.e || 2) : (P.eb || P.e || 2);
    let hh = H / 2 * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(t), e)), 1 / e);
    if (t < -0.55) hh = Math.max(hh, H * (P.eel ? 0.45 : 0.17));
    if (P.eel) hh = Math.max(hh, H * 0.45 * (t > 0.85 ? (1 - t) / 0.15 + 0.3 : 1));
    if (P.hump && t > 0.25 && t < 0.75) hh += 2 * D * Math.sin((t - 0.25) / 0.5 * Math.PI);
    const yc = cy + wave(x);
    let tp = null, bt = null;
    for (let y = Math.floor(yc - hh - 1); y <= Math.ceil(yc + hh); y++) {
      const py = y + 0.5; if (py < yc - hh || py > yc + hh) continue;
      const v = (py - yc) / Math.max(0.5, hh);
      if (tp === null) tp = y; bt = y;
      g.set(x, y, bodyColor(P, pal, t, v, x, y, L));
    }
    if (tp !== null) { top[x] = tp; bot[x] = bt; }
  }
  // 尾びれ
  for (let dx = 1; dx <= tl; dx++) {
    const x = x0 - dx; const f = dx / tl;
    const wag = frame ? Math.round(f * 1.4 * D) : 0;
    const yc = cy + wag;
    for (let y = 0; y < GH; y++) {
      const dy = (y + 0.5) - yc; let on = false;
      switch (P.tail) {
        case 'fork': { const half = D * 0.6 + f * tailH / 2; on = Math.abs(dy) <= half && !(f > 0.45 && Math.abs(dy) < (f - 0.45) * tailH * 0.55); break; }
        case 'lyre': { const half = D * 0.6 + f * tailH / 2; on = Math.abs(dy) <= half && !(f > 0.25 && Math.abs(dy) < (f - 0.2) * tailH * 0.6); break; }
        case 'round': { const half = H * 0.18 + (tailH / 2 - H * 0.18) * Math.sqrt(f); on = Math.abs(dy) <= half * (f > 0.8 ? 1 - (f - 0.8) * 1.5 : 1); break; }
        case 'fan': { const half = D * 0.6 + tailH / 2 * Math.pow(f, 0.6); on = Math.abs(dy) <= half && !(f > 0.85 && Math.abs(dy) < D * 0.6); break; }
        case 'flow': { const yc2 = yc + f * H * 0.5; const half = D * 0.6 + tailH / 2 * Math.pow(f, 0.5); on = Math.abs((y + 0.5) - yc2) <= half; break; }
        case 'shark': on = (dy <= 0.5 && dy >= -(D * 0.6 + f * tailH * 0.75)) || (f < 0.55 && dy > 0 && dy <= D * 0.6 + f * tailH * 0.5); break;
        case 'tuna': { const half = f < 0.35 ? D * 0.6 : D * 0.6 + (f - 0.35) / 0.65 * tailH / 2; on = Math.abs(dy) <= half && !(f > 0.6 && Math.abs(dy) < (f - 0.6) * tailH * 0.9); break; }
      }
      if (on) fin(x, y, (P.tailBars && dx > tl * 0.3 && Math.abs(dy) > D * 0.4 && (Math.floor(dx / D) % 3) === 0) ? P.tailBars : tailC);
    }
  }
  // 背びれ
  const hasTip = pal.pat.some(p => p[0] === 'finTip');
  for (let x = x0; x < x0 + L; x++) {
    if (top[x] === undefined) continue;
    const t = ((x + 0.5) - cx) / (L / 2); let h = 0;
    switch (P.dor) {
      case 1: if (t > -0.35 && t < 0.2) h = Math.round(finUp * (1 - Math.abs(t + 0.07) / 0.28)); break;
      case 2: if (t > -0.65 && t < 0.3) h = Math.round(finUp * Math.sqrt(Math.max(0, 1 - Math.pow((t + 0.17) / 0.48, 2)))); break;
      case 3: if (t > -0.9 && t < 0.25) h = Math.round(finUp * (t < -0.3 ? (t + 0.9) / 0.6 : 1 - (t + 0.3) / 0.55)); break;
      case 4: if (t > -0.15 && t < 0.3) h = Math.round(finUp * (t < 0.0 ? (t + 0.15) / 0.15 : 1 - t / 0.3)); break;
      case 5: if (t < 0.6) h = D; break;
      case 6: if (t < 0.9) h = (t > 0.6 ? 5 : 2) * D; break;
    }
    for (let i = 1; i <= h; i++) fin(x, top[x] - i, (P.dor === 6 ? '#ff3a5a' : finC));
    if (h > 2 && hasTip) { g.set(x, top[x] - h, '#ffffff'); g.set(x, top[x] - h + 1, '#ffffff'); }
  }
  // 腹びれ・しりびれ
  for (let x = x0; x < x0 + L; x++) {
    if (bot[x] === undefined) continue;
    const t = ((x + 0.5) - cx) / (L / 2); let h = 0;
    if (P.ven === 'long') { if (t > -0.85 && t < 0.0) h = Math.round(finDown * (t < -0.35 ? (t + 0.85) / 0.5 : 1 - (t + 0.35) / 0.35)); if (t > 0.05 && t < 0.15) h = finDown; }
    else if (P.ven === 'flow') { if (t > -0.9 && t < 0.1) h = Math.round(finDown * (t + 0.9)); }
    else if (P.dor === 5 || P.dor === 6) { if (t < 0.2) h = D; }
    else if (P.legs) { if (Math.abs(t - 0.45) < 0.08 || Math.abs(t + 0.35) < 0.08) h = 2 * D; }
    else { if (t > -0.5 && t < -0.15) h = Math.round(2 * D * (1 - Math.abs(t + 0.32) / 0.18)); if (t > 0.05 && t < 0.2 && !P.bottom) h = Math.max(h, D); }
    if (P.lobes && Math.abs(t - 0.1) < 0.1) h = 3 * D;
    for (let i = 1; i <= h; i++) fin(x, bot[x] + i, P.legs ? pal.b : finC);
  }
  // マグロの小離鰭
  pal.pat.forEach(p => { if (p[0] === 'finlets') for (let x = x0 + 1; x < x0 + L * 0.3; x += 2 * D) { if (top[x] !== undefined) { g.set(x, top[x] - 1, p[1]); g.set(x + 1, top[x] - 1, p[1]); } if (bot[x] !== undefined) { g.set(x, bot[x] + 1, p[1]); g.set(x + 1, bot[x] + 1, p[1]); } } });
  // えらぶたの線
  if (!P.eel && L >= 10 * D) {
    const gx = Math.round(cx + L / 2 * 0.34);
    if (top[gx] !== undefined) for (let y = top[gx] + 2; y <= bot[gx] - 2; y++) {
      const v = (y + 0.5 - cy) / (H / 2); const xx = gx - Math.round(Math.abs(v) * D * 1.2);
      const c0 = g.get(xx, y); if (c0 && Math.abs(v) < 0.75) g.set(xx, y, shade(c0, -0.2));
    }
  }
  // 胸びれ
  const px = Math.round(cx + L / 2 * 0.22), py = Math.round(cy + H * 0.1);
  if (!P.eel && L >= 8 * D) for (let k = 0; k <= 2 * D; k++) for (let j = 0; j <= Math.floor(k * 0.55); j++) g.set(px - k, py + j, shade(finC, k === 2 * D || j === Math.floor(k * 0.55) ? -0.2 : -0.05));
  // 口先
  const xf = x0 + L;
  if (P.snout) for (let i = 0; i < P.snout * D; i++) { g.set(xf + i, Math.round(cy - D), pal.b); g.set(xf + i, Math.round(cy - D) + 1, shade(pal.b, -0.1)); }
  g.set(xf - 1, Math.round(cy + H * 0.08), shade(pal.b, -0.45));
  if (P.teeth) { for (const k of [1, 3, 5]) { g.set(xf - k, Math.round(cy + D), '#ffffff'); g.set(xf - k, Math.round(cy + D) + 1, '#ffffff'); } }
  if (P.wh) {
    const my = Math.round(cy + H * 0.15), wc = shade(pal.b, -0.45);
    for (let i = 0; i <= 3 * D; i++) g.set(xf + i, my + Math.round(i * 0.8), wc);
    if (L > 14 * D) for (let i = 0; i <= 2 * D; i++) g.set(xf + i, my - 1 - Math.round(i * 0.3), wc);
  }
  if (P.gills) for (let k = 0; k < 5; k++) { const x = Math.round(cx + L * 0.3 - k * 2 * D); if (top[x] !== undefined) for (let y = top[x] + 1; y < bot[x]; y++) g.set(x, y, shade(pal.b, -0.3)); }
  // 目
  const ex = cx + L / 2 * (P.eel ? 0.8 : 0.58);
  const exi = Math.round(ex);
  const ey = P.eyeTop ? (top[exi] !== undefined ? top[exi] + 1 : cy - H / 2) : cy - H * 0.14 + wave(exi);
  const eyeC = P.eyeColor || '#16161e';
  const r = L >= 28 ? 1.6 : L >= 18 ? 1.25 : 0.95;
  if (P.headGlass) {
    for (let x = exi - 3 * D; x <= exi + 2 * D; x++) for (let y = (top[x] || cy) - 3 * D; y < (top[x] || cy); y++) g.set(x, y, '#cfefff');
    disk(g, ex, ey - 2 * D, 1.3, '#3aff6a');
  } else if (P.bigEye) {
    const R = r * (P.bigEye === 2 ? 2.2 : 1.8);
    disk(g, ex, ey, R, P.eyeColor || '#f0f0f0'); disk(g, ex, ey, R * (P.eyeColor ? 0.5 : 0.62), '#101018');
    g.set(Math.floor(ex - R * 0.4), Math.floor(ey - R * 0.4), '#ffffff');
  } else {
    if (r >= 1.2) disk(g, ex, ey, r + 0.7, shade(pal.b, 0.45));
    disk(g, ex, ey, r, eyeC);
    if (r >= 1.2) g.set(Math.floor(ex - 0.5), Math.floor(ey - 0.6), '#ffffff');
  }
  // ちょうちん
  if (P.lure) {
    const lx = exi - D; const ly = top[lx] !== undefined ? top[lx] : Math.round(cy - H / 2);
    for (let i = 1; i <= 4 * D; i++) g.set(lx + Math.floor(i / 2), ly - i, '#3a3a4a');
    disk(g, lx + 2 * D + 1, ly - 4 * D - 2, 2, '#fff38a'); g.noOutline.add('#fff38a');
  }
  if (P.spikes) { for (let x = x0 + D; x < x0 + L - D; x += 2 * D) { const sc = shade(pal.b, -0.35); if (top[x] !== undefined) { g.set(x, top[x] - 1, sc); g.set(x, top[x] - 2, sc); } if (bot[x] !== undefined) { g.set(x, bot[x] + 1, sc); g.set(x, bot[x] + 2, sc); } } }
  return g;
}

function bodyColor(P, pal, t, v, x, y, L) {
  const u = (t + 1) / 2;
  let c = v > 0.38 ? pal.l : pal.b;
  if (v > 0.28 && v <= 0.38 && (x + y) % 2 === 0) c = pal.l; // 腹との境目をなじませる
  for (const p of pal.pat) {
    const k = p[0], col = p[1];
    switch (k) {
      case 'hstripe': if (v >= p[2] && v <= p[3] && u >= (p[4] || 0) && u <= (p[5] == null ? 1 : p[5])) c = col; break;
      case 'spots': { const ox = x % 3, oy = y % 3; if (ox < 2 && oy < 2 && hash2(Math.floor(x / 3), Math.floor(y / 3), p[3]) < p[2] && Math.abs(v) < 0.9) c = col; break; }
      case 'bands': {
        const n = p[3], w = p[4], from = p[5] == null ? 0.2 : p[5], to = p[6] == null ? 0.8 : p[6];
        let d = 9; for (let i = 0; i < n; i++) { const pos = n === 1 ? (from + to) / 2 : from + (to - from) * i / (n - 1); d = Math.min(d, Math.abs(u - pos)); }
        if (d < w) c = col; else if (p[2] && d < w + 1.6 / L) c = p[2];
        break;
      }
      case 'wave': if (Math.sin(x * p[2] / D + Math.sin(y * 0.9 / D) * 2.2 + y * 0.6 / D) > p[3]) c = col; break;
      case 'front': if (u > p[2]) c = col; break;
      case 'rear': if (u < p[2]) c = col; break;
      case 'vbars': if (x % (p[2] * D) < p[3] * D && u > 0.1 && u < 0.9) c = col; break;
      case 'hlines': if ((y + (p[3] || 0) * D) % (p[2] * D) === 0 && Math.abs(v) < 0.95) c = col; break;
      case 'blob': if (vnoise(x / (p[2] * D), y / (p[2] * D), p[4]) > p[3]) c = col; break;
      case 'scales': { const sx = (x + (Math.floor(y / (2 * D)) % 2) * D) % (3 * D), sy = y % (2 * D); if (((sx === 0 && sy === 0) || (sx === 1 && sy === 1)) && Math.abs(v) < 0.8) c = col; break; }
      case 'parr': if (Math.abs(v) < 0.4 && Math.sin(u * Math.PI * p[2]) > 0.5) c = col; break;
      case 'band': if (Math.abs(u - p[2]) < p[3] && v >= p[4] && v <= p[5]) c = col; break;
      case 'belly': if (v > p[2]) c = col; break;
    }
  }
  // 立体感（上を明るく、下を暗く、つやのハイライト）
  if (v < -0.72) c = shade(c, 0.18);
  else if (v < -0.45) c = shade(c, 0.07);
  else if (v > 0.85) c = shade(c, -0.16);
  else if (v > 0.65) c = shade(c, -0.07);
  if (v > -0.58 && v < -0.42 && u > 0.5 && u < 0.78) c = shade(c, 0.28);
  return c;
}

// ---- 特殊な形 ----
function genSpecial(sp, pal, frame) {
  const P = sp.o || {};
  const b = pal.b, l = pal.l, f = pal.f, e = '#101018';
  switch (sp.shape) {
    case 'seahorse': return mapGrid([
      '....bbb.....',
      '...bbbbbbbb.',
      '...bebbbbbbb',
      '...bbbb.....',
      'f...bbb.....',
      'ff.bbbbf....',
      'ffbbllbf....',
      '.fbbllbb....',
      '..bbllbb....',
      '..bbllbb....',
      '..bblllb....',
      '...bbllb....',
      '....bbb.....',
      '....bbb.....',
      '..b..bb.....',
      '..bb.bb.....',
      '...bbbb.....',
      '....bb......'], { b, l, f, e });
    case 'crab': {
      const S = P.longLegs;
      const rows = S ? [
        'f..f..............f..f',
        'ff.ff............ff.ff',
        '.fff..............fff.',
        '..f....b......b....f..',
        '...f...e......e...f...',
        '....f.bbbbbbbbbb.f....',
        '.....bbbbbbbbbbbb.....',
        '.....bbllllllllbb.....',
        '...ff.bbbbbbbbbb.ff...',
        '..f..f.f.f..f.f.f..f..',
        '.f..f..f..f..f..f..f..',
        'f..f..f....ff....f..f.',
        '...f..f..........f..f.'] : [
        'ff..........ff',
        'fff........fff',
        '.ff.b....b.ff.',
        '..f.e....e.f..',
        '...bbbbbbbb...',
        '..bbbbbbbbbb..',
        '..bbllllllbb..',
        '...bbbbbbbb...',
        '..f.f.ff.f.f..',
        '.f..f....f..f.'];
      const pal2 = { b, l, f, e }; if (P.hairy) pal2.f = shade(f, -0.2);
      const g = mapGrid(rows, pal2);
      if (frame && !S) { g.set(0, 1, null); g.set(13, 1, null); }
      return g;
    }
    case 'shrimp': return mapGrid(frame ? [
      'ff..............',
      '..fff........f..',
      '.....f.....ff...',
      '......bbbbbbb...',
      '...bblbblbbbbeb.',
      '.fbblbblbbbbbbbb',
      'ffbb.f.f.f.f....',
      'f....f.f.f.f....'] : [
      'ff..............',
      '..fff........f..',
      '.....f.....ff...',
      '......bbbbbbb...',
      '...bblbblbbbbeb.',
      '.fbblbblbbbbbbbb',
      'ffbb.f.f.f.f....',
      'f...f.f.f.f.....'], { b, l, f, e });
    case 'turtle': return mapGrid([
      '.......bbbbbbb.........',
      '.....bbllbbbllbb.......',
      '....bllbbllbbbllb......',
      '...bbbbbbbbbbbbbbb..ff.',
      '..fbbbbbbbbbbbbbbbbfffe',
      '.ff.llllllllllllll..fff',
      frame ? 'ff..ff.......ff........' : 'f....ff.......ff.......',
      frame ? '....f..........f.......' : '......f.........f......'], { b: b, l: shade(b, 0.25), f: f, e });
    case 'ray': {
      const W = P.W || 22, Hh = Math.round(W * 0.42), g = new Grid(W + 12, Hh + 4);
      const cx = 12 + W / 2, cy = 2 + Hh / 2;
      for (let y = 0; y < Hh + 4; y++) for (let x = 12; x < W + 12; x++) {
        const nx = (x + 0.5 - cx) / (W / 2), ny = (y + 0.5 - cy) / (Hh / 2);
        const wingLift = frame ? -0.15 : 0.1;
        const lim = Math.pow(Math.max(0, 1 - Math.abs(nx)), 0.9) * (1 + (ny < 0 ? wingLift : -wingLift) * Math.abs(nx));
        if (Math.abs(ny) <= lim) g.set(x, y, ny > 0.25 ? l : (ny < -0.5 ? shade(b, 0.12) : b));
      }
      for (let x = 0; x < 12; x++) g.set(x, Math.round(cy) + (x < 6 ? 0 : 0), shade(b, -0.1));
      const ex = Math.round(cx + W * 0.3), ey = Math.round(cy - 1);
      g.set(ex, ey, e);
      if (sp.id === 'manta') { g.set(W + 11, ey + 1, b); g.set(W + 11, ey + 2, b); g.set(W + 10, ey + 3, b); }
      return g;
    }
    case 'isopod': {
      const g = new Grid(20, 9);
      for (let x = 1; x < 18; x++) {
        const t = (x - 9.5) / 8.5, h = Math.round(6 * Math.sqrt(Math.max(0, 1 - t * t)));
        for (let y = 7 - h; y < 7; y++) g.set(x, y, (x % 2 === 0) ? shade(b, -0.15) : (y === 7 - h ? shade(b, 0.2) : b));
        if (x % 2 === 1 && x > 2 && x < 17) g.set(x + (frame ? 1 : 0) - 1, 7, f), g.set(x - 1, 8, shade(f, -0.2));
      }
      g.set(16, 5, e); g.set(18, 4, f); g.set(19, 3, f); g.set(0, 5, f); g.set(0, 6, f);
      return g;
    }
    case 'squid': {
      const g = mapGrid([
        'f.................',
        'ff..bbbbb.........',
        '.fbbbbllbbbbb.....',
        '..bbllbbllbbbbe...',
        '.fbbbbllbbbbbbbbff',
        'ff..bbbbb...ffff..',
        frame ? 'f............f..f.' : 'f...........f..f..'], { b, l, f, e });
      pal.pat.forEach(p => { if (p[0] === 'spots') for (let i = 0; i < 6; i++) g.set(4 + i * 2, 2 + (i % 3), p[1]); });
      g.noOutline.add('#6af8ff');
      return g;
    }
    case 'dumbo': {
      const g = mapGrid(frame ? [
        '.ff........ff.',
        'fffbbbbbbbbfff',
        '.bbbbbbbbbbbb.',
        '.bbbebbbbebbb.',
        '..bbbbbbbbbb..',
        '..bbbbbbbbbb..',
        '.llllllllllll.',
        'l..l..ll..l..l'] : [
        '..ff......ff..',
        '.ffbbbbbbbbff.',
        '.bbbbbbbbbbbb.',
        '.bbbebbbbebbb.',
        '..bbbbbbbbbb..',
        '.llllllllllll.',
        'l.l..l..l..l.l',
        '.l..l....l..l.'], { b, l, f, e });
      pal.pat.forEach(p => { if (p[0] === 'spots') for (let i = 0; i < 5; i++) g.set(3 + i * 2, 2 + (i % 2) * 2, p[1]); });
      return g;
    }
  }
  return new Grid(8, 8);
}

// ---- クラゲ（細かく自動生成） ----
function genJelly(sp, pal, frame) {
  const o = sp.o; const J = 2;
  const pulse = frame ? 1.07 : 1, squash = frame ? 0.9 : 1;
  const bell = o.bell || 'dome';
  const bw = Math.round(o.bw * J * pulse), bh = Math.max(3, Math.round(o.bh * J * squash));
  const tl = (o.tl || 0) * J, armL = (o.arms || 0) * J;
  const crest = o.crest ? 3 * J : 0;
  const W = Math.round(o.bw * J * 1.12) + 10 + (bell === 'float' ? 6 : 0);
  const Hh = bh + Math.max(tl, armL) + 6 + crest;
  const g = new Grid(W, Hh);
  const cx = W / 2, top = 2 + crest;
  const rimY = (bell === 'comb' || bell === 'float') ? top + bh / 2 : top + bh;
  const b = pal.b, l = pal.l;
  let tc = pal.f; if (tc === b || tc === l) tc = shade(tc, 0.07);
  const rimPat = pal.pat.find(p => p[0] === 'rim');
  // 傘
  for (let x = 0; x < W; x++) {
    const nx = (x + 0.5 - cx) / (bw / 2); if (Math.abs(nx) > 1) continue;
    let y0, y1;
    if (bell === 'comb' || bell === 'float') {
      const ry = bh / 2 * Math.sqrt(1 - nx * nx); const tilt = bell === 'float' ? nx * bh * 0.22 : 0;
      y0 = rimY - ry - tilt; y1 = rimY + ry * (bell === 'float' ? 0.8 : 1) - tilt;
    } else {
      const prof = { dome: [2, 2], flat: [2, 1.6], bullet: [2.6, 1.3], cube: [8, 6], disc: [2, 4] }[bell] || [2, 2];
      const h = Math.pow(Math.max(0, 1 - Math.pow(Math.abs(nx), prof[0])), 1 / prof[1]);
      y0 = rimY - bh * h; y1 = rimY - (bell === 'cube' ? 0 : bh * 0.16 * (1 - nx * nx));
    }
    for (let y = Math.ceil(y0); y <= Math.floor(y1); y++) {
      const v = (y - y0) / Math.max(1, y1 - y0);
      let c = b;
      if (v < 0.18) c = shade(b, 0.28); else if (v < 0.4) c = shade(b, 0.12);
      if (Math.abs(nx) > 0.82) c = shade(b, -0.08);
      for (const p of pal.pat) {
        switch (p[0]) {
          case 'radial': { const a = Math.atan2(x + 0.5 - cx, (top + bh * 1.6) - y); if (Math.floor((a + 2) * p[2] / Math.PI) % 2 === 0 && v > 0.12) c = p[1]; break; }
          case 'dots': if ((x % 3 === 1 || y % 3 === 1) && hash2(Math.floor(x / 3), Math.floor(y / 3), 77) < p[2]) c = p[1]; break;
          case 'gonad': { const ex = (x + 0.5 - cx) / (bw * 0.24), ey = (y + 0.5 - (y0 + (y1 - y0) * 0.6)) / Math.max(2, bh * 0.22); if (ex * ex + ey * ey < 1) c = p[1]; break; }
          case 'gonad4': for (let i = 0; i < 4; i++) { const gx = cx + (i - 1.5) * bw * 0.16; if (Math.abs(x + 0.5 - gx) < bw * 0.05 + 0.6 && v > 0.35 && v < 0.85) c = p[1]; } break;
          case 'leaf': for (let i = 0; i < 4; i++) { const gx = cx + (i - 1.5) * bw * 0.17, gy = top + bh * 0.62, rr = bw * 0.065 + 0.9; const dd = Math.hypot(x + 0.5 - gx, (y + 0.5 - gy) * 1.2); if (dd > rr - 1 && dd <= rr + 0.3) c = p[1]; } break;
          case 'comb': for (let k = 0; k < 8; k++) { const colx = cx + (k - 3.5) / 4 * (bw / 2) * 0.85; if (Math.abs(x + 0.5 - colx) < 0.6 && y % 2 === 0 && v > 0.08 && v < 0.92) { const hh = (y * 0.05 + k * 0.13 + frame * 0.3) % 1; c = rgb2hex(...hsl2rgb(hh, 0.95, 0.62)); } } break;
        }
      }
      if (rimPat && y >= y1 - 1.2 && bell !== 'comb') c = rimPat[1];
      g.set(x, y, c);
    }
  }
  // 浮き袋のトサカ（カツオノエボシ）
  if (o.crest) for (let x = 0; x < W; x++) {
    const nx = (x + 0.5 - cx) / (bw / 2); if (Math.abs(nx) > 0.7) continue;
    const ry = bh / 2 * Math.sqrt(1 - nx * nx), yT = rimY - ry - nx * bh * 0.22;
    const h = Math.round(crest * (0.5 + 0.5 * Math.sin(x * 0.9 + frame))) ;
    for (let i = 1; i <= h; i++) g.set(x, Math.floor(yT) - i + 1, o.crest);
  }
  // 口腕（フリル状）
  if (armL) {
    const n = o.armN || 2, aw = (o.armW || 2) * J;
    for (let a = 0; a < n; a++) {
      const off = (n === 1 ? 0 : (a / (n - 1) - 0.5)) * Math.min(bw * 0.4, aw * 1.4 * (n - 1));
      for (let k = 0; k < armL; k++) {
        const y = Math.round(rimY - 2 + k); const f = k / armL;
        const w = Math.max(1, aw * (1 - f * 0.5) + (k % 4 === 0 ? 1 : 0));
        const xc = cx + off + Math.sin(k * 0.13 + frame * 1.3 + a * 2) * (1 + f * 3);
        for (let xx = Math.round(xc - w / 2); xx < Math.round(xc + w / 2); xx++) {
          if (g.get(xx, y) && k < 3) continue;
          const edge = xx === Math.round(xc - w / 2) || xx === Math.round(xc + w / 2) - 1;
          g.set(xx, y, edge ? shade(l, -0.12) : (o.armClub && f > 0.75 ? shade(l, 0.3) : l));
        }
      }
    }
  }
  // 触手（細い線・輪郭なし）
  const n = o.tent || 0;
  for (let i = 0; i < n; i++) {
    let tx0;
    if (bell === 'cube') tx0 = cx + [-0.46, -0.2, 0.2, 0.46][i % 4] * bw;
    else if (bell === 'float') tx0 = cx - bw * 0.25 + (i / Math.max(1, n - 1)) * bw * 0.35;
    else tx0 = cx + (n === 1 ? 0 : (i / (n - 1) - 0.5)) * bw * 0.9;
    const len = tl * (0.65 + 0.35 * hash2(i, 3, sp.idx));
    const y0 = bell === 'float' ? rimY + bh * 0.3 : rimY;
    const col = (o.tentMix && i % 2) ? l : tc;
    for (let k = 0; k < len; k++) {
      const x = Math.round(tx0 + Math.sin(k * 0.16 + i * 1.3 + frame * 1.6) * (0.6 + k / Math.max(1, len) * 2.6));
      const y = Math.round(y0 + k);
      if (!g.get(x, y)) g.set(x, y, col);
      if (bell === 'float' && k % 7 === 3) g.set(x + 1, y, '#ff7ad8');
    }
  }
  g.noOutline.add(tc); if (o.tentMix) g.noOutline.add(l);
  g.noOutline.add('#ff7ad8');
  if (o.flip) { const n2 = new Grid(g.w, g.h); n2.noOutline = g.noOutline; for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) n2.set(x, g.h - 1 - y, g.get(x, y)); return n2; }
  return g;
}

// ---- Scale2x（EPX）: 手描きマップをなめらかに2倍化 ----
function epx(g) {
  const n = new Grid(g.w * 2, g.h * 2); n.noOutline = g.noOutline;
  for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
    const P = g.get(x, y), A = g.get(x, y - 1), B = g.get(x + 1, y), C = g.get(x - 1, y), E = g.get(x, y + 1);
    let p1 = P, p2 = P, p3 = P, p4 = P;
    if (C === A && C !== E && A !== B) p1 = A;
    if (A === B && A !== C && B !== E) p2 = B;
    if (E === C && E !== B && C !== A) p3 = C;
    if (B === E && B !== A && E !== C) p4 = E;
    n.set(2 * x, 2 * y, p1); n.set(2 * x + 1, 2 * y, p2); n.set(2 * x, 2 * y + 1, p3); n.set(2 * x + 1, 2 * y + 1, p4);
  }
  return n;
}

// ---- 公開API ----
const SPRITE_CACHE = new Map();
function scaleGrid(g, s) {
  if (!s || s === 1) return g;
  const W = Math.round(g.w * s), H = Math.round(g.h * s), n = new Grid(W, H); n.noOutline = g.noOutline;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) n.set(x, y, g.get(Math.floor(x / s), Math.floor(y / s)));
  return n;
}
function getFishSprite(spId, shiny, frame) {
  const key = spId + '|' + (shiny ? 1 : 0) + '|' + (frame ? 1 : 0);
  let c = SPRITE_CACHE.get(key); if (c) return c;
  const sp = SPECIES_MAP[spId]; const pal = speciesPal(sp, shiny);
  let g, outline = null;
  if (sp.shape === 'jelly') { g = genJelly(sp, pal, frame); outline = shade(pal.b, -0.5); }
  else if (SPECIAL.has(sp.shape)) { g = genSpecial(sp, pal, frame); if (sp.o && sp.o.S) g = scaleGrid(g, sp.o.S); g = epx(g); }
  else g = genFish(sp, pal, frame);
  c = g.toCanvas(outline, sp.o && sp.o.alpha);
  SPRITE_CACHE.set(key, c);
  return c;
}
function getFishFlip(spId, shiny, frame) {
  const key = 'F' + spId + '|' + (shiny ? 1 : 0) + '|' + (frame ? 1 : 0);
  let c = SPRITE_CACHE.get(key); if (c) return c;
  const s = getFishSprite(spId, shiny, frame);
  c = document.createElement('canvas'); c.width = s.width; c.height = s.height;
  const x = c.getContext('2d'); x.translate(s.width, 0); x.scale(-1, 1); x.drawImage(s, 0, 0);
  SPRITE_CACHE.set(key, c); return c;
}
function getSilhouette(spId) {
  const key = 'S' + spId; let c = SPRITE_CACHE.get(key); if (c) return c;
  const s = getFishSprite(spId, false, 0);
  c = document.createElement('canvas'); c.width = s.width; c.height = s.height;
  const x = c.getContext('2d'); x.drawImage(s, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = '#2b3550'; x.fillRect(0, 0, c.width, c.height);
  SPRITE_CACHE.set(key, c); return c;
}
const URL_CACHE = new Map();
function spriteURL(spId, shiny, sil, scale) {
  scale = scale || 1;
  const key = spId + (shiny ? 's' : '') + (sil ? 'x' : '') + scale;
  if (URL_CACHE.has(key)) return URL_CACHE.get(key);
  const s = sil ? getSilhouette(spId) : getFishSprite(spId, shiny, 0);
  const c = document.createElement('canvas'); c.width = s.width * scale; c.height = s.height * scale;
  const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(s, 0, 0, c.width, c.height);
  const u = c.toDataURL(); URL_CACHE.set(key, u); return u;
}
function fishWeight(spId) { const s = getFishSprite(spId, false, 0); return Math.max(1, Math.round((s.width * s.height) / 880)); }

// ---- 装飾スプライト ----
function genDecor(d, frame, seed) {
  const R = rng(seed * 7919 + 13);
  switch (d.kind) {
    case 'rock': {
      const W = d.big ? 26 : 15, H = d.big ? 14 : 8, g = new Grid(W, H), base = ['#8a8f9a', '#9a8f80', '#7f8a8a'][seed % 3];
      for (let x = 0; x < W; x++) { const t = (x + 0.5) / W * 2 - 1; const h = Math.round(H * Math.pow(1 - Math.abs(t), 0.6) * (0.8 + 0.2 * vnoise(x / 3, 0, seed))); for (let y = H - h; y < H; y++) g.set(x, y, y === H - h ? shade(base, 0.25) : (hash2(x, y, seed) < 0.15 ? shade(base, -0.2) : (x / W + (H - y) / H * 0.2 < 0.45 ? base : shade(base, -0.1)))); }
      return g;
    }
    case 'plant': {
      const H = 22 + (seed % 3) * 4, g = new Grid(13, H), c1 = d.red ? '#e8503a' : '#4ac83a', c2 = d.red ? '#b8302a' : '#2a9a2a';
      for (let s = 0; s < 4; s++) { let x = 3 + s * 2 + (R() * 2 | 0); const h = H - (R() * 8 | 0); for (let i = 0; i < h; i++) { const yy = H - 1 - i; const sw = Math.round(Math.sin(i * 0.25 + (frame ? 0.8 : 0) + s) * 1.2 * i / h); g.set(x + sw, yy, s % 2 ? c2 : c1); if (i % 3 === 1 && i > 2) { g.set(x + sw - 1, yy, c1); g.set(x + sw + 1, yy - 1, c1); g.set(x + sw - 2, yy - 1, c2); } } }
      return g;
    }
    case 'kelp': {
      const H = 40, g = new Grid(12, H);
      for (let s = 0; s < 2; s++) { const x0 = 3 + s * 5; for (let i = 0; i < H - s * 8; i++) { const yy = H - 1 - i; const sw = Math.round(Math.sin(i * 0.18 + (frame ? 0.9 : 0) + s * 2) * 2 * i / H); g.set(x0 + sw, yy, '#7a8a2a'); g.set(x0 + sw + 1, yy, '#9aa83a'); if (i % 5 === 2) g.set(x0 + sw + 2, yy, '#9aa83a'); } }
      return g;
    }
    case 'coral': {
      const g = new Grid(22, 22), c = ['#ff6a9a', '#ff8a4a', '#c86ae8'][seed % 3];
      const branch = (x, y, ang, len, w) => { for (let i = 0; i < len; i++) { x += Math.cos(ang); y -= Math.sin(ang); for (let k = 0; k < w; k++) g.set(x + k, y, k ? shade(c, -0.15) : c); if (i === len - 1) g.set(x, y - 1, shade(c, 0.3)); } if (len > 3) { branch(x, y, ang + 0.5 + R() * 0.3, len * 0.65 | 0, Math.max(1, w - 1)); branch(x, y, ang - 0.5 - R() * 0.3, len * 0.6 | 0, Math.max(1, w - 1)); } };
      branch(10, 21, Math.PI / 2, 8, 2);
      return g;
    }
    case 'softcoral': {
      const g = new Grid(18, 16), c = ['#a86ae8', '#e86ab8', '#ffb04a'][seed % 3];
      for (let i = 0; i < 7; i++) { const x = 3 + i * 2, h = 6 + (R() * 8 | 0); for (let y = 0; y < h; y++) g.set(x + Math.round(Math.sin(y * 0.4 + (frame ? 1 : 0)) * 0.6), 15 - y, y > h - 3 ? shade(c, 0.35) : c); g.set(x - 1, 15 - h, shade(c, 0.35)); g.set(x + 1, 15 - h, shade(c, 0.35)); }
      return g;
    }
    case 'anemone': {
      const g = new Grid(18, 13), c = '#ff9a5a', base = '#c8584a';
      for (let x = 4; x < 14; x++) for (let y = 9; y < 13; y++) g.set(x, y, base);
      for (let i = 0; i < 9; i++) { const x0 = 2 + i * 1.7; const h = 5 + (i % 3); for (let k = 0; k < h; k++) g.set(Math.round(x0 + Math.sin(k * 0.6 + i + (frame ? 1 : 0)) * 1), 9 - k, k === h - 1 ? '#ffd8a8' : c); }
      return g;
    }
    case 'shell': return mapGrid(['..ppp..', '.ppPpp.', 'pPpPpPp', 'pPpPpPp', '.ppppp.', '..ppp..'], { p: '#ffd0c0', P: '#e89a8a' });
    case 'starfish': return mapGrid(['....o....', '....o....', '...ooo...', 'ooooOoooo', '.ooOOOoo.', '..ooOoo..', '..oo.oo..', '.oo...oo.', '.o.....o.'], { o: ['#ff7a4a', '#ffb02a', '#e85a9a'][seed % 3], O: '#ffe0a0' });
    case 'driftwood': {
      const g = new Grid(30, 14);
      for (let x = 0; x < 28; x++) { const y = 12 - Math.round(x * 0.25 + Math.sin(x * 0.3) * 1.5); g.set(x, y, '#7a5a3a'); g.set(x, y + 1, '#5a3a22'); if (x > 4) g.set(x, y - 1, '#9a7a5a'); }
      for (let i = 0; i < 6; i++) { g.set(14 + i, 6 - i, '#7a5a3a'); g.set(15 + i, 6 - i, '#5a3a22'); }
      for (let i = 0; i < 4; i++) { g.set(6 - i, 9 - i, '#7a5a3a'); }
      return g;
    }
    case 'marimo': { const g = new Grid(8, 8); for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { const dx = x - 3.5, dy = y - 3.5; if (dx * dx + dy * dy < 15) g.set(x, y, hash2(x, y, seed) < 0.3 ? '#3a8a2a' : (dx + dy < -2 ? '#7ad84a' : '#4aa83a')); } return g; }
    case 'crystal': return mapGrid(['....c.....', '...cC..c..', '...cC..cC.', '..ccCC.cC.', '..cCCC.cCC', '.c.cCCccCC', 'cC.cCCCcCC', 'cCccCCCCCC', 'cCCcCCCCCC'], { c: '#e0b0ff', C: ['#9a5ae8', '#5ab0e8', '#e85a9a'][seed % 3] });
    case 'bubble': return mapGrid(['.gggg.', 'gGGGGg', 'gggggg'], { g: '#7a7a8a', G: '#a0a0b0' });
    case 'chest': return mapGrid([
      '..bbbbbbbbbb..', '.bByyyyyyyyBb.', 'bByyyyyyyyyyBb', 'bbbbbbbbbbbbbb', 'kyykyykyyky..k',
      'BBBBBByyBBBBBB', 'bbbbbyKKybbbbb', 'BBBBByyyyBBBBB', 'bbbbbbbbbbbbbb', 'BBBBBBBBBBBBBB'],
      { b: '#8a5a2a', B: '#6a4020', y: '#ffd84a', k: '#e8b020', K: '#2a1a10' });
    case 'castle': {
      const g = new Grid(22, 30), s = '#9a9aa8', sd = '#6a6a7a', dk = '#2a2a3a';
      const tower = (x0, w, h) => { const y0 = 30 - h; for (let x = x0; x < x0 + w; x++) for (let y = y0; y < 30; y++) { const brick = (y % 3 === 0) || ((x + (Math.floor(y / 3) % 2) * 2) % 4 === 0); g.set(x, y, brick ? sd : s); } for (let x = x0; x < x0 + w; x += 2) { g.set(x, y0 - 1, s); g.set(x, y0 - 2, s); } };
      tower(0, 8, 18); tower(12, 9, 26); tower(6, 8, 14);
      for (let y = 8; y < 12; y++) for (let x = 15; x < 18; x++) g.set(x, y, dk);
      for (let y = 23; y < 30; y++) for (let x = 8; x < 12; x++) g.set(x, y, (y === 23 && (x === 8 || x === 11)) ? null : dk);
      g.set(3, 17, dk); g.set(3, 18, dk); g.set(4, 17, dk); g.set(4, 18, dk);
      return g;
    }
    case 'torii': return mapGrid([
      'kkkkkkkkkkkkkkkkkk', '.rrrrrrrrrrrrrrrr.', '...r..........r...', 'rrrrrrrrrrrrrrrrrr', '...r..........r...',
      '...r..........r...', '...r..........r...', '...r..........r...', '...r..........r...', '...r..........r...', '..kkk........kkk..'],
      { k: '#2a2a2a', r: '#e8302a' });
    case 'ship': {
      const g = new Grid(44, 24), w1 = '#6a4a2a', w2 = '#4a3220';
      for (let x = 0; x < 40; x++) { const t = x / 40; const top = 12 + Math.round(t * 3), bot = 23 - Math.round(Math.abs(t - 0.45) * 8); for (let y = top; y <= bot; y++) g.set(x + 2, y, (y - top) % 3 === 0 ? w2 : w1); }
      for (let y = 0; y < 13; y++) g.set(18, y + 1, w2); for (let y = 3; y < 12; y++) g.set(30, y + 2, w2);
      for (let y = 2; y < 9; y++) for (let x = 19; x < 19 + (9 - y); x++) g.set(x, y, '#c8b898');
      for (let i = 0; i < 4; i++) g.set(10 + i * 7, 17, '#1a1a1a');
      g.set(6, 13, '#4a9a3a'); g.set(7, 12, '#4a9a3a'); g.set(36, 14, '#4a9a3a');
      return g;
    }
    case 'spawnmat': { const g = new Grid(14, 4); for (let x = 0; x < 14; x++) for (let y = 0; y < 4; y++) g.set(x, y, (x + y) % 2 ? '#3a8a3a' : '#5ab84a'); return g; }
    case 'lamp': { const g = mapGrid(['..yy..', '.yYYy.', '.yYYy.', '..yy..', '..kk..', '..kk..', '.kkkk.', 'kkkkkk'], { y: '#ffe88a', Y: '#fff38a', k: '#4a4a5a' }); g.noOutline.add('#fff38a'); return g; }
  }
  return new Grid(4, 4);
}
function getDecorSprite(id, frame, seed) {
  const d = DECOR_MAP[id]; seed = (seed || 0) % 3;
  const key = 'D' + id + '|' + (frame ? 1 : 0) + '|' + seed;
  let c = SPRITE_CACHE.get(key); if (c) return c;
  c = epx(genDecor(d, frame, seed + 1)).toCanvas(); SPRITE_CACHE.set(key, c); return c;
}
function decorURL(id) {
  const key = 'DU' + id; if (URL_CACHE.has(key)) return URL_CACHE.get(key);
  const s = getDecorSprite(id, 0, 0); const sc = s.width > 60 ? 1 : 2;
  const c = document.createElement('canvas'); c.width = s.width * sc; c.height = s.height * sc;
  const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(s, 0, 0, c.width, c.height);
  const u = c.toDataURL(); URL_CACHE.set(key, u); return u;
}

// ---- 水槽の背景 ----
const TANK_W = 360, TANK_H = 152, SAND_Y = 128;
function getTankBG(type) {
  const key = 'BG' + type; let c = SPRITE_CACHE.get(key); if (c) return c;
  const wt = WATER[type]; c = document.createElement('canvas'); c.width = TANK_W; c.height = TANK_H;
  const x = c.getContext('2d');
  const [r1, g1, b1] = hex2rgb(wt.top), [r2, g2, b2] = hex2rgb(wt.bot);
  const bands = 16;
  for (let i = 0; i < bands; i++) { const t = i / (bands - 1); x.fillStyle = rgb2hex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t); x.fillRect(0, Math.floor(i * SAND_Y / bands), TANK_W, Math.ceil(SAND_Y / bands) + 1); }
  // 光の筋
  x.fillStyle = `rgba(255,255,255,${wt.ray})`;
  for (let k = 0; k < 4; k++) { const ox = 40 + k * 124; for (let y = 0; y < SAND_Y; y++) x.fillRect(ox + y * 0.55 | 0, y, 20 + (k % 2) * 16, 1); }
  // 水面
  x.fillStyle = 'rgba(255,255,255,0.35)'; x.fillRect(0, 0, TANK_W, 3); x.fillStyle = 'rgba(255,255,255,0.15)'; x.fillRect(0, 3, TANK_W, 2);
  // 底
  for (let yy = SAND_Y; yy < TANK_H; yy++) for (let xx = 0; xx < TANK_W; xx++) {
    const n = hash2(xx, yy, 7); let col = yy === SAND_Y ? shade(wt.ground, 0.25) : (n < 0.18 ? wt.ground2 : (n > 0.93 ? shade(wt.ground, 0.3) : wt.ground));
    if (type === 'river' && vnoise(xx / 8, yy / 6, 3) > 0.68) col = n < 0.5 ? '#c8c4b8' : '#8a8478';
    x.fillStyle = col; x.fillRect(xx, yy, 1, 1);
  }
  if (type === 'jelly') { // ライトアップ
    const gr = x.createRadialGradient(TANK_W / 2, SAND_Y * 0.45, 10, TANK_W / 2, SAND_Y * 0.45, TANK_W * 0.6); gr.addColorStop(0, 'rgba(120,180,255,0.28)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gr; x.fillRect(0, 0, TANK_W, SAND_Y);
    for (let i = 0; i < 60; i++) { x.fillStyle = 'rgba(200,230,255,0.25)'; x.fillRect(hash2(i, 5, 4) * TANK_W | 0, hash2(i, 6, 4) * SAND_Y | 0, 1, 1); }
  }
  if (type === 'deep') { for (let i = 0; i < 90; i++) { x.fillStyle = 'rgba(200,220,255,0.35)'; x.fillRect(hash2(i, 1, 9) * TANK_W | 0, hash2(i, 2, 9) * SAND_Y | 0, 1, 1); } }
  if (type === 'brackish') { // マングローブの根
    x.fillStyle = 'rgba(60,40,20,0.35)';
    for (let k = 0; k < 3; k++) { const ox = 60 + k * 160; for (let y = 0; y < 80; y++) { x.fillRect(ox + Math.sin(y * 0.075) * 6 | 0, y, 6, 1); if (y > 40) x.fillRect(ox + (y - 40) | 0, y, 4, 1); } }
  }
  SPRITE_CACHE.set(key, c); return c;
}
