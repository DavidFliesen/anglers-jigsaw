
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
      isEdge: isEdgeIndex(i, size),
      edges: edges[i],

      // Real jigsaw state:
      onBoard: false,
      boardX: 0,
      boardY: 0,
      clusterId: null
    });
  }

  puzzleState = {
    species,
    size,
    pieces: shuffled(pieces),
    filterMode: 'edges',
    borderPromptShown: false,
    piecePx: 130,
    stepPx: 97.5,
    puzzlePx: 325,
    snapDistance: 46,
    nextClusterId: 1
  };

  showScreen('puzzle');
  showToast('Edges Only is on. Put the border pieces out first.');
}

function updatePuzzleGeometry() {
  if (!puzzleState) return;

  const boardRect = puzzleBoard.getBoundingClientRect();
  const usable = Math.max(
    260,
    Math.min(boardRect.width || 560, boardRect.height || 560)
  );

  const oldPiecePx = puzzleState.piecePx || 0;

  // Piece SVG is 120×120. Neighboring cell bodies advance 90 SVG units,
  // so the visual overlap is 75% of a full piece.
  const piecePx = Math.min(172, Math.max(108, usable * 0.29));
  const stepPx = piecePx * 0.75;

  puzzleState.piecePx = piecePx;
  puzzleState.stepPx = stepPx;
  puzzleState.puzzlePx = stepPx * (puzzleState.size - 1) + piecePx;
  puzzleState.snapDistance = Math.max(38, piecePx * 0.34);

  // Keep loose board arrangements proportional if the device rotates/resizes.
  if (oldPiecePx > 0 && Math.abs(oldPiecePx - piecePx) > 0.5) {
    const scale = piecePx / oldPiecePx;
    puzzleState.pieces.forEach(piece => {
      if (piece.onBoard) {
        piece.boardX *= scale;
        piece.boardY *= scale;
      }
    });
  }
}

/*
  Traditional jigsaw silhouette.
  Normal cell body is 90×90 inside a 120×120 box, leaving 15 units around
  the body for outward tabs.
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

  if (top === 0) {
    d += ` L ${rightBase} ${topBase}`;
  } else {
    const y = top === 1 ? outerTop : innerTop;
    d += `
      L 46 ${topBase}
      C 50 ${topBase}, 49 ${y}, 60 ${y}
      C 71 ${y}, 70 ${topBase}, 74 ${topBase}
      L ${rightBase} ${topBase}`;
  }

  if (right === 0) {
    d += ` L ${rightBase} ${bottomBase}`;
  } else {
    const x = right === 1 ? outerRight : innerRight;
    d += `
      L ${rightBase} 46
      C ${rightBase} 50, ${x} 49, ${x} 60
      C ${x} 71, ${rightBase} 70, ${rightBase} 74
      L ${rightBase} ${bottomBase}`;
  }

  if (bottom === 0) {
    d += ` L ${leftBase} ${bottomBase}`;
  } else {
    const y = bottom === 1 ? outerBottom : innerBottom;
    d += `
      L 74 ${bottomBase}
      C 70 ${bottomBase}, 71 ${y}, 60 ${y}
      C 49 ${y}, 50 ${bottomBase}, 46 ${bottomBase}
      L ${leftBase} ${bottomBase}`;
  }

  if (left === 0) {
    d += ` L ${leftBase} ${topBase}`;
  } else {
    const x = left === 1 ? outerLeft : innerLeft;
    d += `
      L ${leftBase} 74
      C ${leftBase} 70, ${x} 71, ${x} 60
      C ${x} 49, ${leftBase} 50, ${leftBase} 46
      L ${leftBase} ${topBase}`;
  }

  return d + ' Z';
}

/*
  Paint the same source image across every piece in one common coordinate
  system. When two pieces snap together, their image portions line up too.
*/
function pieceSvgMarkup(piece, uniqueId) {
  const size = puzzleState.size;
  const imageStep = 90;
  const fullImageSize = imageStep * size;
  const path = piecePath(piece.edges);

  const imageX = 15 - piece.col * imageStep;
  const imageY = 15 - piece.row * imageStep;

  return `
    <svg viewBox="0 0 120 120" preserveAspectRatio="none" aria-hidden="true">
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
          width="${fullImageSize}"
          height="${fullImageSize}"
          preserveAspectRatio="none">
        </image>
      </g>

      <path d="${path}" class="piece-outline"></path>
    </svg>
  `;
}

