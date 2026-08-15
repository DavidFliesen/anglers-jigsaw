const APP_VERSION = 'v3.5.3';
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
  puzzleTitle: document.getElementById('puzzleTitle'),
  puzzleInfo: document.getElementById('puzzleInfo'),
  pieceCounterChip: document.getElementById('pieceCounterChip'),
  previewBtn: document.getElementById('previewBtn'),
  fullscreenBtn: document.getElementById('globalFullscreenBtn'),
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
  completeKicker: document.getElementById('completeKicker'),
  completeImage: document.getElementById('completeImage'),
  completeTitle: document.getElementById('completeTitle'),
  completeScientific: document.getElementById('completeScientific'),
  completeDescription: document.getElementById('completeDescription'),
  completeIdentification: document.getElementById('completeIdentification'),
  completeHabitat: document.getElementById('completeHabitat'),
  completeHistory: document.getElementById('completeHistory'),
  fishAgainBtn: document.getElementById('fishAgainBtn'),
  openCoolerBtn: document.getElementById('openCoolerBtn'),
  coolerGrid: document.getElementById('coolerGrid'),
  coolerCountChip: document.getElementById('coolerCountChip'),
  coolerPlayBtn: document.getElementById('coolerPlayBtn'),
  homeVersion: document.getElementById('homeVersion'),
  playVersion: document.getElementById('playVersion'),
  globalVersion: document.getElementById('globalVersion')
};

let cooler = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
let currentDifficulty = difficulties[1];
let puzzleState = null;
let currentScreen = 'home';
let zCounter = 20;
let detailFish = null;
const puzzleThemes = ['open-ocean', 'deep-abyss', 'coral-reef', 'shipwreck'];

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
  if (els.homeVersion) els.homeVersion.textContent = APP_VERSION;
  if (els.playVersion) els.playVersion.textContent = APP_VERSION;
  if (els.globalVersion) els.globalVersion.textContent = APP_VERSION;
  buildWaterBubbles();
  bindUI();
  bindPuzzleViewportDiagnostics();
  document.addEventListener('fullscreenchange', updateFullscreenButton);
  document.addEventListener('webkitfullscreenchange', updateFullscreenButton);
  renderPuzzleChoices();
  renderCooler();
  updateCoolerChip();
  showScreen('home');
  updateFullscreenButton();
}


function bindPuzzleViewportDiagnostics() {
  const keepAtTop = () => {
    if (currentScreen !== 'puzzle') return;
    if (window.scrollY !== 0 || document.documentElement.scrollTop !== 0 || document.body.scrollTop !== 0) {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      window.scrollTo(0, 0);
    }
  };

  window.addEventListener('scroll', keepAtTop, { passive: true });

  ['gesturestart', 'gesturechange', 'gestureend'].forEach(type => {
    document.addEventListener(type, event => {
      if (currentScreen === 'puzzle') {
        event.preventDefault();
      }
    }, { passive: false });
  });

  document.addEventListener('touchmove', event => {
    if (currentScreen !== 'puzzle') return;

    const target = event.target;
    const inTrayScroller = target.closest?.('#trayPieces');
    const onPuzzlePiece = target.closest?.('.piece') || target.closest?.('.tray-piece');
    const onPlayArea = target.closest?.('#playTable');

    if (dragState.active || onPuzzlePiece || onPlayArea) {
      event.preventDefault();
      keepAtTop();
      return;
    }

    if (!inTrayScroller) {
      event.preventDefault();
      keepAtTop();
    }
  }, { passive: false, capture: true });
}

