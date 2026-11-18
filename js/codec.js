// ===== 見学コード・来訪スタンプ・トレードコードの変換 =====
'use strict';
const CODE_SALT = 'pixel-aquarium-2026';

function b64urlFromBytes(bytes) {
  let s = ''; for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function bytesFromB64url(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/'); while (str.length % 4) str += '=';
  const s = atob(str), b = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i); return b;
}
function fnv(str) { let h = 0x811c9dc5; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); } return (h >>> 0).toString(36); }

async function streamBytes(bytes, Ctor, fmt) {
  const cs = new Ctor(fmt); const w = cs.writable.getWriter(); w.write(bytes); w.close();
  const buf = await new Response(cs.readable).arrayBuffer(); return new Uint8Array(buf);
}
// 種類: V=見学 S=来訪スタンプ T=トレード B=バックアップ
async function encodeCode(kind, obj) {
  const json = JSON.stringify(obj); let bytes = new TextEncoder().encode(json); let flag = 'r';
  if (typeof CompressionStream !== 'undefined') { try { bytes = await streamBytes(bytes, CompressionStream, 'deflate-raw'); flag = 'z'; } catch (e) { bytes = new TextEncoder().encode(json); } }
  const body = b64urlFromBytes(bytes);
  return `AQ${kind}${flag}${body}.${fnv(kind + body + CODE_SALT)}`;
}
async function decodeCode(code, expectKind) {
  code = (code || '').trim();
  const m = code.match(/#(?:v|s|t)=(.+)$/); if (m) code = decodeURIComponent(m[1]);
  if (!code.startsWith('AQ')) throw new Error('コードの形式が正しくありません');
  const kind = code[2], flag = code[3]; const rest = code.slice(4); const dot = rest.lastIndexOf('.');
  if (dot < 0) throw new Error('コードが途中で切れています');
  const body = rest.slice(0, dot), sum = rest.slice(dot + 1);
  if (fnv(kind + body + CODE_SALT) !== sum) throw new Error('コードが壊れているか、書き換えられています');
  if (expectKind && kind !== expectKind) {
    const names = { V: '見学コード', S: '来訪スタンプ', T: 'トレードコード', B: 'バックアップコード' };
    throw new Error(`これは${names[kind] || '別の種類のコード'}です（${names[expectKind]}を入れてください）`);
  }
  let bytes = bytesFromB64url(body);
  if (flag === 'z') {
    if (typeof DecompressionStream === 'undefined') throw new Error('このブラウザは圧縮コードに対応していません');
    bytes = await streamBytes(bytes, DecompressionStream, 'deflate-raw');
  }
  return { kind, data: JSON.parse(new TextDecoder().decode(bytes)) };
}