function createPieceElement(piece, context = 'tray') {
  const el = document.createElement('div');
  el.className = `jigsaw-piece ${context === 'board' ? 'board-piece' : 'tray-piece'}`;
  el.dataset.id = piece.id;

  if (piece.clusterId != null) {
    el.dataset.cluster = String(piece.clusterId);
  }

  const uid = `clip-${piece.id}-${context}-${Math.random().toString(36).slice(2)}`;
  el.innerHTML = pieceSvgMarkup(piece, uid);

  if (context === 'tray' || context === 'board') {
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', `Puzzle piece ${piece.correctIndex + 1}`);
    el.addEventListener('pointerdown', beginPieceDrag);
  }

  return el;
}

function getVisiblePieces() {
  if (!puzzleState) return [];

  return puzzleState.pieces.filter(piece => {
    if (piece.onBoard) return false;
    if (puzzleState.filterMode === 'edges') return piece.isEdge;
    return true;
  });
}

function updatePieceCounter() {
  const total = puzzleState.pieces.length;
  const onBoard = puzzleState.pieces.filter(piece => piece.onBoard).length;

  if (isPuzzleComplete()) {
    pieceCounterChip.textContent = `${total} / ${total} connected`;
  } else {
    pieceCounterChip.textContent = `${onBoard} / ${total} on board`;
  }
}

function renderPuzzle() {
  if (!puzzleState) return;

  updatePuzzleGeometry();
  updatePieceCounter();

  puzzleBoard.innerHTML = '';
  puzzleBoard.classList.add('free-jigsaw-board');

  puzzleState.pieces
    .filter(piece => piece.onBoard)
    .forEach(piece => {
      const el = createPieceElement(piece, 'board');

      el.style.width = `${puzzleState.piecePx}px`;
      el.style.height = `${puzzleState.piecePx}px`;
      el.style.left = `${piece.boardX}px`;
      el.style.top = `${piece.boardY}px`;

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

function getClusterPieces(clusterId) {
  return puzzleState.pieces.filter(
    piece => piece.onBoard && piece.clusterId === clusterId
  );
}

function beginPieceDrag(event) {
  if (!puzzleState) return;
  if (event.pointerType === 'mouse' && event.button !== 0) return;

  event.preventDefault();

  const sourceEl = event.currentTarget;
  const pieceId = sourceEl.dataset.id;
  const piece = puzzleState.pieces.find(p => p.id === pieceId);
  if (!piece) return;

  const rect = sourceEl.getBoundingClientRect();

  dragState.active = true;
  dragState.pieceId = pieceId;
  dragState.pointerId = event.pointerId;
  dragState.sourceEl = sourceEl;
  dragState.startX = event.clientX;
  dragState.startY = event.clientY;
  dragState.moved = false;

  // Preserve where the finger/mouse grabbed the piece.
  dragState.grabFracX = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
  dragState.grabFracY = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));

  if (piece.onBoard) {
    dragState.fromTray = false;
    dragState.clusterId = piece.clusterId;
    dragState.anchorBoardX = piece.boardX;
    dragState.anchorBoardY = piece.boardY;

    const clusterPieces = getClusterPieces(piece.clusterId);
    dragState.members = clusterPieces.map(member => ({
      id: member.id,
      relX: member.boardX - piece.boardX,
      relY: member.boardY - piece.boardY
    }));

    document.querySelectorAll(
      `.board-piece[data-cluster="${piece.clusterId}"]`
    ).forEach(node => node.classList.add('drag-source'));
  } else {
    dragState.fromTray = true;
    dragState.clusterId = null;
    dragState.anchorBoardX = 0;
    dragState.anchorBoardY = 0;
    dragState.members = [{ id: piece.id, relX: 0, relY: 0 }];
    sourceEl.classList.add('drag-source');
  }

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
    createDragGhosts();
  }

  event.preventDefault();
  positionDragGhosts(event.clientX, event.clientY);
  updateSnapPreview();
}

