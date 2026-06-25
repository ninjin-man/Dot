'use strict';
/* === 登録/設定（カテゴリ配列方式）===================================
   1カテゴリ = 1オブジェクト = この配列の1行。
   ★カテゴリ追加  → CATEGORIES に1行足すだけ（html/engineは触らない）
   ★並べ替え/重ね順 → 行を上下に動かすだけ（上の行ほど下に描画＝奥）
   ★初期選択      → 各行の def（options内のindex。0=なし）

   options: 先頭 null = 「なし」。{name, px:関数()} で部品を登録。
   px は parts.js の関数を呼ぶ。base.js / parts.js は変更不要。
=================================================================== */
const CATEGORIES = [
  // id        label      def  options
  { id:'clothes', label:'服',   def:1,
    options:[null,{name:'旅人の服',px:bClothAdv()},{name:'戦士の鎧',px:bClothWar()},{name:'魔法使い',px:bClothMage()}] },

  { id:'weapon',  label:'武器', def:1,
    options:[null,{name:'カタナ',px:bWpKatana()},{name:'ヤリ',px:bWpSpear()},{name:'オノ',px:bWpAxe()}] },

  { id:'shield',  label:'盾',   def:3,
    options:[null,{name:'木の盾',px:bShWood()},{name:'鉄の盾',px:bShIron()},{name:'鞘',px:bShScabbard()}] },

  { id:'hair',    label:'髪型', def:4,
    options:[null,{name:'ショート\n（黒）',px:bHairShort()},{name:'ロング\n（茶）',px:bHairLong()},{name:'兜',px:bHelmet()},{name:'三度笠',px:bHatSandogasa()}] },

  // ↓ カテゴリを増やすときはここに1行足すだけ。例：
  // { id:'eyes', label:'目', def:1, options:[null,{name:'丸目',px:bEyeRound()}] },
];

/* engine.js が使う派生データ（ここは触らなくてよい）------------------
   描画順 = CATEGORIES の並び順そのもの。
   SEL = 現在の選択状態（id→選択index）。 */
const SEL = {};
CATEGORIES.forEach(c => { SEL[c.id] = c.def; });
