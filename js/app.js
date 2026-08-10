
const screens = {
  home: document.getElementById('screen-home'),
  how: document.getElementById('screen-how'),
  waters: document.getElementById('screen-waters'),
  puzzle: document.getElementById('screen-puzzle'),
  complete: document.getElementById('screen-complete'),
  cooler: document.getElementById('screen-cooler')
};

const storageKey = 'anglers-jigsaw-cooler-v1';
let cooler = JSON.parse(localStorage.getItem(storageKey) || '{}');

let currentWater = null;
let currentSpecies = null;
let selectedPieceId = null;
let puzzleState = null;

let dragState = {
  active: false,
  pieceId: null,
  pointerId: null,
  sourceEl: null,
  ghostEl: null,
  startX: 0,
  startY: 0,
  moved: false
};

const homeBtn = document.getElementById('homeBtn');
const coolerBtn = document.getElementById('coolerBtn');
const startFishingBtn = document.getElementById('startFishingBtn');
const howToPlayBtn = document.getElementById('howToPlayBtn');
const howStartBtn = document.getElementById('howStartBtn');
const watersGrid = document.getElementById('watersGrid');

const puzzleBoard = document.getElementById('puzzleBoard');
const trayPieces = document.getElementById('trayPieces');
const edgesOnlyBtn = document.getElementById('edgesOnlyBtn');
const allPiecesBtn = document.getElementById('allPiecesBtn');
const spreadPiecesBtn = document.getElementById('spreadPiecesBtn');
const pieceCounterChip = document.getElementById('pieceCounterChip');

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
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (name === 'puzzle' && puzzleState) {
    requestAnimationFrame(renderPuzzle);
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove('hidden');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => toast.classList.add('hidden'), 2200);
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

function wireGlobalButtons() {
  homeBtn.addEventListener('click', () => showScreen('home'));
  coolerBtn.addEventListener('click', () => {
    renderCooler();
    showScreen('cooler');
  });
  startFishingBtn.addEventListener('click', () => showScreen('waters'));
  howToPlayBtn.addEventListener('click', () => showScreen('how'));
  howStartBtn.addEventListener('click', () => showScreen('waters'));

  document.querySelectorAll('[data-back-home="true"]').forEach(btn => {
    btn.addEventListener('click', () => showScreen('home'));
  });
}

function renderWaters() {
  watersGrid.innerHTML = '';

  waters.forEach(water => {
    const card = document.createElement('article');
    card.className = 'water-card';

    card.innerHTML = `
      <div class="water-tag">${water.name}</div>
      <h3>${water.name}</h3>
      <p>${water.tagline}</p>
      <div class="water-hotspots"><strong>Possible catches:</strong> ${water.species.length} species</div>
      <button class="primary-btn">Choose This Water</button>
    `;

    card.querySelector('button').addEventListener('click', () => chooseWater(water.id));
    watersGrid.appendChild(card);
  });
}

function chooseWater(waterId) {
  currentWater = waters.find(w => w.id === waterId);

  const speciesId =
    currentWater.species[Math.floor(Math.random() * currentWater.species.length)];

  currentSpecies = speciesData[speciesId];

  showToast(`Something is waiting in ${currentWater.name}...`);
  setTimeout(() => startPuzzle(currentSpecies), 450);
}

function shuffled(array) {
  const arr = [...array];

  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

function isEdgeIndex(index, size) {
  const row = Math.floor(index / size);
  const col = index % size;
  return row === 0 || col === 0 || row === size - 1 || col === size - 1;
}

/*
  0 = flat border
  1 = outward tab
 -1 = inward blank

  Every shared edge is generated once and mirrored on its neighbor,
  so adjacent pieces fit like a traditional jigsaw.
*/
function generatePieceEdges(size) {
  const horizontal = Array.from({ length: size - 1 }, () =>
    Array(size).fill(0)
  );
  const vertical = Array.from({ length: size }, () =>
    Array(size - 1).fill(0)
  );

  for (let row = 0; row < size - 1; row += 1) {
    for (let col = 0; col < size; col += 1) {
      horizontal[row][col] = Math.random() < 0.5 ? 1 : -1;
    }
  }

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size - 1; col += 1) {
      vertical[row][col] = Math.random() < 0.5 ? 1 : -1;
    }
  }

  const edges = [];

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      edges.push({
        top: row === 0 ? 0 : -horizontal[row - 1][col],
        right: col === size - 1 ? 0 : vertical[row][col],
        bottom: row === size - 1 ? 0 : horizontal[row][col],
        left: col === 0 ? 0 : -vertical[row][col - 1]
      });
    }
  }

  return edges;
}

