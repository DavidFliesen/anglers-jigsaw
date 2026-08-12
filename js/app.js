const APP_VERSION = 'v3.0';
const STORAGE_KEY = 'anglers-jigsaw-cooler-v3';
const difficulties = [
  { id: 'easy', label: 'Easy', pieces: 12, cols: 4, rows: 3 },
  { id: 'angler', label: 'Angler', pieces: 48, cols: 8, rows: 6 },
  { id: 'guide', label: 'Guide', pieces: 108, cols: 12, rows: 9 },
  { id: 'captain', label: 'Captain', pieces: 192, cols: 16, rows: 12 }
];

const screens = {
  home: document.getElementById('screen-home'),
  select: document.getElementById('screen-select'),
  how: document.getElementById('screen-how'),
  puzzle: document.getElementById('screen-puzzle'),
  complete: document.getElementById('screen-complete'),
  cooler: document.getElementById('screen-cooler')
};

const els = {
  body: document.body,
  waterBubbles: document.getElementById('waterBubbles'),
  toast: document.getElementById('toast'),
  appHeader: document.getElementById('appHeader'),
  homeBtn: document.getElementById('homeBtn'),
  coolerBtn: document.getElementById('coolerBtn'),
  startFishingBtn: document.getElementById('startFishingBtn'),
  howToPlayBtn: document.getElementById('howToPlayBtn'),
  homeCoolerBtn: document.getElementById('homeCoolerBtn'),
  difficultyStrip: document.getElementById('difficultyStrip'),
  fishSelectGrid: document.getElementById('fishSelectGrid'),
  howStartBtn: document.getElementById('howStartBtn'),
  playHomeBtn: document.getElementById('playHomeBtn'),
  puzzleTitle: document.getElementById('puzzleTitle'),
  puzzleInfo: document.getElementById('puzzleInfo'),
  pieceCounterChip: document.getElementById('pieceCounterChip'),
  previewBtn: document.getElementById('previewBtn'),
  fullscreenBtn: document.getElementById('fullscreenBtn'),
  edgesToTableBtn: document.getElementById('edgesToTableBtn'),
  allTableBtn: document.getElementById('allTableBtn'),
  newPuzzleBtn: document.getElementById('newPuzzleBtn'),
  playTable: document.getElementById('playTable'),
  boardShell: document.getElementById('boardShell'),
  boardPreviewImage: document.getElementById('boardPreviewImage'),
  boardCutlines: document.getElementById('boardCutlines'),
  piecesLayer: document.getElementById('piecesLayer'),
  trayBar: document.getElementById('trayBar'),
  trayPieces: document.getElementById('trayPieces'),
  trayCount: document.getElementById('trayCount'),
  trayFilter: document.getElementById('trayFilter'),
  collapseTrayBtn: document.getElementById('collapseTrayBtn'),
  completeImage: document.getElementById('completeImage'),
  completeTitle: document.getElementById('completeTitle'),
  completeScientific: document.getElementById('completeScientific'),
  completeDescription: document.getElementById('completeDescription'),
  completeHistory: document.getElementById('completeHistory'),
  fishAgainBtn: document.getElementById('fishAgainBtn'),
  openCoolerBtn: document.getElementById('openCoolerBtn'),
  coolerGrid: document.getElementById('coolerGrid'),
  coolerCountChip: document.getElementById('coolerCountChip'),
  coolerPlayBtn: document.getElementById('coolerPlayBtn'),
  homeVersion: document.getElementById('homeVersion'),
  playVersion: document.getElementById('playVersion')
};

let cooler = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
let currentDifficulty = difficulties[1];
let puzzleState = null;
let currentScreen = 'home';
let zCounter = 20;

const dragState = {
  active: false,
  piece: null,
  offsetX: 0,
  offsetY: 0,
  pointerId: null,
  origin: 'table'
};

initialize();

function initialize() {
  els.homeVersion.textContent = APP_VERSION;
  els.playVersion.textContent = APP_VERSION;
  buildWaterBubbles();
  bindUI();
  renderPuzzleChoices();
  renderCooler();
  updateCoolerChip();
  showScreen('home');
}

