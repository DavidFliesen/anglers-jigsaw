
const screens = {
  home: document.getElementById('screen-home'),
  difficulty: document.getElementById('screen-difficulty'),
  how: document.getElementById('screen-how'),
  puzzle: document.getElementById('screen-puzzle'),
  complete: document.getElementById('screen-complete'),
  cooler: document.getElementById('screen-cooler')
};

const storageKey = 'anglers-jigsaw-cooler-v1';
let cooler = JSON.parse(localStorage.getItem(storageKey) || '{}');

const difficulties = [
  { id: 'easy', label: 'Easy', pieces: 12, cols: 4, rows: 3, note: 'Large pieces · good for a quick catch' },
  { id: 'angler', label: 'Angler', pieces: 48, cols: 8, rows: 6, note: 'A relaxed full-size puzzle' },
  { id: 'guide', label: 'Guide', pieces: 108, cols: 12, rows: 9, note: 'More detail and a longer solve' },
  { id: 'tournament', label: 'Tournament', pieces: 192, cols: 16, rows: 12, note: 'Small pieces · serious challenge' }
];

let currentDifficulty = difficulties[0];
let currentSpecies = null;
let selectedPieceId = null;
let puzzleState = null;

let dragState = {
  active: false,
  pieceId: null,
  pointerId: null,
  sourceEl: null,
  startX: 0,
  startY: 0,
  moved: false,
  ghostEls: []
};

const homeBtn = document.getElementById('homeBtn');
const coolerBtn = document.getElementById('coolerBtn');
const homeCoolerBtn = document.getElementById('homeCoolerBtn');
const startFishingBtn = document.getElementById('startFishingBtn');
const howToPlayBtn = document.getElementById('howToPlayBtn');
const howStartBtn = document.getElementById('howStartBtn');

const difficultyGrid = document.getElementById('difficultyGrid');

const puzzleBoard = document.getElementById('puzzleBoard');
const trayPieces = document.getElementById('trayPieces');
const edgesOnlyBtn = document.getElementById('edgesOnlyBtn');
const allPiecesBtn = document.getElementById('allPiecesBtn');
const spreadPiecesBtn = document.getElementById('spreadPiecesBtn');
const newPuzzleBtn = document.getElementById('newPuzzleBtn');
const pieceCounterChip = document.getElementById('pieceCounterChip');
const puzzleInfo = document.getElementById('puzzleInfo');

const completeImage = document.getElementById('completeImage');
const completeTitle = document.getElementById('completeTitle');
const completeScientific = document.getElementById('completeScientific');
const completeDescription = document.getElementById('completeDescription');
const completeHistory = document.getElementById('completeHistory');
const fishAgainBtn = document.getElementById('fishAgainBtn');
const openCoolerBtn = document.getElementById('openCoolerBtn');

const coolerGrid = document.getElementById('coolerGrid');
const coolerCountChip = document.getElementById('coolerCountChip');
const toast = document.getElementById('toast');

function showScreen(name) {
  Object.values(screens).forEach(screen => screen.classList.remove('active'));
  screens[name].classList.add('active');

  if (name === 'puzzle' && puzzleState) {
    requestAnimationFrame(renderPuzzle);
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove('hidden');

  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    toast.classList.add('hidden');
  }, 2200);
}

function saveCooler() {
  localStorage.setItem(storageKey, JSON.stringify(cooler));
}

function discoveredCount() {
  return Object.keys(cooler).length;
}

function updateCoolerChip() {
  coolerCountChip.textContent = `${discoveredCount()} discovered`;
}

function renderDifficulties() {
  difficultyGrid.innerHTML = '';

  difficulties.forEach(level => {
    const card = document.createElement('button');
    card.className = 'difficulty-card';
    card.type = 'button';

    card.innerHTML = `
      <span class="difficulty-name">${level.label}</span>
      <span class="difficulty-count">${level.pieces}</span>
      <span class="difficulty-word">pieces</span>
      <span class="difficulty-grid-size">${level.cols} × ${level.rows}</span>
      <span class="difficulty-note">${level.note}</span>
    `;

    card.addEventListener('click', () => {
      currentDifficulty = level;
      startRandomPuzzle();
    });

    difficultyGrid.appendChild(card);
  });
}