function startPuzzle(species) {
  selectedPieceId = null;

  const size = 3;
  const edges = generatePieceEdges(size);
  const pieces = [];

  for (let i = 0; i < size * size; i += 1) {
    const row = Math.floor(i / size);
    const col = i % size;

    pieces.push({
      id: `piece-${i}`,
      correctIndex: i,
      row,
      col,
      placed: false,
      isEdge: isEdgeIndex(i, size),
      edges: edges[i]
    });
  }

  puzzleState = {
    species,
    size,
    pieces: shuffled(pieces),
    filterMode: 'edges',
    borderPromptShown: false,
    piecePx: 130,
    stepPx: 100,
    puzzlePx: 330,
    snapDistance: 58
  };

  showScreen('puzzle');
  showToast('Edges Only is on. Build the border first.');
}

function updatePuzzleGeometry() {
  if (!puzzleState) return;

  const boardRect = puzzleBoard.getBoundingClientRect();
  const usable = Math.max(260, Math.min(boardRect.width || 560, boardRect.height || 560));
  const size = puzzleState.size;

  // Piece viewBox is 120×120 and logical cell step is 90.
  const piecePx = usable / (0.75 * size + 0.25);
  const stepPx = piecePx * 0.75;
  const puzzlePx = stepPx * (size - 1) + piecePx;

  puzzleState.piecePx = piecePx;
  puzzleState.stepPx = stepPx;
  puzzleState.puzzlePx = puzzlePx;

  // The completed puzzle is centered inside the larger play board.
  // All placed pieces and snap targets must use this same origin.
  puzzleState.originX = Math.max(0, (boardRect.width - puzzlePx) / 2);
  puzzleState.originY = Math.max(0, (boardRect.height - puzzlePx) / 2);

  // Generous snap radius for touch devices. The actual piece still lands
  // only in its correct location.
  puzzleState.snapDistance = Math.max(48, piecePx * 0.58);
}

/*
  Traditional jigsaw silhouette.
  The outline lives inside a 120×120 box. The normal cell body is 90×90
  from 15..105, leaving room for tabs to protrude to 0 or 120.
*/
function piecePath(edges) {
  const { top, right, bottom, left } = edges;

  const leftBase = 15;
  const topBase = 15;
  const rightBase = 105;
  const bottomBase = 105;

  const outerTop = 0;
  const innerTop = 30;
  const outerRight = 120;
  const innerRight = 90;
  const outerBottom = 120;
  const innerBottom = 90;
  const outerLeft = 0;
  const innerLeft = 30;

  let d = `M ${leftBase} ${topBase}`;

  // TOP — left to right
  if (top === 0) {
    d += ` L ${rightBase} ${topBase}`;
  } else {
    const y = top === 1 ? outerTop : innerTop;
    d += `
      L 48 ${topBase}
      C 50 ${topBase}, 50 ${y}, 60 ${y}
      C 70 ${y}, 70 ${topBase}, 72 ${topBase}
      L ${rightBase} ${topBase}`;
  }

  // RIGHT — top to bottom
  if (right === 0) {
    d += ` L ${rightBase} ${bottomBase}`;
  } else {
    const x = right === 1 ? outerRight : innerRight;
    d += `
      L ${rightBase} 48
      C ${rightBase} 50, ${x} 50, ${x} 60
      C ${x} 70, ${rightBase} 70, ${rightBase} 72
      L ${rightBase} ${bottomBase}`;
  }

  // BOTTOM — right to left
  if (bottom === 0) {
    d += ` L ${leftBase} ${bottomBase}`;
  } else {
    const y = bottom === 1 ? outerBottom : innerBottom;
    d += `
      L 72 ${bottomBase}
      C 70 ${bottomBase}, 70 ${y}, 60 ${y}
      C 50 ${y}, 50 ${bottomBase}, 48 ${bottomBase}
      L ${leftBase} ${bottomBase}`;
  }

  // LEFT — bottom to top
  if (left === 0) {
    d += ` L ${leftBase} ${topBase}`;
  } else {
    const x = left === 1 ? outerLeft : innerLeft;
    d += `
      L ${leftBase} 72
      C ${leftBase} 70, ${x} 70, ${x} 60
      C ${x} 50, ${leftBase} 50, ${leftBase} 48
      L ${leftBase} ${topBase}`;
  }

  return d + ' Z';
}

