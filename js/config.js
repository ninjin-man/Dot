'use strict';
/* === 登録/設定（カテゴリ配列方式・色対応版）=========================
   ★形の追加     → options に {name, fn:関数} を足す（fnは関数“参照”、()なし）
   ★色の追加     → palettes に [輪郭,明,中,影] を足す
   ★色なしカテゴリ → palettes を書かない（服・武器・盾）
   ★並べ替え/重ね順 → 行を上下に動かす（上ほど奥＝先に描画）
   ★初期選択      → def（形index,0=なし）, defCol（色index）
   描画: engine が fn(palettes[選択色]) を呼ぶ。色なしは fn()。
=================================================================== */
const CATEGORIES = [
  { id:'bottoms', label:'ボトムス', def:1,
    options:[null,
      {name:'旅ズボン',fn:bBtmAdvPants},{name:'すね当て',fn:bBtmWarGreave},{name:'長ローブ',fn:bBtmMageRobe},
      {name:'スカート',fn:bBtmSkirt},{name:'ロングスカート',fn:bBtmLongSkirt}] },

  { id:'tops', label:'トップス', def:1,
    options:[null,
      {name:'旅人の上衣',fn:bTopAdv},{name:'戦士の胸甲',fn:bTopWar},{name:'魔法ローブ',fn:bTopMage},
      {name:'シャツ',fn:bTopShirt}] },

  { id:'weapon', label:'武器', def:1,
    options:[null,
      {name:'カタナ',fn:bWpKatana},{name:'ヤリ',fn:bWpSpear},{name:'オノ',fn:bWpAxe}] },

  { id:'shield', label:'盾', def:3,
    options:[null,
      {name:'木の盾',fn:bShWood},{name:'鉄の盾',fn:bShIron},{name:'鞘',fn:bShScabbard}] },

  { id:'shoes', label:'靴', def:1,
    options:[null,
      {name:'革ブーツ',fn:bShoeBoot},{name:'鉄靴',fn:bShoeIron},{name:'布靴',fn:bShoeFlat},
      {name:'スニーカー',fn:bShoeSneaker}] },

  { id:'hair', label:'髪型', def:1, defCol:1,
    options:[null,
      {name:'短髪♂',fn:bHairMShort},{name:'ツンツン♂',fn:bHairMSpiky},{name:'オールバック♂',fn:bHairMBack},
      {name:'マッシュ♂',fn:bHairMMash},{name:'武人ロング♂',fn:bHairMWarrior},{name:'サムライ♂',fn:bHairMSamurai},
      {name:'ロング♀',fn:bHairFLong},{name:'ツインテ♀',fn:bHairFTwin},{name:'ボブ♀',fn:bHairFBob},
      {name:'お団子♀',fn:bHairFBun},{name:'姫カット♀',fn:bHairFHime},{name:'ポニーテール♀',fn:bHairFPony}],
    palettes:[HAIR_BLACK, HAIR_BROWN, HAIR_GOLD, HAIR_BLUE, HAIR_PURPLE, HAIR_RED],
    paletteNames:['黒','茶','金','青','紫','赤'] },

  // 顔（目+眉+鼻+口+頬）。髪より後＝最前面に描画し、眉が前髪に隠れないようにする。
  { id:'eyes', label:'顔', def:1, defCol:0,
    options:[null,
      {name:'標準♂',fn:bEyeMNormal},{name:'鋭い♂',fn:bEyeMSharp},{name:'強い♂',fn:bEyeMStrong},
      {name:'冷静♂',fn:bEyeMCalm},{name:'たれ目♂',fn:bEyeMDroop},{name:'細目♂',fn:bEyeMNarrow},
      {name:'丸目♀',fn:bEyeFRound},{name:'ぱっちり♀',fn:bEyeFBig},{name:'まつ毛♀',fn:bEyeFLash},
      {name:'たれ目♀',fn:bEyeFDroop},{name:'凛♀',fn:bEyeFSharp},{name:'ウインク♀',fn:bEyeFWink}],
    palettes:[EYE_BLUE, EYE_BROWN, EYE_GREEN, EYE_PURPLE, EYE_RED],
    paletteNames:['青','茶','緑','紫','赤'] },
];

/* 派生データ（触らなくてよい）。SEL=形選択, SELCOL=色選択 */
const SEL = {}, SELCOL = {};
CATEGORIES.forEach(c => {
  SEL[c.id] = c.def || 0;
  SELCOL[c.id] = c.defCol || 0;
});
