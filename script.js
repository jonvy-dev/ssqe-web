const grid = document.getElementById('grid');
const mapOutput = document.getElementById('mapOutput');
const quantumMode = document.getElementById('quantumMode');
const bpmInput = document.getElementById('bpm');
const offsetInput = document.getElementById('offset');
const audioIDInput = document.getElementById('audioID');

const notes = [];
let currentTime = 0; // ms, later we can link to audio position or manual time input
let dragNote = null;
let offsetX = 0, offsetY = 0;

const keyToGrid = {
  'Q': [2, 2], 'W': [1, 2], 'E': [0, 2],
  'A': [2, 1], 'S': [1, 1], 'D': [0, 1],
  'Z': [2, 0], 'X': [1, 0], 'C': [0, 0]
};

grid.style.position = 'relative';
grid.innerHTML = '';
for (let i = 0; i < 9; i++) {
  const cell = document.createElement('div');
  cell.classList.add('cell');
  grid.appendChild(cell);
}

grid.addEventListener('click', (e) => {
  if (quantumMode.checked) {
    const rect = grid.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 3;
    const y = 3 - ((e.clientY - rect.top) / rect.height) * 3;
    placeNote(x, y);
  }
});

document.addEventListener('keydown', (e) => {
  const key = e.key.toUpperCase();
  if (!quantumMode.checked && keyToGrid[key]) {
    const [x, y] = keyToGrid[key];
    placeNote(x, y);
  }
});

function placeNote(x, y) {
  const note = document.createElement('div');
  note.classList.add('note');
  note.style.left = `${(x / 3) * 100}%`;
  note.style.top = `${(1 - y / 3) * 100}%`;
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
    let y = 3 - ((e.clientY - rect.top) / rect.height) * 3;

    if (!quantumMode.checked) {
      x = Math.round(x);
      y = Math.round(y);
    }

    dragNote.style.left = `${(x / 3) * 100}%`;
    dragNote.style.top = `${(1 - y / 3) * 100}%`;
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