function bindUI() {
  els.homeBtn.addEventListener('click', () => showScreen('home'));
  els.coolerBtn.addEventListener('click', () => openCooler());
  els.startFishingBtn.addEventListener('click', () => showScreen('select'));
  els.howToPlayBtn.addEventListener('click', () => showScreen('how'));
  els.homeCoolerBtn.addEventListener('click', () => openCooler());
  els.howStartBtn.addEventListener('click', () => showScreen('select'));
  els.playHomeBtn.addEventListener('click', confirmLeavePuzzle);
  els.previewBtn.addEventListener('click', togglePreview);
  els.fullscreenBtn.addEventListener('click', toggleFullscreen);
  els.edgesToTableBtn.addEventListener('click', edgesToTable);
  els.allTableBtn.addEventListener('click', allToTableAction);
  els.newPuzzleBtn.addEventListener('click', () => showScreen('select'));
  els.trayFilter.addEventListener('change', renderTray);
  els.collapseTrayBtn.addEventListener('click', toggleTray);
  els.fishAgainBtn.addEventListener('click', () => showScreen('select'));
  els.openCoolerBtn.addEventListener('click', () => openCooler());
  els.coolerPlayBtn.addEventListener('click', () => showScreen('select'));

  document.querySelectorAll('[data-back-home="true"]').forEach(btn => {
    btn.addEventListener('click', () => showScreen('home'));
  });

  window.addEventListener('resize', () => {
    if (currentScreen === 'puzzle' && puzzleState) {
      layoutPuzzle();
    }
  });

  window.addEventListener('pointermove', onPointerMove, { passive: false });
  window.addEventListener('pointerup', onPointerUp, { passive: false });
  window.addEventListener('pointercancel', cancelDrag, { passive: false });
}