/*
  Uses an SVG <pattern> filled into the jigsaw path instead of clipping a
  rectangular image. This makes the transparent tabs/blanks render reliably
  in Safari/iPadOS as well as Chrome/Firefox/desktop browsers.
*/
function pieceSvgMarkup(piece, uniqueId) {
  const size = puzzleState.size;
  const imageStep = 90;
  const fullImageSize = imageStep * size;

  // Each piece image is shifted so its own cell lines up inside its silhouette.
  const imageX = 15 - (piece.col * imageStep);
  const imageY = 15 - (piece.row * imageStep);

  const path = piecePath(piece.edges);

  return `
    <svg viewBox="0 0 120 120" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <pattern id="${uniqueId}" patternUnits="userSpaceOnUse"
                 x="${imageX}" y="${imageY}"
                 width="${fullImageSize}" height="${fullImageSize}">
          <image href="${puzzleState.species.image}"
                 x="0" y="0"
                 width="${fullImageSize}" height="${fullImageSize}"
                 preserveAspectRatio="xMidYMid slice"></image>
        </pattern>
      </defs>

      <path d="${path}"
            fill="url(#${uniqueId})"
            class="piece-fill"></path>

      <path d="${path}"
            class="piece-outline"></path>
    </svg>
  `;
}

function createPieceElement(piece, context = 'tray') {
  const el = document.createElement('div');
  el.className = `jigsaw-piece ${context === 'board' ? 'board-piece' : 'tray-piece'}`;
  el.dataset.id = piece.id;

  const uid = `pat-${piece.id}-${context}-${Math.random().toString(36).slice(2)}`;
  el.innerHTML = pieceSvgMarkup(piece, uid);

  if (context === 'tray') {
    if (selectedPieceId === piece.id) {
      el.classList.add('selected');
    }

    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', `Puzzle piece ${piece.correctIndex + 1}`);

    el.addEventListener('pointerdown', beginPieceDrag);

    el.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        selectedPieceId = piece.id;
        renderPuzzle();
      }
    });
  }

  return el;
}

function getVisiblePieces() {
  if (!puzzleState) return [];

  return puzzleState.pieces.filter(piece => {
    if (piece.placed) return false;
    if (puzzleState.filterMode === 'edges') return piece.isEdge;
    return true;
  });
}

function updatePieceCounter() {
  const total = puzzleState.pieces.length;
  const placed = puzzleState.pieces.filter(piece => piece.placed).length;
  pieceCounterChip.textContent = `${placed} / ${total} placed`;
}

function renderPuzzle() {
  if (!puzzleState) return;

  updatePuzzleGeometry();
  updatePieceCounter();

  puzzleBoard.innerHTML = '';
  puzzleBoard.style.setProperty('--puzzle-px', `${puzzleState.puzzlePx}px`);
  puzzleBoard.style.setProperty('--piece-px', `${puzzleState.piecePx}px`);

  const guide = document.createElement('img');
  guide.className = 'puzzle-guide';
  guide.src = puzzleState.species.image;
  guide.alt = '';
  puzzleBoard.appendChild(guide);

  puzzleState.pieces
    .filter(piece => piece.placed)
    .forEach(piece => {
      const el = createPieceElement(piece, 'board');
      el.style.width = `${puzzleState.piecePx}px`;
      el.style.height = `${puzzleState.piecePx}px`;
      el.style.left = `${puzzleState.originX + piece.col * puzzleState.stepPx}px`;
      el.style.top = `${puzzleState.originY + piece.row * puzzleState.stepPx}px`;
      puzzleBoard.appendChild(el);
    });

  trayPieces.innerHTML = '';

  getVisiblePieces().forEach(piece => {
    const el = createPieceElement(piece, 'tray');
    trayPieces.appendChild(el);
  });

  edgesOnlyBtn.classList.toggle('primary-btn', puzzleState.filterMode === 'edges');
  edgesOnlyBtn.classList.toggle('secondary-btn', puzzleState.filterMode !== 'edges');
  allPiecesBtn.classList.toggle('primary-btn', puzzleState.filterMode === 'all');
  allPiecesBtn.classList.toggle('secondary-btn', puzzleState.filterMode !== 'all');
}

