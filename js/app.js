
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
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove('hidden');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => toast.classList.add('hidden'), 2400);
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

  Array.from(document.querySelectorAll('.hotspot-btn')).forEach(btn => btn.disabled = true);
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
        Array.from(document.querySelectorAll('.hotspot-btn')).forEach(btn => btn.disabled = false);
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
    fishingStatus.textContent = 'You landed something! Your catch is becoming a puzzle...';
    setTimeout(() => {
      const speciesId = currentWater.species[Math.floor(Math.random() * currentWater.species.length)];
      currentSpecies = speciesData[speciesId];
      startPuzzle(currentSpecies);
    }, 1100);
  }
});

backToWatersBtn.addEventListener('click', () => showScreen('waters'));

function isEdgeIndex(index, size=3) {
  const row = Math.floor(index / size);
  const col = index % size;
  return row === 0 || col === 0 || row === size - 1 || col === size - 1;
}

function shuffled(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function startPuzzle(species) {
  selectedPieceId = null;
  const size = 3;
  const pieces = [];
  for (let i = 0; i < size * size; i += 1) {
    pieces.push({
      id: `piece-${i}`,
      correctIndex: i,
      placed: false,
      currentSlot: null,
      isEdge: isEdgeIndex(i, size)
    });
  }

  puzzleState = {
    species,
    size,
    pieces: shuffled(pieces),
    filterMode: 'edges',
    borderPromptShown: false
  };

  renderPuzzle();
  showScreen('puzzle');
  showToast('Edges Only is on. Build the border first if you like.');
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

function createPieceElement(piece, forBoard = false) {
  const size = puzzleState.size;
  const row = Math.floor(piece.correctIndex / size);
  const col = piece.correctIndex % size;
  const el = document.createElement('div');
  el.className = 'piece';
  if (selectedPieceId === piece.id && !forBoard) el.classList.add('selected');
  el.dataset.id = piece.id;
  el.style.backgroundImage = `url("${puzzleState.species.image}")`;
  el.style.backgroundPosition = `${(col / (size - 1)) * 100}% ${(row / (size - 1)) * 100}%`;

  if (!forBoard) {
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
  } else {
    el.classList.remove('selected');
  }
  return el;
}

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

  try { sourceEl.setPointerCapture(event.pointerId); } catch (e) {}
  sourceEl.addEventListener('pointermove', movePieceDrag);
  sourceEl.addEventListener('pointerup', endPieceDrag);
  sourceEl.addEventListener('pointercancel', cancelPieceDrag);
}

function movePieceDrag(event) {
  if (!dragState.active || event.pointerId !== dragState.pointerId) return;
  const dx = event.clientX - dragState.startX;
  const dy = event.clientY - dragState.startY;
  const distance = Math.hypot(dx, dy);
  if (!dragState.moved && distance < 7) return;

  if (!dragState.moved) {
    dragState.moved = true;
    createDragGhost(event.clientX, event.clientY);
  }

  event.preventDefault();
  positionDragGhost(event.clientX, event.clientY);
  document.querySelectorAll('.board-slot.drop-target').forEach(slot => slot.classList.remove('drop-target'));
  const target = document.elementFromPoint(event.clientX, event.clientY);
  const slot = target?.closest?.('.board-slot');
  if (slot) slot.classList.add('drop-target');
}

function createDragGhost(x, y) {
  const source = dragState.sourceEl;
  if (!source) return;
  const rect = source.getBoundingClientRect();
  const ghost = source.cloneNode(true);
  ghost.classList.remove('selected', 'drag-source');
  ghost.classList.add('drag-ghost');
  ghost.style.width = `${rect.width}px`;
  ghost.style.height = `${rect.height}px`;
  document.body.appendChild(ghost);
  dragState.ghostEl = ghost;
  positionDragGhost(x, y);
}

function positionDragGhost(x, y) {
  if (!dragState.ghostEl) return;
  dragState.ghostEl.style.left = `${x}px`;
  dragState.ghostEl.style.top = `${y}px`;
}

function cleanupDrag() {
  if (dragState.sourceEl) {
    dragState.sourceEl.classList.remove('drag-source');
    dragState.sourceEl.removeEventListener('pointermove', movePieceDrag);
    dragState.sourceEl.removeEventListener('pointerup', endPieceDrag);
    dragState.sourceEl.removeEventListener('pointercancel', cancelPieceDrag);
  }
  if (dragState.ghostEl) dragState.ghostEl.remove();
  document.querySelectorAll('.board-slot.drop-target').forEach(slot => slot.classList.remove('drop-target'));
  dragState = {active:false,pieceId:null,pointerId:null,sourceEl:null,ghostEl:null,startX:0,startY:0,moved:false};
}

function cancelPieceDrag() { cleanupDrag(); }

function endPieceDrag(event) {
  if (!dragState.active || event.pointerId !== dragState.pointerId) return;
  const pieceId = dragState.pieceId;
  const wasMoved = dragState.moved;

  if (!wasMoved) {
    selectedPieceId = pieceId;
    cleanupDrag();
    renderPuzzle();
    return;
  }

  const target = document.elementFromPoint(event.clientX, event.clientY);
  const slot = target?.closest?.('.board-slot');
  cleanupDrag();

  if (!slot) {
    selectedPieceId = pieceId;
    renderPuzzle();
    showToast('Drop the piece onto the puzzle board.');
    return;
  }

  const slotIndex = Number(slot.dataset.slot);
  selectedPieceId = pieceId;
  handleBoardSlotClick(slotIndex, slot);
}

function renderPuzzle() {
  if (!puzzleState) return;
  updatePieceCounter();

  puzzleBoard.innerHTML = '';
  for (let slotIndex = 0; slotIndex < puzzleState.size * puzzleState.size; slotIndex += 1) {
    const slot = document.createElement('button');
    slot.type = 'button';
    slot.className = 'board-slot';
    slot.dataset.slot = slotIndex;
    const placedPiece = puzzleState.pieces.find(p => p.currentSlot === slotIndex && p.placed);
    if (placedPiece) {
      slot.classList.add('correct');
      slot.appendChild(createPieceElement(placedPiece, true));
    }
    slot.addEventListener('click', () => handleBoardSlotClick(slotIndex, slot));
    puzzleBoard.appendChild(slot);
  }

  trayPieces.innerHTML = '';
  getVisiblePieces().forEach(piece => {
    const el = createPieceElement(piece);
    trayPieces.appendChild(el);
  });

  edgesOnlyBtn.classList.toggle('primary-btn', puzzleState.filterMode === 'edges');
  edgesOnlyBtn.classList.toggle('secondary-btn', puzzleState.filterMode !== 'edges');
  allPiecesBtn.classList.toggle('primary-btn', puzzleState.filterMode === 'all');
  allPiecesBtn.classList.toggle('secondary-btn', puzzleState.filterMode !== 'all');
}

function handleBoardSlotClick(slotIndex, slotEl) {
  if (!puzzleState || !selectedPieceId) return;
  const piece = puzzleState.pieces.find(p => p.id === selectedPieceId);
  if (!piece || piece.placed) return;

  if (slotIndex === piece.correctIndex) {
    piece.placed = true;
    piece.currentSlot = slotIndex;
    selectedPieceId = null;
    checkBorderComplete();
    renderPuzzle();
    if (puzzleState.pieces.every(p => p.placed)) {
      finishPuzzle();
    } else {
      showToast('Nice fit.');
    }
  } else {
    slotEl.classList.add('wrong');
    setTimeout(() => slotEl.classList.remove('wrong'), 260);
    showToast("That piece doesn't fit there.");
  }
}

function checkBorderComplete() {
  if (puzzleState.borderPromptShown) return;
  const edgesDone = puzzleState.pieces.filter(p => p.isEdge).every(p => p.placed);
  if (edgesDone) {
    puzzleState.borderPromptShown = true;
    puzzleState.filterMode = 'all';
    showToast('Border complete! All remaining pieces are now in the tray.');
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
  const unplaced = puzzleState.pieces.filter(p => !p.placed);
  const placed = puzzleState.pieces.filter(p => p.placed);
  puzzleState.pieces = [...placed, ...shuffled(unplaced)];
  selectedPieceId = null;
  renderPuzzle();
  showToast('Pieces spread out in the tray.');
});

fishAgainBtn.addEventListener('click', () => {
  if (currentWater) {
    startFishing(currentWater.id);
  } else {
    showScreen('waters');
  }
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
