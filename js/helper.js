'use strict';
/* === 共通ヘルパー（面M・線P）====================
   M(rows,pal): 文字マップ伸長（面パーツ＝髪・服）。"."は透明。
   P(pal,dots): 番号ドット伸長（線パーツ＝武器・盾・目）。
================================================ */
const M=(rows,pal)=>{const px=[];rows.forEach((row,y)=>{for(let x=0;x<row.length;x++){const c=pal[row[x]];if(c)px.push([x,y,c]);}});return px;};
const P=(pal,dots)=>dots.map(([x,y,i])=>[x,y,pal[i]]);