function bindUI() {
  els.homeBtn.addEventListener('click', () => {
    ensureFullscreenForNavigation();
    if (currentScreen === 'puzzle') confirmLeavePuzzle();
    else showScreen('home');
  });
  els.coolerBtn.addEventListener('click', () => {
    ensureFullscreenForNavigation();
    openCooler();
  });
  els.startFishingBtn.addEventListener('click', () => {
    ensureFullscreenForNavigation();
    showScreen('select');
  });
  els.howToPlayBtn.addEventListener('click', () => {
    ensureFullscreenForNavigation();
    showScreen('how');
  });
  els.homeCoolerBtn.addEventListener('click', () => {
    ensureFullscreenForNavigation();
    openCooler();
  });
  els.howStartBtn.addEventListener('click', () => {
    ensureFullscreenForNavigation();
    showScreen('select');
  });
  els.previewBtn.addEventListener('click', togglePreview);
  els.fullscreenBtn.addEventListener('click', toggleFullscreen);
  els.edgesToTableBtn.addEventListener('click', edgesToTable);
  els.allTableBtn.addEventListener('click', allToTableAction);
  els.newPuzzleBtn.addEventListener('click', () => { ensureFullscreenForNavigation(); showScreen('select'); });
  els.trayFilter.addEventListener('change', renderTray);
  els.collapseTrayBtn.addEventListener('click', toggleTray);
  els.fishAgainBtn.addEventListener('click', () => {
    if (els.completeKicker.textContent === 'Fish Cooler Species' && detailFish) {
      startPuzzle(detailFish, currentDifficulty);
    } else {
      ensureFullscreenForNavigation();
      showScreen('select');
    }
  });
  els.openCoolerBtn.addEventListener('click', () => { ensureFullscreenForNavigation(); openCooler(); });
  els.coolerPlayBtn.addEventListener('click', () => { ensureFullscreenForNavigation(); showScreen('select'); });

  document.querySelectorAll('[data-back-home="true"]').forEach(btn => {
    btn.addEventListener('click', () => { ensureFullscreenForNavigation(); showScreen('home'); });
  });

  window.addEventListener('resize', () => {
    if (currentScreen === 'puzzle' && puzzleState) {
      schedulePuzzleLayout(false);
    }
  });

  window.addEventListener('orientationchange', () => {
    if (currentScreen === 'puzzle' && puzzleState) {
      schedulePuzzleLayout(false);
    }
  });

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
      if (currentScreen === 'puzzle' && puzzleState) {
        schedulePuzzleLayout(false);
      }
    });
  }

  // iPad/Safari: prevent page rubber-banding while a puzzle piece is being dragged.
  els.playTable.addEventListener('touchmove', event => {
    if (dragState.active) event.preventDefault();
  }, { passive: false });

  document.addEventListener('touchmove', event => {
    if (dragState.active) event.preventDefault();
  }, { passive: false, capture: true });

  window.addEventListener('pointermove', onPointerMove, { passive: false });
  window.addEventListener('pointerup', onPointerUp, { passive: false });
  window.addEventListener('pointercancel', cancelDrag, { passive: false });
}

