const APP_VERSION = "v3.9.8";
const STORAGE_KEY = "anglers-jigsaw-cooler-v3"; // retained so existing catches survive the rebuild
const PROGRESS_KEY = "anglers-jigsaw-progress-v1";
const difficulties = [
  {id:"easy",label:"Easy",pieces:12,cols:4,rows:3},
  {id:"angler",label:"Angler",pieces:48,cols:8,rows:6},
  {id:"guide",label:"Guide",pieces:108,cols:12,rows:9},
  {id:"captain",label:"Captain",pieces:192,cols:16,rows:12}
];
const $ = id => document.getElementById(id);
const screens = {home:$("screen-home"),select:$("screen-select"),how:$("screen-how"),puzzle:$("screen-puzzle"),complete:$("screen-complete"),caught:$("screen-caught")};
const els = {
  body:document.body, homeBtn:$("homeBtn"), fishCaughtBtn:$("fishCaughtBtn"), startFishingBtn:$("startFishingBtn"),
  howToPlayBtn:$("howToPlayBtn"), homeFishCaughtBtn:$("homeFishCaughtBtn"), homeReturnGameBtn:$("homeReturnGameBtn"), howStartBtn:$("howStartBtn"),
  difficultyStrip:$("difficultyStrip"), levelSelectTitle:$("levelSelectTitle"), levelSelectSubtitle:$("levelSelectSubtitle"),
  puzzleTitle:$("puzzleTitle"), puzzleInfo:$("puzzleInfo"), pieceCounterChip:$("pieceCounterChip"),
  allModeBtn:$("allModeBtn"), edgesModeBtn:$("edgesModeBtn"), pushModeBtn:$("pushModeBtn"), pullModeBtn:$("pullModeBtn"), previewBtn:$("previewBtn"), puzzleHomeBtn:$("puzzleHomeBtn"), puzzleFishCaughtBtn:$("puzzleFishCaughtBtn"),
  playTable:$("playTable"), boardShell:$("boardShell"), boardPreviewImage:$("boardPreviewImage"), boardCutlines:$("boardCutlines"), piecesLayer:$("piecesLayer"),
  trayBar:$("trayBar"), trayPieces:$("trayPieces"), trayCount:$("trayCount"), trayModeNote:$("trayModeNote"),
  completeKicker:$("completeKicker"), completeImage:$("completeImage"), completeTitle:$("completeTitle"), completeScientific:$("completeScientific"),
  completeDescription:$("completeDescription"), completeIdentification:$("completeIdentification"), completeHabitat:$("completeHabitat"), completeHistory:$("completeHistory"), completeSource:$("completeSource"),
  fishAgainBtn:$("fishAgainBtn"), openFishCaughtBtn:$("openFishCaughtBtn"), nextFishBtn:$("nextFishBtn"),
  caughtGrid:$("caughtGrid"), caughtCountChip:$("caughtCountChip"), caughtPlayBtn:$("caughtPlayBtn"), caughtReturnGameBtn:$("caughtReturnGameBtn"), resetFishBtn:$("resetFishBtn"),
  toast:$("toast"), globalVersion:$("globalVersion")
};
let caught = safeJson(STORAGE_KEY,{});
let progress = safeJson(PROGRESS_KEY,{nextLevel:1});
let currentDifficulty=difficulties[1], puzzleState=null, currentScreen="home", zCounter=20, detailFish=null, trayMode="all", boardActionMode="push", puzzleStarting=false;
let lastLayoutW=0,lastLayoutH=0,resizeTimer=null,pendingViewportRelayout=false;
const dragState={active:false,piece:null,pointerId:null,offsetX:0,offsetY:0,origin:"table",captureEl:null,tableRect:null,group:[],startPositions:new Map()};
const fishAssetCache=new Map();

function safeJson(key,fallback){try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return structuredClone(fallback)}}
function speciesList(){return Object.values(speciesData).sort((a,b)=>a.number-b.number)}
function maxLevel(){return speciesList().length}
function currentLevelNumber(){return Math.max(1,Math.min(Number(progress.nextLevel)||1,maxLevel()+1))}
function currentLevelFish(){const n=currentLevelNumber();return speciesList().find(f=>f.number===n)||null}
function saveCaught(){localStorage.setItem(STORAGE_KEY,JSON.stringify(caught))}
function saveProgress(){localStorage.setItem(PROGRESS_KEY,JSON.stringify(progress))}
function testImageUrl(url){return new Promise(resolve=>{const image=new Image();image.onload=()=>resolve(url);image.onerror=()=>resolve(null);image.src=url})}
async function resolveFishAsset(fish,kind){const key=`${fish.id}:${kind}`;if(fishAssetCache.has(key))return fishAssetCache.get(key);const promise=testImageUrl(kind==="swim"?fish.swimImage:fish.puzzleImage);fishAssetCache.set(key,promise);return promise}
async function setFishImage(element,fish,kind){const resolved=await resolveFishAsset(fish,kind);if(!resolved){element.removeAttribute("src");element.hidden=true;return null}element.src=resolved;element.hidden=false;return resolved}

