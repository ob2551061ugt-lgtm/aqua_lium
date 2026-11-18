// ===== ゲームデータ =====
'use strict';

const WATER = {
  fresh:    { name: '淡水',  full: '熱帯淡水ブース', icon: '🌿', rank: 1, base: 300,
              top: '#66c9b9', bot: '#2b867d', ground: '#c9a66b', ground2: '#9c7a45', ray: 0.10 },
  river:    { name: '川',    full: '渓流ブース',     icon: '🏞️', rank: 1, base: 400,
              top: '#86d0ea', bot: '#3f8fb3', ground: '#a7a49a', ground2: '#6f6c64', ray: 0.12 },
  sea:      { name: '海水',  full: '海水ブース',     icon: '🐠', rank: 2, base: 800,
              top: '#58a8f0', bot: '#2463c4', ground: '#f0cf68', ground2: '#c99c3a', ray: 0.13 },
  jelly:    { name: 'クラゲ', full: 'クラゲブース',   icon: '🪼', rank: 3, base: 1200,
              top: '#163a78', bot: '#040c26', ground: '#1c2440', ground2: '#121830', ray: 0.04 },
  brackish: { name: '汽水',  full: '汽水ブース',     icon: '🌾', rank: 4, base: 1500,
              top: '#86b39a', bot: '#456e5a', ground: '#8f7553', ground2: '#5f4c33', ray: 0.08 },
  deep:     { name: '深海',  full: '深海ブース',     icon: '🌑', rank: 6, base: 4000,
              top: '#1a3266', bot: '#03081c', ground: '#3b3d55', ground2: '#25263a', ray: 0.03 },
};
const WATER_KEYS = ['fresh', 'river', 'sea', 'jelly', 'brackish', 'deep'];

const RARITY_APPEAL = [0, 3, 6, 12, 25, 60];
const RARITY_PRICE  = [0, 60, 250, 1000, 4000, 18000];
const RARITY_WEIGHT = [0, 50, 30, 14, 5, 1.2];
const RARITY_BREED  = [0, 0.12, 0.08, 0.055, 0.035, 0.018];
const RARITY_GROW   = [0, 90, 150, 240, 360, 600]; // 秒

// F(id, 名前, 水, レア度, 形, "体,腹,ヒレ,尾", 模様, 形オプション, 説明)
function F(id, name, w, r, shape, cols, pat, o, desc) {
  const c = cols.split(',');
  return { id, name, w, r, shape, c: { b: c[0], l: c[1] || c[0], f: c[2] || c[0], t: c[3] || c[2] || c[0] },
           pat: pat || [], o: o || {}, desc: desc || '' };
}