function buildWaterBubbles() {
  if (!els.waterBubbles) return;
  els.waterBubbles.innerHTML = '';

  const count = 22;
  for (let i = 0; i < count; i += 1) {
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    const size = 5 + Math.random() * 18;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${Math.random() * 100}%`;
    bubble.style.setProperty('--drift', `${Math.random() * 56 - 28}px`);
    bubble.style.animationDuration = `${10 + Math.random() * 18}s`;
    bubble.style.animationDelay = `${-Math.random() * 26}s`;
    bubble.style.opacity = (0.25 + Math.random() * 0.35).toFixed(2);
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
  document.documentElement.classList.toggle('puzzle-scroll-lock', playing);

  if (playing && puzzleState) {
    // The puzzle screen must always begin at the top of the page. Safari/iPad
    // otherwise preserves the scroll position from the puzzle-selection screen,
    // which can make the toolbar and top of the board appear cut off.
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo(0, 0);
    schedulePuzzleLayout(false);
  } else {
    document.body.removeAttribute('data-sea-theme');
    const themeLayer = document.getElementById('seaThemeLayer');
    if (themeLayer) themeLayer.innerHTML = '';
  }
}

function schedulePuzzleLayout(initial = false) {
  if (!puzzleState || currentScreen !== 'puzzle') return;

  // iPad Safari may need more than one frame for the flex layout and browser
  // chrome/visual viewport to settle. Re-measure a few times without disturbing
  // gameplay state so the full board stays inside the visible play table.
  const delays = [0, 80, 220, 420];
  delays.forEach((delay, index) => {
    setTimeout(() => {
      if (!puzzleState || currentScreen !== 'puzzle') return;
      requestAnimationFrame(() => layoutPuzzle(initial && index === 0));
    }, delay);
  });
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
  const discoveredFish = Object.values(speciesData).filter(fish => Boolean(cooler[fish.id]));

  if (!discoveredFish.length) {
    const empty = document.createElement('div');
    empty.className = 'cooler-empty';
    empty.innerHTML = `
      <strong>Your Fish Cooler is empty.</strong>
      <p>Complete a puzzle to discover your first fish. Each catch you complete will be saved here.</p>
    `;
    els.coolerGrid.appendChild(empty);
  } else {
    discoveredFish.forEach(fish => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'cooler-card cooler-card-button';
      card.innerHTML = `
        <img src="${fish.image}" alt="${fish.commonName}" />
        <div class="cooler-card-body">
          <strong>${fish.commonName}</strong>
          <div class="cooler-status">Tap to view identification and species information</div>
        </div>
      `;
      card.addEventListener('click', () => showFishDetails(fish));
      els.coolerGrid.appendChild(card);
    });
  }

  updateCoolerChip();
}

function populateFishInfo(fish, fromCooler = false) {
  detailFish = fish;
  els.completeKicker.textContent = fromCooler ? 'Fish Cooler Species' : 'Puzzle Complete';
  els.completeImage.src = fish.image;
  els.completeTitle.textContent = fish.commonName;
  els.completeScientific.textContent = fish.scientificName;
  els.completeDescription.textContent = fish.description;
  els.completeIdentification.textContent = fish.identification || fish.description;
  els.completeHabitat.textContent = fish.habitat;
  els.completeHistory.textContent = fish.history;
  els.fishAgainBtn.textContent = fromCooler ? 'Play This Fish' : 'Choose Another Puzzle';
  els.openCoolerBtn.textContent = fromCooler ? 'Back to Fish Cooler' : 'Fish Cooler';
}

function showFishDetails(fish) {
  populateFishInfo(fish, true);
  showScreen('complete');
}

async function startPuzzle(fish, difficulty) {
  // Request fullscreen while still inside the user's tap/click gesture.
  ensureFullscreenOnStart();
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
    completeShown: false,
    theme: pickPuzzleTheme()
  };

  applyPuzzleTheme(puzzleState.theme);
  buildPieces();
  showScreen('puzzle');
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  window.scrollTo(0, 0);
  schedulePuzzleLayout(true);
  setTimeout(() => schedulePuzzleLayout(false), 550);
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
  const edgeGrid = generateEdgeGrid(rows, cols);
  const edgesList = edgeGrid.pieces;
  puzzleState.horizontalCuts = edgeGrid.horizontal;
  puzzleState.verticalCuts = edgeGrid.vertical;
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
        targetY: 0,
        trayOrder: Math.random()
      });
    }
  }

  puzzleState.pieces = pieces;
}

function generateEdgeGrid(rows, cols) {
  const horizontal = Array.from({ length: rows - 1 }, (_, row) =>
    Array.from({ length: cols }, (_, col) => {
      const seed = (row * 17 + col * 11 + row * col * 3) % 7;
      return seed % 2 === 0 ? 1 : -1;
    })
  );

  const vertical = Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols - 1 }, (_, col) => {
      const seed = (row * 13 + col * 19 + row * col * 5) % 9;
      return seed % 2 === 0 ? 1 : -1;
    })
  );

  // Match the supplied 12-piece reference with a balanced classic cut pattern.
  if (rows === 3 && cols === 4) {
    horizontal[0] = [1, -1, 1, -1];
    horizontal[1] = [-1, 1, -1, 1];
    vertical[0] = [-1, 1, -1];
    vertical[1] = [1, -1, 1];
    vertical[2] = [-1, 1, -1];
  }

  const pieces = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      pieces.push({
        top: row === 0 ? 0 : -horizontal[row - 1][col],
        right: col === cols - 1 ? 0 : vertical[row][col],
        bottom: row === rows - 1 ? 0 : horizontal[row][col],
        left: col === 0 ? 0 : -vertical[row][col - 1]
      });
    }
  }

  return { pieces, horizontal, vertical };
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

  // If Safari reports a tiny temporary flexbox height while changing screens,
  // wait for the scheduled follow-up measurement rather than creating a board
  // that is taller than the visible table and therefore clipped at the top.
  if (tableRect.width < 260 || tableRect.height < 220) return;

  const gutter = Math.max(30, Math.min(56, tableRect.width * 0.045));
  const maxW = Math.max(1, (tableRect.width - gutter * 2) * 0.94);
  const maxH = Math.max(1, (tableRect.height - gutter * 2) * 0.94);
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

function ribbonProfile(sideLength) {
  // One canonical connector profile is used for BOTH outward tabs and inward blanks.
  // This guarantees that every male/female pair is the same size and shape.
  return {
    neckHalf: sideLength * 0.075,
    lobeRadius: sideLength * 0.125,
    depth: sideLength * 0.235,
    shoulder: sideLength * 0.025,
    k: 0.5522847498
  };
}

function buildPieceShape(cell, margin, edges) {
  const s = cell;
  const m = margin;
  const ext = s + m * 2;
  const x0 = m;
  const y0 = m;
  const x1 = m + s;
  const y1 = m + s;

  // Use the exact same compact circular profile for tabs and blanks.
  const { neckHalf, lobeRadius, depth, shoulder, k } = ribbonProfile(s);

  let d = `M ${x0} ${y0}`;
  d += edgeSegment({x:x0,y:y0},{x:x1,y:y0},{x:0,y:-1},edges.top,s,neckHalf,lobeRadius,depth,shoulder,k);
  d += edgeSegment({x:x1,y:y0},{x:x1,y:y1},{x:1,y:0},edges.right,s,neckHalf,lobeRadius,depth,shoulder,k);
  d += edgeSegment({x:x1,y:y1},{x:x0,y:y1},{x:0,y:1},edges.bottom,s,neckHalf,lobeRadius,depth,shoulder,k);
  d += edgeSegment({x:x0,y:y1},{x:x0,y:y0},{x:-1,y:0},edges.left,s,neckHalf,lobeRadius,depth,shoulder,k);
  d += ' Z';
  return { path: d, size: ext, margin: m };
}

function edgeSegment(start, end, normal, edge, sideLength, neckHalf, radius, depth, shoulder, k) {
  if (edge === 0) return ` L ${end.x} ${end.y}`;

  const tx = (end.x - start.x) / sideLength;
  const ty = (end.y - start.y) / sideLength;
  const dir = edge === 1 ? 1 : -1;
  const nx = normal.x * dir;
  const ny = normal.y * dir;
  const mid = { x:(start.x+end.x)/2, y:(start.y+end.y)/2 };

  const neckA = { x:mid.x-tx*neckHalf, y:mid.y-ty*neckHalf };
  const neckB = { x:mid.x+tx*neckHalf, y:mid.y+ty*neckHalf };
  const center = { x:mid.x+nx*(depth-radius), y:mid.y+ny*(depth-radius) };
  const circleA = { x:center.x-tx*radius, y:center.y-ty*radius };
  const circleB = { x:center.x+tx*radius, y:center.y+ty*radius };
  const far = { x:center.x+nx*radius, y:center.y+ny*radius };

  const c1 = { x:neckA.x+nx*shoulder, y:neckA.y+ny*shoulder };
  const c2 = { x:circleA.x-nx*shoulder, y:circleA.y-ny*shoulder };
  const q1 = { x:circleA.x+nx*k*radius, y:circleA.y+ny*k*radius };
  const q2 = { x:far.x-tx*k*radius, y:far.y-ty*k*radius };
  const q3 = { x:far.x+tx*k*radius, y:far.y+ty*k*radius };
  const q4 = { x:circleB.x+nx*k*radius, y:circleB.y+ny*k*radius };
  const c3 = { x:circleB.x-nx*shoulder, y:circleB.y-ny*shoulder };
  const c4 = { x:neckB.x+nx*shoulder, y:neckB.y+ny*shoulder };

  return [
    ` L ${neckA.x} ${neckA.y}`,
    ` C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${circleA.x} ${circleA.y}`,
    ` C ${q1.x} ${q1.y}, ${q2.x} ${q2.y}, ${far.x} ${far.y}`,
    ` C ${q3.x} ${q3.y}, ${q4.x} ${q4.y}, ${circleB.x} ${circleB.y}`,
    ` C ${c3.x} ${c3.y}, ${c4.x} ${c4.y}, ${neckB.x} ${neckB.y}`,
    ` L ${end.x} ${end.y}`
  ].join(' ');
}

function renderBoardCutlines() {
  if (!puzzleState) return;
  const { boardW, boardH, cell } = puzzleState.metrics;
  const stroke = Math.max(2.2, cell * 0.045);
  const color = 'rgba(27, 39, 54, 0.70)';
  els.boardCutlines.setAttribute('viewBox', `0 0 ${boardW} ${boardH}`);

  const parts = [`<rect x="1" y="1" width="${boardW-2}" height="${boardH-2}" fill="none" stroke="${color}" stroke-width="${stroke}" />`];

  for (let row = 0; row < puzzleState.rows; row += 1) {
    for (let boundary = 0; boundary < puzzleState.cols - 1; boundary += 1) {
      const edge = puzzleState.verticalCuts[row][boundary];
      const x = (boundary + 1) * cell;
      const y0 = row * cell;
      const y1 = (row + 1) * cell;
      const path = sharedCutPath({x,y:y0},{x,y:y1},{x:1,y:0},edge,cell);
      parts.push(`<path d="${path}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linejoin="round" stroke-linecap="round" />`);
    }
  }

  for (let boundary = 0; boundary < puzzleState.rows - 1; boundary += 1) {
    for (let col = 0; col < puzzleState.cols; col += 1) {
      const edge = puzzleState.horizontalCuts[boundary][col];
      const y = (boundary + 1) * cell;
      const x0 = col * cell;
      const x1 = (col + 1) * cell;
      const path = sharedCutPath({x:x0,y},{x:x1,y},{x:0,y:1},edge,cell);
      parts.push(`<path d="${path}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linejoin="round" stroke-linecap="round" />`);
    }
  }

  els.boardCutlines.innerHTML = parts.join('');
}

