'use strict';
/* === 登録/設定 =====================================================
   PARTS: 各カテゴリの選択肢（先頭 null = なし）。新パーツはここに登録。
   SEL  : 初期選択（起動時の見た目）。 ORDER: 重ね順。
=================================================================== */
const PARTS = {
  hair:   [null,{name:'ショート\n（黒）',px:bHairShort()},{name:'ロング\n（茶）',px:bHairLong()},{name:'兜',px:bHelmet()},{name:'三度笠',px:bHatSandogasa()}],
  clothes:[null,{name:'旅人の服',px:bClothAdv()},{name:'戦士の鎧',px:bClothWar()},{name:'魔法使い',px:bClothMage()}],
  weapon: [null,{name:'カタナ',px:bWpKatana()},{name:'ヤリ',px:bWpSpear()},{name:'オノ',px:bWpAxe()}],
  shield: [null,{name:'木の盾',px:bShWood()},{name:'鉄の盾',px:bShIron()},{name:'鞘',px:bShScabbard()}],
};

const SEL = {hair:4, clothes:1, weapon:1, shield:3};

// 描画順：服 → 武器 → 盾 → 髪（頭が最上）
const ORDER=['clothes','weapon','shield','hair'];