function startRandomPuzzle() {
  const ids = Object.keys(speciesData);
  const id = ids[Math.floor(Math.random() * ids.length)];

  currentSpecies = speciesData[id];
  startPuzzle(currentSpecies, currentDifficulty);
}

function wireButtons() {
  homeBtn.addEventListener('click', () => showScreen('home'));

  const openCooler = () => {
    renderCooler();
    showScreen('cooler');
  };

  coolerBtn.addEventListener('click', openCooler);
  homeCoolerBtn.addEventListener('click', openCooler);
  openCoolerBtn.addEventListener('click', openCooler);

  startFishingBtn.addEventListener('click', () => showScreen('difficulty'));
  howStartBtn.addEventListener('click', () => showScreen('difficulty'));
  howToPlayBtn.addEventListener('click', () => showScreen('how'));

  newPuzzleBtn.addEventListener('click', () => showScreen('difficulty'));
  fishAgainBtn.addEventListener('click', () => showScreen('difficulty'));

  document.querySelectorAll('[data-back-home="true"]').forEach(button => {
    button.addEventListener('click', () => showScreen('home'));
  });
}

function shuffled(array) {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}



function isEdgePiece(row, col, rows, cols) {
  return row === 0 || col === 0 || row === rows - 1 || col === cols - 1;
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


function startPuzzle(species, difficulty) {
  selectedPieceId = null;

  const { rows, cols } = difficulty;
  const edgeSet = generatePieceEdges(rows, cols);
  const pieces = [];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const index = row * cols + col;

      pieces.push({
        id: `piece-${index}`,
        correctIndex: index,
        row,
        col,
        isEdge: isEdgePiece(row, col, rows, cols),
        edges: edgeSet[index],
        onBoard: false,
        locked: false,
        boardX: 0,
        boardY: 0,
        zIndex: 1,
        clusterId: null
      });
    }
  }

  puzzleState = {
    species,
    difficulty,
    rows,
    cols,
    pieces: shuffled(pieces),
    filterMode: 'all',
    borderPromptShown: false,
    piecePx: 100,
    stepPx: 75,
    snapDistance: 36,
    nextClusterId: 1,
    nextZ: 10
  };

  puzzleInfo.textContent =
    `${difficulty.label} · ${difficulty.pieces} pieces · ${difficulty.cols} × ${difficulty.rows}`;

  showScreen('puzzle');
  showToast('All Pieces is on. Build the puzzle your way.');
}

function updatePuzzleGeometry() {
  if (!puzzleState) return;

  const rect = puzzleBoard.getBoundingClientRect();

  /*
    Classic ribbon-cut geometry:
    - SVG canvas = 120 × 120
    - visible "body" cell = 84 × 84
    - connector padding = 18 on each side

    That gives a familiar puzzle silhouette while keeping the
    assembled picture aligned to the full 4:3 board area.
  */
  const BODY = 84;
  const PAD = 18;
  const stepX = rect.width / puzzleState.cols;
  const stepY = rect.height / puzzleState.rows;
  const stepPx = Math.min(stepX, stepY);

  puzzleState.stepPx = stepPx;
  puzzleState.piecePx = stepPx * (120 / BODY);
  puzzleState.connectorPadPx = puzzleState.piecePx * (PAD / 120);
  puzzleState.snapDistance = Math.max(18, Math.min(60, stepPx * 0.52));
}