function beginPieceDrag(event) {
  if (!puzzleState) return;

  // Ignore non-primary mouse buttons.
  if (event.pointerType === 'mouse' && event.button !== 0) return;

  const sourceEl = event.currentTarget;
  const pieceId = sourceEl.dataset.id;
  const piece = puzzleState.pieces.find(p => p.id === pieceId);

  if (!piece || piece.placed) return;

  event.preventDefault();

  dragState.active = true;
  dragState.pieceId = pieceId;
  dragState.pointerId = event.pointerId;
  dragState.sourceEl = sourceEl;
  dragState.startX = event.clientX;
  dragState.startY = event.clientY;
  dragState.moved = false;

  selectedPieceId = pieceId;
  sourceEl.classList.add('drag-source');

  try {
    sourceEl.setPointerCapture(event.pointerId);
  } catch (error) {}

  sourceEl.addEventListener('pointermove', movePieceDrag);
  sourceEl.addEventListener('pointerup', endPieceDrag);
  sourceEl.addEventListener('pointercancel', cancelPieceDrag);
}

function movePieceDrag(event) {
  if (!dragState.active || event.pointerId !== dragState.pointerId) return;

  const distance = Math.hypot(
    event.clientX - dragState.startX,
    event.clientY - dragState.startY
  );

  if (!dragState.moved && distance < 5) return;

  if (!dragState.moved) {
    dragState.moved = true;
    createDragGhost();
  }

  event.preventDefault();
  positionDragGhost(event.clientX, event.clientY);
  updateSnapPreview(event.clientX, event.clientY);
}

function createDragGhost() {
  const piece = puzzleState.pieces.find(p => p.id === dragState.pieceId);
  if (!piece) return;

  const ghost = createPieceElement(piece, 'ghost');
  ghost.classList.add('drag-ghost');

  const ghostSize = Math.min(150, puzzleState.piecePx);
  ghost.style.width = `${ghostSize}px`;
  ghost.style.height = `${ghostSize}px`;

  document.body.appendChild(ghost);
  dragState.ghostEl = ghost;
}

function positionDragGhost(x, y) {
  if (!dragState.ghostEl) return;

  dragState.ghostEl.style.left = `${x}px`;
  dragState.ghostEl.style.top = `${y}px`;
}

function getTargetCenter(piece) {
  const rect = puzzleBoard.getBoundingClientRect();

  return {
    x: rect.left + puzzleState.originX +
       piece.col * puzzleState.stepPx + puzzleState.piecePx / 2,
    y: rect.top + puzzleState.originY +
       piece.row * puzzleState.stepPx + puzzleState.piecePx / 2
  };
}

function updateSnapPreview(pointerX, pointerY) {
  puzzleBoard.classList.remove('snap-ready');

  const piece = puzzleState.pieces.find(p => p.id === dragState.pieceId);
  if (!piece) return;

  const boardRect = puzzleBoard.getBoundingClientRect();

  const overBoard =
    pointerX >= boardRect.left &&
    pointerX <= boardRect.right &&
    pointerY >= boardRect.top &&
    pointerY <= boardRect.bottom;

  if (!overBoard) return;

  const target = getTargetCenter(piece);
  const distance = Math.hypot(pointerX - target.x, pointerY - target.y);
  const half = puzzleState.piecePx * 0.62;

  const insideTargetBox =
    pointerX >= target.x - half &&
    pointerX <= target.x + half &&
    pointerY >= target.y - half &&
    pointerY <= target.y + half;

  if (distance <= puzzleState.snapDistance || insideTargetBox) {
    puzzleBoard.classList.add('snap-ready');
  }
}

function cleanupDrag() {
  if (dragState.sourceEl) {
    dragState.sourceEl.classList.remove('drag-source');
    dragState.sourceEl.removeEventListener('pointermove', movePieceDrag);
    dragState.sourceEl.removeEventListener('pointerup', endPieceDrag);
    dragState.sourceEl.removeEventListener('pointercancel', cancelPieceDrag);
  }

  dragState.ghostEl?.remove();
  puzzleBoard.classList.remove('snap-ready');

  dragState = {
    active: false,
    pieceId: null,
    pointerId: null,
    sourceEl: null,
    ghostEl: null,
    startX: 0,
    startY: 0,
    moved: false
  };
}

function cancelPieceDrag() {
  cleanupDrag();
}

