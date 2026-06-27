'use strict';
/* === engine.js : 合成描画 + パーツUI自動生成 + 実機ドット編集モード ===
   依存: base.js(BC,BM) / helper.js(M,P) / 各パーツ / config.js(CATEGORIES,SEL,SELCOL)
   役割:
   1) CATEGORIES から合成して 32x32 を mainCanvas に描画
   2) パーツ選択パネルと色帯を自動生成
   3) ランダム合成 / PNG保存
   4) 編集モード: 合成結果を下絵に、指でドットを打って P()形式JS と PNG に書き出す
================================================================= */

const SIZE = 32, SCALE = 10;           // 32px実体 / 表示320px
const cv = document.getElementById('mainCanvas');
const ctx = cv.getContext('2d');
ctx.imageSmoothingEnabled = false;

/* ---- 合成: 各レイヤーの [x,y,color] を集めて1枚に ---- */
function buildLayers(){
  const layers = [];
  // 素体（BMを展開）
  const baseDots = [];
  BM.forEach((row,y)=>{ for(let x=0;x<row.length;x++){ const ch=row[x]; if(ch!=='.'&&BC[ch]) baseDots.push([x,y,BC[ch]]); }});
  layers.push(baseDots);
  // カテゴリ順（CATEGORIESの並び＝奥から手前）
  CATEGORIES.forEach(cat=>{
    const sel = SEL[cat.id]; if(!sel) return;          // 0=なし
    const opt = cat.options[sel]; if(!opt) return;
    let dots;
    if(cat.palettes){                                  // 色ありカテゴリ
      const palIdx = SELCOL[cat.id] || 0;
      dots = opt.fn(cat.palettes[palIdx]);
    } else {
      dots = opt.fn();                                 // 色なし
    }
    layers.push(dots);
  });
  return layers;
}

/* ---- 1枚の32x32ピクセル配列に焼き込む（後勝ち） ---- */
function flatten(layers){
  const grid = new Array(SIZE*SIZE).fill(null);
  layers.forEach(dots=>{
    dots.forEach(([x,y,c])=>{
      if(x>=0&&x<SIZE&&y>=0&&y<SIZE&&c) grid[y*SIZE+x]=c;
    });
  });
  return grid;
}

/* ---- 描画 ---- */
function drawGrid(grid){
  ctx.clearRect(0,0,SIZE,SIZE);
  for(let y=0;y<SIZE;y++) for(let x=0;x<SIZE;x++){
    const c=grid[y*SIZE+x]; if(c){ ctx.fillStyle=c; ctx.fillRect(x,y,1,1); }
  }
}

let currentGrid = null;
function render(){
  currentGrid = flatten(buildLayers());
  if(editMode){ drawEdit(); } else { drawGrid(currentGrid); }
}

/* ================= パーツUI自動生成 ================= */
function buildPanels(){
  const root = document.getElementById('panelRoot');
  root.innerHTML='';
  CATEGORIES.forEach(cat=>{
    const panel=document.createElement('div'); panel.className='part-panel';
    const label=document.createElement('span'); label.className='part-label';
    label.textContent=cat.label; panel.appendChild(label);
    const opts=document.createElement('div'); opts.className='part-options';
    cat.options.forEach((opt,i)=>{
      const box=document.createElement('div');
      box.className='part-option'+(SEL[cat.id]===i?' active':'');
      const c=document.createElement('canvas'); c.width=SIZE; c.height=SIZE;
      const cc=c.getContext('2d'); cc.imageSmoothingEnabled=false;
      // サムネ: 素体+このパーツ
      const dots=[];
      BM.forEach((row,y)=>{for(let x=0;x<row.length;x++){const ch=row[x];if(ch!=='.'&&BC[ch])dots.push([x,y,BC[ch]]);}});
      let g=flatten([dots]);
      if(opt){ const d = cat.palettes? opt.fn(cat.palettes[SELCOL[cat.id]||0]) : opt.fn(); g=flatten([dots,d]); }
      for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){const col=g[y*SIZE+x];if(col){cc.fillStyle=col;cc.fillRect(x,y,1,1);}}
      box.appendChild(c);
      const sp=document.createElement('span'); sp.textContent=opt?opt.name:'なし'; box.appendChild(sp);
      box.onclick=()=>{ SEL[cat.id]=i; buildPanels(); render(); };
      opts.appendChild(box);
    });
    panel.appendChild(opts);
    // 色帯
    if(cat.palettes){
      const bar=document.createElement('div'); bar.className='color-bar';
      cat.palettes.forEach((p,ci)=>{
        const sw=document.createElement('div'); sw.className='color-swatch'+((SELCOL[cat.id]||0)===ci?' active':'');
        p.slice(0,4).forEach(col=>{const d=document.createElement('span');d.className='color-dot';d.style.background=col;sw.appendChild(d);});
        sw.title=cat.paletteNames?cat.paletteNames[ci]:'';
        sw.onclick=()=>{ SELCOL[cat.id]=ci; buildPanels(); render(); };
        bar.appendChild(sw);
      });
      panel.appendChild(bar);
    }
    root.appendChild(panel);
  });
}