function sharedCutPath(start, end, normal, edge, sideLength) {
  const { neckHalf, lobeRadius, depth, shoulder, k } = ribbonProfile(sideLength);
  return `M ${start.x} ${start.y}` + edgeSegment(start,end,normal,edge,sideLength,neckHalf,lobeRadius,depth,shoulder,k);
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

  const trayPieces = puzzleState.pieces
    .filter(piece => piece.location === 'tray' && matchesTrayFilter(piece, els.trayFilter.value))
    .sort((a, b) => a.trayOrder - b.trayOrder);

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
  document.body.classList.add('piece-drag-active');
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  window.scrollTo(0, 0);
  try {
    piece.el?.setPointerCapture?.(event.pointerId);
  } catch (_) {
    // Safari can reject capture while the element is being reparented; touch-action
    // and scroll locking still prevent the document from jumping.
  }
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
  document.body.classList.remove('piece-drag-active');
}


function movePieceToTray(piece) {
  piece.location = 'tray';
  piece.locked = false;
  piece.trayOrder = Math.random();
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

  const bands = [
    { x1: boardLeft - cell * 1.15, x2: boardLeft + boardW - cell * 0.3, y1: boardTop - cell * 1.15, y2: boardTop - cell * 0.25 },
    { x1: boardLeft - cell * 1.15, x2: boardLeft + boardW - cell * 0.3, y1: boardTop + boardH - cell * 0.1, y2: boardTop + boardH + cell * 0.65 },
    { x1: boardLeft - cell * 1.15, x2: boardLeft - cell * 0.18, y1: boardTop - cell * 0.3, y2: boardTop + boardH - cell * 0.3 },
    { x1: boardLeft + boardW - cell * 0.1, x2: boardLeft + boardW + cell * 0.65, y1: boardTop - cell * 0.3, y2: boardTop + boardH - cell * 0.3 }
  ];

  const zone = bands[Math.floor(Math.random() * bands.length)];
  const x = zone.x1 + Math.random() * Math.max(8, zone.x2 - zone.x1);
  const y = zone.y1 + Math.random() * Math.max(8, zone.y2 - zone.y1);
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
  piece.trayOrder = Math.random();
  if (piece.el) {
    piece.el.remove();
    piece.el = null;
  }
}


