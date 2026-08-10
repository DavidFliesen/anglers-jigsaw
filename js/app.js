
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

/*
  Edge values:
   0 = flat outside border
   1 = outward tab
  -1 = inward blank

  Shared edges are created once, then mirrored onto the neighboring piece.
*/
function generatePieceEdges(rows, cols) {
  const horizontal = Array.from({ length: Math.max(0, rows - 1) }, () =>
    Array(cols).fill(0)
  );

  const vertical = Array.from({ length: rows }, () =>
    Array(Math.max(0, cols - 1)).fill(0)
  );

  for (let row = 0; row < rows - 1; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      horizontal[row][col] = Math.random() < 0.5 ? 1 : -1;
    }
  }

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols - 1; col += 1) {
      vertical[row][col] = Math.random() < 0.5 ? 1 : -1;
    }
  }

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
        boardX: 0,
        boardY: 0,
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
    filterMode: 'edges',
    borderPromptShown: false,
    piecePx: 100,
    stepPx: 75,
    snapDistance: 36,
    nextClusterId: 1
  };

  puzzleInfo.textContent =
    `${difficulty.label} · ${difficulty.pieces} pieces · ${difficulty.cols} × ${difficulty.rows}`;

  showScreen('puzzle');
  showToast('Edges Only is on. Start with the border.');
}