function piecePath(edges) {
  const { top, right, bottom, left } = edges;

  /*
    Traditional ribbon-cut piece:
    - straight body box
    - centered circular-looking knobs and blanks
    - mirrored curves so neighboring pieces line up cleanly
  */
  let d = 'M 18 18';

  // TOP
  if (top === 0) {
    d += ' L 102 18';
  } else if (top === 1) {
    d += ` L 43 18
           C 46 18, 47 12, 50 9
           C 54 4, 66 4, 70 9
           C 73 12, 74 18, 77 18
           L 102 18`;
  } else {
    d += ` L 43 18
           C 46 18, 47 24, 50 27
           C 54 32, 66 32, 70 27
           C 73 24, 74 18, 77 18
           L 102 18`;
  }

  // RIGHT
  if (right === 0) {
    d += ' L 102 102';
  } else if (right === 1) {
    d += ` L 102 43
           C 102 46, 108 47, 111 50
           C 116 54, 116 66, 111 70
           C 108 73, 102 74, 102 77
           L 102 102`;
  } else {
    d += ` L 102 43
           C 102 46, 96 47, 93 50
           C 88 54, 88 66, 93 70
           C 96 73, 102 74, 102 77
           L 102 102`;
  }

  // BOTTOM
  if (bottom === 0) {
    d += ' L 18 102';
  } else if (bottom === 1) {
    d += ` L 77 102
           C 74 102, 73 108, 70 111
           C 66 116, 54 116, 50 111
           C 47 108, 46 102, 43 102
           L 18 102`;
  } else {
    d += ` L 77 102
           C 74 102, 73 96, 70 93
           C 66 88, 54 88, 50 93
           C 47 96, 46 102, 43 102
           L 18 102`;
  }

  // LEFT
  if (left === 0) {
    d += ' L 18 18';
  } else if (left === 1) {
    d += ` L 18 77
           C 18 74, 12 73, 9 70
           C 4 66, 4 54, 9 50
           C 12 47, 18 46, 18 43
           L 18 18`;
  } else {
    d += ` L 18 77
           C 18 74, 24 73, 27 70
           C 32 66, 32 54, 27 50
           C 24 47, 18 46, 18 43
           L 18 18`;
  }

  return d + ' Z';
}