/* ================= ランダム / 保存 ================= */
function randomize(){
  CATEGORIES.forEach(cat=>{
    const n=cat.options.length;
    // なし(0)も含めてランダム。ただし髪・顔は必ず何か出す
    let lo = (cat.id==='hair'||cat.id==='eyes')?1:0;
    SEL[cat.id]=lo+Math.floor(Math.random()*(n-lo));
    if(cat.palettes){ SELCOL[cat.id]=Math.floor(Math.random()*cat.palettes.length); }
  });
  buildPanels(); render();
}
function saveImage(){
  const out=document.createElement('canvas'); out.width=SIZE*SCALE; out.height=SIZE*SCALE;
  const o=out.getContext('2d'); o.imageSmoothingEnabled=false;
  const g = editMode? editGrid : currentGrid;
  for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){const c=g[y*SIZE+x];if(c){o.fillStyle=c;o.fillRect(x*SCALE,y*SCALE,SCALE,SCALE);}}
  const a=document.createElement('a'); a.download='character.png'; a.href=out.toDataURL('image/png'); a.click();
}

/* ================= 編集モード ================= */
let editMode=false, editGrid=null, editColor='#2a2422', editTool='pen';
const editHistory=[];
const GRIDLINE='rgba(0,0,0,0.12)';

function enterEdit(){
  editMode=true;
  editGrid = currentGrid.slice();       // 現在の合成をコピーして下絵に
  editHistory.length=0;
  document.getElementById('editBar').style.display='block';
  document.getElementById('normalBar').style.display='none';
  drawEdit();
}
function exitEdit(){
  editMode=false;
  document.getElementById('editBar').style.display='none';
  document.getElementById('normalBar').style.display='flex';
  drawGrid(currentGrid);
}
function drawEdit(){
  drawGrid(editGrid);
  // グリッド線
  ctx.strokeStyle=GRIDLINE; ctx.lineWidth=0.05;
  for(let i=0;i<=SIZE;i++){
    ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,SIZE);ctx.stroke();
    ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(SIZE,i);ctx.stroke();
  }
}
function setPixel(x,y){
  if(x<0||x>=SIZE||y<0||y>=SIZE) return;
  const idx=y*SIZE+x;
  if(editTool==='eyedrop'){ const c=editGrid[idx]; if(c){editColor=c; syncColorUI();} return; }
  editHistory.push([idx,editGrid[idx]]); if(editHistory.length>500)editHistory.shift();
  editGrid[idx] = (editTool==='eraser')? null : editColor;
  drawEdit();
}
function undoEdit(){ const h=editHistory.pop(); if(h){ editGrid[h[0]]=h[1]; drawEdit(); } }
function clearEdit(){ editGrid=new Array(SIZE*SIZE).fill(null); drawEdit(); }

/* タップ/ドラッグ → ドット座標 */
function evtToCell(e){
  const r=cv.getBoundingClientRect();
  const t=e.touches?e.touches[0]:e;
  const px=(t.clientX-r.left)/r.width*SIZE;
  const py=(t.clientY-r.top)/r.height*SIZE;
  return [Math.floor(px),Math.floor(py)];
}
let drawing=false;
function onDown(e){ if(!editMode)return; e.preventDefault(); drawing=true; const[x,y]=evtToCell(e); setPixel(x,y); }
function onMove(e){ if(!editMode||!drawing)return; e.preventDefault(); const[x,y]=evtToCell(e); setPixel(x,y); }
function onUp(e){ drawing=false; }
cv.addEventListener('touchstart',onDown,{passive:false});
cv.addEventListener('touchmove',onMove,{passive:false});
cv.addEventListener('touchend',onUp);
cv.addEventListener('mousedown',onDown);
cv.addEventListener('mousemove',onMove);
window.addEventListener('mouseup',onUp);

function setTool(t){ editTool=t; syncColorUI(); }
function setColor(c){ editColor=c; editTool='pen'; syncColorUI(); }
function syncColorUI(){
  document.querySelectorAll('.edit-tool').forEach(b=>b.classList.toggle('on',b.dataset.tool===editTool));
  const cur=document.getElementById('curColor'); if(cur)cur.style.background=editColor;
  document.querySelectorAll('.edit-swatch').forEach(s=>s.classList.toggle('on',s.dataset.col===editColor));
}

/* JS(P形式)書き出し: 使われている色をパレット化しインデックスドットで出力 */
function exportJS(){
  const palette=[]; const pidx={};
  const dots=[];
  for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){
    const c=editGrid[y*SIZE+x]; if(!c)continue;
    if(!(c in pidx)){ pidx[c]=palette.length; palette.push(c); }
    dots.push([x,y,pidx[c]]);
  }
  const palStr='['+palette.map(c=>`"${c}"`).join(',')+']';
  const dotStr='['+dots.map(d=>`[${d[0]},${d[1]},${d[2]}]`).join(',')+']';
  const code=`function bCustom(){return P(${palStr},${dotStr});}`;
  const ta=document.getElementById('jsOut'); ta.value=code; ta.style.display='block';
  ta.select();
  try{ navigator.clipboard.writeText(code); }catch(e){}
}

/* ================= 起動 ================= */
buildPanels();
render();