function updatePuzzleGeometry() {
  if (!puzzleState) return;

  const rect = puzzleBoard.getBoundingClientRect();
  const oldPiecePx = puzzleState.piecePx || 0;

  // Board is always 4:3. A puzzle cell advances 75% of the full SVG
  // piece size because the extra 25% is reserved for tabs.
  const widthPiece = rect.width / (0.75 * puzzleState.cols + 0.25);
  const heightPiece = rect.height / (0.75 * puzzleState.rows + 0.25);
  const piecePx = Math.min(widthPiece, heightPiece);
  const stepPx = piecePx * 0.75;

  puzzleState.piecePx = piecePx;
  puzzleState.stepPx = stepPx;

  // Touch-friendly snap distance that scales down for higher difficulties.
  puzzleState.snapDistance = Math.max(
    11,
    Math.min(44, piecePx * 0.34)
  );

  // Keep loose pieces proportionally positioned when the screen changes size.
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

function piecePath(edges) {
  const { top, right, bottom, left } = edges;

  const a = 15;
  const b = 105;

  let d = `M ${a} ${a}`;

  if (top === 0) {
    d += ` L ${b} ${a}`;
  } else {
    const y = top === 1 ? 0 : 30;
    d += `
      L 46 ${a}
      C 50 ${a}, 49 ${y}, 60 ${y}
      C 71 ${y}, 70 ${a}, 74 ${a}
      L ${b} ${a}`;
  }

  if (right === 0) {
    d += ` L ${b} ${b}`;
  } else {
    const x = right === 1 ? 120 : 90;
    d += `
      L ${b} 46
      C ${b} 50, ${x} 49, ${x} 60
      C ${x} 71, ${b} 70, ${b} 74
      L ${b} ${b}`;
  }

  if (bottom === 0) {
    d += ` L ${a} ${b}`;
  } else {
    const y = bottom === 1 ? 120 : 90;
    d += `
      L 74 ${b}
      C 70 ${b}, 71 ${y}, 60 ${y}
      C 49 ${y}, 50 ${b}, 46 ${b}
      L ${a} ${b}`;
  }

  if (left === 0) {
    d += ` L ${a} ${a}`;
  } else {
    const x = left === 1 ? 0 : 30;
    d += `
      L ${a} 74
      C ${a} 70, ${x} 71, ${x} 60
      C ${x} 49, ${a} 50, ${a} 46
      L ${a} ${a}`;
  }

  return d + ' Z';
}

/*
  Each piece shows its exact part of one common 4:3 source image.
  The square fish artwork is center-cropped into the standard 4:3 puzzle board.
*/
function pieceSvgMarkup(piece, uniqueId) {
  const imageStep = 90;
  const fullWidth = imageStep * puzzleState.cols;
  const fullHeight = imageStep * puzzleState.rows;
  const path = piecePath(piece.edges);

  const imageX = 15 - piece.col * imageStep;
  const imageY = 15 - piece.row * imageStep;

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

  if (piece.clusterId != null) {
    element.dataset.cluster = String(piece.clusterId);
  }

  const uid =
    `clip-${piece.id}-${context}-${Math.random().toString(36).slice(2)}`;

  element.innerHTML = pieceSvgMarkup(piece, uid);

  if (context === 'tray' || context === 'board') {
    element.setAttribute('role', 'button');
    element.setAttribute('tabindex', '0');
    element.setAttribute(
      'aria-label',
      `Puzzle piece ${piece.correctIndex + 1}`
    );

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
  const onBoard = puzzleState.pieces.filter(piece => piece.onBoard).length;

  if (isPuzzleComplete()) {
    pieceCounterChip.textContent = `${total} / ${total} connected`;
  } else {
    pieceCounterChip.textContent = `${onBoard} / ${total} on table`;
  }
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

  puzzleState.pieces
    .filter(piece => piece.onBoard)
    .forEach(piece => {
      const element = createPieceElement(piece, 'board');

      element.style.width = `${puzzleState.piecePx}px`;
      element.style.height = `${puzzleState.piecePx}px`;
      element.style.left = `${piece.boardX}px`;
      element.style.top = `${piece.boardY}px`;

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

function getClusterPieces(clusterId) {
  return puzzleState.pieces.filter(
    piece => piece.onBoard && piece.clusterId === clusterId
  );
}

function beginPieceDrag(event) {
  if (!puzzleState) return;
  if (event.pointerType === 'mouse' && event.button !== 0) return;

  event.preventDefault();

  const sourceElement = event.currentTarget;
  const piece = puzzleState.pieces.find(
    candidate => candidate.id === sourceElement.dataset.id
  );

  if (!piece) return;

  const rect = sourceElement.getBoundingClientRect();

  dragState.active = true;
  dragState.pieceId = piece.id;
  dragState.pointerId = event.pointerId;
  dragState.sourceEl = sourceElement;
  dragState.startX = event.clientX;
  dragState.startY = event.clientY;
  dragState.moved = false;

  dragState.grabFracX = Math.max(
    0,
    Math.min(1, (event.clientX - rect.left) / rect.width)
  );

  dragState.grabFracY = Math.max(
    0,
    Math.min(1, (event.clientY - rect.top) / rect.height)
  );

  if (piece.onBoard) {
    dragState.fromTray = false;
    dragState.clusterId = piece.clusterId;
    dragState.anchorBoardX = piece.boardX;
    dragState.anchorBoardY = piece.boardY;

    dragState.members = getClusterPieces(piece.clusterId).map(member => ({
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
    sourceElement.classList.add('drag-source');
  }

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
    createDragGhosts();
  }

  event.preventDefault();
  positionDragGhosts(event.clientX, event.clientY);
}

function createDragGhosts() {
  dragState.ghostEls = [];

  dragState.members.forEach(memberInfo => {
    const piece = puzzleState.pieces.find(
      candidate => candidate.id === memberInfo.id
    );

    if (!piece) return;

    const ghost = createPieceElement(piece, 'ghost');
    ghost.classList.add('drag-ghost');

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

  dragState.ghostEls.forEach(ghostInfo => {
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

  dragState.ghostEls.forEach(info => info.el.remove());

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

  clusterPieces.forEach(piece => {
    piece.boardX += shiftX;
    piece.boardY += shiftY;
  });
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
    cleanupDrag();
    renderPuzzle();
    showToast('Keep puzzle pieces on the puzzle table.');
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

  const activeCluster = piece.clusterId;

  clampClusterToBoard(getClusterPieces(activeCluster));
  cleanupDrag();

  snapClusterToNeighbors(activeCluster);
  checkBorderComplete();
  renderPuzzle();

  if (isPuzzleComplete()) {
    setTimeout(finishPuzzle, 300);
  }
}

function logicalNeighborIndex(piece, side) {
  const { row, col } = piece;
  const { rows, cols } = puzzleState;

  if (side === 'left' && col > 0) return row * cols + (col - 1);
  if (side === 'right' && col < cols - 1) return row * cols + (col + 1);
  if (side === 'top' && row > 0) return (row - 1) * cols + col;
  if (side === 'bottom' && row < rows - 1) return (row + 1) * cols + col;

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

      const pieceB = puzzleState.pieces.find(candidate =>
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
  let snapped = false;

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
    snapped = true;
  }

  if (snapped) {
    showToast('Click! Those pieces fit.');
  }
}

function checkBorderComplete() {
  if (puzzleState.borderPromptShown) return;

  const edgePieces = puzzleState.pieces.filter(piece => piece.isEdge);
  const allEdgesOnBoard = edgePieces.every(piece => piece.onBoard);

  if (allEdgesOnBoard) {
    puzzleState.borderPromptShown = true;
    puzzleState.filterMode = 'all';
    showToast('All edge pieces are out. Center pieces are now available.');
  }
}

function isPuzzleComplete() {
  if (!puzzleState) return false;

  if (!puzzleState.pieces.every(piece => piece.onBoard)) {
    return false;
  }

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
  if (!box || box.childElementCount) return;

  const count = 18;

  for (let i = 0; i < count; i += 1) {
    const bubble = document.createElement('div');
    bubble.className = 'bubble';

    const size = 7 + Math.random() * 21;

    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${Math.random() * 100}%`;
    bubble.style.setProperty('--drift', `${Math.random() * 40 - 20}px`);
    bubble.style.animationDuration = `${11 + Math.random() * 13}s`;
    bubble.style.animationDelay = `${-Math.random() * 22}s`;

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