/*
  Each piece shows its exact part of one common 4:3 source image.
*/
function pieceSvgMarkup(piece, uniqueId) {
  const BODY = 84;
  const PAD = 18;
  const fullWidth = BODY * puzzleState.cols;
  const fullHeight = BODY * puzzleState.rows;
  const path = piecePath(piece.edges);

  /*
    The image is mapped across one shared 4:3 board image so every piece
    lines up cleanly. The puzzle board itself now shows that same image
    beneath the pieces, which eliminates the distracting blue side strips.
  */
  const imageX = PAD - piece.col * BODY;
  const imageY = PAD - piece.row * BODY;

  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <clipPath id="${uniqueId}">
          <path d="${path}"></path>
        </clipPath>
      </defs>

      <g clip-path="url(#${uniqueId})">
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

function createPieceElement(piece, context = 'tray') {
  const element = document.createElement('div');
  element.className =
    `jigsaw-piece ${context === 'board' ? 'board-piece' : 'tray-piece'}`;

  element.dataset.id = piece.id;

  if (piece.locked) {
    element.classList.add('locked-piece');
    element.dataset.locked = 'true';
  }

  const uid =
    `clip-${piece.id}-${context}-${Math.random().toString(36).slice(2)}`;

  element.innerHTML = pieceSvgMarkup(piece, uid);

  if ((context === 'tray' || context === 'board') && !piece.locked) {
    element.setAttribute('role', 'button');
    element.setAttribute('tabindex', '0');
    element.setAttribute('aria-label', `Puzzle piece ${piece.correctIndex + 1}`);
    element.addEventListener('pointerdown', beginPieceDrag);
  }

  return element;
}

function getVisibleTrayPieces() {
  if (!puzzleState) return [];

  return puzzleState.pieces.filter(piece => {
    if (piece.onBoard) return false;
    if (puzzleState.filterMode === 'edges') return piece.isEdge;
    return true;
  });
}

function updatePieceCounter() {
  const total = puzzleState.pieces.length;
  const locked = puzzleState.pieces.filter(piece => piece.locked).length;
  pieceCounterChip.textContent = `${locked} / ${total} locked`;
}

function trayPieceSize() {
  if (!puzzleState) return 72;

  if (puzzleState.difficulty.pieces <= 12) return 104;
  if (puzzleState.difficulty.pieces <= 48) return 72;
  if (puzzleState.difficulty.pieces <= 108) return 54;
  return 42;
}

function renderPuzzle() {
  if (!puzzleState) return;

  updatePuzzleGeometry();
  updatePieceCounter();

  puzzleBoard.innerHTML = '';
  puzzleBoard.classList.add('free-jigsaw-board');
  puzzleBoard.style.setProperty('--board-image', `url("${puzzleState.species.image}")`);

  puzzleState.pieces
    .filter(piece => piece.onBoard)
    .forEach(piece => {
      const element = createPieceElement(piece, 'board');

      if (piece.locked) {
        const correct = getCorrectBoardPosition(piece);
        piece.boardX = correct.x;
        piece.boardY = correct.y;
      }

      element.style.width = `${puzzleState.piecePx}px`;
      element.style.height = `${puzzleState.piecePx}px`;
      element.style.left = `${piece.boardX}px`;
      element.style.top = `${piece.boardY}px`;
      element.style.zIndex = String(piece.locked ? 5 : (piece.zIndex || 10));

      puzzleBoard.appendChild(element);
    });

  trayPieces.innerHTML = '';

  const traySize = trayPieceSize();

  getVisibleTrayPieces().forEach(piece => {
    const element = createPieceElement(piece, 'tray');
    element.style.width = `${traySize}px`;
    element.style.height = `${traySize}px`;
    trayPieces.appendChild(element);
  });

  edgesOnlyBtn.classList.toggle('active-filter', puzzleState.filterMode === 'edges');
  allPiecesBtn.classList.toggle('active-filter', puzzleState.filterMode === 'all');
}


function getCorrectBoardPosition(piece) {
  const pad = puzzleState.connectorPadPx || 0;

  return {
    x: piece.col * puzzleState.stepPx - pad,
    y: piece.row * puzzleState.stepPx - pad
  };
}

function beginPieceDrag(event) {
  if (!puzzleState) return;
  if (event.pointerType === 'mouse' && event.button !== 0) return;

  event.preventDefault();

  const sourceElement = event.currentTarget;
  const piece = puzzleState.pieces.find(
    candidate => candidate.id === sourceElement.dataset.id
  );

  if (!piece || piece.locked) return;

  piece.zIndex = ++puzzleState.nextZ;
  sourceElement.style.zIndex = String(piece.zIndex);

  const rect = sourceElement.getBoundingClientRect();

  dragState.active = true;
  dragState.pieceId = piece.id;
  dragState.pointerId = event.pointerId;
  dragState.sourceEl = sourceElement;
  dragState.startX = event.clientX;
  dragState.startY = event.clientY;
  dragState.moved = false;

  dragState.grabFracX = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
  dragState.grabFracY = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));

  sourceElement.classList.add('drag-source');

  try {
    sourceElement.setPointerCapture(event.pointerId);
  } catch (error) {}

  sourceElement.addEventListener('pointermove', movePieceDrag);
  sourceElement.addEventListener('pointerup', endPieceDrag);
  sourceElement.addEventListener('pointercancel', cancelPieceDrag);
}

function movePieceDrag(event) {
  if (!dragState.active || event.pointerId !== dragState.pointerId) return;

  const distance = Math.hypot(
    event.clientX - dragState.startX,
    event.clientY - dragState.startY
  );

  if (!dragState.moved && distance < 4) return;

  if (!dragState.moved) {
    dragState.moved = true;
    createDragGhost();
  }

  event.preventDefault();
  positionDragGhost(event.clientX, event.clientY);
}

function createDragGhost() {
  const piece = puzzleState.pieces.find(
    candidate => candidate.id === dragState.pieceId
  );

  if (!piece) return;

  const ghost = createPieceElement(piece, 'ghost');
  ghost.classList.add('drag-ghost');
  ghost.style.width = `${puzzleState.piecePx}px`;
  ghost.style.height = `${puzzleState.piecePx}px`;

  document.body.appendChild(ghost);
  dragState.ghostEls = [{ el: ghost }];
}

function positionDragGhost(pointerX, pointerY) {
  const ghost = dragState.ghostEls?.[0]?.el;
  if (!ghost) return;

  ghost.style.left = `${pointerX - dragState.grabFracX * puzzleState.piecePx}px`;
  ghost.style.top = `${pointerY - dragState.grabFracY * puzzleState.piecePx}px`;
}

