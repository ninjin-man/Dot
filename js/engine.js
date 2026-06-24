'use strict';
/* === エンジン（描画・UI・ランダム・PNG保存）=========================
   基本は触らない。BC/BM/PARTS/SEL/ORDER を使って合成・描画する。
=================================================================== */
function drawBase(ctx){
  for(let y=0;y<32;y++){
    const row=BM[y];
    for(let x=0;x<32;x++){
      const ch=row[x];
      if(BC[ch]){ctx.fillStyle=BC[ch];ctx.fillRect(x,y,1,1);}
    }
  }
}
function drawPart(ctx,pxArr){
  if(!pxArr) return;
  for(const[x,y,c] of pxArr){ctx.fillStyle=c;ctx.fillRect(x,y,1,1);}
}

function render(ctx, ov={}){
  ctx.clearRect(0,0,32,32);
  drawBase(ctx);
  for(const cat of ORDER){
    const idx = ov[cat]!==undefined ? ov[cat] : SEL[cat];
    const pt = PARTS[cat][idx];
    if(pt) drawPart(ctx,pt.px);
  }
}

// サムネイル：素体 + そのパーツのみ
function thumb(cat,idx){
  const c=document.createElement('canvas');
  c.width=c.height=32;
  render(c.getContext('2d'),{hair:0,clothes:0,weapon:0,shield:0,[cat]:idx});
  return c;
}

// ───────────────────────────────────────────
//  UI 構築
// ───────────────────────────────────────────
const mainCtx = document.getElementById('mainCanvas').getContext('2d');

(function initUI(){
  for(const cat of Object.keys(PARTS)){
    const cont = document.getElementById('opt-'+cat);
    PARTS[cat].forEach((pt,idx)=>{
      const wrap = document.createElement('div');
      wrap.className = 'part-option'+(idx===SEL[cat]?' active':'');

      const tc = thumb(cat,idx);
      tc.style.cssText='width:64px;height:64px;image-rendering:pixelated;display:block;';
      wrap.appendChild(tc);

      const label = document.createElement('span');
      label.textContent = pt ? pt.name : 'なし';
      wrap.appendChild(label);

      wrap.addEventListener('click',()=>{
        SEL[cat]=idx;
        cont.querySelectorAll('.part-option').forEach((el,i)=>el.classList.toggle('active',i===idx));
        render(mainCtx);
      });
      cont.appendChild(wrap);
    });
  }
  render(mainCtx);
})();

// ───────────────────────────────────────────
//  ランダム生成
// ───────────────────────────────────────────
function randomize(){
  for(const cat of Object.keys(PARTS)){
    SEL[cat]=Math.floor(Math.random()*PARTS[cat].length);
    document.getElementById('opt-'+cat)
      .querySelectorAll('.part-option')
      .forEach((el,i)=>el.classList.toggle('active',i===SEL[cat]));
  }
  render(mainCtx);
}

// ───────────────────────────────────────────
//  PNG 保存
// ───────────────────────────────────────────
function saveImage(){
  const a=document.createElement('a');
  a.download='character.png';
  a.href=document.getElementById('mainCanvas').toDataURL('image/png');
  a.click();
}
