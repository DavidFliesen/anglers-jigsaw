const APP_VERSION = '2.0';

const difficulties = [
  { id: 'easy', label: 'Easy', pieces: 12, cols: 4, rows: 3 },
  { id: 'angler', label: 'Angler', pieces: 48, cols: 8, rows: 6 },
  { id: 'guide', label: 'Guide', pieces: 108, cols: 12, rows: 9 },
  { id: 'tournament', label: 'Tournament', pieces: 192, cols: 16, rows: 12 }
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
  header: document.getElementById('appHeader'),
  shell: document.getElementById('appShell'),
  toast: document.getElementById('toast'),
  version: document.getElementById('versionLabel'),

  homeBtn: document.getElementById('homeBtn'),
  coolerBtn: document.getElementById('coolerBtn'),
  homeCoolerBtn: document.getElementById('homeCoolerBtn'),
  startFishingBtn: document.getElementById('startFishingBtn'),
  howToPlayBtn: document.getElementById('howToPlayBtn'),
  howStartBtn: document.getElementById('howStartBtn'),

  difficultyStrip: document.getElementById('difficultyStrip'),
  fishSelectGrid: document.getElementById('fishSelectGrid'),

  playHomeBtn: document.getElementById('playHomeBtn'),
  puzzleTitle: document.getElementById('puzzleTitle'),
  puzzleInfo: document.getElementById('puzzleInfo'),
  pieceCounter: document.getElementById('pieceCounterChip'),
  edgesToTableBtn: document.getElementById('edgesToTableBtn'),
  allTableBtn: document.getElementById('allTableBtn'),
  previewBtn: document.getElementById('previewBtn'),
  fullscreenBtn: document.getElementById('fullscreenBtn'),
  newPuzzleBtn: document.getElementById('newPuzzleBtn'),

  playShell: document.getElementById('playShell'),
  playTable: document.getElementById('playTable'),
  puzzleFrame: document.getElementById('puzzleFrame'),
  framePreview: document.getElementById('framePreview'),

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
  coolerCountChip: document.getElementById('coolerCountChip')
};

const storageKey = 'anglers-jigsaw-cooler-v2';
let cooler = JSON.parse(localStorage.getItem(storageKey) || '{}');

let currentDifficulty = difficulties[0];
let puzzleState = null;
let pieceElements = new Map();

let dragState = {
  active: false,
  pointerId: null,
  pieceId: null,
  sourceEl: null,
  fromTray: false,
  startPointerX: 0,
  startPointerY: 0,
  startPositions: [],
  grabFracX: 0.5,
  grabFracY: 0.5,
  proxy: null,
  moved: false
};

function showScreen(name) {
  Object.values(screens).forEach(screen => screen.classList.remove('active'));
  screens[name].classList.add('active');

  const playing = name === 'puzzle';
  els.body.classList.toggle('puzzle-mode', playing);

  if (!playing) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (playing && puzzleState) {
    requestAnimationFrame(() => {
      layoutPuzzle(true);
      syncAllPieces();
    });
  }
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.remove('hidden');

  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    els.toast.classList.add('hidden');
  }, 1800);
}

function saveCooler() {
  localStorage.setItem(storageKey, JSON.stringify(cooler));
}

function discoveredCount() {
  return Object.keys(cooler).length;
}

function updateCoolerChip() {
  els.coolerCountChip.textContent = `${discoveredCount()} discovered`;
}