const SPECIES = [
  // ---------- 熱帯淡水 ----------
  F('neon', 'ネオンテトラ', 'fresh', 1, 'tiny', '#9aa7c4,#e8e8f0,#c8d0e0', [['hstripe', '#2ef0ff', -0.55, -0.05, 0.1, 1], ['hstripe', '#ff2f4f', 0.0, 0.8, 0, 0.55]], {}, '青く光るラインが美しい小型カラシン。群れで泳ぐ。'),
  F('cardinal', 'カーディナルテトラ', 'fresh', 2, 'tiny', '#9aa7c4,#ff2f4f,#c8d0e0', [['hstripe', '#2ef0ff', -0.55, -0.05, 0.05, 1], ['hstripe', '#ff2f4f', 0.0, 1, 0, 1]], {}, 'ネオンテトラより赤い帯が長い。'),
  F('guppy_r', 'グッピー(レッド)', 'fresh', 1, 'guppy', '#d8c8b0,#f0e8d8,#ff4a3a,#ff4a3a', [['spots', '#ff8a5a', 0.25, 3]], {}, '大きな尾びれを持つ卵胎生メダカ。'),
  F('guppy_b', 'グッピー(ブルー)', 'fresh', 1, 'guppy', '#c8d0d8,#f0f0f0,#3a7aff,#3a7aff', [['spots', '#7ab0ff', 0.25, 5]], {}, '青いドレスのような尾びれ。'),
  F('betta', 'ベタ', 'fresh', 2, 'betta', '#d8262e,#e84a4a,#c01822,#d8262e', [], {}, '闘魚とも呼ばれる。ひらひらのヒレが魅力。'),
  F('betta_hm', 'ベタ(ハーフムーン)', 'fresh', 3, 'betta', '#4a64e8,#7a8cf0,#2840c8,#2a4ad0', [['wave', '#7ef0ff', 0.9, 0.75]], { tl: 11 }, '尾びれが半月状に180度開く品種。'),
  F('angel', 'エンゼルフィッシュ', 'fresh', 2, 'angel', '#e8e8e0,#f8f8f0,#d8d8d0', [['bands', '#2a2a2a', null, 3, 0.05, 0.25, 0.8]], {}, '三角形のシルエットが優雅な南米のシクリッド。'),
  F('discus', 'ディスカス', 'fresh', 4, 'tall', '#d84a2a,#e86a3a,#c83a1a', [['wave', '#3ab8e8', 1.1, 0.5]], { L: 14, H: 14, dor: 1, e: 2 }, '熱帯魚の王様。円盤のような体。'),
  F('platy', 'プラティ', 'fresh', 1, 'small', '#ff8a1a,#ffb04a,#ff7a10', [], { L: 9, H: 5 }, '丈夫で飼いやすい卵胎生魚。'),
  F('molly', 'ブラックモーリー', 'fresh', 1, 'small', '#2a2a34,#3a3a46,#24242c', [], { L: 10, H: 5, dor: 2 }, '真っ黒な体の卵胎生魚。'),
  F('zebra', 'ゼブラダニオ', 'fresh', 1, 'tiny', '#e8d890,#f0e8c0,#d8c880', [['hlines', '#2a4ab8', 2, 0]], { L: 9 }, 'しま模様の元気な小魚。'),
  F('rummy', 'ラミーノーズテトラ', 'fresh', 2, 'tiny', '#c8ccd0,#e8e8e8,#e0e0e0,#ffffff', [['front', '#ff2a2a', 0.7]], { tailBars: '#1a1a1a' }, '鼻先の赤が水質のバロメーター。'),
  F('cherry', 'チェリーバルブ', 'fresh', 1, 'tiny', '#e83a3a,#ff6a5a,#d82a2a', [['hstripe', '#8a1a1a', -0.15, 0.1, 0, 1]], { L: 9, H: 5 }, 'さくらんぼ色の小型バルブ。'),
  F('cory', 'コリドラス', 'fresh', 1, 'cat', '#c8b898,#e8dcc0,#c0b090', [['spots', '#5a4a3a', 0.25, 7]], { L: 11, H: 6, dor: 2 }, '底でちょこちょこ動く愛嬌もの。'),
  F('pleco', 'プレコ', 'fresh', 2, 'cat', '#4a4034,#6a5a48,#3a3228', [['spots', '#e8d8a8', 0.3, 9]], { L: 18, H: 6, dor: 3 }, '吸盤状の口でガラスに張り付く。'),
  F('otocin', 'オトシンクルス', 'fresh', 1, 'cat', '#a89878,#e0d8c0,#a09070', [['hstripe', '#3a3228', -0.2, 0.1, 0, 1]], { L: 9, H: 4, wh: false }, 'コケ取り名人の小型ナマズ。'),
  F('piranha', 'ピラニア・ナッテリー', 'fresh', 2, 'std', '#9aa0a8,#ff4a2a,#7a8088', [['spots', '#d8e0e8', 0.25, 11]], { H: 10 }, '鋭い歯を持つが、実は臆病。'),
  F('oscar', 'オスカー', 'fresh', 2, 'std', '#3a3a30,#5a4a30,#2a2a24', [['blob', '#ff8a2a', 2.5, 0.62, 13]], { L: 18, H: 10, tail: 'round' }, '飼い主を覚えるといわれる大型シクリッド。'),
  F('gourami', 'ドワーフグラミー', 'fresh', 1, 'tall', '#3a8ae8,#e84a3a,#e85a3a', [['vbars', '#e84a3a', 3, 1]], { L: 10, H: 8 }, '赤と青の縦じまが鮮やか。'),
  F('arowana', 'シルバーアロワナ', 'fresh', 4, 'long', '#c8d0d8,#e8ecf0,#a8b0b8', [['scales', '#e8f0f8']], { L: 30, H: 7, wh: true }, '古代魚。下あごにひげがある。'),
  F('arowana_r', 'アジアアロワナ(紅龍)', 'fresh', 5, 'long', '#e84a3a,#ff8a5a,#c82a1a', [['scales', '#ffd08a']], { L: 30, H: 7, wh: true }, '龍魚とも呼ばれる幻の高級魚。'),
  F('polypterus', 'ポリプテルス', 'fresh', 3, 'long', '#7a8060,#c8c090,#6a7050', [['blob', '#3a3a2a', 2, 0.6, 21]], { L: 24, H: 5, dor: 5 }, '背びれが小旗のように並ぶ古代魚。'),
  F('arapaima', 'ピラルク', 'fresh', 5, 'long', '#6a7a6a,#c84a3a,#5a6a5a,#c83a2a', [['rear', '#c84a3a', 0.25]], { L: 38, H: 10 }, '世界最大級の淡水魚。'),
  F('eeleel', 'デンキウナギ', 'fresh', 4, 'eel', '#4a4a3a,#e8a050,#3a3a2a', [], { L: 34, H: 5 }, '強力な電気を出す。実はウナギの仲間ではない。'),
  F('redbee', 'レッドビーシュリンプ', 'fresh', 2, 'shrimp', '#e83a3a,#ffffff,#e83a3a', [], {}, '紅白模様の小さなエビ。'),
  F('wakin', '和金', 'fresh', 1, 'std', '#ff6a1a,#ffa04a,#ff6a1a', [], { L: 13, H: 7 }, 'もっとも原種に近い体型の金魚。'),
  F('ryukin', '琉金', 'fresh', 2, 'round', '#ff4a1a,#ffffff,#ff6a3a', [['blob', '#ffffff', 2, 0.6, 31]], {}, '丸い体と長いヒレの優雅な金魚。'),
  F('demekin', '黒出目金', 'fresh', 2, 'round', '#24242c,#3a3a44,#2a2a34', [], { bigEye: 2 }, '飛び出た目がチャームポイント。'),
  F('ranchu', 'らんちゅう', 'fresh', 3, 'ranchu', '#ff5a1a,#ffffff,#ff6a3a', [['blob', '#ffffff', 2, 0.55, 41], ['front', '#ff8a5a', 0.82]], {}, '背びれのない「金魚の王様」。'),
  F('killi', 'アフィオセミオン', 'fresh', 3, 'small', '#4a8ae8,#ffd04a,#e85a3a', [['spots', '#e83a3a', 0.35, 43]], { L: 10, H: 5, tail: 'lyre' }, 'カラフルな卵生メダカ(キリフィッシュ)。'),
  F('tiger', 'スマトラ', 'fresh', 1, 'small', '#e8c050,#f0e0a0,#e84a2a', [['bands', '#1a1a1a', null, 4, 0.045, 0.1, 0.85]], { L: 10, H: 7 }, '4本の黒い縦帯がトレードマーク。'),
  F('apisto', 'アピストグラマ', 'fresh', 3, 'small', '#e8c84a,#5ab0e8,#e83a2a', [['hstripe', '#2a2a2a', -0.1, 0.12, 0, 0.9]], { L: 11, H: 6, dor: 2 }, '小型シクリッド。オスはヒレが派手。'),

  // ---------- 渓流・日本の淡水 ----------
  F('medaka', 'メダカ', 'river', 1, 'tiny', '#9a9a7a,#d8d8c0,#a0a080', [], { L: 8 }, '日本の田んぼや小川の小さな魚。'),
  F('himedaka', 'ヒメダカ', 'river', 1, 'tiny', '#ffb04a,#ffd890,#ffb04a', [], { L: 8 }, '黄色いメダカ。観賞用に改良された。'),
  F('miyuki', '幹之メダカ', 'river', 3, 'tiny', '#c8d8e8,#eef4ff,#c8d8e8', [['hstripe', '#7af8ff', -1, -0.55, 0, 1]], { L: 8 }, '背中が青白く光る人気の改良メダカ。'),
  F('ayu', 'アユ', 'river', 2, 'slim', '#8a9a6a,#e8e8d0,#9aa078', [['band', '#ffd84a', 0.62, 0.06, -0.3, 0.3]], {}, 'スイカのような香りの清流の女王。'),
  F('yamame', 'ヤマメ', 'river', 2, 'slim', '#9aa088,#e8e0d8,#a0a090', [['parr', '#4a5a6a', 6], ['spots', '#2a2a2a', 0.08, 51]], {}, '体側の小判型の模様(パーマーク)が特徴。'),
  F('amago', 'アマゴ', 'river', 2, 'slim', '#9aa088,#e8e0d8,#a0a090', [['parr', '#4a5a6a', 6], ['spots', '#ff4a2a', 0.1, 52]], {}, 'ヤマメに似るが朱色の点がある。'),
  F('iwana', 'イワナ', 'river', 3, 'slim', '#5a6a5a,#e8c890,#5a6050', [['spots', '#f0f0e0', 0.22, 53]], {}, '源流に棲む渓流の王者。'),
  F('niji', 'ニジマス', 'river', 2, 'slim', '#9aa8a0,#f0f0f0,#a0a8a0', [['hstripe', '#ff6a8a', -0.15, 0.25, 0, 1], ['spots', '#2a2a2a', 0.15, 54]], {}, '体側の虹色の帯が名前の由来。'),
  F('oikawa', 'オイカワ', 'river', 2, 'std', '#7ab0c8,#e8e8f0,#ff6a4a', [['vbars', '#5a8ae8', 3, 1], ['belly', '#ff6a8a', 0.5]], { L: 14, H: 6 }, '婚姻色のオスは虹色に輝く。'),
  F('kawamutsu', 'カワムツ', 'river', 1, 'std', '#a0a088,#e8e8d8,#c8a860', [['hstripe', '#3a3a5a', -0.15, 0.15, 0, 0.9]], { L: 13, H: 6 }, '川の中流でよく見られる身近な魚。'),
  F('ugui', 'ウグイ', 'river', 1, 'std', '#8a9078,#e8e8e0,#a09878', [['hstripe', '#e8503a', 0.25, 0.5, 0, 0.9]], { L: 15, H: 6 }, '産卵期には赤い婚姻色が出る。'),
  F('funa', 'ギンブナ', 'river', 1, 'std', '#a8a070,#d8d0a0,#988f60', [['scales', '#c8c090']], { L: 14, H: 8 }, '池や川にいる身近なフナ。'),
  F('koi', 'マゴイ', 'river', 2, 'big', '#4a4a38,#a89a68,#3a3a2a', [['scales', '#6a6a50']], { wh: true }, 'たくましい真鯉。ひげが4本。'),
  F('nishiki', '錦鯉(紅白)', 'river', 3, 'big', '#f8f8f0,#ffffff,#f0f0e8', [['blob', '#e8301a', 3, 0.5, 61]], { wh: true }, '泳ぐ宝石と呼ばれる日本の誇り。'),
  F('ogon', '錦鯉(黄金)', 'river', 4, 'big', '#f0c030,#ffe080,#e8b020', [['scales', '#fff0a0']], { wh: true }, '全身が金色に輝く錦鯉。'),
  F('showa', '錦鯉(昭和三色)', 'river', 4, 'big', '#f8f8f0,#ffffff,#2a2a2a', [['blob', '#e8301a', 3, 0.55, 62], ['blob', '#1a1a1a', 2.5, 0.68, 63]], { wh: true }, '紅・白・墨の三色が織りなす錦鯉。'),
  F('namazu', 'ナマズ', 'river', 2, 'cat', '#5a5a48,#c8c0a0,#4a4a3a', [['blob', '#3a3a2a', 2, 0.62, 71]], { L: 22, H: 7, dor: 0 }, '長いひげで獲物を探す夜行性の魚。'),
  F('dojo', 'ドジョウ', 'river', 1, 'eel', '#a89068,#d8c8a0,#988058', [['spots', '#5a4a30', 0.3, 72]], { L: 16, H: 3, wh: true, bottom: true }, '田んぼのおなじみ。口ひげは10本。'),
  F('unagi', 'ニホンウナギ', 'river', 3, 'eel', '#3a4a3a,#d8d8b0,#3a4a3a', [], { L: 30, H: 4 }, '遠く南の海で生まれる不思議な魚。'),
  F('tanago', 'ヤリタナゴ', 'river', 2, 'tall', '#a8b0a8,#e8e0f0,#ff8a6a', [['hstripe', '#4a8ac8', -0.1, 0.1, 0, 0.7]], { L: 11, H: 7, tail: 'fork' }, '二枚貝に卵を産む小さな魚。'),
  F('oyanirami', 'オヤニラミ', 'river', 3, 'std', '#a0906a,#d8c8a0,#a08860', [['vbars', '#6a5a3a', 4, 2], ['band', '#2a4ae8', 0.25, 0.05, -0.6, -0.2]], { L: 13, H: 8, tail: 'round', dor: 2 }, 'えらぶたに目玉模様がある。'),
  F('yoshinobori', 'ヨシノボリ', 'river', 1, 'goby', '#b0a080,#e0d0b0,#a09070', [['spots', '#6a5a40', 0.3, 81]], {}, '吸盤状の腹びれで岩に張り付くハゼ。'),
  F('kajika', 'カジカ', 'river', 2, 'goby', '#7a7058,#c8b890,#6a6048', [['blob', '#4a4030', 2, 0.55, 82]], { L: 13, H: 6 }, 'きれいな川の石の下にひそむ。'),
  F('sawagani', 'サワガニ', 'river', 1, 'crab', '#c86a3a,#e8a070,#c06030', [], {}, '一生を淡水で過ごすカニ。'),
  F('sujiebi', 'スジエビ', 'river', 1, 'shrimp', '#c8d0c8,#2a3a4a,#c8d0c8', [], { alpha: 0.85 }, '体に黒いすじが入った透明なエビ。'),
  F('ito', 'イトウ', 'river', 5, 'slim', '#6a7060,#d8c8b8,#7a7060,#c84a3a', [['spots', '#2a2a2a', 0.12, 91], ['belly', '#e8a090', 0.55]], { L: 34, H: 8 }, '日本最大の淡水魚。幻の魚と呼ばれる。'),
  F('sake', 'シロザケ', 'river', 3, 'slim', '#8a9aa0,#e8e8e8,#7a8a90', [['vbars', '#a05a7a', 5, 2]], { L: 26, H: 8 }, '生まれた川に帰ってくる。'),
  F('kusagame', 'クサガメ', 'river', 3, 'turtle', '#6a5a3a,#e8d8a0,#5a6040', [], {}, '昔から日本にいる淡水のカメ。'),
  F('ohsansho', 'オオサンショウウオ', 'river', 5, 'cat', '#6a5a3a,#8a7a58,#5a4a30', [['blob', '#3a3020', 1.8, 0.58, 93]], { L: 32, H: 7, dor: 0, tail: 'round', wh: false, legs: true }, '特別天然記念物。生きた化石。'),

  // ---------- 海水 ----------
  F('clown', 'カクレクマノミ', 'sea', 1, 'small', '#ff7a1a,#ff8a2a,#ff7a1a', [['bands', '#ffffff', '#1a1a1a', 3, 0.06, 0.12, 0.78]], { L: 12, H: 7 }, 'イソギンチャクと共生する人気者。'),
  F('hanabira', 'ハナビラクマノミ', 'sea', 2, 'small', '#ffb8a0,#ffd0c0,#ffa890', [['band', '#ffffff', 0.78, 0.04, -1, 1], ['hstripe', '#ffffff', -1, -0.7, 0, 1]], { L: 12, H: 7 }, '背中に白い一本線が入る。'),
  F('bluetang', 'ナンヨウハギ', 'sea', 2, 'tall', '#2a5cff,#3a6cff,#1a3cc8,#ffd21a', [['wave', '#1a1a3a', 0.5, 0.82]], { L: 15, H: 10, tail: 'fork' }, '鮮やかな青と黄色の尾が目を引く。'),
  F('yellowtang', 'キイロハギ', 'sea', 2, 'tall', '#ffe01a,#ffe84a,#ffd800', [], { L: 13, H: 11 }, '全身レモンイエローのハギ。'),
  F('idol', 'ツノダシ', 'sea', 3, 'angel', '#f8f8f0,#ffffff,#2a2a2a', [['bands', '#1a1a1a', null, 2, 0.1, 0.3, 0.75], ['rear', '#ffd81a', 0.22]], { L: 10, H: 11 }, '長い背びれをなびかせる優雅な魚。'),
  F('debasuzume', 'デバスズメダイ', 'sea', 1, 'tiny', '#7ae8d8,#b0f8f0,#6ad8c8', [], { L: 9, H: 5 }, 'サンゴの周りを群れで泳ぐ。'),
  F('rurisuzume', 'ルリスズメダイ', 'sea', 1, 'tiny', '#1a6bff,#ffd21a,#1a5be8,#1a6bff', [], { L: 9, H: 5 }, '瑠璃色の小さな宝石。'),
  F('lionfish', 'ハナミノカサゴ', 'sea', 3, 'std', '#e8c8b0,#f8e8d8,#c84a3a', [['vbars', '#a83020', 2, 1]], { L: 15, H: 9, dor: 3, tail: 'round', finRays: true }, '毒のあるトゲを持つ優雅な魚。'),
  F('butterfly', 'トゲチョウチョウウオ', 'sea', 2, 'tall', '#f8f8f0,#ffe04a,#ffd81a', [['band', '#1a1a1a', 0.8, 0.05, -1, 1], ['rear', '#ffd81a', 0.35]], { L: 12, H: 10 }, 'チョウのようにひらひら泳ぐ。'),
  F('emperor', 'タテジマキンチャクダイ', 'sea', 4, 'tall', '#1a3ab8,#2a4ac8,#ffd81a,#ffd81a', [['hlines', '#ffd81a', 2, 1], ['front', '#1a1a3a', 0.82]], { L: 16, H: 12 }, '幼魚と成魚で模様がまったく違う。'),
  F('flame', 'フレームエンゼル', 'sea', 3, 'tall', '#ff3a1a,#ff6a2a,#ff2a1a', [['vbars', '#5a0a0a', 3, 1]], { L: 10, H: 8 }, '炎のように赤い小型ヤッコ。'),
  F('mandarin', 'ニシキテグリ', 'sea', 3, 'goby', '#ff8a1a,#3ab8e8,#3a8ae8', [['wave', '#2a6ae8', 1.3, 0.3]], { L: 11, H: 6 }, '世界一派手とも言われる模様。'),
  F('gramma', 'ロイヤルグラマ', 'sea', 2, 'small', '#ffd81a,#ffe04a,#ffd81a', [['front', '#a83ae8', 0.45]], { L: 10, H: 5 }, '前半は紫、後半は黄色のツートン。'),
  F('harisenbon', 'ハリセンボン', 'sea', 2, 'puffer', '#e0d0a0,#ffffff,#d0c090', [['spots', '#6a5030', 0.25, 101]], { spikes: true }, '膨らむとトゲが立つ。針は千本もない。'),
  F('hakofugu', 'ハコフグ', 'sea', 2, 'box', '#ffd81a,#ffe84a,#ffd000', [['spots', '#1a1a1a', 0.2, 102]], {}, '箱のような四角い体。'),
  F('seahorse', 'タツノオトシゴ', 'sea', 2, 'seahorse', '#e8a830,#ffd070,#d89820', [], {}, 'オスがお腹の袋で子育てをする。'),
  F('mizukurage', 'ミズクラゲ', 'jelly', 1, 'jelly', '#d8ecff,#f0f8ff,#c0d8f0', [['leaf', '#ffb0d0']], { bw: 15, bh: 6, bell: 'flat', tent: 14, tl: 4, arms: 6, armW: 1.5, alpha: 0.72 }, '四つ葉の模様が透けて見える、いちばん身近なクラゲ。'),
  F('kasago', 'カサゴ', 'sea', 1, 'std', '#c84a3a,#e8a080,#b83a2a', [['blob', '#7a2018', 2, 0.6, 111]], { L: 14, H: 8, tail: 'round', dor: 2 }, '岩場にひそむ根魚。'),
  F('madai', 'マダイ', 'sea', 2, 'std', '#ff8a9a,#ffd8d8,#ff7a8a', [['spots', '#4ab8ff', 0.12, 112]], { L: 18, H: 10 }, 'めでたい魚の代表。青い斑点がある。'),
  F('ishidai', 'イシダイ', 'sea', 2, 'std', '#e8e8e0,#f0f0e8,#3a3a3a', [['bands', '#2a2a2a', null, 7, 0.035, 0.05, 0.95]], { L: 16, H: 10 }, '7本の黒い縞模様。'),
  F('kawahagi', 'カワハギ', 'sea', 1, 'tall', '#c8b890,#e8dcc0,#b8a878', [['spots', '#8a7a5a', 0.2, 113]], { L: 13, H: 9, tail: 'round' }, '皮をはいで料理することが名前の由来。'),
  F('utsubo', 'ウツボ', 'sea', 2, 'eel', '#a08030,#c8a850,#8a6a20', [['blob', '#4a3010', 1.8, 0.55, 121]], { L: 32, H: 6 }, '岩の隙間から顔を出すハンター。'),
  F('hanahige', 'ハナヒゲウツボ', 'sea', 4, 'eel', '#1a3ae8,#ffd81a,#ffd81a', [], { L: 32, H: 4 }, '成長とともに黒→青→黄と色が変わる。'),
  F('chinanago', 'チンアナゴ', 'sea', 2, 'eel', '#f0f0e8,#ffffff,#f0f0e8', [['spots', '#2a2a2a', 0.15, 122]], { L: 18, H: 3 }, '砂から顔を出してゆらゆら。'),
  F('picasso', 'ムラサメモンガラ', 'sea', 3, 'tall', '#f0e8d0,#ffffff,#3a3a3a', [['hstripe', '#3a6ab8', -0.1, 0.3, 0.25, 0.75], ['band', '#ffd81a', 0.82, 0.04, 0, 0.6], ['rear', '#1a1a1a', 0.2]], { L: 15, H: 10, tail: 'round' }, 'ピカソが描いたような模様のフグの仲間。'),
  F('napoleon', 'メガネモチノウオ', 'sea', 5, 'big', '#2ab89a,#4ad8b8,#1a9a7a', [['wave', '#1a6a5a', 0.7, 0.6]], { L: 30, H: 14, tail: 'round', hump: true }, '別名ナポレオンフィッシュ。額のこぶが特徴。'),
  F('manta', 'オニイトマキエイ', 'sea', 5, 'ray', '#2a2a3a,#f0f0f0,#2a2a3a', [], { W: 30 }, 'マンタ。翼のようなヒレで大海原を舞う。'),
  F('akaei', 'アカエイ', 'sea', 2, 'ray', '#a07050,#f0e0c0,#906040', [], { W: 20 }, '尾に毒のトゲを持つエイ。'),
  F('nemuri', 'ネムリブカ', 'sea', 3, 'shark', '#8a9098,#f0f0f0,#7a8088', [['finTip', '#ffffff']], {}, '昼間は岩陰で眠るサメ。'),
  F('torafu', 'トラフザメ', 'sea', 4, 'shark', '#d8c070,#f0e8c0,#c8b060', [['spots', '#3a2a1a', 0.2, 131]], { L: 32 }, 'ヒョウ柄のおとなしいサメ。'),
  F('jinbe', 'ジンベエザメ', 'sea', 5, 'shark', '#3a5a8a,#e8f0f8,#2a4a7a', [['spots', '#e8f0ff', 0.2, 132], ['hlines', '#6a8ab8', 3, 0]], { L: 44, H: 12 }, '世界最大の魚。性格はとてもおだやか。'),
  F('iwashi', 'マイワシ', 'sea', 1, 'slim', '#3a6ab8,#e8eef8,#5a7ab8', [['spots', '#1a2a5a', 0.06, 141]], { L: 13, H: 4 }, '大群で泳ぐ海の小魚。'),
  F('aji', 'マアジ', 'sea', 1, 'slim', '#7a9ab0,#e8ecf0,#c8c070', [['hstripe', '#e8d860', -0.05, 0.12, 0, 1]], { L: 15, H: 5 }, '側線にそって「ぜんご」というウロコがある。'),
  F('buri', 'ブリ', 'sea', 2, 'slim', '#3a6a9a,#e8e8f0,#c8c040', [['hstripe', '#ffe04a', -0.1, 0.1, 0, 1]], { L: 26, H: 7 }, '成長すると名前が変わる出世魚。'),
  F('maguro', 'クロマグロ', 'sea', 4, 'tuna', '#1a2a5a,#c8d0e0,#3a4a7a', [['finlets', '#ffd81a']], {}, '時速80kmで泳ぐ海の弾丸。'),
  F('skunk', 'スカンクシュリンプ', 'sea', 2, 'shrimp', '#ff6a3a,#ffffff,#ff6a3a', [], {}, '他の魚を掃除するクリーナーシュリンプ。'),
  F('ishigani', 'イシガニ', 'sea', 1, 'crab', '#5a6a8a,#c8b8a0,#4a5a7a', [], {}, '磯でよく見かけるワタリガニの仲間。'),
  F('aoumigame', 'アオウミガメ', 'sea', 5, 'turtle', '#5a7a4a,#e8d8a0,#7a8a5a', [], { S: 1.6 }, '海を旅する大きなカメ。'),
  F('hatatate', 'ハタタテダイ', 'sea', 2, 'angel', '#f8f8f0,#ffffff,#ffd81a', [['bands', '#1a1a1a', null, 2, 0.08, 0.35, 0.72]], { L: 10, H: 10, tail: 'round' }, 'ツノダシに似るが別の仲間。'),
  F('kumanomi', 'クマノミ', 'sea', 2, 'small', '#3a2a1a,#ff8a1a,#ffa02a,#ffd8a0', [['bands', '#ffffff', null, 2, 0.06, 0.55, 0.85], ['belly', '#ff8a1a', 0.25]], { L: 13, H: 8 }, '日本でも見られるクマノミ。'),

  // ---------- 汽水 ----------
  F('tobihaze', 'ミナミトビハゼ', 'brackish', 2, 'goby', '#8a8068,#c8c0a0,#5a7ab8', [['spots', '#3ab8e8', 0.18, 151]], { bigEye: 1 }, '陸に上がって跳ね回るハゼ。'),
  F('teppo', 'テッポウウオ', 'brackish', 3, 'std', '#e8e0b0,#ffffff,#e8d070', [['bands', '#1a1a1a', null, 4, 0.04, 0.15, 0.8]], { L: 14, H: 8 }, '水鉄砲で虫を撃ち落とす名ハンター。'),
  F('midorifugu', 'ミドリフグ', 'brackish', 2, 'puffer', '#9ad83a,#ffffff,#8ac82a', [['spots', '#1a2a1a', 0.25, 152]], { L: 11, H: 8 }, '黄緑色に黒い斑点のかわいいフグ。'),
  F('suzuki', 'スズキ', 'brackish', 2, 'slim', '#8a9aa8,#e8ecf0,#7a8a98', [], { L: 26, H: 7, dor: 2 }, 'セイゴ→フッコ→スズキと名前が変わる。'),
  F('bora', 'ボラ', 'brackish', 1, 'slim', '#7a8a98,#e0e4e8,#6a7a88', [['hlines', '#5a6a78', 2, 0]], { L: 20, H: 6 }, '水面からジャンプすることがある。'),
  F('akame', 'アカメ', 'brackish', 4, 'big', '#a8b0b8,#e8ecf0,#8a9098', [], { eyeColor: '#ff2a2a', bigEye: 1 }, '光を当てると目が赤く光る日本固有種。'),
  F('mahaze', 'マハゼ', 'brackish', 1, 'goby', '#b0a888,#e8e0c8,#a09878', [['spots', '#6a6048', 0.25, 153]], { L: 13 }, '秋のハゼ釣りでおなじみ。'),
  F('shimaisaki', 'シマイサキ', 'brackish', 1, 'std', '#c8c8b8,#f0f0e8,#b8b8a8', [['hlines', '#4a4a3a', 2, 1]], { L: 13, H: 6 }, 'グーグーと鳴く縞模様の魚。'),
  F('mokuzu', 'モクズガニ', 'brackish', 2, 'crab', '#6a6040,#a89870,#5a5030', [], { hairy: true }, 'はさみにふさふさの毛が生えたカニ。'),
  F('gazami', 'ガザミ', 'brackish', 3, 'crab', '#4a6ab8,#e8e0c8,#3a5aa8', [], { S: 1.2 }, '泳ぐのが得意なワタリガニ。'),
  F('scat', 'スキャット', 'brackish', 2, 'tall', '#8a9a6a,#c8d0a0,#7a8a5a', [['spots', '#2a2a1a', 0.25, 154]], { L: 12, H: 11 }, 'マングローブ域にすむ丸い魚。'),
  F('monodactylus', 'モノダクティルス', 'brackish', 2, 'angel', '#e0e8f0,#ffffff,#ffd81a', [['band', '#2a2a2a', 0.72, 0.03, -1, 1]], { L: 10, H: 10 }, '銀色に輝く菱形の魚。'),

  // ---------- 深海 ----------
  F('anko', 'チョウチンアンコウ', 'deep', 4, 'puffer', '#2a2a3a,#3a3a4a,#20202c', [], { lure: true, L: 14, H: 11, teeth: true }, '頭のちょうちんで獲物をおびき寄せる。'),
  F('ryugu', 'リュウグウノツカイ', 'deep', 5, 'eel', '#d8e0f0,#ffffff,#ff3a5a', [['spots', '#8a9ab8', 0.08, 161]], { L: 44, H: 6, dor: 6 }, '人魚伝説のモデルともいわれる。'),
  F('mendako', 'メンダコ', 'deep', 4, 'dumbo', '#ff8a6a,#ffb8a0,#ff7a5a', [], {}, '耳のようなヒレで泳ぐ深海のタコ。'),
  F('gusokumushi', 'ダイオウグソクムシ', 'deep', 4, 'isopod', '#c8b8a8,#e0d8c8,#a89888', [], {}, '何年も絶食できる深海のダンゴムシ。'),
  F('takaashi', 'タカアシガニ', 'deep', 3, 'crab', '#e8783a,#ffe0c0,#e86a2a', [['spots', '#ffffff', 0.15, 162]], { S: 1.6, longLegs: true }, '脚を広げると3mを超える世界最大のカニ。'),
  F('demenigisu', 'デメニギス', 'deep', 5, 'std', '#3a3a4a,#5a5a6a,#2a2a3a', [], { headGlass: true, L: 15, H: 7 }, '頭が透明なドームでおおわれている。'),
  F('mitsukuri', 'ミツクリザメ', 'deep', 4, 'shark', '#e8a8a8,#f8d8d8,#d89898', [], { snout: 5, L: 32 }, 'ゴブリンシャークとも呼ばれる。'),
  F('rabuka', 'ラブカ', 'deep', 4, 'eel', '#5a4a3a,#8a7a6a,#4a3a2a', [], { L: 34, H: 5, gills: true }, '3億年前から姿が変わらない古代ザメ。'),
  F('kinmedai', 'キンメダイ', 'deep', 2, 'std', '#e8302a,#ff8a7a,#e8302a', [], { L: 16, H: 9, bigEye: 2, eyeColor: '#ffd81a' }, '金色に光る大きな目を持つ。'),
  F('hotaruika', 'ホタルイカ', 'deep', 2, 'squid', '#8a4a6a,#b86a8a,#7a3a5a', [['spots', '#6af8ff', 0.3, 163]], { glow: '#6af8ff' }, '体中が青く光る小さなイカ。'),
  F('benikurage', 'ベニクラゲ', 'jelly', 3, 'jelly', '#ffd0d8,#ff3a5a,#ffa0b0', [['gonad', '#ff2a4a']], { bw: 7, bh: 7, bell: 'bullet', tent: 12, tl: 7, alpha: 0.8 }, '若返りを繰り返す「不老不死」のクラゲ。'),
  F('coela', 'シーラカンス', 'deep', 5, 'big', '#2a3a6a,#3a4a7a,#2a3a6a', [['spots', '#e8f0ff', 0.12, 164]], { tail: 'round', L: 28, H: 11, lobes: true }, '生きた化石。肉厚のヒレを持つ。'),
  F('onikinme', 'オニキンメ', 'deep', 3, 'std', '#3a2a2a,#4a3a3a,#2a1a1a', [], { L: 13, H: 9, teeth: true, bigEye: 1 }, '大きな牙を持つ深海魚。'),
  F('nutaunagi', 'ヌタウナギ', 'deep', 2, 'eel', '#d89898,#e8b8b8,#c88888', [], { L: 24, H: 4 }, '大量のネバネバを出すことで有名。'),
  F('hatchet', 'ムネエソ', 'deep', 3, 'tall', '#c8d0e0,#f0f4ff,#a8b0c0', [['spots', '#6af8ff', 0.12, 165]], { L: 9, H: 9, tail: 'fork' }, '別名ハチェットフィッシュ。腹が光る。'),
  F('mizudako', 'ミズダコ', 'deep', 3, 'dumbo', '#c84a3a,#e88a6a,#b83a2a', [['spots', '#8a2a1a', 0.2, 166]], { S: 1.5 }, '世界最大のタコ。とても賢い。'),

  // ---------- クラゲ（あとから追加：並び順は末尾に足していく） ----------
  F('akakurage', 'アカクラゲ', 'jelly', 2, 'jelly', '#f8e8dc,#f07a5a,#d8604a', [['radial', '#d8503a', 16]], { bw: 14, bh: 8, tent: 10, tl: 18, arms: 13, armW: 2, alpha: 0.85 }, '傘に16本の赤いすじ。毒が強いので注意。'),
  F('takokurage', 'タコクラゲ', 'jelly', 2, 'jelly', '#c8a878,#e8d8b0,#b89868', [['dots', '#ffffff', 0.3]], { bw: 14, bh: 9, tent: 0, arms: 8, armW: 3, armN: 4, armClub: true, alpha: 0.9 }, '白い水玉もようと、タコの足のような口腕。'),
  F('sakasa', 'サカサクラゲ', 'jelly', 2, 'jelly', '#8aa870,#b8d898,#6a8858', [['radial', '#6a8a50', 10]], { bw: 14, bh: 4, bell: 'flat', tent: 0, arms: 5, armW: 3, armN: 4, flip: true, bottom: true }, '傘を下にして海の底でひっくり返っている。'),
  F('kabuto', 'カブトクラゲ', 'jelly', 2, 'jelly', '#e8f4ff,#ffffff,#d0e8ff', [['comb']], { bw: 9, bh: 15, bell: 'comb', tent: 0, alpha: 0.6 }, '光を反射して虹色に光るクシクラゲの仲間。'),
  F('urikurage', 'ウリクラゲ', 'jelly', 3, 'jelly', '#ffe0e8,#fff0f4,#ffd0e0', [['comb']], { bw: 8, bh: 18, bell: 'comb', tent: 0, alpha: 0.6 }, 'ウリのような形。カブトクラゲを食べる。'),
  F('bluejelly', 'ブルージェリー', 'jelly', 3, 'jelly', '#7ab0ff,#c8e0ff,#5a90e8', [['radial', '#4a70d8', 8]], { bw: 16, bh: 9, tent: 0, arms: 11, armW: 3, armN: 2 }, '鮮やかな青色の傘を持つ。'),
  F('seanettle', 'パシフィックシーネットル', 'jelly', 3, 'jelly', '#e8a040,#ffe8c0,#c87a2a', [['radial', '#b85a1a', 20]], { bw: 12, bh: 8, tent: 8, tl: 28, arms: 18, armW: 2 }, '長い触手をなびかせる、水族館の人気者。'),
  F('amakusa', 'アマクサクラゲ', 'jelly', 2, 'jelly', '#ffd8b0,#ff9a6a,#ff8a5a', [['rim', '#ff5a2a']], { bw: 10, bh: 7, tent: 8, tl: 14, arms: 8, armW: 2, alpha: 0.85 }, '傘のふちがオレンジ色に色づく。'),
  F('echizen', 'エチゼンクラゲ', 'jelly', 4, 'jelly', '#e8d8c0,#c8a888,#b89878', [['dots', '#a08060', 0.18]], { bw: 26, bh: 12, tent: 0, arms: 16, armW: 5, armN: 3 }, '傘の直径が2mにもなる巨大クラゲ。'),
  F('hanagasa', 'ハナガサクラゲ', 'jelly', 4, 'jelly', '#e8f0ff,#ff5ac8,#3ae8a0', [['rim', '#3ae8a0'], ['radial', '#ffa0e0', 12]], { bw: 12, bh: 10, bell: 'bullet', tent: 22, tl: 7, tentMix: true, alpha: 0.8 }, '花笠のようなカラフルな触手。'),
  F('giyaman', 'ギヤマンクラゲ', 'jelly', 3, 'jelly', '#f0f8ff,#ffffff,#d8ecff', [['gonad4', '#a8e8ff']], { bw: 10, bh: 9, bell: 'bullet', tent: 16, tl: 10, alpha: 0.55 }, 'ガラス細工のように透き通ったクラゲ。'),
  F('owan', 'オワンクラゲ', 'jelly', 3, 'jelly', '#e0f8f0,#ffffff,#c8f0e0', [['rim', '#6aff9a'], ['radial', '#a8ffd8', 24]], { bw: 15, bh: 6, bell: 'flat', tent: 20, tl: 8, alpha: 0.6 }, '緑色に光るタンパク質の研究でノーベル賞に。'),
  F('katsuo', 'カツオノエボシ', 'jelly', 4, 'jelly', '#8ad0ff,#4a7ae8,#4a5ae8', [], { bw: 14, bh: 7, bell: 'float', tent: 6, tl: 30, crest: '#ff8ae0', alpha: 0.85 }, '青い浮き袋で海面をただよう。電気クラゲとも。'),
  F('habu', 'ハブクラゲ', 'jelly', 4, 'jelly', '#e8f4ff,#ffffff,#d0e8ff', [], { bw: 10, bh: 10, bell: 'cube', tent: 8, tl: 22, alpha: 0.55 }, '四角い傘を持つ猛毒のハコクラゲ。'),
  F('andon', 'アンドンクラゲ', 'jelly', 2, 'jelly', '#f0f8ff,#ffffff,#ffb0c0', [], { bw: 7, bh: 8, bell: 'cube', tent: 4, tl: 16, alpha: 0.6 }, '行灯のような四角い形。お盆の頃に増える。'),
  F('yurei', 'ユウレイクラゲ', 'jelly', 5, 'jelly', '#fff0e0,#ffe0c0,#ffd8b0', [['radial', '#ffe8d0', 16]], { bw: 18, bh: 9, tent: 26, tl: 32, arms: 28, armW: 3, alpha: 0.6 }, '幽霊のように白く長い口腕をたなびかせる。'),
  F('daiou', 'ダイオウクラゲ', 'jelly', 5, 'jelly', '#8a1a2a,#a8303a,#6a1020', [], { bw: 22, bh: 10, tent: 0, arms: 26, armW: 4, armN: 4 }, '深海にすむ、口腕が10mにもなる幻のクラゲ。'),
  F('kamikurage', 'カミクラゲ', 'jelly', 3, 'jelly', '#fff0d8,#ffd890,#ffc870', [['gonad', '#ff8a3a']], { bw: 9, bh: 10, bell: 'bullet', tent: 28, tl: 12, alpha: 0.75 }, '髪の毛のようにたくさんの触手を持つ。'),
  F('komochi', 'コモチクラゲ', 'jelly', 2, 'jelly', '#f0e8ff,#ffffff,#e0d0ff', [['gonad', '#b88aff']], { bw: 6, bh: 6, bell: 'bullet', tent: 4, tl: 9, alpha: 0.7 }, '傘から子どものクラゲが生まれ出る。'),
  F('ginka', 'ギンカクラゲ', 'jelly', 3, 'jelly', '#e8eef8,#3a8aff,#2a6ae8', [['radial', '#c8d8f0', 18]], { bw: 12, bh: 3, bell: 'disc', tent: 16, tl: 5, tentMix: true }, '銀貨のような円盤と青い触手。'),
  F('kinchaku', 'キタユウレイクラゲ', 'jelly', 4, 'jelly', '#ffd8a0,#ffb070,#ffa060', [['gonad', '#e88040']], { bw: 20, bh: 9, tent: 30, tl: 20, arms: 14, armW: 3, alpha: 0.7 }, '北の海の巨大クラゲ。無数の触手を持つ。'),
  F('pinkjelly', 'カラージェリー(ピンク)', 'jelly', 1, 'jelly', '#ffc8e0,#ffe0f0,#ffb0d0', [['leaf', '#ff7ab0']], { bw: 13, bh: 6, bell: 'flat', tent: 12, tl: 4, arms: 5, armW: 1.5, alpha: 0.72 }, 'ライトアップで桃色に染まったミズクラゲ。'),
];

