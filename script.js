const grid = document.getElementById('grid');
const mapOutput = document.getElementById('mapOutput');
const quantumMode = document.getElementById('quantumMode');
const bpmInput = document.getElementById('bpm');
const offsetInput = document.getElementById('offset');
const audioIDInput = document.getElementById('audioID');
const timeline = document.getElementById('timeline');

const notes = [];
let currentTime = 0; // TODO: link with playback timeline
let dragNote = null;
let offsetX = 0, offsetY = 0;

const keyToGrid = {
  'Q': [0, 0], 'W': [1, 0], 'E': [2, 0],
  'A': [0, 1], 'S': [1, 1], 'D': [2, 1],
  'Z': [0, 2], 'X': [1, 2], 'C': [2, 2]
};

const cellSize = 100 / 3;
grid.style.position = 'relative';
grid.innerHTML = '';
for (let i = 0; i < 9; i++) {
  const cell = document.createElement('div');
  cell.classList.add('cell');
  grid.appendChild(cell);
}

function generateTimeline() {
  timeline.innerHTML = '';
  const bpm = parseFloat(bpmInput.value);
  const offset = parseFloat(offsetInput.value);
  if (isNaN(bpm) || isNaN(offset)) return;

  const beatInterval = 60000 / bpm; // ms per beat
  const totalBeats = 100; // arbitrary for prototype

  for (let i = 0; i < totalBeats; i++) {
    const beatMarker = document.createElement('div');
    beatMarker.classList.add('beat-marker');
    beatMarker.style.left = `${(i * beatInterval) / 10}px`;
    if (i % 4 === 0) beatMarker.classList.add('measure');
    timeline.appendChild(beatMarker);
  }
}

bpmInput.addEventListener('input', generateTimeline);
offsetInput.addEventListener('input', generateTimeline);

grid.addEventListener('click', (e) => {
  if (quantumMode.checked) {
    const rect = grid.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 3;
    const y = ((e.clientY - rect.top) / rect.height) * 3;
    placeNote(x, y);
  }
});

document.addEventListener('keydown', (e) => {
  const key = e.key.toUpperCase();
  if (!quantumMode.checked && keyToGrid[key]) {
    const [gridX, gridY] = keyToGrid[key];
    const x = gridX;
    const y = gridY;
    placeNote(x, y);
  }
});

function placeNote(x, y) {
  const note = document.createElement('div');
  note.classList.add('note');
  note.style.left = `${(x + 0.5) * cellSize}%`;
  note.style.top = `${(y + 0.5) * cellSize}%`;
  note.dataset.x = x;
  note.dataset.y = y;
  note.dataset.ms = currentTime;
  note.setAttribute('draggable', false);

  note.addEventListener('mousedown', (e) => {
    dragNote = note;
    offsetX = e.offsetX;
    offsetY = e.offsetY;
  });

  grid.appendChild(note);
  notes.push(note);
  updateMapOutput();
}

document.addEventListener('mouseup', () => {
  dragNote = null;
});

document.addEventListener('mousemove', (e) => {
  if (dragNote) {
    const rect = grid.getBoundingClientRect();
    let x = ((e.clientX - rect.left) / rect.width) * 3;
    let y = ((e.clientY - rect.top) / rect.height) * 3;

    if (!quantumMode.checked) {
      x = Math.round(x);
      y = Math.round(y);
    }

    dragNote.style.left = `${(x + 0.5) * cellSize}%`;
    dragNote.style.top = `${(y + 0.5) * cellSize}%`;
    dragNote.dataset.x = x;
    dragNote.dataset.y = y;
    updateMapOutput();
  }
});

function updateMapOutput() {
  const audioID = audioIDInput.value || 'Untitled';
  const data = notes.map(n => `${parseFloat(n.dataset.x)}|${parseFloat(n.dataset.y)}|${n.dataset.ms}`);
  mapOutput.value = `${audioID},${data.join(',')}`;
}

function exportMap() {
  const blob = new Blob([mapOutput.value], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${audioIDInput.value || 'map'}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function copyMap() {
  navigator.clipboard.writeText(mapOutput.value).then(() => alert('Map data copied!'));
}

// Initial timeline render
generateTimeline();