function shuffled(array) {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function renderPuzzleChoices() {
  els.difficultyStrip.innerHTML = '';

  difficulties.forEach(level => {
    const button = document.createElement('button');
    button.className = 'difficulty-choice';
    button.classList.toggle('selected', level.id === currentDifficulty.id);
    button.innerHTML = `
      <strong>${level.pieces}</strong>
      <span>${level.cols} × ${level.rows}</span>
    `;

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

    card.addEventListener('click', () => {
      startPuzzle(fish, currentDifficulty);
    });

    els.fishSelectGrid.appendChild(card);
  });
}

function isEdgePiece(row, col, rows, cols) {
  return row === 0 || col === 0 || row === rows - 1 || col === cols - 1;
}

function isCornerPiece(row, col, rows, cols) {
  const vertical = row === 0 || row === rows - 1;
  const horizontal = col === 0 || col === cols - 1;
  return vertical && horizontal;
}

function generatePieceEdges(rows, cols) {
  const horizontal = Array.from({ length: Math.max(0, rows - 1) }, () =>
    Array.from({ length: cols }, () => (Math.random() < 0.5 ? 1 : -1))
  );

  const vertical = Array.from({ length: rows }, () =>
    Array.from({ length: Math.max(0, cols - 1) }, () => (Math.random() < 0.5 ? 1 : -1))
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

function outwardTabInfo(edges) {
  const directions = [];

  if (edges.top === 1) directions.push('up');
  if (edges.right === 1) directions.push('right');
  if (edges.bottom === 1) directions.push('down');
  if (edges.left === 1) directions.push('left');

  return {
    count: directions.length,
    directions
  };
}

/*
  Conventional ribbon-cut jigsaw shape:
  a square body with centered round knobs and sockets.
  Shared edges are exact mirrored opposites.
*/
function piecePath(edges) {
  const { top, right, bottom, left } = edges;
  let d = 'M 18 18';

  // TOP
  if (top === 0) {
    d += ' L 102 18';
  } else if (top === 1) {
    d += ` L 46 18
           C 49 18, 50 16, 50 13
           C 50 6, 54 2, 60 2
           C 66 2, 70 6, 70 13
           C 70 16, 71 18, 74 18
           L 102 18`;
  } else {
    d += ` L 46 18
           C 49 18, 50 20, 50 23
           C 50 30, 54 34, 60 34
           C 66 34, 70 30, 70 23
           C 70 20, 71 18, 74 18
           L 102 18`;
  }

  // RIGHT
  if (right === 0) {
    d += ' L 102 102';
  } else if (right === 1) {
    d += ` L 102 46
           C 102 49, 104 50, 107 50
           C 114 50, 118 54, 118 60
           C 118 66, 114 70, 107 70
           C 104 70, 102 71, 102 74
           L 102 102`;
  } else {
    d += ` L 102 46
           C 102 49, 100 50, 97 50
           C 90 50, 86 54, 86 60
           C 86 66, 90 70, 97 70
           C 100 70, 102 71, 102 74
           L 102 102`;
  }

  // BOTTOM
  if (bottom === 0) {
    d += ' L 18 102';
  } else if (bottom === 1) {
    d += ` L 74 102
           C 71 102, 70 104, 70 107
           C 70 114, 66 118, 60 118
           C 54 118, 50 114, 50 107
           C 50 104, 49 102, 46 102
           L 18 102`;
  } else {
    d += ` L 74 102
           C 71 102, 70 100, 70 97
           C 70 90, 66 86, 60 86
           C 54 86, 50 90, 50 97
           C 50 100, 49 102, 46 102
           L 18 102`;
  }

  // LEFT
  if (left === 0) {
    d += ' L 18 18';
  } else if (left === 1) {
    d += ` L 18 74
           C 18 71, 16 70, 13 70
           C 6 70, 2 66, 2 60
           C 2 54, 6 50, 13 50
           C 16 50, 18 49, 18 46
           L 18 18`;
  } else {
    d += ` L 18 74
           C 18 71, 20 70, 23 70
           C 30 70, 34 66, 34 60
           C 34 54, 30 50, 23 50
           C 20 50, 18 49, 18 46
           L 18 18`;
  }

  return d + ' Z';
}

function pieceSvgMarkup(piece) {
  const BODY = 84;
  const PAD = 18;
  const fullWidth = BODY * puzzleState.cols;
  const fullHeight = BODY * puzzleState.rows;
  const path = piecePath(piece.edges);
  const clipId = `clip-${puzzleState.id}-${piece.id}`;
  const imageX = PAD - piece.col * BODY;
  const imageY = PAD - piece.row * BODY;

  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <clipPath id="${clipId}">
          <path d="${path}"></path>
        </clipPath>
      </defs>

      <g clip-path="url(#${clipId})">
        <image
          href="${puzzleState.species.image}"
          x="${imageX}"
          y="${imageY}"
          width="${fullWidth}"
          height="${fullHeight}"
          preserveAspectRatio="xMidYMid slice">
        </image>
      </g>

      <path d="${path}" class="piece-outline"></path>
    </svg>
  `;
}

function startPuzzle(species, difficulty) {
  pieceElements.clear();

  const edges = generatePieceEdges(difficulty.rows, difficulty.cols);
  const pieces = [];

  for (let row = 0; row < difficulty.rows; row += 1) {
    for (let col = 0; col < difficulty.cols; col += 1) {
      const index = row * difficulty.cols + col;
      const tabs = outwardTabInfo(edges[index]);

      pieces.push({
        id: index,
        row,
        col,
        edges: edges[index],
        isEdge: isEdgePiece(row, col, difficulty.rows, difficulty.cols),
        isCorner: isCornerPiece(row, col, difficulty.rows, difficulty.cols),
        outTabs: tabs.count,
        outDirections: tabs.directions,
        state: 'tray',
        x: 0,
        y: 0,
        clusterId: index + 1,
        locked: false,
        z: 10 + index
      });
    }
  }

  puzzleState = {
    id: Date.now(),
    species,
    difficulty,
    rows: difficulty.rows,
    cols: difficulty.cols,
    pieces: shuffled(pieces),
    preview: false,
    trayCollapsed: false,
    trayFilter: 'all',
    allTableMode: 'scatter',
    nextClusterId: pieces.length + 100,
    nextZ: pieces.length + 50,
    geometry: null
  };

  els.puzzleTitle.textContent = species.commonName;
  els.puzzleInfo.textContent =
    `${difficulty.label} · ${difficulty.pieces} pieces · ${difficulty.cols} × ${difficulty.rows}`;

  els.framePreview.style.backgroundImage = `url("${species.image}")`;
  els.framePreview.classList.remove('visible');
  els.previewBtn.classList.remove('active');
  els.previewBtn.textContent = 'Preview';

  els.trayFilter.value = 'all';
  els.trayBar.classList.remove('collapsed');
  els.collapseTrayBtn.textContent = 'Hide Tray';
  els.allTableBtn.textContent = 'All to Table';

  buildPieceElements();
  showScreen('puzzle');

  requestAnimationFrame(() => {
    layoutPuzzle(false);
    syncAllPieces();
    updatePlayControls();
  });
}

function buildPieceElements() {
  els.trayPieces.replaceChildren();

  puzzleState.pieces.forEach(piece => {
    const element = document.createElement('div');
    element.className = 'jigsaw-piece tray-piece';
    element.dataset.pieceId = String(piece.id);
    element.innerHTML = pieceSvgMarkup(piece);
    element.setAttribute('role', 'button');
    element.setAttribute('aria-label', `Puzzle piece ${piece.id + 1}`);
    element.addEventListener('pointerdown', beginPieceDrag);

    pieceElements.set(piece.id, element);
    els.trayPieces.appendChild(element);
  });
}

function layoutPuzzle(preserveLoosePositions = true) {
  if (!puzzleState) return;

  const rect = els.playTable.getBoundingClientRect();
  if (!rect.width || !rect.height) return;

  const old = puzzleState.geometry;

  const boardMaxW = rect.width * 0.66;
  const boardMaxH = rect.height * 0.72;
  const boardWidth = Math.min(boardMaxW, boardMaxH * (4 / 3));
  const boardHeight = boardWidth * (3 / 4);
  const boardLeft = (rect.width - boardWidth) / 2;
  const boardTop = (rect.height - boardHeight) / 2;

  const step = boardWidth / puzzleState.cols;
  const piecePx = step * (120 / 84);
  const padPx = piecePx * (18 / 120);

  puzzleState.geometry = {
    tableWidth: rect.width,
    tableHeight: rect.height,
    boardLeft,
    boardTop,
    boardWidth,
    boardHeight,
    step,
    piecePx,
    padPx,
    pieceSnap: Math.max(10, step * 0.22),
    boardSnap: Math.max(12, step * 0.26)
  };

  els.puzzleFrame.style.left = `${boardLeft}px`;
  els.puzzleFrame.style.top = `${boardTop}px`;
  els.puzzleFrame.style.width = `${boardWidth}px`;
  els.puzzleFrame.style.height = `${boardHeight}px`;

  if (preserveLoosePositions && old) {
    const scaleX = rect.width / old.tableWidth;
    const scaleY = rect.height / old.tableHeight;

    puzzleState.pieces.forEach(piece => {
      if (piece.state !== 'table') return;

      if (piece.locked) {
        const target = correctPosition(piece);
        piece.x = target.x;
        piece.y = target.y;
      } else {
        piece.x *= scaleX;
        piece.y *= scaleY;
        clampPieceToTable(piece);
      }
    });
  }
}

function correctPosition(piece) {
  const g = puzzleState.geometry;

  return {
    x: g.boardLeft + piece.col * g.step - g.padPx,
    y: g.boardTop + piece.row * g.step - g.padPx
  };
}

function pieceById(id) {
  return puzzleState.pieces.find(piece => piece.id === id);
}

function pieceAt(row, col) {
  if (row < 0 || col < 0 || row >= puzzleState.rows || col >= puzzleState.cols) {
    return null;
  }

  const id = row * puzzleState.cols + col;
  return pieceById(id);
}

function clusterPieces(clusterId) {
  return puzzleState.pieces.filter(
    piece => piece.state === 'table' && piece.clusterId === clusterId
  );
}

function clusterSize(clusterId) {
  return clusterPieces(clusterId).length;
}

function clusterLocked(clusterId) {
  const members = clusterPieces(clusterId);
  return members.length > 0 && members.every(piece => piece.locked);
}

function syncAllPieces() {
  if (!puzzleState) return;

  puzzleState.pieces.forEach(piece => syncPiece(piece));
  applyTrayFilter();
  updatePlayControls();
}

function syncPiece(piece) {
  const element = pieceElements.get(piece.id);
  if (!element) return;

  if (piece.state === 'table') {
    if (element.parentElement !== els.playTable) {
      els.playTable.appendChild(element);
    }

    element.className = `jigsaw-piece board-piece${piece.locked ? ' locked-piece' : ''}`;
    element.style.display = '';
    element.style.width = `${puzzleState.geometry.piecePx}px`;
    element.style.height = `${puzzleState.geometry.piecePx}px`;
    element.style.left = `${piece.x}px`;
    element.style.top = `${piece.y}px`;
    element.style.zIndex = String(piece.locked ? 20 : piece.z);
  } else {
    if (element.parentElement !== els.trayPieces) {
      els.trayPieces.appendChild(element);
    }

    element.className = 'jigsaw-piece tray-piece';
    element.style.left = '';
    element.style.top = '';
    element.style.zIndex = '';
    element.style.width = `${trayPieceSize()}px`;
    element.style.height = `${trayPieceSize()}px`;
  }
}

function trayPieceSize() {
  if (!puzzleState) return 68;

  const count = puzzleState.difficulty.pieces;
  if (count <= 12) return 96;
  if (count <= 48) return 68;
  if (count <= 108) return 54;
  return 44;
}

function trayFilterMatches(piece) {
  const filter = puzzleState.trayFilter;

  if (filter === 'all') return true;
  if (filter === 'edges') return piece.isEdge;
  if (filter === 'corners') return piece.isCorner;

  if (filter.startsWith('out-')) {
    const value = filter.slice(4);

    if (['up', 'right', 'down', 'left'].includes(value)) {
      return piece.outTabs === 1 && piece.outDirections.includes(value);
    }

    return piece.outTabs === Number(value);
  }

  return true;
}

function applyTrayFilter() {
  if (!puzzleState) return;

  let visible = 0;
  let totalTray = 0;

  puzzleState.pieces.forEach(piece => {
    if (piece.state !== 'tray') return;

    totalTray += 1;
    const element = pieceElements.get(piece.id);
    const matches = trayFilterMatches(piece);

    if (element) {
      element.style.display = matches ? '' : 'none';
    }

    if (matches) visible += 1;
  });

  els.trayCount.textContent =
    visible === totalTray
      ? `${totalTray} ${totalTray === 1 ? 'piece' : 'pieces'}`
      : `${visible} shown · ${totalTray} in tray`;
}

function updatePlayControls() {
  if (!puzzleState) return;

  const locked = puzzleState.pieces.filter(piece => piece.locked).length;
  const connected = puzzleState.pieces.filter(
    piece => piece.state === 'table' && !piece.locked && clusterSize(piece.clusterId) > 1
  ).length;

  els.pieceCounter.textContent =
    `${locked}/${puzzleState.pieces.length} locked`;

  els.allTableBtn.textContent =
    puzzleState.allTableMode === 'scatter'
      ? 'All to Table'
      : 'Recall Singles';

  if (connected > 0) {
    els.pieceCounter.title = `${connected} pieces are currently in loose connected groups`;
  } else {
    els.pieceCounter.title = '';
  }
}

function beginPieceDrag(event) {
  if (!puzzleState) return;
  if (event.pointerType === 'mouse' && event.button !== 0) return;

  const sourceEl = event.currentTarget;
  const piece = pieceById(Number(sourceEl.dataset.pieceId));

  if (!piece || piece.locked) return;

  event.preventDefault();

  const rect = sourceEl.getBoundingClientRect();

  dragState.active = true;
  dragState.pointerId = event.pointerId;
  dragState.pieceId = piece.id;
  dragState.sourceEl = sourceEl;
  dragState.fromTray = piece.state === 'tray';
  dragState.startPointerX = event.clientX;
  dragState.startPointerY = event.clientY;
  dragState.grabFracX = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
  dragState.grabFracY = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
  dragState.moved = false;
  dragState.startPositions = [];

  if (dragState.fromTray) {
    createTrayDragProxy(piece);
  } else {
    const members = clusterPieces(piece.clusterId);

    dragState.startPositions = members.map(member => ({
      id: member.id,
      x: member.x,
      y: member.y
    }));

    piece.z = ++puzzleState.nextZ;
    members.forEach(member => {
      member.z = piece.z;
      const el = pieceElements.get(member.id);
      if (el) el.classList.add('dragging');
    });
  }

  try {
    sourceEl.setPointerCapture(event.pointerId);
  } catch (error) {}

  sourceEl.addEventListener('pointermove', movePieceDrag);
  sourceEl.addEventListener('pointerup', endPieceDrag);
  sourceEl.addEventListener('pointercancel', cancelPieceDrag);
}

function createTrayDragProxy(piece) {
  const proxy = document.createElement('div');
  proxy.className = 'jigsaw-piece drag-proxy';
  proxy.innerHTML = pieceSvgMarkup(piece);
  proxy.style.width = `${puzzleState.geometry.piecePx}px`;
  proxy.style.height = `${puzzleState.geometry.piecePx}px`;
  document.body.appendChild(proxy);
  dragState.proxy = proxy;
}

function movePieceDrag(event) {
  if (!dragState.active || event.pointerId !== dragState.pointerId) return;

  const dx = event.clientX - dragState.startPointerX;
  const dy = event.clientY - dragState.startPointerY;

  if (!dragState.moved && Math.hypot(dx, dy) < 4) return;
  dragState.moved = true;

  event.preventDefault();

  if (dragState.fromTray) {
    if (!dragState.proxy) return;

    const size = puzzleState.geometry.piecePx;

    dragState.proxy.style.left =
      `${event.clientX - dragState.grabFracX * size}px`;

    dragState.proxy.style.top =
      `${event.clientY - dragState.grabFracY * size}px`;

    return;
  }

  dragState.startPositions.forEach(start => {
    const piece = pieceById(start.id);
    if (!piece) return;

    piece.x = start.x + dx;
    piece.y = start.y + dy;

    const el = pieceElements.get(piece.id);
    if (el) {
      el.style.left = `${piece.x}px`;
      el.style.top = `${piece.y}px`;
      el.style.zIndex = String(piece.z);
    }
  });
}

function endPieceDrag(event) {
  if (!dragState.active || event.pointerId !== dragState.pointerId) return;

  const piece = pieceById(dragState.pieceId);

  if (!piece) {
    cleanupDrag();
    return;
  }

  const tableRect = els.playTable.getBoundingClientRect();

  const overTable =
    event.clientX >= tableRect.left &&
    event.clientX <= tableRect.right &&
    event.clientY >= tableRect.top &&
    event.clientY <= tableRect.bottom;

  if (dragState.fromTray) {
    if (dragState.moved && overTable) {
      piece.state = 'table';
      piece.locked = false;
      piece.clusterId = puzzleState.nextClusterId++;
      piece.z = ++puzzleState.nextZ;

      piece.x =
        event.clientX - tableRect.left -
        dragState.grabFracX * puzzleState.geometry.piecePx;

      piece.y =
        event.clientY - tableRect.top -
        dragState.grabFracY * puzzleState.geometry.piecePx;

      clampPieceToTable(piece);
      syncPiece(piece);

      const activeCluster = resolveClusterSnaps(piece.clusterId);
      tryLockClusterToFrame(activeCluster);
    }
  } else {
    const clusterId = piece.clusterId;

    clampClusterToTable(clusterId);

    const activeCluster = resolveClusterSnaps(clusterId);
    tryLockClusterToFrame(activeCluster);
  }

  cleanupDrag();
  syncAllPieces();

  if (isPuzzleComplete()) {
    setTimeout(finishPuzzle, 350);
  }
}

function cancelPieceDrag() {
  if (!dragState.active) return;

  if (!dragState.fromTray) {
    dragState.startPositions.forEach(start => {
      const piece = pieceById(start.id);
      if (!piece) return;
      piece.x = start.x;
      piece.y = start.y;
    });
  }

  cleanupDrag();
  syncAllPieces();
}

function cleanupDrag() {
  if (dragState.sourceEl) {
    dragState.sourceEl.removeEventListener('pointermove', movePieceDrag);
    dragState.sourceEl.removeEventListener('pointerup', endPieceDrag);
    dragState.sourceEl.removeEventListener('pointercancel', cancelPieceDrag);
  }

  if (dragState.proxy) {
    dragState.proxy.remove();
  }

  pieceElements.forEach(element => element.classList.remove('dragging'));

  dragState = {
    active: false,
    pointerId: null,
    pieceId: null,
    sourceEl: null,
    fromTray: false,
    startPointerX: 0,
    startPointerY: 0,
    startPositions: [],
    grabFracX: 0.5,
    grabFracY: 0.5,
    proxy: null,
    moved: false
  };
}

function clampPieceToTable(piece) {
  const g = puzzleState.geometry;
  const margin = g.piecePx * 0.18;

  piece.x = Math.max(
    -margin,
    Math.min(g.tableWidth - g.piecePx + margin, piece.x)
  );

  piece.y = Math.max(
    -margin,
    Math.min(g.tableHeight - g.piecePx + margin, piece.y)
  );
}

function clampClusterToTable(clusterId) {
  const members = clusterPieces(clusterId);
  if (!members.length) return;

  const g = puzzleState.geometry;
  const margin = g.piecePx * 0.18;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  members.forEach(piece => {
    minX = Math.min(minX, piece.x);
    minY = Math.min(minY, piece.y);
    maxX = Math.max(maxX, piece.x + g.piecePx);
    maxY = Math.max(maxY, piece.y + g.piecePx);
  });

  let shiftX = 0;
  let shiftY = 0;

  if (minX < -margin) shiftX = -margin - minX;
  if (minY < -margin) shiftY = -margin - minY;
  if (maxX > g.tableWidth + margin) shiftX = g.tableWidth + margin - maxX;
  if (maxY > g.tableHeight + margin) shiftY = g.tableHeight + margin - maxY;

  if (shiftX || shiftY) {
    members.forEach(piece => {
      piece.x += shiftX;
      piece.y += shiftY;
    });
  }
}

function neighborPieces(piece) {
  return [
    pieceAt(piece.row - 1, piece.col),
    pieceAt(piece.row, piece.col + 1),
    pieceAt(piece.row + 1, piece.col),
    pieceAt(piece.row, piece.col - 1)
  ].filter(Boolean);
}

function findBestClusterSnap(clusterId) {
  const moving = clusterPieces(clusterId);
  const g = puzzleState.geometry;
  let best = null;

  moving.forEach(pieceA => {
    neighborPieces(pieceA).forEach(pieceB => {
      if (
        pieceB.state !== 'table' ||
        pieceB.clusterId === clusterId
      ) {
        return;
      }

      const expectedX =
        pieceB.x + (pieceA.col - pieceB.col) * g.step;

      const expectedY =
        pieceB.y + (pieceA.row - pieceB.row) * g.step;

      const shiftX = expectedX - pieceA.x;
      const shiftY = expectedY - pieceA.y;
      const distance = Math.hypot(shiftX, shiftY);

      if (
        distance <= g.pieceSnap &&
        (!best || distance < best.distance)
      ) {
        best = {
          sourceCluster: clusterId,
          targetCluster: pieceB.clusterId,
          shiftX,
          shiftY,
          distance,
          targetLocked: pieceB.locked
        };
      }
    });
  });

  return best;
}

function mergeClusters(sourceClusterId, targetClusterId, shiftX, shiftY) {
  const source = clusterPieces(sourceClusterId);
  const targetWasLocked = clusterLocked(targetClusterId);

  source.forEach(piece => {
    piece.x += shiftX;
    piece.y += shiftY;
    piece.clusterId = targetClusterId;
  });

  if (targetWasLocked) {
    clusterPieces(targetClusterId).forEach(piece => {
      const target = correctPosition(piece);
      piece.x = target.x;
      piece.y = target.y;
      piece.locked = true;
    });
  }

  return targetClusterId;
}

function resolveClusterSnaps(clusterId) {
  let active = clusterId;
  let connected = false;

  for (let pass = 0; pass < puzzleState.pieces.length; pass += 1) {
    if (clusterLocked(active)) break;

    const best = findBestClusterSnap(active);
    if (!best) break;

    active = mergeClusters(
      best.sourceCluster,
      best.targetCluster,
      best.shiftX,
      best.shiftY
    );

    connected = true;
  }

  if (connected) {
    showToast('Click! Pieces connected.');
  }

  return active;
}

function tryLockClusterToFrame(clusterId) {
  const members = clusterPieces(clusterId);
  if (!members.length || members.every(piece => piece.locked)) {
    return false;
  }

  const g = puzzleState.geometry;
  let best = null;

  members.forEach(piece => {
    const target = correctPosition(piece);
    const dx = target.x - piece.x;
    const dy = target.y - piece.y;
    const distance = Math.hypot(dx, dy);

    if (!best || distance < best.distance) {
      best = { dx, dy, distance };
    }
  });

  if (!best || best.distance > g.boardSnap) {
    return false;
  }

  members.forEach(piece => {
    piece.x += best.dx;
    piece.y += best.dy;
    piece.locked = true;
    const target = correctPosition(piece);
    piece.x = target.x;
    piece.y = target.y;
  });

  showToast(
    members.length === 1
      ? 'Snap! Piece locked.'
      : `Snap! ${members.length}-piece group locked.`
  );

  return true;
}

function scatterPieces(pieces, mode = 'all') {
  if (!pieces.length) return;

  const g = puzzleState.geometry;
  const positions = [];

  const board = {
    left: g.boardLeft,
    top: g.boardTop,
    right: g.boardLeft + g.boardWidth,
    bottom: g.boardTop + g.boardHeight
  };

  const pieceSize = g.piecePx;
  const perimeterSlots = [];

  if (mode === 'edges') {
    const stepX = Math.max(pieceSize * 0.72, 54);
    const stepY = Math.max(pieceSize * 0.72, 54);

    for (let x = 8; x < g.tableWidth - pieceSize; x += stepX) {
      perimeterSlots.push({ x, y: Math.max(4, board.top - pieceSize * 0.82) });
      perimeterSlots.push({ x, y: Math.min(g.tableHeight - pieceSize, board.bottom + pieceSize * 0.08) });
    }

    for (let y = 8; y < g.tableHeight - pieceSize; y += stepY) {
      perimeterSlots.push({ x: Math.max(4, board.left - pieceSize * 0.82), y });
      perimeterSlots.push({ x: Math.min(g.tableWidth - pieceSize, board.right + pieceSize * 0.08), y });
    }
  }

  const shuffledSlots = shuffled(perimeterSlots);

  pieces.forEach((piece, index) => {
    piece.state = 'table';
    piece.locked = false;
    piece.clusterId = puzzleState.nextClusterId++;
    piece.z = ++puzzleState.nextZ;

    let position;

    if (mode === 'edges' && shuffledSlots.length) {
      position = shuffledSlots[index % shuffledSlots.length];
      position = {
        x: position.x + (Math.random() - 0.5) * pieceSize * 0.28,
        y: position.y + (Math.random() - 0.5) * pieceSize * 0.28
      };
    } else {
      position = {
        x: Math.random() * Math.max(1, g.tableWidth - pieceSize),
        y: Math.random() * Math.max(1, g.tableHeight - pieceSize)
      };
    }

    piece.x = position.x;
    piece.y = position.y;
    clampPieceToTable(piece);
  });

  syncAllPieces();
}

function recallSingles() {
  const sizes = new Map();

  puzzleState.pieces.forEach(piece => {
    if (piece.state !== 'table' || piece.locked) return;
    sizes.set(piece.clusterId, (sizes.get(piece.clusterId) || 0) + 1);
  });

  let recalled = 0;

  puzzleState.pieces.forEach(piece => {
    if (
      piece.state === 'table' &&
      !piece.locked &&
      sizes.get(piece.clusterId) === 1
    ) {
      piece.state = 'tray';
      piece.x = 0;
      piece.y = 0;
      piece.clusterId = puzzleState.nextClusterId++;
      recalled += 1;
    }
  });

  puzzleState.allTableMode = 'scatter';
  syncAllPieces();

  showToast(
    recalled
      ? `${recalled} single ${recalled === 1 ? 'piece' : 'pieces'} returned to the tray.`
      : 'No loose single pieces to recall.'
  );
}

function toggleAllToTable() {
  if (!puzzleState) return;

  if (puzzleState.allTableMode === 'scatter') {
    const tray = puzzleState.pieces.filter(piece => piece.state === 'tray');

    if (!tray.length) {
      puzzleState.allTableMode = 'recall';
      updatePlayControls();
      return;
    }

    scatterPieces(tray, 'all');
    puzzleState.allTableMode = 'recall';
    updatePlayControls();
    showToast('All loose tray pieces scattered onto the table.');
  } else {
    recallSingles();
  }
}

function edgesToTable() {
  if (!puzzleState) return;

  const edges = puzzleState.pieces.filter(
    piece => piece.state === 'tray' && piece.isEdge
  );

  if (!edges.length) {
    showToast('All edge pieces are already out of the tray.');
    return;
  }

  scatterPieces(edges, 'edges');
  showToast(`${edges.length} edge pieces scattered onto the table.`);
}

function isPuzzleComplete() {
  return Boolean(
    puzzleState &&
    puzzleState.pieces.every(piece => piece.locked)
  );
}

function finishPuzzle() {
  const fish = puzzleState.species;
  const id = fish.id;

  if (!cooler[id]) {
    cooler[id] = {
      firstCompletedAt: new Date().toISOString(),
      completions: 0,
      bestPieces: 0
    };
  }

  cooler[id].completions += 1;
  cooler[id].bestPieces = Math.max(
    cooler[id].bestPieces || 0,
    puzzleState.difficulty.pieces
  );

  saveCooler();

  els.completeImage.src = fish.image;
  els.completeTitle.textContent = fish.commonName;
  els.completeScientific.textContent = fish.scientificName;
  els.completeDescription.textContent = fish.description;
  els.completeHistory.textContent = fish.history;

  updateCoolerChip();
  showScreen('complete');
  showToast(`${fish.commonName} added to your Fish Cooler.`);
}

function renderCooler() {
  updateCoolerChip();
  els.coolerGrid.innerHTML = '';

  Object.values(speciesData).forEach(fish => {
    const meta = cooler[fish.id];
    const card = document.createElement('article');
    card.className = `cooler-card ${meta ? '' : 'locked'}`;

    if (meta) {
      const firstDate = new Date(meta.firstCompletedAt);

      card.innerHTML = `
        <img src="${fish.image}" alt="${fish.commonName}" />
        <div class="cooler-body">
          <h3>${fish.commonName}</h3>
          <p class="scientific">${fish.scientificName}</p>
          <p>${fish.description}</p>
          <p><strong>Completed:</strong> ${meta.completions} time${meta.completions === 1 ? '' : 's'}</p>
          <p><strong>Largest puzzle:</strong> ${meta.bestPieces || 12} pieces</p>
          <p><strong>First completed:</strong> ${firstDate.toLocaleDateString()}</p>
        </div>
      `;
    } else {
      card.innerHTML = `
        <div class="locked-art">?</div>
        <div class="cooler-body">
          <h3>Undiscovered Fish</h3>
          <p>Complete this fish to add its species card to your cooler.</p>
        </div>
      `;
    }

    els.coolerGrid.appendChild(card);
  });
}

function togglePreview() {
  if (!puzzleState) return;

  puzzleState.preview = !puzzleState.preview;
  els.framePreview.classList.toggle('visible', puzzleState.preview);
  els.previewBtn.classList.toggle('active', puzzleState.preview);
  els.previewBtn.textContent = puzzleState.preview ? 'Hide Preview' : 'Preview';
}

async function toggleFullscreen() {
  try {
    if (!document.fullscreenElement) {
      if (els.playShell.requestFullscreen) {
        await els.playShell.requestFullscreen();
      } else if (els.playShell.webkitRequestFullscreen) {
        els.playShell.webkitRequestFullscreen();
      }
    } else if (document.exitFullscreen) {
      await document.exitFullscreen();
    }
  } catch (error) {
    showToast('Full screen is not available in this browser mode.');
  }
}

function updateFullscreenButton() {
  const active = Boolean(document.fullscreenElement);
  els.fullscreenBtn.textContent = active ? 'Exit Full Screen' : 'Full Screen';

  if (puzzleState) {
    requestAnimationFrame(() => {
      layoutPuzzle(true);
      syncAllPieces();
    });
  }
}

function toggleTray() {
  if (!puzzleState) return;

  puzzleState.trayCollapsed = !puzzleState.trayCollapsed;
  els.trayBar.classList.toggle('collapsed', puzzleState.trayCollapsed);
  els.collapseTrayBtn.textContent =
    puzzleState.trayCollapsed ? 'Show Tray' : 'Hide Tray';

  setTimeout(() => {
    layoutPuzzle(true);
    syncAllPieces();
  }, 220);
}

function initWaterBubbles() {
  const box = document.getElementById('waterBubbles');
  if (!box) return;

  box.replaceChildren();

  for (let i = 0; i < 12; i += 1) {
    const bubble = document.createElement('div');
    bubble.className = 'bubble';

    const size = 4 + Math.random() * 13;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${Math.random() * 100}%`;
    bubble.style.setProperty('--drift', `${Math.random() * 40 - 20}px`);
    bubble.style.animationDuration = `${10 + Math.random() * 12}s`;
    bubble.style.animationDelay = `${-Math.random() * 18}s`;

    box.appendChild(bubble);
  }
}

function wireButtons() {
  const goHome = () => showScreen('home');
  const goSelect = () => {
    renderPuzzleChoices();
    showScreen('select');
  };

  const openCooler = () => {
    renderCooler();
    showScreen('cooler');
  };

  els.homeBtn.addEventListener('click', goHome);
  els.coolerBtn.addEventListener('click', openCooler);
  els.homeCoolerBtn.addEventListener('click', openCooler);
  els.openCoolerBtn.addEventListener('click', openCooler);

  els.startFishingBtn.addEventListener('click', goSelect);
  els.howStartBtn.addEventListener('click', goSelect);
  els.howToPlayBtn.addEventListener('click', () => showScreen('how'));

  els.playHomeBtn.addEventListener('click', goHome);
  els.newPuzzleBtn.addEventListener('click', goSelect);
  els.fishAgainBtn.addEventListener('click', goSelect);

  els.edgesToTableBtn.addEventListener('click', edgesToTable);
  els.allTableBtn.addEventListener('click', toggleAllToTable);
  els.previewBtn.addEventListener('click', togglePreview);
  els.fullscreenBtn.addEventListener('click', toggleFullscreen);
  els.collapseTrayBtn.addEventListener('click', toggleTray);

  els.trayFilter.addEventListener('change', event => {
    if (!puzzleState) return;
    puzzleState.trayFilter = event.target.value;
    applyTrayFilter();
  });

  document.querySelectorAll('[data-back-home="true"]').forEach(button => {
    button.addEventListener('click', goHome);
  });

  document.addEventListener('fullscreenchange', updateFullscreenButton);

  window.addEventListener('orientationchange', () => {
    if (!puzzleState || !screens.puzzle.classList.contains('active')) return;

    setTimeout(() => {
      layoutPuzzle(true);
      syncAllPieces();
    }, 260);
  });
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}

els.version.textContent = `Angler's Jigsaw • v${APP_VERSION}`;

wireButtons();
renderPuzzleChoices();
renderCooler();
updateCoolerChip();
initWaterBubbles();
showScreen('home');