function scatterPieceOnTable(piece) {
  const { boardLeft, boardTop, boardW, boardH, cell, tableW, tableH } = puzzleState.metrics;
  piece.location = 'table';
  piece.locked = false;
  piece.z = ++zCounter;

  const perimeterZones = [
    { x1: boardLeft - cell * 1.25, x2: boardLeft + boardW - cell * 0.15, y1: boardTop - cell * 1.2, y2: boardTop - cell * 0.15 },
    { x1: boardLeft - cell * 1.25, x2: boardLeft + boardW - cell * 0.15, y1: boardTop + boardH - cell * 0.1, y2: boardTop + boardH + cell * 0.85 },
    { x1: boardLeft - cell * 1.2, x2: boardLeft - cell * 0.1, y1: boardTop - cell * 0.4, y2: boardTop + boardH - cell * 0.15 },
    { x1: boardLeft + boardW - cell * 0.05, x2: boardLeft + boardW + cell * 0.85, y1: boardTop - cell * 0.4, y2: boardTop + boardH - cell * 0.15 }
  ];
  const interiorZone = { x1: boardLeft + cell * 0.1, x2: boardLeft + boardW - cell * 1.1, y1: boardTop + cell * 0.1, y2: boardTop + boardH - cell * 1.1 };
  const wholeTableZone = { x1: 0, x2: tableW - piece.size, y1: 0, y2: tableH - piece.size };

  let zone;
  const roll = Math.random();
  if (roll < 0.58) {
    zone = perimeterZones[Math.floor(Math.random() * perimeterZones.length)];
  } else if (roll < 0.84) {
    zone = interiorZone;
  } else {
    zone = wholeTableZone;
  }

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


function ensureFullscreenForNavigation() {
  if (isFullscreenActive()) return;
  requestFullscreenCompat(document.documentElement)
    .then(() => updateFullscreenButton())
    .catch(() => updateFullscreenButton());
}

async function toggleFullscreen() {
  try {
    if (!isFullscreenActive()) {
      await requestFullscreenCompat(document.documentElement);
    } else {
      await exitFullscreenCompat();
    }
    updateFullscreenButton();
    schedulePuzzleLayout(false);
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
  updateFullscreenButton();
}


function checkCompletion() {
  if (!puzzleState) return;
  const complete = puzzleState.pieces.every(piece => piece.locked);
  if (!complete || puzzleState.completeShown) return;

  puzzleState.completeShown = true;
  cooler[puzzleState.fish.id] = true;
  saveCooler();
  renderCooler();

  populateFishInfo(puzzleState.fish, false);
  showScreen('complete');
}


function pickPuzzleTheme() {
  return puzzleThemes[Math.floor(Math.random() * puzzleThemes.length)];
}

function applyPuzzleTheme(theme) {
  const resolvedTheme = theme || 'open-ocean';
  document.body.setAttribute('data-sea-theme', resolvedTheme);
  renderSeaThemeScene(resolvedTheme);
}

function renderSeaThemeScene(theme) {
  const layer = document.getElementById('seaThemeLayer');
  if (!layer) return;

  const scenes = {
    'open-ocean': `
      <div class="theme-scene theme-open-ocean" aria-hidden="true">
        <div class="theme-ray ray-a"></div>
        <div class="theme-ray ray-b"></div>
      </div>`,
    'deep-abyss': `
      <div class="theme-scene theme-deep-abyss" aria-hidden="true">
        <div class="abyss-glow"></div>
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <g class="theme-angler" transform="translate(1180 430) scale(1.08)" opacity=".34">
            <ellipse cx="0" cy="0" rx="125" ry="66" fill="#030711"/>
            <path d="M-92 -5 C-165 -72 -195 -62 -225 -18 C-183 -5 -160 18 -110 32 Z" fill="#030711"/>
            <path d="M70 -34 C126 -70 152 -25 143 10 C118 -1 94 3 70 18 Z" fill="#030711"/>
            <circle cx="74" cy="-14" r="8" fill="#bdddf2" opacity=".55"/>
            <path d="M42 -53 C72 -120 126 -134 151 -112" fill="none" stroke="#071019" stroke-width="8" stroke-linecap="round"/>
            <circle class="angler-lure-glow" cx="158" cy="-112" r="105" fill="rgba(255,220,110,.18)"/>
            <circle cx="158" cy="-112" r="10" fill="#fff0a0" opacity=".85"/>
          </g>
        </svg>
      </div>`,
    'coral-reef': `
      <div class="theme-scene theme-coral-reef" aria-hidden="true">
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <g transform="translate(0 665)" opacity=".28">
            <path d="M0 150 C220 118 330 166 520 122 C700 80 840 152 1010 126 C1200 97 1360 147 1600 112 L1600 280 L0 280 Z" fill="#0c3d56"/>
            <ellipse cx="280" cy="155" rx="110" ry="34" fill="#295864" opacity=".95"/>
            <ellipse cx="520" cy="170" rx="76" ry="22" fill="#5a7c6b" opacity=".88"/>
            <ellipse cx="760" cy="150" rx="132" ry="38" fill="#734c61" opacity=".82"/>
            <ellipse cx="1030" cy="166" rx="96" ry="28" fill="#2b6870" opacity=".9"/>
            <ellipse cx="1290" cy="152" rx="126" ry="34" fill="#8b5a54" opacity=".84"/>
            <circle cx="220" cy="136" r="14" fill="#dcb46a" opacity=".82"/>
            <circle cx="1160" cy="138" r="12" fill="#e8cf8f" opacity=".78"/>
            <circle cx="1225" cy="152" r="8" fill="#f0dbad" opacity=".72"/>
          </g>
        </svg>
      </div>`,
    'shipwreck': `
      <div class="theme-scene theme-shipwreck" aria-hidden="true">
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <g transform="translate(250 620) rotate(-7)" opacity=".28" fill="#071a2a">
            <path d="M0 115 L510 115 L445 200 L90 200 Z"/>
            <path d="M110 115 V-55 H132 V115 Z"/>
            <path d="M130 -44 L330 28 L130 55 Z"/>
            <path d="M350 115 V15 H370 V115 Z"/>
            <path d="M365 22 L480 62 L365 72 Z"/>
            <path d="M0 115 L-42 78 L28 80 Z"/>
          </g>
          <g transform="translate(1180 780)" opacity=".22">
            <rect x="-74" y="-22" width="148" height="64" rx="10" fill="#50371d"/>
            <path d="M-74 -22 Q0 -82 74 -22 Z" fill="#684421"/>
          </g>
        </svg>
      </div>`
  };

  layer.innerHTML = scenes[theme] || scenes['open-ocean'];
}

function isFullscreenActive() {
  return Boolean(document.fullscreenElement || document.webkitFullscreenElement);
}

async function requestFullscreenCompat(element) {
  if (element.requestFullscreen) {
    return element.requestFullscreen();
  }
  if (element.webkitRequestFullscreen) {
    return Promise.resolve(element.webkitRequestFullscreen());
  }
  throw new Error('fullscreen unavailable');
}

async function exitFullscreenCompat() {
  if (document.exitFullscreen) {
    return document.exitFullscreen();
  }
  if (document.webkitExitFullscreen) {
    return Promise.resolve(document.webkitExitFullscreen());
  }
  throw new Error('fullscreen unavailable');
}

function ensureFullscreenOnStart() {
  if (isFullscreenActive()) {
    updateFullscreenButton();
    return;
  }
  requestFullscreenCompat(document.documentElement)
    .then(() => {
      updateFullscreenButton();
      schedulePuzzleLayout(false);
    })
    .catch(() => updateFullscreenButton());
}

function updateFullscreenButton() {
  if (!els.fullscreenBtn) return;
  els.fullscreenBtn.textContent = isFullscreenActive() ? 'Exit Full Screen' : 'Full Screen';
}