function verifyCriticalUI(){
  const critical=["playTable","allModeBtn","edgesModeBtn","pushModeBtn","pullModeBtn","previewBtn","caughtReturnGameBtn"];
  const missing=critical.filter(key=>!els[key]);
  if(missing.length)console.error("Angler's Jigsaw UI binding error:",missing);
  return missing.length===0;
}

initialize();
function initialize(){els.globalVersion.textContent=APP_VERSION;normalizeProgress();verifyCriticalUI();bindUI();buildWaterBubbles();renderLevelSelect();renderCaught();showScreen("home");spawnAmbientLoop()}
function normalizeProgress(){
  const ordered=speciesList();
  const caughtNumbers=ordered.filter(f=>caught[f.id]).map(f=>f.number);
  let sequential=1;
  while(caughtNumbers.includes(sequential))sequential++;

  // v3.9.3 repair: progression is strictly numerical. Earlier builds could
  // leave nextLevel ahead of the first missing fish, and could record a later
  // species as caught out of sequence. Keep only the contiguous completed run
  // (1..N), then make the next level exactly N+1.
  let caughtChanged=false;
  ordered.forEach(f=>{
    if(f.number>=sequential&&caught[f.id]){delete caught[f.id];caughtChanged=true}
  });
  progress.nextLevel=sequential;
  if(caughtChanged)saveCaught();
  saveProgress();
}
function bindPress(element,handler){
  if(!element)return;
  element.addEventListener("click",event=>{
    event.preventDefault();
    event.stopPropagation();
    handler(event);
  });
}
function bindUI(){
  bindPress(els.homeBtn,()=>showScreen("home"));
  bindPress(els.fishCaughtBtn,openCaught);
  bindPress(els.homeFishCaughtBtn,openCaught);
  bindPress(els.openFishCaughtBtn,openCaught);
  bindPress(els.startFishingBtn,openNextLevel);
  bindPress(els.homeReturnGameBtn,returnToActiveGame);
  bindPress(els.howStartBtn,openNextLevel);
  bindPress(els.howToPlayBtn,()=>showScreen("how"));
  bindPress(els.caughtPlayBtn,openNextLevel);
  bindPress(els.caughtReturnGameBtn,returnToActiveGame);
  bindPress(els.allModeBtn,()=>setTrayMode("all"));
  bindPress(els.edgesModeBtn,()=>setTrayMode("edges"));
  bindPress(els.pushModeBtn,()=>runBoardAction("push"));
  bindPress(els.pullModeBtn,()=>runBoardAction("pull"));
  bindPress(els.previewBtn,togglePreview);
  bindPress(els.puzzleHomeBtn,()=>showScreen("home"));
  bindPress(els.puzzleFishCaughtBtn,openCaught);
  bindPress(els.fishAgainBtn,replayDetailFish);
  bindPress(els.nextFishBtn,openNextLevel);
  bindPress(els.resetFishBtn,resetAllFish);
  document.querySelectorAll("[data-back-home=true]").forEach(button=>bindPress(button,()=>showScreen("home")));
  window.addEventListener("resize",()=>requestViewportRelayout(false),{passive:true});
  window.addEventListener("orientationchange",()=>{if(dragState.active){pendingViewportRelayout=true;return}setTimeout(()=>requestViewportRelayout(true),180)},{passive:true});
  els.playTable?.addEventListener("touchmove",event=>{if(dragState.active)event.preventDefault()},{passive:false});
  window.addEventListener("pointermove",onPointerMove,{passive:false});
  window.addEventListener("pointerup",onPointerUp,{passive:false});
  window.addEventListener("pointercancel",cancelDrag,{passive:false});
  ["gesturestart","gesturechange","gestureend"].forEach(type=>document.addEventListener(type,event=>{if(currentScreen==="puzzle")event.preventDefault()},{passive:false}));
}

