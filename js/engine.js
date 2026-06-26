'use strict';
/* === エンジン（描画・UI・色帯・ランダム・PNG保存）===================
   CATEGORIES（config.js）の配列だけを見て動く。
   形=fn(palette)で取得。palettesを持つカテゴリは色帯を表示。
   描画順 = CATEGORIES の並び順（先頭ほど奥＝先に描く）。
=================================================================== */

// 形のピクセル配列を取得。色カテゴリは選択中パレットを渡す。
function getPx(cat, idx, colIdx){
  const pt = cat.options[idx];
  if(!pt) return null;
  const fn = pt.fn || pt.px;          // fn:関数参照（pxは後方互換）
  if(typeof fn !== 'function') return fn;  // 既に配列ならそのまま
  if(cat.palettes){
    const c = colIdx!==undefined ? colIdx : SELCOL[cat.id];
    return fn(cat.palettes[c]);
  }
  return fn();
}

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

// ov: {id:index} で形を一時上書き。ovc:{id:colIdx}で色を一時上書き。
function render(ctx, ov={}, ovc={}){
  ctx.clearRect(0,0,32,32);
  drawBase(ctx);
  for(const cat of CATEGORIES){
    const idx = ov[cat.id]!==undefined ? ov[cat.id] : SEL[cat.id];
    const col = ovc[cat.id]!==undefined ? ovc[cat.id] : SELCOL[cat.id];
    drawPart(ctx, getPx(cat, idx, col));
  }
}

// サムネ：素体 + そのカテゴリの形のみ（色は選択中）
function thumb(catId,idx){
  const c=document.createElement('canvas');
  c.width=c.height=32;
  const ov={}; CATEGORIES.forEach(cc=>ov[cc.id]=0);
  ov[catId]=idx;
  render(c.getContext('2d'),ov);
  return c;
}

const mainCtx = document.getElementById('mainCanvas').getContext('2d');
const panelRoot = document.getElementById('panelRoot');

// 形サムネを今の色で描き直す（色変更時に呼ぶ）
function refreshThumbs(cat){
  const opts=document.getElementById('opt-'+cat.id);
  if(!opts) return;
  opts.querySelectorAll('.part-option').forEach((wrap,idx)=>{
    const old=wrap.querySelector('canvas');
    if(!old) return;
    const tc=thumb(cat.id,idx);
    tc.style.cssText='width:64px;height:64px;image-rendering:pixelated;display:block;';
    old.replaceWith(tc);
  });
}

(function initUI(){
  CATEGORIES.forEach(cat=>{
    const panel=document.createElement('div');
    panel.className='part-panel';

    const label=document.createElement('span');
    label.className='part-label';
    label.textContent='▶ '+cat.label;
    panel.appendChild(label);

    const opts=document.createElement('div');
    opts.className='part-options';
    opts.id='opt-'+cat.id;
    panel.appendChild(opts);

    cat.options.forEach((pt,idx)=>{
      const wrap=document.createElement('div');
      wrap.className='part-option'+(idx===SEL[cat.id]?' active':'');
      const tc=thumb(cat.id,idx);
      tc.style.cssText='width:64px;height:64px;image-rendering:pixelated;display:block;';
      wrap.appendChild(tc);
      const cap=document.createElement('span');
      cap.textContent=pt?pt.name:'なし';
      wrap.appendChild(cap);
      wrap.addEventListener('click',()=>{
        SEL[cat.id]=idx;
        opts.querySelectorAll('.part-option').forEach((el,i)=>el.classList.toggle('active',i===idx));
        render(mainCtx);
      });
      opts.appendChild(wrap);
    });

    // 色帯（palettesを持つカテゴリのみ）
    if(cat.palettes){
      const bar=document.createElement('div');
      bar.className='color-bar';
      bar.id='col-'+cat.id;
      cat.palettes.forEach((pal,ci)=>{
        const sw=document.createElement('div');
        sw.className='color-swatch'+(ci===SELCOL[cat.id]?' active':'');
        sw.title=(cat.paletteNames&&cat.paletteNames[ci])||('色'+ci);
        // パレットの濃淡をミニドットで表示
        pal.forEach(hex=>{
          const dot=document.createElement('span');
          dot.className='color-dot';
          dot.style.background=hex;
          sw.appendChild(dot);
        });
        sw.addEventListener('click',()=>{
          SELCOL[cat.id]=ci;
          bar.querySelectorAll('.color-swatch').forEach((el,i)=>el.classList.toggle('active',i===ci));
          refreshThumbs(cat);   // 形サムネも新色に
          render(mainCtx);
        });
        bar.appendChild(sw);
      });
      panel.appendChild(bar);
    }

    panelRoot.appendChild(panel);
  });
  render(mainCtx);
})();

function randomize(){
  CATEGORIES.forEach(cat=>{
    SEL[cat.id]=Math.floor(Math.random()*cat.options.length);
    document.getElementById('opt-'+cat.id)
      .querySelectorAll('.part-option')
      .forEach((el,i)=>el.classList.toggle('active',i===SEL[cat.id]));
    if(cat.palettes){
      SELCOL[cat.id]=Math.floor(Math.random()*cat.palettes.length);
      const bar=document.getElementById('col-'+cat.id);
      if(bar) bar.querySelectorAll('.color-swatch').forEach((el,i)=>el.classList.toggle('active',i===SELCOL[cat.id]));
      refreshThumbs(cat);
    }
  });
  render(mainCtx);
}

function saveImage(){
  const a=document.createElement('a');
  a.download='character.png';
  a.href=document.getElementById('mainCanvas').toDataURL('image/png');
  a.click();
}
