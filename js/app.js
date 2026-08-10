
const screens = {
  home: document.getElementById('screen-home'),
  how: document.getElementById('screen-how'),
  waters: document.getElementById('screen-waters'),
  fishing: document.getElementById('screen-fishing'),
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

let fishingState = {
  reeling: false,
  clicks: 0,
  requiredClicks: 14,
  biteTimer: null,
  escapeTimer: null
};

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
const waterTitle = document.getElementById('waterTitle');
const waterTagline = document.getElementById('waterTagline');
const hotspotsWrap = document.getElementById('hotspots');
const fishingStatus = document.getElementById('fishingStatus');
const reelPanel = document.getElementById('reelPanel');
const reelFill = document.getElementById('reelFill');
const reelBtn = document.getElementById('reelBtn');
const backToWatersBtn = document.getElementById('backToWatersBtn');

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
      <div class="water-hotspots"><strong>Hotspots:</strong> ${water.hotspots.join(', ')}</div>
      <button class="primary-btn">Fish Here</button>
    `;
    card.querySelector('button').addEventListener('click', () => startFishing(water.id));
    watersGrid.appendChild(card);
  });
}

function startFishing(waterId) {
  currentWater = waters.find(w => w.id === waterId);
  waterTitle.textContent = currentWater.name;
  waterTagline.textContent = currentWater.tagline;
  fishingStatus.textContent = 'Pick a hotspot to cast your line.';
  reelPanel.classList.add('hidden');
  reelFill.style.width = '0%';
  hotspotsWrap.innerHTML = '';

  currentWater.hotspots.forEach(spot => {
    const btn = document.createElement('button');
    btn.className = 'hotspot-btn';
    btn.textContent = spot;
    btn.addEventListener('click', () => castLine(spot));
    hotspotsWrap.appendChild(btn);
  });

  showScreen('fishing');
}

function clearFishingTimers() {
  clearTimeout(fishingState.biteTimer);
  clearTimeout(fishingState.escapeTimer);
}

function castLine(spot) {
  clearFishingTimers();
  fishingState.reeling = false;
  fishingState.clicks = 0;
  reelFill.style.width = '0%';

  document.querySelectorAll('.hotspot-btn').forEach(btn => btn.disabled = true);
  fishingStatus.textContent = `Casting toward ${spot}... wait for the line to tighten.`;

  fishingState.biteTimer = setTimeout(() => {
    fishingStatus.textContent = `BITE at ${spot}! Reel quickly before it gets away!`;
    reelPanel.classList.remove('hidden');
    fishingState.reeling = true;
    fishingState.requiredClicks = 11 + Math.floor(Math.random() * 7);

    fishingState.escapeTimer = setTimeout(() => {
      if (fishingState.reeling) {
        fishingState.reeling = false;
        reelPanel.classList.add('hidden');
        fishingStatus.textContent = 'The fish got away. Pick another hotspot and cast again.';
        document.querySelectorAll('.hotspot-btn').forEach(btn => btn.disabled = false);
        showToast('That one slipped the hook.');
      }
    }, 9000);
  }, 1200);
}

reelBtn.addEventListener('click', () => {
  if (!fishingState.reeling) return;
  fishingState.clicks += 1;
  const pct = Math.min(100, (fishingState.clicks / fishingState.requiredClicks) * 100);
  reelFill.style.width = `${pct}%`;

  if (pct >= 100) {
    fishingState.reeling = false;
    clearFishingTimers();
    reelPanel.classList.add('hidden');
    fishingStatus.textContent = 'You landed something! Your catch is becoming a jigsaw...';

    setTimeout(() => {
      const speciesId = currentWater.species[Math.floor(Math.random() * currentWater.species.length)];
      currentSpecies = speciesData[speciesId];
      startPuzzle(currentSpecies);
    }, 900);
  }
});

backToWatersBtn.addEventListener('click', () => showScreen('waters'));

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
  Edge codes:
  0 = outside border / flat
  1 = outward tab
 -1 = inward blank

  Shared edges are generated as exact opposites so adjoining pieces fit.
*/
function generatePieceEdges(size) {
  const rightEdges = Array.from({ length: size }, () => Array(size).fill(0));
  const bottomEdges = Array.from({ length: size }, () => Array(size).fill(0));

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (col < size - 1) rightEdges[row][col] = Math.random() < 0.5 ? 1 : -1;
      if (row < size - 1) bottomEdges[row][col] = Math.random() < 0.5 ? 1 : -1;
    }
  }

  const result = [];
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      result.push({
        top: row === 0 ? 0 : -bottomEdges[row - 1][col],
        right: col === size - 1 ? 0 : rightEdges[row][col],
        bottom: row === size - 1 ? 0 : bottomEdges[row][col],
        left: col === 0 ? 0 : -rightEdges[row][col - 1]
      });
    }
  }
  return result;
}

function startPuzzle(species) {
  selectedPieceId = null;

  // Starter difficulty remains 3x3, but pieces are now true interlocking shapes.
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
    piecePx: 110,
    stepPx: 88,
    puzzlePx: 286,
    snapDistance: 46
  };

  showScreen('puzzle');
  requestAnimationFrame(renderPuzzle);
  showToast('Edges Only is on. Drag the border pieces into place.');
}

function updatePuzzleGeometry() {
  if (!puzzleState) return;
  const boardRect = puzzleBoard.getBoundingClientRect();
  const usable = Math.max(240, Math.min(boardRect.width || 560, boardRect.height || 560));
  const size = puzzleState.size;

  // Each 100x100 piece advances 80 units so tabs overlap neighbors.
  const piecePx = usable / (0.8 * size + 0.2);
  const stepPx = piecePx * 0.8;
  const puzzlePx = stepPx * (size - 1) + piecePx;

  puzzleState.piecePx = piecePx;
  puzzleState.stepPx = stepPx;
  puzzleState.puzzlePx = puzzlePx;
  puzzleState.snapDistance = Math.max(28, piecePx * 0.38);
}

function piecePath(edges) {
  const { top, right, bottom, left } = edges;
  const out = 0;
  const flat = 10;
  const inner = 20;

  const tY = type => type === 1 ? out : type === -1 ? inner : flat;
  const rX = type => type === 1 ? 100 : type === -1 ? 80 : 90;
  const bY = type => type === 1 ? 100 : type === -1 ? 80 : 90;
  const lX = type => type === 1 ? out : type === -1 ? inner : flat;

  let d = `M 10 10 `;

  // TOP: left -> right
  if (top === 0) {
    d += `L 90 10 `;
  } else {
    const y = tY(top);
    d += `L 38 10
          C 42 10, 42 ${y}, 50 ${y}
          C 58 ${y}, 58 10, 62 10
          L 90 10 `;
  }

  // RIGHT: top -> bottom
  if (right === 0) {
    d += `L 90 90 `;
  } else {
    const x = rX(right);
    d += `L 90 38
          C 90 42, ${x} 42, ${x} 50
          C ${x} 58, 90 58, 90 62
          L 90 90 `;
  }

  // BOTTOM: right -> left
  if (bottom === 0) {
    d += `L 10 90 `;
  } else {
    const y = bY(bottom);
    d += `L 62 90
          C 58 90, 58 ${y}, 50 ${y}
          C 42 ${y}, 42 90, 38 90
          L 10 90 `;
  }

  // LEFT: bottom -> top
  if (left === 0) {
    d += `L 10 10 `;
  } else {
    const x = lX(left);
    d += `L 10 62
          C 10 58, ${x} 58, ${x} 50
          C ${x} 42, 10 42, 10 38
          L 10 10 `;
  }

  return d + 'Z';
}

function pieceSvgMarkup(piece, uniqueId) {
  const size = puzzleState.size;
  const stepUnits = 80;
  const fullUnits = 80 * (size - 1) + 100;
  const x = -(piece.col * stepUnits);
  const y = -(piece.row * stepUnits);

  return `
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <clipPath id="${uniqueId}">
          <path d="${piecePath(piece.edges)}"></path>
        </clipPath>
      </defs>
      <image
        href="${puzzleState.species.image}"
        x="${x}" y="${y}"
        width="${fullUnits}" height="${fullUnits}"
        preserveAspectRatio="xMidYMid slice"
        clip-path="url(#${uniqueId})">
      </image>
      <path class="piece-outline" d="${piecePath(piece.edges)}"></path>
    </svg>
  `;
}

function createPieceElement(piece, context = 'tray') {
  const el = document.createElement('div');
  el.className = `jigsaw-piece ${context === 'board' ? 'board-piece' : 'tray-piece'}`;
  el.dataset.id = piece.id;

  const uid = `clip-${piece.id}-${context}-${Math.random().toString(36).slice(2)}`;
  el.innerHTML = pieceSvgMarkup(piece, uid);

  if (context === 'tray') {
    if (selectedPieceId === piece.id) el.classList.add('selected');
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
  const placed = puzzleState.pieces.filter(p => p.placed).length;
  pieceCounterChip.textContent = `${placed} / ${total} placed`;
}

function renderPuzzle() {
  if (!puzzleState) return;

  updatePuzzleGeometry();
  updatePieceCounter();

  puzzleBoard.innerHTML = '';
  puzzleBoard.style.setProperty('--puzzle-px', `${puzzleState.puzzlePx}px`);
  puzzleBoard.style.setProperty('--piece-px', `${puzzleState.piecePx}px`);

  // Very faint completed-image guide under the board. It helps without solving it for the player.
  const guide = document.createElement('img');
  guide.className = 'puzzle-guide';
  guide.src = puzzleState.species.image;
  guide.alt = '';
  puzzleBoard.appendChild(guide);

  puzzleState.pieces.filter(p => p.placed).forEach(piece => {
    const el = createPieceElement(piece, 'board');
    const left = piece.col * puzzleState.stepPx;
    const top = piece.row * puzzleState.stepPx;
    el.style.width = `${puzzleState.piecePx}px`;
    el.style.height = `${puzzleState.piecePx}px`;
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
    puzzleBoard.appendChild(el);
  });

  // Optional tap-target markers are invisible until a piece is selected.
  if (selectedPieceId) {
    const selected = puzzleState.pieces.find(p => p.id === selectedPieceId && !p.placed);
    if (selected) {
      const target = document.createElement('button');
      target.className = 'tap-snap-target';
      target.type = 'button';
      target.style.width = `${puzzleState.piecePx}px`;
      target.style.height = `${puzzleState.piecePx}px`;
      target.style.left = `${selected.col * puzzleState.stepPx}px`;
      target.style.top = `${selected.row * puzzleState.stepPx}px`;
      target.setAttribute('aria-label', 'Place selected piece here');
      target.addEventListener('click', () => placePiece(selected));
      puzzleBoard.appendChild(target);
    }
  }

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

  const sourceEl = event.currentTarget;
  const pieceId = sourceEl.dataset.id;
  const piece = puzzleState.pieces.find(p => p.id === pieceId);
  if (!piece || piece.placed) return;

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
  } catch (e) {}

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

  if (!dragState.moved && distance < 6) return;

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
  ghost.style.width = `${Math.min(130, puzzleState.piecePx)}px`;
  ghost.style.height = `${Math.min(130, puzzleState.piecePx)}px`;
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
    x: rect.left + piece.col * puzzleState.stepPx + puzzleState.piecePx / 2,
    y: rect.top + piece.row * puzzleState.stepPx + puzzleState.piecePx / 2
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
  if (distance <= puzzleState.snapDistance) {
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
    const distance = Math.hypot(event.clientX - target.x, event.clientY - target.y);
    canSnap = distance <= puzzleState.snapDistance;
  }

  cleanupDrag();

  if (canSnap) {
    placePiece(piece);
  } else {
    selectedPieceId = pieceId;
    renderPuzzle();
    showToast(overBoard ? 'Close — move it nearer its matching shape.' : 'Drop the piece onto the puzzle board.');
  }
}

function placePiece(piece) {
  if (!piece || piece.placed) return;

  piece.placed = true;
  selectedPieceId = null;
  checkBorderComplete();

  if (puzzleState.pieces.every(p => p.placed)) {
    renderPuzzle();
    setTimeout(finishPuzzle, 280);
  } else {
    renderPuzzle();
    showToast('Click! Nice fit.');
  }
}

function checkBorderComplete() {
  if (puzzleState.borderPromptShown) return;
  const edgesDone = puzzleState.pieces.filter(p => p.isEdge).every(p => p.placed);

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
  // "Spread" only rearranges the visible tray order; it never moves board pieces.
  const placed = puzzleState.pieces.filter(p => p.placed);
  const loose = puzzleState.pieces.filter(p => !p.placed);
  puzzleState.pieces = [...placed, ...shuffled(loose)];
  selectedPieceId = null;
  renderPuzzle();
  showToast('Loose pieces have been spread through the Tackle Tray.');
});

fishAgainBtn.addEventListener('click', () => {
  if (currentWater) startFishing(currentWater.id);
  else showScreen('waters');
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
          <p class="muted">Keep fishing to discover this entry for your Fish Cooler.</p>
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