function hasActiveGame(){return Boolean(puzzleState&&!puzzleState.completeShown)}
function updateReturnToGameButtons(){const active=hasActiveGame();els.homeReturnGameBtn?.classList.toggle("hidden",!active);els.caughtReturnGameBtn?.classList.toggle("hidden",!active)}
function returnToActiveGame(){if(!hasActiveGame())return;showScreen("puzzle")}
function showScreen(name){Object.entries(screens).forEach(([k,v])=>v.classList.toggle("active",k===name));currentScreen=name;const playing=name==="puzzle";els.body.classList.toggle("puzzle-mode",playing);updateReturnToGameButtons();if(playing&&puzzleState)schedulePuzzleLayout(false)}
function showToast(msg){els.toast.textContent=msg;els.toast.classList.remove("hidden");clearTimeout(showToast.t);showToast.t=setTimeout(()=>els.toast.classList.add("hidden"),1700)}
function openNextLevel(){if(!currentLevelFish()){renderCaught();showScreen("caught");showToast("You caught every fish in the current collection!");return}renderLevelSelect();showScreen("select")}
function renderLevelSelect(){const level=currentLevelNumber();els.levelSelectTitle.textContent=level>maxLevel()?"Collection Complete":`Level ${level}`;els.levelSelectSubtitle.textContent=level>maxLevel()?"You have caught every fish currently available.":"Choose how many pieces you want. The level starts immediately.";els.difficultyStrip.innerHTML="";difficulties.forEach(d=>{const b=document.createElement("button");b.className="difficulty-choice";b.innerHTML=`<strong>${d.pieces}</strong><span>${d.label} • ${d.cols} × ${d.rows}</span>`;b.onclick=async()=>{if(puzzleStarting)return;puzzleStarting=true;b.classList.add("selected");currentDifficulty=d;try{await startCurrentLevel()}finally{puzzleStarting=false}};els.difficultyStrip.appendChild(b)})}
function startCurrentLevel(){const fish=currentLevelFish();return fish?startPuzzle(fish,currentDifficulty,false):Promise.resolve()}
function replayDetailFish(){if(detailFish)startPuzzle(detailFish,currentDifficulty,true)}
function openCaught(){renderCaught();showScreen("caught")}
function renderCaught(){
  els.caughtGrid.innerHTML="";const all=speciesList(),count=all.filter(f=>caught[f.id]).length;els.caughtCountChip.textContent=`${count} caught`;
  all.forEach(f=>{const isCaught=Boolean(caught[f.id]);const card=document.createElement(isCaught?"button":"div");card.className=`caught-row ${isCaught?"caught":"locked"}`;
    if(isCaught){const img=document.createElement("img");img.alt=f.commonName;setFishImage(img,f,"swim");const body=document.createElement("div");body.className="caught-row-copy";body.innerHTML=`<strong>${f.commonName}</strong><em>${f.scientificName}</em><span>${shortIdentification(f.identification)}</span><b>Tap to study ›</b>`;card.append(img,body);card.onclick=()=>showFishDetails(f)}
    else{card.innerHTML=`<div class="locked-mark">?</div><div class="caught-row-copy"><strong>Not yet caught</strong><span>Clear Level ${f.number} to add this species.</span></div>`}
    els.caughtGrid.appendChild(card)
  })
}
function shortIdentification(text){const s=(text||"").split(/[.;]/).filter(Boolean).slice(0,2).join(" • ");return s||"Complete the level to study this species."}
function populateFishInfo(fish,fromCaught=false){detailFish=fish;els.completeKicker.textContent=fromCaught?"Species Profile":"Species Identified";els.completeTitle.textContent=fish.commonName;els.completeScientific.textContent=fish.scientificName;els.completeDescription.textContent=fish.description;els.completeIdentification.textContent=fish.identification;els.completeHabitat.textContent=fish.habitat;els.completeHistory.textContent=fish.history;els.completeSource.textContent=fish.source;setFishImage(els.completeImage,fish,"swim");els.nextFishBtn.hidden=fromCaught;els.fishAgainBtn.textContent="Replay"}
function showFishDetails(f){populateFishInfo(f,true);showScreen("complete")}
function resetAllFish(){if(!confirm("Reset all Fish Caught progress and return to Level 1? This cannot be undone."))return;caught={};progress={nextLevel:1};saveCaught();saveProgress();renderCaught();renderLevelSelect();showToast("Fish Caught reset. Level 1 is ready.")}
async function startPuzzle(fish,difficulty,replay=false){if(!fish||!difficulty)return;const imageSrc=await resolveFishAsset(fish,"puzzle");if(!imageSrc){showToast("Puzzle artwork is missing.");return}clearPuzzle();trayMode="all";boardActionMode="push";puzzleState={fish,difficulty,imageSrc,replay,ratio:4/3,rows:difficulty.rows,cols:difficulty.cols,pieces:[],previewOn:false,metrics:null,completeShown:false};buildPieces();updatePuzzleMeta();updateToolLabels();showScreen("puzzle");schedulePuzzleLayout(true);setTimeout(()=>schedulePuzzleLayout(false),550)}
function clearPuzzle(){cancelDrag();puzzleState=null;els.piecesLayer.innerHTML="";els.trayPieces.innerHTML="";els.boardCutlines.innerHTML="";els.boardPreviewImage.removeAttribute("src");els.boardShell.classList.remove("show-preview")}
function buildPieces(){const {rows,cols}=puzzleState,grid=generateEdgeGrid(rows,cols);puzzleState.horizontalCuts=grid.horizontal;puzzleState.verticalCuts=grid.vertical;for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const idx=r*cols+c,e=grid.pieces[idx],tabs=outwardTabInfo(e),id=`piece-${r}-${c}`;puzzleState.pieces.push({id,groupId:id,row:r,col:c,edges:e,tabs,isEdge:r===0||c===0||r===rows-1||c===cols-1,isCorner:(r===0||r===rows-1)&&(c===0||c===cols-1),location:"tray",locked:false,x:0,y:0,z:1,size:0,margin:0,path:"",el:null,targetX:0,targetY:0,imgX:0,imgY:0,imgW:0,imgH:0,trayOrder:Math.random(),dirty:true})}}