function cleanupDrag() {
  if (dragState.sourceEl) {
    dragState.sourceEl.removeEventListener('pointermove', movePieceDrag);
    dragState.sourceEl.removeEventListener('pointerup', endPieceDrag);
    dragState.sourceEl.removeEventListener('pointercancel', cancelPieceDrag);
  }

  document.querySelectorAll('.drag-source').forEach(node => {
    node.classList.remove('drag-source');
  });

  (dragState.ghostEls || []).forEach(info => info.el.remove());

  dragState = {
    active: false,
    pieceId: null,
    pointerId: null,
    sourceEl: null,
    startX: 0,
    startY: 0,
    moved: false,
    ghostEls: []
  };
}

function cancelPieceDrag() {
  cleanupDrag();
}

function clampPieceToBoard(piece) {
  const boardRect = puzzleBoard.getBoundingClientRect();
  const pad = puzzleState.connectorPadPx || 0;

  const minX = -pad;
  const minY = -pad;
  const maxX = Math.max(minX, boardRect.width - puzzleState.piecePx + pad);
  const maxY = Math.max(minY, boardRect.height - puzzleState.piecePx + pad);

  piece.boardX = Math.max(minX, Math.min(maxX, piece.boardX));
  piece.boardY = Math.max(minY, Math.min(maxY, piece.boardY));
}

function separateLooseOverlap(piece) {
  if (!piece || piece.locked) return;

  const size = puzzleState.piecePx;
  const minSeparation = size * 0.46;

  const others = puzzleState.pieces.filter(other =>
    other.id !== piece.id &&
    other.onBoard &&
    !other.locked
  );

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const blocker = others.find(other =>
      Math.abs(piece.boardX - other.boardX) < minSeparation &&
      Math.abs(piece.boardY - other.boardY) < minSeparation
    );

    if (!blocker) break;

    const angle = (attempt * Math.PI) / 4;
    piece.boardX += Math.cos(angle) * size * 0.34;
    piece.boardY += Math.sin(angle) * size * 0.34;
    clampPieceToBoard(piece);
  }
}

function trySnapLockPiece(piece) {
  if (!piece || piece.locked) return false;

  const target = getCorrectBoardPosition(piece);
  const distance = Math.hypot(
    piece.boardX - target.x,
    piece.boardY - target.y
  );

  const snapRadius = Math.max(
    puzzleState.snapDistance,
    puzzleState.piecePx * 0.42
  );

  if (distance > snapRadius) return false;

  piece.boardX = target.x;
  piece.boardY = target.y;
  piece.locked = true;
  piece.clusterId = 0;

  showToast('Snap! Piece locked in place.');
  return true;
}

function endPieceDrag(event) {
  if (!dragState.active || event.pointerId !== dragState.pointerId) return;

  const piece = puzzleState.pieces.find(
    candidate => candidate.id === dragState.pieceId
  );

  if (!piece) {
    cleanupDrag();
    return;
  }

  if (!dragState.moved) {
    cleanupDrag();
    return;
  }

  const boardRect = puzzleBoard.getBoundingClientRect();

  const overBoard =
    event.clientX >= boardRect.left &&
    event.clientX <= boardRect.right &&
    event.clientY >= boardRect.top &&
    event.clientY <= boardRect.bottom;

  if (!overBoard) {
    piece.onBoard = false;
    cleanupDrag();
    renderPuzzle();
    showToast('Drop the piece onto the puzzle table.');
    return;
  }

  piece.onBoard = true;
  piece.boardX =
    event.clientX - boardRect.left -
    dragState.grabFracX * puzzleState.piecePx;

  piece.boardY =
    event.clientY - boardRect.top -
    dragState.grabFracY * puzzleState.piecePx;

  clampPieceToBoard(piece);
  cleanupDrag();

  const snapped = trySnapLockPiece(piece);

  if (!snapped) {
    piece.onBoard = false;
    piece.boardX = 0;
    piece.boardY = 0;
    renderPuzzle();
    showToast('Not quite — move it closer to its matching spot.');
    return;
  }

  checkBorderComplete();
  renderPuzzle();

  if (isPuzzleComplete()) {
    setTimeout(finishPuzzle, 300);
  }
}