function buildWaterBubbles() {
  if (!els.waterBubbles) return;
  els.waterBubbles.innerHTML = '';

  const count = 12;
  for (let i = 0; i < count; i += 1) {
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    const size = 6 + Math.random() * 16;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${Math.random() * 100}%`;
    bubble.style.setProperty('--drift', `${Math.random() * 42 - 21}px`);
    bubble.style.animationDuration = `${12 + Math.random() * 14}s`;
    bubble.style.animationDelay = `${-Math.random() * 20}s`;
    els.waterBubbles.appendChild(bubble);
  }
}

function showScreen(name) {
  Object.entries(screens).forEach(([key, screen]) => {
    screen.classList.toggle('active', key === name);
  });

  currentScreen = name;
  const playing = name === 'puzzle';
  els.body.classList.toggle('puzzle-mode', playing);

  if (playing && puzzleState) {
    requestAnimationFrame(() => layoutPuzzle());
  }
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.remove('hidden');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => els.toast.classList.add('hidden'), 1800);
}

function saveCooler() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cooler));
}

function discoveredCount() {
  return Object.keys(cooler).length;
}

function updateCoolerChip() {
  els.coolerCountChip.textContent = `${discoveredCount()} discovered`;
}

function renderPuzzleChoices() {
  els.difficultyStrip.innerHTML = '';
  difficulties.forEach(level => {
    const button = document.createElement('button');
    button.className = 'difficulty-choice';
    button.classList.toggle('selected', level.id === currentDifficulty.id);
    button.innerHTML = `<strong>${level.pieces}</strong><span>${level.label} • ${level.cols} × ${level.rows}</span>`;
    button.addEventListener('click', () => {
      currentDifficulty = level;
      renderPuzzleChoices();
    });
    els.difficultyStrip.appendChild(button);
  });

  els.fishSelectGrid.innerHTML = '';
  Object.values(speciesData).forEach(fish => {
    const card = document.createElement('button');
    card.className = 'fish-select-card';
    card.innerHTML = `
      <img src="${fish.image}" alt="${fish.commonName}" />
      <span class="fish-card-name">${fish.commonName}</span>
      <span class="fish-card-habitat">${fish.habitat}</span>
    `;
    card.addEventListener('click', () => startPuzzle(fish, currentDifficulty));
    els.fishSelectGrid.appendChild(card);
  });
}

function openCooler() {
  renderCooler();
  showScreen('cooler');
}

function renderCooler() {
  els.coolerGrid.innerHTML = '';

  Object.values(speciesData).forEach(fish => {
    const discovered = Boolean(cooler[fish.id]);
    const card = document.createElement('article');
    card.className = 'cooler-card';
    card.innerHTML = `
      <img src="${fish.image}" alt="${fish.commonName}" />
      <div class="cooler-card-body">
        <strong>${fish.commonName}</strong>
        <div class="cooler-status">${discovered ? 'Discovered' : 'Not discovered yet'}</div>
      </div>
    `;
    els.coolerGrid.appendChild(card);
  });

  updateCoolerChip();
}

async function startPuzzle(fish, difficulty) {
  clearPuzzle();
  const ratio = await loadImageRatio(fish.image).catch(() => 4 / 3);

  puzzleState = {
    fish,
    difficulty,
    ratio,
    rows: difficulty.rows,
    cols: difficulty.cols,
    pieces: [],
    previewOn: false,
    trayCollapsed: false,
    metrics: null,
    completeShown: false
  };

  buildPieces();
  showScreen('puzzle');
  requestAnimationFrame(() => layoutPuzzle(true));
}

function clearPuzzle() {
  cancelDrag();
  puzzleState = null;
  els.piecesLayer.innerHTML = '';
  els.trayPieces.innerHTML = '';
  els.boardCutlines.innerHTML = '';
  els.boardPreviewImage.removeAttribute('src');
  els.boardShell.classList.remove('show-preview');
}

function loadImageRatio(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth && img.naturalHeight) {
        resolve(img.naturalWidth / img.naturalHeight);
      } else {
        resolve(4 / 3);
      }
    };
    img.onerror = reject;
    img.src = src;
  });
}

function buildPieces() {
  const { rows, cols } = puzzleState;
  const edgesList = generateEdgeGrid(rows, cols);
  const pieces = [];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const idx = row * cols + col;
      const edges = edgesList[idx];
      const tabs = outwardTabInfo(edges);
      pieces.push({
        id: `piece-${row}-${col}`,
        row,
        col,
        edges,
        tabs,
        isEdge: isEdgePiece(row, col, rows, cols),
        isCorner: isCornerPiece(row, col, rows, cols),
        location: 'tray',
        locked: false,
        x: 0,
        y: 0,
        z: 1,
        size: 0,
        margin: 0,
        path: '',
        thumbScale: 0.64,
        el: null,
        thumbEl: null,
        imgX: 0,
        imgY: 0,
        imgW: 0,
        imgH: 0,
        targetX: 0,
        targetY: 0
      });
    }
  }

  puzzleState.pieces = pieces;
}

function generateEdgeGrid(rows, cols) {
  const horizontal = Array.from({ length: rows - 1 }, (_, row) =>
    Array.from({ length: cols }, (_, col) => (((row + col) % 2 === 0 ? 1 : -1) * (((row * 7 + col * 5) % 3) === 0 ? -1 : 1)))
  );
  const vertical = Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols - 1 }, (_, col) => (((row + col) % 2 === 0 ? -1 : 1) * (((row * 11 + col * 3) % 4) === 0 ? -1 : 1)))
  );

  const result = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      result.push({
        top: row === 0 ? 0 : -horizontal[row - 1][col],
        right: col === cols - 1 ? 0 : vertical[row][col],
        bottom: row === rows - 1 ? 0 : horizontal[row][col],
        left: col === 0 ? 0 : -vertical[row][col - 1]
      });
    }
  }
  return result;
}

function isEdgePiece(row, col, rows, cols) {
  return row === 0 || col === 0 || row === rows - 1 || col === cols - 1;
}

function isCornerPiece(row, col, rows, cols) {
  const vertical = row === 0 || row === rows - 1;
  const horizontal = col === 0 || col === cols - 1;
  return vertical && horizontal;
}

function outwardTabInfo(edges) {
  const directions = [];
  if (edges.top === 1) directions.push('up');
  if (edges.right === 1) directions.push('right');
  if (edges.bottom === 1) directions.push('down');
  if (edges.left === 1) directions.push('left');
  return { count: directions.length, directions };
}

function layoutPuzzle(initial = false) {
  if (!puzzleState) return;

  const tableRect = els.playTable.getBoundingClientRect();
  const oldMetrics = puzzleState.metrics;
  const maxW = Math.max(320, tableRect.width - 72);
  const maxH = Math.max(240, tableRect.height - 72);
  let boardW = maxW;
  let boardH = boardW * 3 / 4;
  if (boardH > maxH) {
    boardH = maxH;
    boardW = boardH * 4 / 3;
  }

  const cell = Math.floor(boardW / puzzleState.cols);
  boardW = cell * puzzleState.cols;
  boardH = cell * puzzleState.rows;
  const boardLeft = Math.round((tableRect.width - boardW) / 2);
  const boardTop = Math.round((tableRect.height - boardH) / 2);

  const metrics = {
    tableW: tableRect.width,
    tableH: tableRect.height,
    boardW,
    boardH,
    boardLeft,
    boardTop,
    cell,
    margin: cell * 0.26,
    snapDistance: cell * 0.34
  };
  puzzleState.metrics = metrics;

  els.boardShell.style.width = `${boardW}px`;
  els.boardShell.style.height = `${boardH}px`;
  els.boardShell.style.left = `${boardLeft}px`;
  els.boardShell.style.top = `${boardTop}px`;
  els.boardPreviewImage.src = puzzleState.fish.image;

  const draw = computeCoverRect(puzzleState.ratio, boardW, boardH);

  puzzleState.pieces.forEach(piece => {
    if (oldMetrics && !initial && !piece.locked && piece.location === 'table') {
      piece.x = (piece.x / oldMetrics.tableW) * metrics.tableW;
      piece.y = (piece.y / oldMetrics.tableH) * metrics.tableH;
    }

    const shape = buildPieceShape(metrics.cell, metrics.margin, piece.edges);
    piece.size = shape.size;
    piece.margin = shape.margin;
    piece.path = shape.path;
    piece.targetX = boardLeft + piece.col * metrics.cell - shape.margin;
    piece.targetY = boardTop + piece.row * metrics.cell - shape.margin;
    piece.imgX = draw.x - piece.col * metrics.cell + shape.margin;
    piece.imgY = draw.y - piece.row * metrics.cell + shape.margin;
    piece.imgW = draw.w;
    piece.imgH = draw.h;

    if (piece.locked) {
      piece.x = piece.targetX;
      piece.y = piece.targetY;
    } else if (piece.location === 'table') {
      clampPieceToTable(piece);
    }
  });

  renderBoardCutlines();
  syncLoosePieces();
  renderTray();
  updatePuzzleMeta();
}

function computeCoverRect(imageRatio, boardW, boardH) {
  const boardRatio = boardW / boardH;
  if (imageRatio > boardRatio) {
    const h = boardH;
    const w = h * imageRatio;
    return { w, h, x: (boardW - w) / 2, y: 0 };
  }
  const w = boardW;
  const h = w / imageRatio;
  return { w, h, x: 0, y: (boardH - h) / 2 };
}

function buildPieceShape(cell, margin, edges) {
  const s = cell;
  const m = margin;
  const ext = s + m * 2;
  const x0 = m;
  const y0 = m;
  const x1 = m + s;
  const y1 = m + s;
  const cx = m + s / 2;
  const cy = m + s / 2;
  const neck = s * 0.17;
  const depth = s * 0.23;
  const spread = s * 0.17;

  let d = `M ${x0} ${y0}`;

  d += topEdgePath(x0, y0, x1, cx, neck, depth, spread, edges.top);
  d += rightEdgePath(x1, y0, y1, cy, neck, depth, spread, edges.right);
  d += bottomEdgePath(x1, y1, x0, cx, neck, depth, spread, edges.bottom);
  d += leftEdgePath(x0, y1, y0, cy, neck, depth, spread, edges.left);
  d += ' Z';

  return { path: d, size: ext, margin: m };
}

function topEdgePath(x0, y, x1, cx, neck, depth, spread, edge) {
  if (edge === 0) return ` L ${x1} ${y}`;
  const dir = edge === 1 ? -1 : 1;
  return [
    ` L ${cx - neck} ${y}`,
    ` C ${cx - neck * 0.9} ${y}, ${cx - spread} ${y + dir * depth}, ${cx} ${y + dir * depth}`,
    ` C ${cx + spread} ${y + dir * depth}, ${cx + neck * 0.9} ${y}, ${cx + neck} ${y}`,
    ` L ${x1} ${y}`
  ].join(' ');
}

function rightEdgePath(x, y0, y1, cy, neck, depth, spread, edge) {
  if (edge === 0) return ` L ${x} ${y1}`;
  const dir = edge === 1 ? 1 : -1;
  return [
    ` L ${x} ${cy - neck}`,
    ` C ${x} ${cy - neck * 0.9}, ${x + dir * depth} ${cy - spread}, ${x + dir * depth} ${cy}`,
    ` C ${x + dir * depth} ${cy + spread}, ${x} ${cy + neck * 0.9}, ${x} ${cy + neck}`,
    ` L ${x} ${y1}`
  ].join(' ');
}

function bottomEdgePath(x1, y, x0, cx, neck, depth, spread, edge) {
  if (edge === 0) return ` L ${x0} ${y}`;
  const dir = edge === 1 ? 1 : -1;
  return [
    ` L ${cx + neck} ${y}`,
    ` C ${cx + neck * 0.9} ${y}, ${cx + spread} ${y + dir * depth}, ${cx} ${y + dir * depth}`,
    ` C ${cx - spread} ${y + dir * depth}, ${cx - neck * 0.9} ${y}, ${cx - neck} ${y}`,
    ` L ${x0} ${y}`
  ].join(' ');
}

function leftEdgePath(x, y1, y0, cy, neck, depth, spread, edge) {
  if (edge === 0) return ` L ${x} ${y0}`;
  const dir = edge === 1 ? -1 : 1;
  return [
    ` L ${x} ${cy + neck}`,
    ` C ${x} ${cy + neck * 0.9}, ${x + dir * depth} ${cy + spread}, ${x + dir * depth} ${cy}`,
    ` C ${x + dir * depth} ${cy - spread}, ${x} ${cy - neck * 0.9}, ${x} ${cy - neck}`,
    ` L ${x} ${y0}`
  ].join(' ');
}

function renderBoardCutlines() {
  if (!puzzleState) return;
  const { boardW, boardH, cell } = puzzleState.metrics;
  const stroke = Math.max(1.2, cell * 0.05);
  els.boardCutlines.setAttribute('viewBox', `0 0 ${boardW} ${boardH}`);
  els.boardCutlines.innerHTML = puzzleState.pieces.map(piece => {
    const tx = piece.col * cell - piece.margin;
    const ty = piece.row * cell - piece.margin;
    return `<path d="${piece.path}" transform="translate(${tx} ${ty})" fill="none" stroke="rgba(22, 43, 75, 0.75)" stroke-width="${stroke}" stroke-linejoin="round" stroke-linecap="round" />`;
  }).join('');
}

function pieceSvgMarkup(piece) {
  const clipId = `${piece.id}-clip`;
  const stroke = Math.max(1.2, puzzleState.metrics.cell * 0.042);
  return `
    <svg viewBox="0 0 ${piece.size} ${piece.size}" width="${piece.size}" height="${piece.size}" aria-hidden="true">
      <defs>
        <clipPath id="${clipId}">
          <path d="${piece.path}" />
        </clipPath>
      </defs>
      <g clip-path="url(#${clipId})">
        <image href="${puzzleState.fish.image}" x="${piece.imgX}" y="${piece.imgY}" width="${piece.imgW}" height="${piece.imgH}" preserveAspectRatio="xMidYMid slice" />
      </g>
      <path d="${piece.path}" fill="none" stroke="rgba(245,251,255,0.92)" stroke-width="${stroke}" stroke-linejoin="round" stroke-linecap="round" />
      <path class="piece-hit" d="${piece.path}" />
    </svg>
  `;
}

function createPieceElement(piece) {
  const el = document.createElement('div');
  el.className = 'piece';
  el.dataset.id = piece.id;
  el.innerHTML = pieceSvgMarkup(piece);
  el.style.width = `${piece.size}px`;
  el.style.height = `${piece.size}px`;
  el.addEventListener('pointerdown', event => startDragFromTable(piece, event));
  piece.el = el;
  els.piecesLayer.appendChild(el);
}

function ensurePieceElement(piece) {
  if (!piece.el) {
    createPieceElement(piece);
  } else {
    piece.el.innerHTML = pieceSvgMarkup(piece);
    piece.el.style.width = `${piece.size}px`;
    piece.el.style.height = `${piece.size}px`;
  }
}

function syncLoosePieces() {
  if (!puzzleState) return;

  puzzleState.pieces.forEach(piece => {
    if (piece.location === 'tray') {
      if (piece.el) {
        piece.el.remove();
        piece.el = null;
      }
      return;
    }

    ensurePieceElement(piece);
    piece.el.classList.toggle('locked', piece.locked);
    piece.el.classList.remove('dragging');
    piece.el.style.zIndex = piece.locked ? '1' : String(piece.z || 2);
    piece.el.style.transform = `translate(${piece.x}px, ${piece.y}px)`;
  });
}

function updatePuzzleMeta() {
  if (!puzzleState) return;
  const { fish, difficulty, rows, cols } = puzzleState;
  const locked = puzzleState.pieces.filter(piece => piece.locked).length;
  const total = puzzleState.pieces.length;
  els.puzzleTitle.textContent = fish.commonName;
  els.puzzleInfo.textContent = `${difficulty.label} • ${difficulty.pieces} pieces • ${cols} × ${rows}`;
  els.pieceCounterChip.textContent = `${locked}/${total} locked`;
  els.trayCount.textContent = `${puzzleState.pieces.filter(piece => piece.location === 'tray').length} pieces`;
  els.previewBtn.textContent = puzzleState.previewOn ? 'Hide Preview' : 'Preview';
  const trayPiecesLeft = puzzleState.pieces.filter(piece => piece.location === 'tray').length;
  els.allTableBtn.textContent = trayPiecesLeft > 0 ? 'All to Table' : 'Recall Singles';
}

function renderTray() {
  if (!puzzleState) return;
  els.trayPieces.innerHTML = '';

  const trayPieces = puzzleState.pieces.filter(piece => piece.location === 'tray' && matchesTrayFilter(piece, els.trayFilter.value));

  if (!trayPieces.length) {
    const empty = document.createElement('div');
    empty.className = 'tray-empty';
    empty.textContent = 'No matching pieces in the tray.';
    els.trayPieces.appendChild(empty);
  } else {
    trayPieces.forEach(piece => {
      const btn = document.createElement('button');
      btn.className = 'tray-piece';
      btn.innerHTML = trayPieceMarkup(piece);
      btn.addEventListener('pointerdown', event => startDragFromTray(piece, event));
      els.trayPieces.appendChild(btn);
      piece.thumbEl = btn;
    });
  }

  updatePuzzleMeta();
}

function trayPieceMarkup(piece) {
  const thumb = Math.max(58, puzzleState.metrics ? puzzleState.metrics.cell * 0.75 : 64);
  return `
    <svg viewBox="0 0 ${piece.size} ${piece.size}" width="${thumb}" height="${thumb}" aria-hidden="true">
      <defs>
        <clipPath id="${piece.id}-thumb-clip">
          <path d="${piece.path}" />
        </clipPath>
      </defs>
      <g clip-path="url(#${piece.id}-thumb-clip)">
        <image href="${puzzleState.fish.image}" x="${piece.imgX}" y="${piece.imgY}" width="${piece.imgW}" height="${piece.imgH}" preserveAspectRatio="xMidYMid slice" />
      </g>
      <path d="${piece.path}" fill="none" stroke="rgba(245,251,255,0.92)" stroke-width="${Math.max(1.1, puzzleState.metrics.cell * 0.04)}" stroke-linejoin="round" stroke-linecap="round" />
    </svg>
  `;
}

function matchesTrayFilter(piece, filterValue) {
  if (filterValue === 'all') return true;
  if (filterValue === 'edges') return piece.isEdge;
  if (filterValue === 'corners') return piece.isCorner;
  if (filterValue === `out-${piece.tabs.count}`) return true;
  if (piece.tabs.count === 1) {
    if (filterValue === 'out-up' && piece.tabs.directions[0] === 'up') return true;
    if (filterValue === 'out-right' && piece.tabs.directions[0] === 'right') return true;
    if (filterValue === 'out-down' && piece.tabs.directions[0] === 'down') return true;
    if (filterValue === 'out-left' && piece.tabs.directions[0] === 'left') return true;
  }
  return false;
}

function startDragFromTray(piece, event) {
  if (!puzzleState || piece.locked) return;
  if (!puzzleState.metrics) return;

  event.preventDefault();
  const tableRect = els.playTable.getBoundingClientRect();
  piece.location = 'table';
  piece.locked = false;
  piece.z = ++zCounter;
  piece.x = event.clientX - tableRect.left - piece.size / 2;
  piece.y = event.clientY - tableRect.top - piece.size / 2;
  clampPieceToTable(piece);
  syncLoosePieces();
  renderTray();
  beginDrag(piece, event, piece.size / 2, piece.size / 2, 'tray');
}

function startDragFromTable(piece, event) {
  if (!puzzleState || piece.locked) return;
  event.preventDefault();
  const tableRect = els.playTable.getBoundingClientRect();
  piece.z = ++zCounter;
  beginDrag(piece, event, event.clientX - tableRect.left - piece.x, event.clientY - tableRect.top - piece.y, 'table');
}

function beginDrag(piece, event, offsetX, offsetY, origin) {
  dragState.active = true;
  dragState.piece = piece;
  dragState.offsetX = offsetX;
  dragState.offsetY = offsetY;
  dragState.pointerId = event.pointerId;
  dragState.origin = origin;
  piece.el?.classList.add('dragging');
}

function onPointerMove(event) {
  if (!dragState.active || !puzzleState) return;
  if (dragState.pointerId !== null && event.pointerId !== dragState.pointerId) return;
  event.preventDefault();

  const tableRect = els.playTable.getBoundingClientRect();
  const piece = dragState.piece;
  piece.x = event.clientX - tableRect.left - dragState.offsetX;
  piece.y = event.clientY - tableRect.top - dragState.offsetY;
  clampPieceToTable(piece);

  if (piece.el) {
    piece.el.style.transform = `translate(${piece.x}px, ${piece.y}px)`;
    piece.el.style.zIndex = String(piece.z);
  }
}

function onPointerUp(event) {
  if (!dragState.active || !puzzleState) return;
  if (dragState.pointerId !== null && event.pointerId !== dragState.pointerId) return;
  event.preventDefault();

  const piece = dragState.piece;
  piece.el?.classList.remove('dragging');

  const trayRect = els.trayBar.getBoundingClientRect();
  if (pointInRect(event.clientX, event.clientY, trayRect) && !piece.locked) {
    movePieceToTray(piece);
    cancelDrag();
    return;
  }

  const dx = piece.x - piece.targetX;
  const dy = piece.y - piece.targetY;
  if (Math.hypot(dx, dy) <= puzzleState.metrics.snapDistance) {
    lockPiece(piece);
  } else {
    piece.location = 'table';
    clampPieceToTable(piece);
    syncLoosePieces();
  }

  renderTray();
  checkCompletion();
  cancelDrag();
}

function cancelDrag() {
  dragState.active = false;
  dragState.piece = null;
  dragState.offsetX = 0;
  dragState.offsetY = 0;
  dragState.pointerId = null;
  dragState.origin = 'table';
}

function movePieceToTray(piece) {
  piece.location = 'tray';
  piece.locked = false;
  if (piece.el) {
    piece.el.remove();
    piece.el = null;
  }
  renderTray();
}

function lockPiece(piece) {
  piece.location = 'table';
  piece.locked = true;
  piece.x = piece.targetX;
  piece.y = piece.targetY;
  syncLoosePieces();
  showToast('Snap!');
}

function pointInRect(x, y, rect) {
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

function clampPieceToTable(piece) {
  const { tableW, tableH } = puzzleState.metrics;
  const minX = -piece.size * 0.25;
  const maxX = tableW - piece.size * 0.75;
  const minY = -piece.size * 0.25;
  const maxY = tableH - piece.size * 0.75;
  piece.x = Math.max(minX, Math.min(maxX, piece.x));
  piece.y = Math.max(minY, Math.min(maxY, piece.y));
}

function edgesToTable() {
  if (!puzzleState) return;
  const pieces = puzzleState.pieces.filter(piece => piece.location === 'tray' && piece.isEdge);
  if (!pieces.length) {
    showToast('No edge pieces left in the tray.');
    return;
  }
  pieces.forEach(piece => scatterEdgePiece(piece));
  syncLoosePieces();
  renderTray();
}

function scatterEdgePiece(piece) {
  const { boardLeft, boardTop, boardW, boardH, cell } = puzzleState.metrics;
  piece.location = 'table';
  piece.locked = false;
  piece.z = ++zCounter;

  let x = boardLeft;
  let y = boardTop;

  if (piece.isCorner) {
    x = piece.col === 0 ? boardLeft - cell * 0.8 : boardLeft + boardW - cell * 0.2;
    y = piece.row === 0 ? boardTop - cell * 0.8 : boardTop + boardH - cell * 0.2;
  } else if (piece.row === 0) {
    x = boardLeft + Math.random() * (boardW - cell);
    y = boardTop - cell * (0.7 + Math.random() * 0.6);
  } else if (piece.row === puzzleState.rows - 1) {
    x = boardLeft + Math.random() * (boardW - cell);
    y = boardTop + boardH + Math.random() * (cell * 0.6);
  } else if (piece.col === 0) {
    x = boardLeft - cell * (0.7 + Math.random() * 0.6);
    y = boardTop + Math.random() * (boardH - cell);
  } else if (piece.col === puzzleState.cols - 1) {
    x = boardLeft + boardW + Math.random() * (cell * 0.6);
    y = boardTop + Math.random() * (boardH - cell);
  }

  piece.x = x - piece.margin;
  piece.y = y - piece.margin;
  clampPieceToTable(piece);
}

function allToTableAction() {
  if (!puzzleState) return;
  const trayPieces = puzzleState.pieces.filter(piece => piece.location === 'tray');
  if (trayPieces.length) {
    trayPieces.forEach(piece => scatterPieceOnTable(piece));
    syncLoosePieces();
    renderTray();
    return;
  }

  const singles = puzzleState.pieces.filter(piece => !piece.locked && piece.location === 'table');
  if (!singles.length) {
    showToast('Nothing to recall.');
    return;
  }

  singles.forEach(movePieceToTraySilently);
  syncLoosePieces();
  renderTray();
  showToast('Loose pieces returned to tray.');
}

function movePieceToTraySilently(piece) {
  piece.location = 'tray';
  piece.locked = false;
  if (piece.el) {
    piece.el.remove();
    piece.el = null;
  }
}

function scatterPieceOnTable(piece) {
  const { boardLeft, boardTop, boardW, boardH, cell } = puzzleState.metrics;
  piece.location = 'table';
  piece.locked = false;
  piece.z = ++zCounter;

  const outerBand = [
    { x1: boardLeft - cell * 1.6, x2: boardLeft + boardW + cell * 0.6, y1: boardTop - cell * 1.1, y2: boardTop - cell * 0.2 },
    { x1: boardLeft - cell * 1.6, x2: boardLeft + boardW + cell * 0.6, y1: boardTop + boardH + cell * 0.1, y2: boardTop + boardH + cell * 0.8 },
    { x1: boardLeft - cell * 1.2, x2: boardLeft - cell * 0.2, y1: boardTop - cell * 0.4, y2: boardTop + boardH + cell * 0.4 },
    { x1: boardLeft + boardW + cell * 0.1, x2: boardLeft + boardW + cell * 0.8, y1: boardTop - cell * 0.4, y2: boardTop + boardH + cell * 0.4 },
    { x1: boardLeft + cell * 0.2, x2: boardLeft + boardW - cell * 1.2, y1: boardTop + cell * 0.2, y2: boardTop + boardH - cell * 1.2 }
  ];

  const zone = outerBand[Math.floor(Math.random() * outerBand.length)];
  const x = zone.x1 + Math.random() * Math.max(8, zone.x2 - zone.x1);
  const y = zone.y1 + Math.random() * Math.max(8, zone.y2 - zone.y1);
  piece.x = x - piece.margin;
  piece.y = y - piece.margin;
  clampPieceToTable(piece);
}

function togglePreview() {
  if (!puzzleState) return;
  puzzleState.previewOn = !puzzleState.previewOn;
  els.boardShell.classList.toggle('show-preview', puzzleState.previewOn);
  updatePuzzleMeta();
}

function toggleTray() {
  if (!puzzleState) return;
  puzzleState.trayCollapsed = !puzzleState.trayCollapsed;
  els.trayBar.classList.toggle('tray-hidden', puzzleState.trayCollapsed);
  els.collapseTrayBtn.textContent = puzzleState.trayCollapsed ? 'Show Tray' : 'Hide Tray';
}

async function toggleFullscreen() {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen?.();
    } else {
      await document.exitFullscreen?.();
    }
  } catch {
    showToast('Full screen is not available here.');
  }
}

function confirmLeavePuzzle() {
  if (!puzzleState) {
    showScreen('home');
    return;
  }
  showScreen('home');
}

function checkCompletion() {
  if (!puzzleState) return;
  const complete = puzzleState.pieces.every(piece => piece.locked);
  if (!complete || puzzleState.completeShown) return;

  puzzleState.completeShown = true;
  cooler[puzzleState.fish.id] = true;
  saveCooler();
  renderCooler();

  els.completeImage.src = puzzleState.fish.image;
  els.completeTitle.textContent = puzzleState.fish.commonName;
  els.completeScientific.textContent = puzzleState.fish.scientificName;
  els.completeDescription.textContent = puzzleState.fish.description;
  els.completeHistory.textContent = puzzleState.fish.history;
  showScreen('complete');
}
