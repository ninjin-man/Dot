'use strict';
/* === エンジン（描画・UI・ランダム・PNG保存）=========================
   CATEGORIES（config.js）の配列だけを見て動く。
   カテゴリが増減してもこのファイルは触らなくてよい。
   描画順 = CATEGORIES の並び順（先頭ほど奥＝先に描く）。
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

// ov: {id:index} で一時上書き。指定なければ SEL を使う。
function render(ctx, ov={}){
  ctx.clearRect(0,0,32,32);
  drawBase(ctx);
  for(const cat of CATEGORIES){               // 配列順 = 重ね順
    const idx = ov[cat.id]!==undefined ? ov[cat.id] : SEL[cat.id];
    const pt = cat.options[idx];
    if(pt) drawPart(ctx,pt.px);
  }
}

// サムネイル：素体 + そのカテゴリのパーツのみ（他は全部なし=0）
function thumb(catId,idx){
  const c=document.createElement('canvas');
  c.width=c.height=32;
  const ov={};
  CATEGORIES.forEach(cc=>ov[cc.id]=0);   // 全カテゴリを「なし」に
  ov[catId]=idx;                         // 対象だけ表示
  render(c.getContext('2d'),ov);
  return c;
}

// ───────────────────────────────────────────
//  UI 自動生成（パネルもHTMLに書かず、ここで作る）
// ───────────────────────────────────────────
const mainCtx = document.getElementById('mainCanvas').getContext('2d');
const panelRoot = document.getElementById('panelRoot');

(function initUI(){
  CATEGORIES.forEach(cat=>{
    // パネル枠
    const panel = document.createElement('div');
    panel.className = 'part-panel';

    const label = document.createElement('span');
    label.className = 'part-label';
    label.textContent = '▶ ' + cat.label;
    panel.appendChild(label);

    const opts = document.createElement('div');
    opts.className = 'part-options';
    opts.id = 'opt-' + cat.id;
    panel.appendChild(opts);

    // 選択肢ボタン
    cat.options.forEach((pt,idx)=>{
      const wrap = document.createElement('div');
      wrap.className = 'part-option'+(idx===SEL[cat.id]?' active':'');

      const tc = thumb(cat.id,idx);
      tc.style.cssText='width:64px;height:64px;image-rendering:pixelated;display:block;';
      wrap.appendChild(tc);

      const cap = document.createElement('span');
      cap.textContent = pt ? pt.name : 'なし';
      wrap.appendChild(cap);

      wrap.addEventListener('click',()=>{
        SEL[cat.id]=idx;
        opts.querySelectorAll('.part-option').forEach((el,i)=>el.classList.toggle('active',i===idx));
        render(mainCtx);
      });
      opts.appendChild(wrap);
    });

    panelRoot.appendChild(panel);
  });
  render(mainCtx);
})();

// ───────────────────────────────────────────
//  ランダム生成
// ───────────────────────────────────────────
function randomize(){
  CATEGORIES.forEach(cat=>{
    SEL[cat.id]=Math.floor(Math.random()*cat.options.length);
    document.getElementById('opt-'+cat.id)
      .querySelectorAll('.part-option')
      .forEach((el,i)=>el.classList.toggle('active',i===SEL[cat.id]));
  });
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