function createDragGhosts() {
  dragState.ghostEls = [];

  dragState.members.forEach(memberInfo => {
    const piece = puzzleState.pieces.find(p => p.id === memberInfo.id);
    if (!piece) return;

    const ghost = createPieceElement(piece, 'ghost');
    ghost.classList.add('drag-ghost', 'cluster-ghost');

    ghost.style.width = `${puzzleState.piecePx}px`;
    ghost.style.height = `${puzzleState.piecePx}px`;

    document.body.appendChild(ghost);

    dragState.ghostEls.push({
      el: ghost,
      relX: memberInfo.relX,
      relY: memberInfo.relY
    });
  });
}

function positionDragGhosts(pointerX, pointerY) {
  const anchorLeft =
    pointerX - dragState.grabFracX * puzzleState.piecePx;
  const anchorTop =
    pointerY - dragState.grabFracY * puzzleState.piecePx;

  (dragState.ghostEls || []).forEach(ghostInfo => {
    ghostInfo.el.style.left = `${anchorLeft + ghostInfo.relX}px`;
    ghostInfo.el.style.top = `${anchorTop + ghostInfo.relY}px`;
  });
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
  puzzleBoard.classList.remove('snap-ready');

  dragState = {
    active: false,
    pieceId: null,
    pointerId: null,
    sourceEl: null,
    ghostEls: [],
    startX: 0,
    startY: 0,
    moved: false
  };
}

function cancelPieceDrag() {
  cleanupDrag();
}

function clampClusterToBoard(clusterPieces) {
  const boardRect = puzzleBoard.getBoundingClientRect();
  const piecePx = puzzleState.piecePx;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  clusterPieces.forEach(piece => {
    minX = Math.min(minX, piece.boardX);
    minY = Math.min(minY, piece.boardY);
    maxX = Math.max(maxX, piece.boardX + piecePx);
    maxY = Math.max(maxY, piece.boardY + piecePx);
  });

  let shiftX = 0;
  let shiftY = 0;

  if (minX < 0) shiftX = -minX;
  if (minY < 0) shiftY = -minY;
  if (maxX > boardRect.width) shiftX = boardRect.width - maxX;
  if (maxY > boardRect.height) shiftY = boardRect.height - maxY;

  if (shiftX || shiftY) {
    clusterPieces.forEach(piece => {
      piece.boardX += shiftX;
      piece.boardY += shiftY;
    });
  }
}

function endPieceDrag(event) {
  if (!dragState.active || event.pointerId !== dragState.pointerId) return;

  const piece = puzzleState.pieces.find(p => p.id === dragState.pieceId);
  if (!piece) {
    cleanupDrag();
    return;
  }

  const boardRect = puzzleBoard.getBoundingClientRect();

  const overBoard =
    event.clientX >= boardRect.left &&
    event.clientX <= boardRect.right &&
    event.clientY >= boardRect.top &&
    event.clientY <= boardRect.bottom;

  if (!dragState.moved) {
    cleanupDrag();
    return;
  }

  if (!overBoard) {
    cleanupDrag();
    renderPuzzle();
    showToast('Keep the puzzle pieces on the board.');
    return;
  }

  const anchorX =
    event.clientX - boardRect.left -
    dragState.grabFracX * puzzleState.piecePx;

  const anchorY =
    event.clientY - boardRect.top -
    dragState.grabFracY * puzzleState.piecePx;

  if (dragState.fromTray) {
    piece.onBoard = true;
    piece.clusterId = puzzleState.nextClusterId++;
    piece.boardX = anchorX;
    piece.boardY = anchorY;
  } else {
    const movingPieces = getClusterPieces(dragState.clusterId);
    const deltaX = anchorX - dragState.anchorBoardX;
    const deltaY = anchorY - dragState.anchorBoardY;

    movingPieces.forEach(member => {
      member.boardX += deltaX;
      member.boardY += deltaY;
    });
  }

  const movingClusterId = piece.clusterId;
  clampClusterToBoard(getClusterPieces(movingClusterId));

  cleanupDrag();

  // Unlike the old version, the piece is allowed to stay anywhere on the
  // table. It only snaps when a real matching neighbor is close.
  snapClusterToNeighbors(movingClusterId);
  checkBorderComplete();
  renderPuzzle();

  if (isPuzzleComplete()) {
    setTimeout(finishPuzzle, 320);
  }
}