function generateEdgeGrid(rows,cols){
  const horizontal=Array.from({length:rows-1},(_,r)=>Array.from({length:cols},(_,c)=>((r*17+c*11+r*c*3)%7)%2===0?1:-1));
  const vertical=Array.from({length:rows},(_,r)=>Array.from({length:cols-1},(_,c)=>((r*13+c*19+r*c*5)%9)%2===0?1:-1));
  if(rows===3&&cols===4){horizontal[0]=[1,-1,1,-1];horizontal[1]=[-1,1,-1,1];vertical[0]=[-1,1,-1];vertical[1]=[1,-1,1];vertical[2]=[-1,1,-1]}
  const pieces=[];for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)pieces.push({top:r===0?0:-horizontal[r-1][c],right:c===cols-1?0:vertical[r][c],bottom:r===rows-1?0:horizontal[r][c],left:c===0?0:-vertical[r][c-1]});return{pieces,horizontal,vertical}
}
function outwardTabInfo(e){const d=[];if(e.top===1)d.push("up");if(e.right===1)d.push("right");if(e.bottom===1)d.push("down");if(e.left===1)d.push("left");return{count:d.length,directions:d}}
function ribbonProfile(s){return{neck:s*.075,r:s*.125,depth:s*.235,shoulder:s*.025,k:.5522847498}}
function buildPieceShape(s,m,e){const x0=m,y0=m,x1=m+s,y1=m+s,p=ribbonProfile(s);let d=`M ${x0} ${y0}`;d+=edgeSegment({x:x0,y:y0},{x:x1,y:y0},{x:0,y:-1},e.top,s,p);d+=edgeSegment({x:x1,y:y0},{x:x1,y:y1},{x:1,y:0},e.right,s,p);d+=edgeSegment({x:x1,y:y1},{x:x0,y:y1},{x:0,y:1},e.bottom,s,p);d+=edgeSegment({x:x0,y:y1},{x:x0,y:y0},{x:-1,y:0},e.left,s,p);return{path:d+" Z",size:s+m*2,margin:m}}
function edgeSegment(a,b,n,edge,s,p){
  if(edge===0)return` L ${b.x} ${b.y}`;
  const tx=(b.x-a.x)/s,ty=(b.y-a.y)/s,dir=edge===1?1:-1,nx=n.x*dir,ny=n.y*dir,mx=(a.x+b.x)/2,my=(a.y+b.y)/2;
  const A={x:mx-tx*p.neck,y:my-ty*p.neck},B={x:mx+tx*p.neck,y:my+ty*p.neck},cx=mx+nx*(p.depth-p.r),cy=my+ny*(p.depth-p.r),CA={x:cx-tx*p.r,y:cy-ty*p.r},CB={x:cx+tx*p.r,y:cy+ty*p.r},F={x:cx+nx*p.r,y:cy+ny*p.r};
  return` L ${A.x} ${A.y} C ${A.x+nx*p.shoulder} ${A.y+ny*p.shoulder}, ${CA.x-nx*p.shoulder} ${CA.y-ny*p.shoulder}, ${CA.x} ${CA.y} C ${CA.x+nx*p.k*p.r} ${CA.y+ny*p.k*p.r}, ${F.x-tx*p.k*p.r} ${F.y-ty*p.k*p.r}, ${F.x} ${F.y} C ${F.x+tx*p.k*p.r} ${F.y+ty*p.k*p.r}, ${CB.x+nx*p.k*p.r} ${CB.y+ny*p.k*p.r}, ${CB.x} ${CB.y} C ${CB.x-nx*p.shoulder} ${CB.y-ny*p.shoulder}, ${B.x+nx*p.shoulder} ${B.y+ny*p.shoulder}, ${B.x} ${B.y} L ${b.x} ${b.y}`
}
function sharedCutPath(a,b,n,edge,s){return`M ${a.x} ${a.y}`+edgeSegment(a,b,n,edge,s,ribbonProfile(s))}
function requestViewportRelayout(force=false){if(currentScreen!=="puzzle"||!puzzleState)return;const w=Math.round(innerWidth||0),h=Math.round(visualViewport?.height||innerHeight||0);if(!force&&w===lastLayoutW&&Math.abs(h-lastLayoutH)<120)return;if(dragState.active){pendingViewportRelayout=true;return}clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{if(dragState.active||currentScreen!=="puzzle"||!puzzleState){pendingViewportRelayout=true;return}lastLayoutW=w;lastLayoutH=h;pendingViewportRelayout=false;schedulePuzzleLayout(false)},150)}
function schedulePuzzleLayout(initial=false){if(!puzzleState||currentScreen!=="puzzle")return;if(dragState.active){pendingViewportRelayout=true;return}(initial?[0,100,260]:[0]).forEach((delay,index)=>setTimeout(()=>{if(!puzzleState||currentScreen!=="puzzle"||dragState.active)return;requestAnimationFrame(()=>layoutPuzzle(initial&&index===0))},delay))}
function layoutPuzzle(initial=false){
  if(!puzzleState)return;let rect=els.playTable.getBoundingClientRect(),old=puzzleState.metrics;if(rect.width<260||rect.height<220){const vh=visualViewport?.height||innerHeight||768,toolbar=document.querySelector(".play-toolbar")?.getBoundingClientRect().height||58,tray=els.trayBar?.getBoundingClientRect().height||132,fallback=Math.max(320,Math.floor(vh-toolbar-tray-100));els.playTable.style.minHeight=`${fallback}px`;rect=els.playTable.getBoundingClientRect()}if(rect.width<260||rect.height<220)return;
  const gutter=Math.max(26,Math.min(54,rect.width*.04)),maxW=(rect.width-gutter*2)*.94,maxH=(rect.height-gutter*2)*.94;let boardW=maxW,boardH=boardW*3/4;if(boardH>maxH){boardH=maxH;boardW=boardH*4/3}const cell=Math.floor(boardW/puzzleState.cols);boardW=cell*puzzleState.cols;boardH=cell*puzzleState.rows;const left=Math.round((rect.width-boardW)/2),top=Math.round((rect.height-boardH)/2);const m={tableW:rect.width,tableH:rect.height,boardW,boardH,boardLeft:left,boardTop:top,cell,margin:cell*.26,snapDistance:cell*.34,magnetDistance:cell*.30};puzzleState.metrics=m;Object.assign(els.boardShell.style,{width:`${boardW}px`,height:`${boardH}px`,left:`${left}px`,top:`${top}px`});els.boardPreviewImage.src=puzzleState.imageSrc;
  const draw=computeCoverRect(puzzleState.ratio,boardW,boardH);puzzleState.pieces.forEach(p=>{if(old&&!initial&&!p.locked&&p.location==="table"){p.x=p.x/old.tableW*m.tableW;p.y=p.y/old.tableH*m.tableH}const sh=buildPieceShape(cell,m.margin,p.edges);p.size=sh.size;p.margin=sh.margin;p.path=sh.path;p.dirty=true;p.targetX=left+p.col*cell-sh.margin;p.targetY=top+p.row*cell-sh.margin;p.imgX=draw.x-p.col*cell+sh.margin;p.imgY=draw.y-p.row*cell+sh.margin;p.imgW=draw.w;p.imgH=draw.h;if(p.locked){p.x=p.targetX;p.y=p.targetY}else if(p.location==="table")clampPieceToTable(p)});
  normalizeLooseGroups();renderBoardCutlines();syncLoosePieces();renderTray();updatePuzzleMeta();lastLayoutW=Math.round(innerWidth||0);lastLayoutH=Math.round(visualViewport?.height||innerHeight||0);pendingViewportRelayout=false
}
function normalizeLooseGroups(){if(!puzzleState?.metrics)return;const groups=new Map();puzzleState.pieces.filter(p=>p.location==="table"&&!p.locked).forEach(p=>{if(!groups.has(p.groupId))groups.set(p.groupId,[]);groups.get(p.groupId).push(p)});groups.forEach(g=>{if(g.length<2)return;const a=g[0],cell=puzzleState.metrics.cell;g.slice(1).forEach(p=>{p.x=a.x+(p.col-a.col)*cell;p.y=a.y+(p.row-a.row)*cell})})}
function computeCoverRect(imageRatio,boardW,boardH){const boardRatio=boardW/boardH;if(imageRatio>boardRatio){const h=boardH,w=h*imageRatio;return{w,h,x:(boardW-w)/2,y:0}}const w=boardW,h=w/imageRatio;return{w,h,x:0,y:(boardH-h)/2}}
function pieceSvgMarkup(p){const id=`${p.id}-clip`;return`<svg viewBox="0 0 ${p.size} ${p.size}" width="${p.size}" height="${p.size}"><defs><clipPath id="${id}"><path d="${p.path}"/></clipPath></defs><g clip-path="url(#${id})"><image href="${puzzleState.imageSrc}" x="${p.imgX}" y="${p.imgY}" width="${p.imgW}" height="${p.imgH}" preserveAspectRatio="xMidYMid slice"/></g><path class="piece-hit" d="${p.path}"/></svg>`}
function ensurePieceElement(p){if(!p.el){const el=document.createElement("div");el.className="piece";el.dataset.id=p.id;el.addEventListener("pointerdown",e=>startDragFromTable(p,e));p.el=el;els.piecesLayer.appendChild(el);p.dirty=true}if(p.dirty){p.el.innerHTML=pieceSvgMarkup(p);p.el.style.width=`${p.size}px`;p.el.style.height=`${p.size}px`;p.dirty=false}}
function syncLoosePieces(){if(!puzzleState)return;puzzleState.pieces.forEach(p=>{if(p.location==="tray"){if(p.el){p.el.remove();p.el=null}return}ensurePieceElement(p);p.el.classList.toggle("locked",p.locked);p.el.classList.toggle("connected",!p.locked&&groupMembers(p).length>1);p.el.classList.remove("dragging");p.el.style.zIndex=p.locked?"1":String(p.z||2);p.el.style.transform=`translate(${p.x}px,${p.y}px)`})}
function renderBoardCutlines(){if(!puzzleState)return;const {boardW,boardH,cell}=puzzleState.metrics,stroke=Math.max(2.2,cell*.045),col="rgba(27,39,54,.70)";els.boardCutlines.setAttribute("viewBox",`0 0 ${boardW} ${boardH}`);const out=[`<rect x="1" y="1" width="${boardW-2}" height="${boardH-2}" fill="none" stroke="${col}" stroke-width="${stroke}"/>`];for(let row=0;row<puzzleState.rows;row++)for(let boundary=0;boundary<puzzleState.cols-1;boundary++){const edge=puzzleState.verticalCuts[row][boundary],x=(boundary+1)*cell,y0=row*cell,y1=(row+1)*cell;out.push(`<path d="${sharedCutPath({x,y:y0},{x,y:y1},{x:1,y:0},edge,cell)}" fill="none" stroke="${col}" stroke-width="${stroke}"/>`)}for(let boundary=0;boundary<puzzleState.rows-1;boundary++)for(let colIndex=0;colIndex<puzzleState.cols;colIndex++){const edge=puzzleState.horizontalCuts[boundary][colIndex],y=(boundary+1)*cell,x0=colIndex*cell,x1=(colIndex+1)*cell;out.push(`<path d="${sharedCutPath({x:x0,y},{x:x1,y},{x:0,y:1},edge,cell)}" fill="none" stroke="${col}" stroke-width="${stroke}"/>`)}els.boardCutlines.innerHTML=out.join("")}
function groupMembers(p){return puzzleState?puzzleState.pieces.filter(q=>q.location==="table"&&q.groupId===p.groupId):[]}
function renderTray(){if(!puzzleState)return;els.trayPieces.innerHTML="";const list=puzzleState.pieces.filter(p=>p.location==="tray"&&(trayMode==="all"||p.isEdge)).sort((a,b)=>a.trayOrder-b.trayOrder);if(!list.length)els.trayPieces.innerHTML='<div class="tray-empty">No matching pieces in the tray.</div>';else list.forEach(p=>{const b=document.createElement("button");b.className="tray-piece";const thumb=Math.max(58,puzzleState.metrics.cell*.72);b.innerHTML=`<svg viewBox="0 0 ${p.size} ${p.size}" width="${thumb}" height="${thumb}"><defs><clipPath id="${p.id}-t"><path d="${p.path}"/></clipPath></defs><g clip-path="url(#${p.id}-t)"><image href="${puzzleState.imageSrc}" x="${p.imgX}" y="${p.imgY}" width="${p.imgW}" height="${p.imgH}" preserveAspectRatio="xMidYMid slice"/></g></svg>`;b.addEventListener("pointerdown",e=>startDragFromTray(p,e));els.trayPieces.appendChild(b)});updatePuzzleMeta()}
function updateToolLabels(){els.allModeBtn?.classList.toggle("selected",trayMode==="all");els.edgesModeBtn?.classList.toggle("selected",trayMode==="edges");els.pushModeBtn?.classList.toggle("selected",boardActionMode==="push");els.pullModeBtn?.classList.toggle("selected",boardActionMode==="pull");els.trayModeNote.textContent=trayMode==="edges"?"Showing edge pieces":"Showing all pieces";els.previewBtn.classList.toggle("selected",Boolean(puzzleState?.previewOn))}
function updatePuzzleMeta(){if(!puzzleState)return;const locked=puzzleState.pieces.filter(p=>p.locked).length,tray=puzzleState.pieces.filter(p=>p.location==="tray").length;els.puzzleTitle.textContent=`Level ${puzzleState.fish.number}`;els.puzzleInfo.textContent=`${puzzleState.difficulty.pieces} pieces • ${puzzleState.cols} × ${puzzleState.rows}`;els.pieceCounterChip.textContent=`${locked}/${puzzleState.pieces.length} locked`;els.trayCount.textContent=`${tray} pieces`;updateToolLabels()}
function setTrayMode(mode){trayMode=mode;renderTray();updateToolLabels()}
function runBoardAction(mode){
  if(!puzzleState)return;
  boardActionMode=mode;
  updateToolLabels();
  if(mode==="push")pushVisibleToBoard();
  else if(mode==="pull")pullLoosePieces();
}
function startDragFromTray(p,e){if(!puzzleState?.metrics)return;e.preventDefault();e.stopPropagation();const cap=e.currentTarget;try{cap.setPointerCapture(e.pointerId)}catch{}cap.style.visibility="hidden";cap.style.pointerEvents="none";p.location="table";p.locked=false;p.groupId=p.id;p.z=++zCounter;const r=els.playTable.getBoundingClientRect();p.x=e.clientX-r.left-p.size/2;p.y=e.clientY-r.top-p.size/2;ensurePieceElement(p);startDrag(p,e,"tray",cap)}
function startDragFromTable(p,e){if(!puzzleState||p.locked)return;e.preventDefault();e.stopPropagation();startDrag(p,e,"table",e.currentTarget)}
function startDrag(p,e,origin,cap){const rect=els.playTable.getBoundingClientRect(),group=groupMembers(p);dragState.active=true;dragState.piece=p;dragState.pointerId=e.pointerId;dragState.origin=origin;dragState.captureEl=cap;dragState.tableRect=rect;dragState.group=group.length?group:[p];dragState.startPositions=new Map(dragState.group.map(q=>[q.id,{x:q.x,y:q.y}]));dragState.group.forEach(q=>{q.z=++zCounter;ensurePieceElement(q);q.el.classList.add("dragging")});const px=e.clientX-rect.left,py=e.clientY-rect.top;dragState.offsetX=px-p.x;dragState.offsetY=py-p.y;try{cap?.setPointerCapture?.(e.pointerId)}catch{}}
function boundedGroupDelta(group,dx,dy){const m=puzzleState.metrics,size=group[0]?.size||0,minX=Math.min(...group.map(p=>p.x)),maxX=Math.max(...group.map(p=>p.x+p.size)),minY=Math.min(...group.map(p=>p.y)),maxY=Math.max(...group.map(p=>p.y+p.size)),pad=size*.25;if(minX+dx<-pad)dx=-pad-minX;if(maxX+dx>m.tableW+pad)dx=m.tableW+pad-maxX;if(minY+dy<-pad)dy=-pad-minY;if(maxY+dy>m.tableH+pad)dy=m.tableH+pad-maxY;return{dx,dy}}
function onPointerMove(e){if(!dragState.active||e.pointerId!==dragState.pointerId||!puzzleState)return;e.preventDefault();const p=dragState.piece,r=dragState.tableRect,desiredX=e.clientX-r.left-dragState.offsetX,desiredY=e.clientY-r.top-dragState.offsetY;let {dx,dy}=boundedGroupDelta(dragState.group,desiredX-p.x,desiredY-p.y);dragState.group.forEach(q=>{q.x+=dx;q.y+=dy;if(q.el)q.el.style.transform=`translate(${q.x}px,${q.y}px)`})}
function onPointerUp(e){if(!dragState.active||e.pointerId!==dragState.pointerId)return;e.preventDefault();const p=dragState.piece,trayRect=els.trayBar.getBoundingClientRect();if(p&&!p.locked&&pointInRect(e.clientX,e.clientY,trayRect)){if(dragState.group.length>1){showToast("Connected pieces stay together on the table.")}else{const cap=dragState.captureEl;if(cap){cap.style.visibility="";cap.style.pointerEvents=""}movePieceToTray(p);resetDrag();syncLoosePieces();renderTray();updatePuzzleMeta();return}}finishDrag()}
function finishDrag(){if(!dragState.active)return;let group=[...dragState.group];const cap=dragState.captureEl;if(cap){cap.style.visibility="";cap.style.pointerEvents=""}if(!trySnapGroupToBoard(group)){let merges=0;while(merges<8){const result=trySnapGroupToNeighbor(group);if(!result)break;group=result;merges++}trySnapGroupToBoard(group)}resetDrag();syncLoosePieces();renderTray();updatePuzzleMeta();checkComplete();if(pendingViewportRelayout)requestViewportRelayout(true)}
function trySnapGroupToBoard(group){if(!group.length)return false;let best=null;for(const p of group){const d=Math.hypot(p.x-p.targetX,p.y-p.targetY);if(!best||d<best.d)best={p,d}}if(!best||best.d>puzzleState.metrics.snapDistance)return false;moveGroupBy(group,best.p.targetX-best.p.x,best.p.targetY-best.p.y);group.forEach(p=>{p.locked=true;p.x=p.targetX;p.y=p.targetY});showToast(group.length>1?`${group.length} pieces locked!`:"Snap!");return true}
function adjacentPieces(p){return puzzleState.pieces.filter(q=>q.location==="table"&&q.groupId!==p.groupId&&Math.abs(q.row-p.row)+Math.abs(q.col-p.col)===1)}
function trySnapGroupToNeighbor(group){const cell=puzzleState.metrics.cell,threshold=puzzleState.metrics.magnetDistance;let best=null;for(const p of group){for(const n of adjacentPieces(p)){const ex=n.x+(p.col-n.col)*cell,ey=n.y+(p.row-n.row)*cell,d=Math.hypot(p.x-ex,p.y-ey);if(d<=threshold&&(!best||d<best.d))best={p,n,ex,ey,d}}}if(!best)return null;moveGroupBy(group,best.ex-best.p.x,best.ey-best.p.y);const targetId=best.n.groupId;group.forEach(p=>p.groupId=targetId);const merged=puzzleState.pieces.filter(p=>p.location==="table"&&p.groupId===targetId);if(best.n.locked){merged.forEach(p=>{p.locked=true;p.x=p.targetX;p.y=p.targetY})}showToast(`${merged.length} pieces connected`);return merged}
function moveGroupBy(group,dx,dy){group.forEach(p=>{p.x+=dx;p.y+=dy})}
function cancelDrag(){if(!dragState.active)return;const cap=dragState.captureEl;if(cap){cap.style.visibility="";cap.style.pointerEvents=""}resetDrag();if(puzzleState){syncLoosePieces();renderTray()}if(pendingViewportRelayout)requestViewportRelayout(true)}
function resetDrag(){dragState.active=false;dragState.piece=null;dragState.pointerId=null;dragState.captureEl=null;dragState.tableRect=null;dragState.group=[];dragState.startPositions=new Map()}
function pointInRect(x,y,r){return x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom}
function movePieceToTray(p){p.location="tray";p.locked=false;p.groupId=p.id;p.trayOrder=Math.random();if(p.el){p.el.remove();p.el=null}}
function clampPieceToTable(p){if(!puzzleState?.metrics)return;const {tableW,tableH}=puzzleState.metrics;p.x=Math.max(-p.size*.25,Math.min(tableW-p.size*.75,p.x));p.y=Math.max(-p.size*.25,Math.min(tableH-p.size*.75,p.y))}
function pushVisibleToBoard(){
  if(!puzzleState)return;
  const list=puzzleState.pieces.filter(p=>p.location==="tray"&&(trayMode==="all"||p.isEdge));
  if(!list.length){showToast(trayMode==="edges"?"No edge pieces left in the tray.":"Tray is empty.");return 0}
  list.forEach(piece=>{piece.groupId=piece.id;scatterPiece(piece)});
  syncLoosePieces();renderTray();updatePuzzleMeta();
  showToast(`${list.length} piece${list.length===1?"":"s"} pushed to board`);
  return list.length;
}
function pullLoosePieces(){
  if(!puzzleState)return 0;
  const tablePieces=puzzleState.pieces.filter(p=>p.location==="table"&&!p.locked);
  const counts=new Map();
  tablePieces.forEach(p=>counts.set(p.groupId,(counts.get(p.groupId)||0)+1));
  const loose=tablePieces.filter(p=>(counts.get(p.groupId)||0)===1);
  if(!loose.length){showToast("No loose pieces to pull back.");return 0}
  loose.forEach(movePieceToTray);
  syncLoosePieces();renderTray();updatePuzzleMeta();
  showToast(`${loose.length} loose piece${loose.length===1?"":"s"} returned to tray`);
  return loose.length;
}
function scatterPiece(p){const m=puzzleState.metrics;p.location="table";p.locked=false;p.groupId=p.id;p.z=++zCounter;let tries=0;do{p.x=Math.random()*(m.tableW-p.size);p.y=Math.random()*(m.tableH-p.size);tries++}while(tries<12&&p.x>m.boardLeft-p.size*.5&&p.x<m.boardLeft+m.boardW&&p.y>m.boardTop-p.size*.5&&p.y<m.boardTop+m.boardH);clampPieceToTable(p)}
function togglePreview(){if(!puzzleState)return;puzzleState.previewOn=!puzzleState.previewOn;els.boardShell.classList.toggle("show-preview",puzzleState.previewOn);updateToolLabels()}
function checkComplete(){if(!puzzleState||puzzleState.completeShown||!puzzleState.pieces.every(p=>p.locked))return;puzzleState.completeShown=true;const f=puzzleState.fish;const wasCaught=Boolean(caught[f.id]);caught[f.id]=caught[f.id]||{firstCompletedAt:new Date().toISOString(),completions:0,bestPieces:0};caught[f.id].completions++;caught[f.id].bestPieces=Math.max(caught[f.id].bestPieces,puzzleState.difficulty.pieces);saveCaught();if(!puzzleState.replay&&!wasCaught&&f.number===currentLevelNumber()){progress.nextLevel=Math.min(f.number+1,maxLevel()+1);saveProgress()}populateFishInfo(f,false);setTimeout(()=>showScreen("complete"),250)}
function confirmLeavePuzzle(){if(!puzzleState){showScreen("home");return}if(confirm("Leave this puzzle? Your unfinished layout will not be saved.")){clearPuzzle();showScreen("home")}}
function buildWaterBubbles(){const host=$("waterBubbles");for(let i=0;i<22;i++){const b=document.createElement("div");b.className="bubble";const s=5+Math.random()*18;b.style.width=b.style.height=s+"px";b.style.left=Math.random()*100+"%";b.style.setProperty("--drift",Math.random()*56-28+"px");b.style.animationDuration=10+Math.random()*18+"s";b.style.animationDelay=-Math.random()*26+"s";host.appendChild(b)}}
function spawnAmbientLoop(){const host=$("ambientFishLayer"),fish=speciesList();async function spawn(){if(document.hidden){setTimeout(spawn,2500);return}if(host.childElementCount>=8){setTimeout(spawn,2200);return}const f=fish[Math.floor(Math.random()*fish.length)],src=await resolveFishAsset(f,"swim");if(!src){setTimeout(spawn,900);return}const box=document.createElement("div"),img=document.createElement("img"),travelDirection=Math.random()<.5?"left":"right",sourceFacing=(f.facing||"right").toLowerCase(),flip=sourceFacing===travelDirection?1:-1,w=95+Math.random()*120,y=innerHeight*(.12+Math.random()*.68);box.className=`ambient-fish swim-${travelDirection}`;box.style.width=w+"px";box.style.zIndex=String(Math.round(w));box.style.setProperty("--y0",y+"px");box.style.setProperty("--y1",y+(Math.random()*70-35)+"px");box.style.setProperty("--dur",32+Math.random()*18+"s");img.alt="";img.src=src;img.style.setProperty("--fish-flip",String(flip));box.appendChild(img);host.appendChild(box);box.addEventListener("animationend",()=>box.remove(),{once:true});setTimeout(()=>{if(box.isConnected)box.remove()},55000);setTimeout(spawn,2500+Math.random()*4500)}setTimeout(spawn,900)}