function endPieceDrag(event) {
  if (!dragState.active || event.pointerId !== dragState.pointerId) return;

  const pieceId = dragState.pieceId;
  const moved = dragState.moved;
  const piece = puzzleState.pieces.find(p => p.id === pieceId);

  if (!piece) {
    cleanupDrag();
    return;
  }

  // A simple tap selects the piece, useful with keyboard/touch accessibility.
  if (!moved) {
    selectedPieceId = pieceId;
    cleanupDrag();
    renderPuzzle();
    return;
  }

  const boardRect = puzzleBoard.getBoundingClientRect();

  const overBoard =
    event.clientX >= boardRect.left &&
    event.clientX <= boardRect.right &&
    event.clientY >= boardRect.top &&
    event.clientY <= boardRect.bottom;

  let canSnap = false;

  if (overBoard) {
    const target = getTargetCenter(piece);
    const distance = Math.hypot(
      event.clientX - target.x,
      event.clientY - target.y
    );

    // On touch screens the finger hides part of the piece, so allow either
    // a generous center-distance snap OR a drop anywhere over the expanded
    // correct-piece footprint.
    const half = puzzleState.piecePx * 0.62;
    const insideTargetBox =
      event.clientX >= target.x - half &&
      event.clientX <= target.x + half &&
      event.clientY >= target.y - half &&
      event.clientY <= target.y + half;

    canSnap = distance <= puzzleState.snapDistance || insideTargetBox;
  }

  cleanupDrag();

  if (canSnap) {
    placePiece(piece);
  } else {
    selectedPieceId = null;
    renderPuzzle();
    showToast(
      overBoard
        ? 'Close — move it nearer its matching position.'
        : 'Drop the piece onto the puzzle board.'
    );
  }
}

function placePiece(piece) {
  if (!piece || piece.placed) return;

  piece.placed = true;
  selectedPieceId = null;

  checkBorderComplete();

  if (puzzleState.pieces.every(p => p.placed)) {
    renderPuzzle();
    setTimeout(finishPuzzle, 300);
  } else {
    renderPuzzle();
    showToast('Click! Nice fit.');
  }
}

function checkBorderComplete() {
  if (puzzleState.borderPromptShown) return;

  const edgesDone = puzzleState.pieces
    .filter(piece => piece.isEdge)
    .every(piece => piece.placed);

  if (edgesDone) {
    puzzleState.borderPromptShown = true;
    puzzleState.filterMode = 'all';
    showToast('Border complete! The center pieces are now in the Tackle Tray.');
  }
}

function finishPuzzle() {
  const id = puzzleState.species.id;

  if (!cooler[id]) {
    cooler[id] = {
      firstCaughtAt: new Date().toISOString(),
      catches: 0
    };
  }

  cooler[id].catches += 1;
  cooler[id].lastWater = currentWater?.name || puzzleState.species.water;

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
  selectedPieceId = null;
  renderPuzzle();
});

allPiecesBtn.addEventListener('click', () => {
  if (!puzzleState) return;

  puzzleState.filterMode = 'all';
  selectedPieceId = null;
  renderPuzzle();
});

spreadPiecesBtn.addEventListener('click', () => {
  if (!puzzleState) return;

  const placed = puzzleState.pieces.filter(piece => piece.placed);
  const loose = puzzleState.pieces.filter(piece => !piece.placed);

  puzzleState.pieces = [...placed, ...shuffled(loose)];
  selectedPieceId = null;

  renderPuzzle();
  showToast('Loose pieces have been spread through the Tackle Tray.');
});

fishAgainBtn.addEventListener('click', () => {
  showScreen('waters');
});

openCoolerBtn.addEventListener('click', () => {
  renderCooler();
  showScreen('cooler');
});

function renderCooler() {
  updateCoolerChip();
  coolerGrid.innerHTML = '';

  Object.keys(speciesData).forEach(id => {
    const fish = speciesData[id];
    const caught = !!cooler[id];
    const card = document.createElement('article');

    card.className = `cooler-card ${caught ? '' : 'locked'}`;

    if (caught) {
      const meta = cooler[id];
      const discoveredDate = new Date(meta.firstCaughtAt);

      card.innerHTML = `
        <img src="${fish.image}" alt="${fish.commonName}" />
        <div class="cooler-body">
          <h3>${fish.commonName}</h3>
          <p class="muted"><em>${fish.scientificName}</em></p>
          <p>${fish.description}</p>
          <p><strong>Catches:</strong> ${meta.catches}</p>
          <p><strong>First caught:</strong> ${discoveredDate.toLocaleDateString()}</p>
          <p><strong>Last water:</strong> ${meta.lastWater || fish.water}</p>
        </div>
      `;
    } else {
      card.innerHTML = `
        <div class="locked-art">🎣</div>
        <div class="cooler-body">
          <h3>Unknown Species</h3>
          <p class="muted">Keep solving to discover this entry for your Fish Cooler.</p>
          <p><strong>Likely water:</strong> ${fish.water}</p>
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

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}

wireGlobalButtons();
renderWaters();
renderCooler();
updateCoolerChip();
showScreen('home');