function logicalNeighborIndex(piece, side) {
  const { row, col } = piece;
  const size = puzzleState.size;

  if (side === 'left' && col > 0) return row * size + (col - 1);
  if (side === 'right' && col < size - 1) return row * size + (col + 1);
  if (side === 'top' && row > 0) return (row - 1) * size + col;
  if (side === 'bottom' && row < size - 1) return (row + 1) * size + col;

  return null;
}

function desiredDeltaBetween(pieceA, pieceB) {
  return {
    x: (pieceA.col - pieceB.col) * puzzleState.stepPx,
    y: (pieceA.row - pieceB.row) * puzzleState.stepPx
  };
}

function findBestClusterSnap(clusterId) {
  const movingPieces = getClusterPieces(clusterId);
  let best = null;

  movingPieces.forEach(pieceA => {
    ['left', 'right', 'top', 'bottom'].forEach(side => {
      const neighborIndex = logicalNeighborIndex(pieceA, side);
      if (neighborIndex == null) return;

      const pieceB = puzzleState.pieces.find(
        candidate =>
          candidate.correctIndex === neighborIndex &&
          candidate.onBoard &&
          candidate.clusterId !== clusterId
      );

      if (!pieceB) return;

      const desired = desiredDeltaBetween(pieceA, pieceB);

      const errorX =
        (pieceA.boardX - pieceB.boardX) - desired.x;
      const errorY =
        (pieceA.boardY - pieceB.boardY) - desired.y;

      const distance = Math.hypot(errorX, errorY);

      if (
        distance <= puzzleState.snapDistance &&
        (!best || distance < best.distance)
      ) {
        best = {
          pieceA,
          pieceB,
          shiftX: -errorX,
          shiftY: -errorY,
          distance
        };
      }
    });
  });

  return best;
}

function mergeClusters(sourceClusterId, targetClusterId, shiftX, shiftY) {
  const sourcePieces = getClusterPieces(sourceClusterId);

  sourcePieces.forEach(piece => {
    piece.boardX += shiftX;
    piece.boardY += shiftY;
    piece.clusterId = targetClusterId;
  });

  clampClusterToBoard(getClusterPieces(targetClusterId));
}

function snapClusterToNeighbors(clusterId) {
  let activeClusterId = clusterId;
  let snappedAny = false;

  // A cluster may connect to more than one neighbor in one drop.
  for (let pass = 0; pass < puzzleState.pieces.length; pass += 1) {
    const best = findBestClusterSnap(activeClusterId);
    if (!best) break;

    const targetClusterId = best.pieceB.clusterId;

    mergeClusters(
      activeClusterId,
      targetClusterId,
      best.shiftX,
      best.shiftY
    );

    activeClusterId = targetClusterId;
    snappedAny = true;
  }

  if (snappedAny) {
    showToast('Click! Those pieces fit together.');
  }

  return activeClusterId;
}

function updateSnapPreview() {
  // During dragging we keep this subtle because snapping is based on actual
  // neighboring jigsaw pieces, not hidden fixed positions.
  puzzleBoard.classList.add('dragging-active');
}

function checkBorderComplete() {
  if (puzzleState.borderPromptShown) return;

  const edgePieces = puzzleState.pieces.filter(piece => piece.isEdge);
  const allEdgesOnBoard = edgePieces.every(piece => piece.onBoard);

  if (allEdgesOnBoard) {
    puzzleState.borderPromptShown = true;
    puzzleState.filterMode = 'all';
    showToast('All edge pieces are out. The center pieces are now in the Tackle Tray.');
  }
}

function isPuzzleComplete() {
  const allOnBoard = puzzleState.pieces.every(piece => piece.onBoard);
  if (!allOnBoard) return false;

  const clusters = new Set(
    puzzleState.pieces.map(piece => piece.clusterId)
  );

  return clusters.size === 1;
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

  const boardPieces = puzzleState.pieces.filter(piece => piece.onBoard);
  const trayPiecesState = puzzleState.pieces.filter(piece => !piece.onBoard);

  puzzleState.pieces = [...boardPieces, ...shuffled(trayPiecesState)];
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