function checkBorderComplete() {
  if (puzzleState.borderPromptShown) return;

  const edgePieces = puzzleState.pieces.filter(piece => piece.isEdge);
  const borderLocked = edgePieces.every(piece => piece.locked);

  if (borderLocked) {
    puzzleState.borderPromptShown = true;
    showToast('Border complete!');
  }
}

function isPuzzleComplete() {
  return Boolean(
    puzzleState &&
    puzzleState.pieces.every(piece => piece.locked)
  );
}

function finishPuzzle() {
  const id = puzzleState.species.id;

  if (!cooler[id]) {
    cooler[id] = {
      firstCaughtAt: new Date().toISOString(),
      catches: 0,
      bestPieces: 0
    };
  }

  cooler[id].catches += 1;
  cooler[id].bestPieces = Math.max(
    cooler[id].bestPieces || 0,
    puzzleState.difficulty.pieces
  );

  saveCooler();

  completeImage.src = puzzleState.species.image;
  completeTitle.textContent = puzzleState.species.commonName;
  completeScientific.textContent = puzzleState.species.scientificName;
  completeDescription.textContent = puzzleState.species.description;
  completeHistory.textContent = puzzleState.species.history;

  updateCoolerChip();
  showScreen('complete');

  showToast(`${puzzleState.species.commonName} added to your Fish Cooler.`);
}

edgesOnlyBtn.addEventListener('click', () => {
  if (!puzzleState) return;
  puzzleState.filterMode = 'edges';
  renderPuzzle();
});

allPiecesBtn.addEventListener('click', () => {
  if (!puzzleState) return;
  puzzleState.filterMode = 'all';
  renderPuzzle();
});

spreadPiecesBtn.addEventListener('click', () => {
  if (!puzzleState) return;

  const boardPieces = puzzleState.pieces.filter(piece => piece.onBoard);
  const trayState = puzzleState.pieces.filter(piece => !piece.onBoard);

  puzzleState.pieces = [...boardPieces, ...shuffled(trayState)];

  renderPuzzle();
  showToast('Loose pieces rearranged in the Tackle Tray.');
});

function renderCooler() {
  updateCoolerChip();
  coolerGrid.innerHTML = '';

  Object.keys(speciesData).forEach(id => {
    const fish = speciesData[id];
    const caught = Boolean(cooler[id]);

    const card = document.createElement('article');
    card.className = `cooler-card ${caught ? '' : 'locked'}`;

    if (caught) {
      const meta = cooler[id];
      const firstDate = new Date(meta.firstCaughtAt);

      card.innerHTML = `
        <img src="${fish.image}" alt="${fish.commonName}" />
        <div class="cooler-body">
          <h3>${fish.commonName}</h3>
          <p class="scientific">${fish.scientificName}</p>
          <p>${fish.description}</p>
          <p><strong>Completed:</strong> ${meta.catches} time${meta.catches === 1 ? '' : 's'}</p>
          <p><strong>Largest puzzle:</strong> ${meta.bestPieces || 12} pieces</p>
          <p><strong>First completed:</strong> ${firstDate.toLocaleDateString()}</p>
        </div>
      `;
    } else {
      card.innerHTML = `
        <div class="locked-art">?</div>
        <div class="cooler-body">
          <h3>Undiscovered Fish</h3>
          <p>Complete more puzzles to unlock this Fish Cooler entry.</p>
        </div>
      `;
    }

    coolerGrid.appendChild(card);
  });
}

window.addEventListener('resize', () => {
  if (screens.puzzle.classList.contains('active') && puzzleState) {
    clearTimeout(window.__puzzleResizeTimer);
    window.__puzzleResizeTimer = setTimeout(renderPuzzle, 120);
  }
});



function initWaterBubbles() {
  const box = document.getElementById('water-bubbles');
  if (!box) return;

  // Rebuild the layer cleanly on every page load.
  box.replaceChildren();

  const count = 12;

  for (let i = 0; i < count; i += 1) {
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

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}

wireButtons();
renderDifficulties();
renderCooler();
updateCoolerChip();
initWaterBubbles();
showScreen('home');