const SPECIES_MAP = {};
SPECIES.forEach((s, i) => { s.idx = i; SPECIES_MAP[s.id] = s; });

// ---------- 装飾 ----------
const DECOR = [
  { id: 'rock',      name: '岩',          price: 80,   appeal: 2,  kind: 'rock' },
  { id: 'rock2',     name: '大きな岩',    price: 200,  appeal: 4,  kind: 'rock', big: true },
  { id: 'plant',     name: '水草',        price: 60,   appeal: 2,  kind: 'plant' },
  { id: 'plant2',    name: 'ロタラ(赤い水草)', price: 150, appeal: 3, kind: 'plant', red: true },
  { id: 'kelp',      name: 'コンブ',      price: 120,  appeal: 3,  kind: 'kelp' },
  { id: 'coral',     name: '枝サンゴ',    price: 300,  appeal: 6,  kind: 'coral' },
  { id: 'coral2',    name: 'ソフトコーラル', price: 350, appeal: 6, kind: 'softcoral' },
  { id: 'anemone',   name: 'イソギンチャク', price: 400, appeal: 7, kind: 'anemone' },
  { id: 'shell',     name: '貝殻',        price: 50,   appeal: 1,  kind: 'shell' },
  { id: 'starfish',  name: 'ヒトデ',      price: 90,   appeal: 2,  kind: 'starfish' },
  { id: 'driftwood', name: '流木',        price: 250,  appeal: 5,  kind: 'driftwood' },
  { id: 'marimo',    name: 'マリモ',      price: 100,  appeal: 3,  kind: 'marimo' },
  { id: 'crystal',   name: '水晶',        price: 600,  appeal: 9,  kind: 'crystal' },
  { id: 'bubble',    name: 'エアストーン', price: 150, appeal: 2,  kind: 'bubble' },
  { id: 'chest',     name: '宝箱',        price: 800,  appeal: 10, kind: 'chest' },
  { id: 'castle',    name: '海底城',      price: 1500, appeal: 16, kind: 'castle' },
  { id: 'torii',     name: '鳥居',        price: 1200, appeal: 14, kind: 'torii' },
  { id: 'ship',      name: '沈没船',      price: 3000, appeal: 25, kind: 'ship' },
  { id: 'spawnmat',  name: '産卵床',      price: 500,  appeal: 1,  kind: 'spawnmat', breed: 0.5 },
  { id: 'lamp',      name: '深海ランプ',  price: 700,  appeal: 8,  kind: 'lamp' },
];
const DECOR_MAP = {};
DECOR.forEach(d => DECOR_MAP[d.id] = d);

const RANK_TITLES = ['', '小さな水槽屋', '町の水族館', '人気の水族館', '評判の水族館', '観光名所', '地方の名館', '全国区の水族館', '海の殿堂', '世界の水族館', '伝説の水族館'];
function rankTitle(r) { return RANK_TITLES[Math.min(r, RANK_TITLES.length - 1)] + (r >= RANK_TITLES.length ? ' ★' + (r - RANK_TITLES.length + 1) : ''); }
function rankNeed(r) { return Math.floor(250 * Math.pow(r, 2.25)); }
function maxRarityForRank(r) { return r >= 7 ? 5 : r >= 5 ? 4 : r >= 3 ? 3 : r >= 2 ? 2 : 1; }
