<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sound Space Quantum Editor Web</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            background: #1a1a1a;
            color: #ffffff;
            font-family: 'Consolas', 'Monaco', monospace;
            overflow: hidden;
        }

        .container {
            display: flex;
            height: 100vh;
        }

        .sidebar {
            width: 300px;
            background: #2a2a2a;
            padding: 20px;
            overflow-y: auto;
        }

        .main-area {
            flex: 1;
            display: flex;
            flex-direction: column;
        }

        .timeline-container {
            height: 120px;
            background: #333;
            position: relative;
            overflow-x: auto;
            border-bottom: 2px solid #444;
        }

        .timeline {
            height: 100%;
            position: relative;
            min-width: 100%;
        }

        .timeline-ruler {
            position: absolute;
            top: 0;
            height: 30px;
            background: #2a2a2a;
            width: 100%;
            border-bottom: 1px solid #555;
        }

        .beat-marker {
            position: absolute;
            top: 0;
            bottom: 0;
            width: 2px;
            background: #ff00ff;
            opacity: 0.7;
        }

        .time-marker {
            position: absolute;
            top: 35px;
            bottom: 0;
            width: 1px;
            background: #666;
        }

        .playhead {
            position: absolute;
            top: 0;
            bottom: 0;
            width: 2px;
            background: #00ff00;
            z-index: 10;
        }

        .grid-container {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            background: #1a1a1a;
        }

        .grid {
            width: 400px;
            height: 400px;
            background: #2a2a2a;
            border: 2px solid #444;
            position: relative;
            cursor: crosshair;
        }

        .grid-line {
            position: absolute;
            background: #444;
        }

        .grid-line.vertical {
            width: 1px;
            height: 100%;
        }

        .grid-line.horizontal {
            width: 100%;
            height: 1px;
        }

        .grid-label {
            position: absolute;
            color: #888;
            font-size: 16px;
            font-weight: bold;
            pointer-events: none;
        }

        .note {
            position: absolute;
            width: 30px;
            height: 30px;
            border: 3px solid #ff00ff;
            background: transparent;
            transform: translate(-50%, -50%);
            cursor: pointer;
            z-index: 5;
        }

        .note.quantum {
            border-color: #00ffff;
        }

        .controls {
            padding: 20px;
            background: #2a2a2a;
            border-top: 2px solid #444;
            display: flex;
            gap: 20px;
            align-items: center;
        }

        .control-group {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }

        .control-group label {
            font-size: 12px;
            color: #ccc;
        }

        input[type="number"], input[type="file"], textarea {
            background: #333;
            border: 1px solid #555;
            color: #fff;
            padding: 5px;
            border-radius: 3px;
        }

        button {
            background: #ff00ff;
            color: #fff;
            border: none;
            padding: 8px 16px;
            border-radius: 3px;
            cursor: pointer;
            font-family: inherit;
        }

        button:hover {
            background: #cc00cc;
        }

        button:disabled {
            background: #555;
            cursor: not-allowed;
        }

        .toggle {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .checkbox {
            width: 20px;
            height: 20px;
            background: #333;
            border: 2px solid #ff00ff;
            position: relative;
            cursor: pointer;
        }

        .checkbox.checked {
            background: #ff00ff;
        }

        .checkbox.checked::after {
            content: "✓";
            position: absolute;
            color: #fff;
            font-size: 14px;
            top: -2px;
            left: 2px;
        }

        .section {
            margin-bottom: 20px;
        }

        .section h3 {
            color: #ff00ff;
            margin-bottom: 10px;
            font-size: 14px;
        }

        textarea {
            width: 100%;
            height: 100px;
            resize: vertical;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 12px;
        }

        .time-display {
            color: #00ff00;
            font-family: 'Consolas', 'Monaco', monospace;
        }

        .note-info {
            background: #333;
            padding: 10px;
            border-radius: 3px;
            font-size: 12px;
            max-height: 150px;
            overflow-y: auto;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="sidebar">
            <div class="section">
                <h3>TIMING</h3>
                <div class="control-group">
                    <label>BPM</label>
                    <input type="number" id="bpm" value="120" min="1" max="300">
                </div>
                <div class="control-group">
                    <label>Offset (ms)</label>
                    <input type="number" id="offset" value="0" step="1">
                </div>
            </div>

            <div class="section">
                <h3>AUDIO</h3>
                <div class="control-group">
                    <label>Audio File</label>
                    <input type="file" id="audioFile" accept="audio/*">
                </div>
                <div class="control-group">
                    <label>Audio Name</label>
                    <input type="text" id="audioName" placeholder="Enter audio name">
                </div>
            </div>

            <div class="section">
                <h3>OPTIONS</h3>
                <div class="toggle">
                    <div class="checkbox" id="quantumToggle"></div>
                    <label>Quantum Placement</label>
                </div>
            </div>

            <div class="section">
                <h3>NOTES</h3>
                <div class="note-info" id="notesList">
                    No notes placed
                </div>
            </div>

            <div class="section">
                <h3>MAP DATA</h3>
                <textarea id="mapData" placeholder="Map data will appear here..."></textarea>
                <button onclick="exportMapData()">Export Map Data</button>
                <button onclick="importMapData()">Import Map Data</button>
            </div>
        </div>

        <div class="main-area">
            <div class="timeline-container">
                <div class="timeline" id="timeline">
                    <div class="timeline-ruler"></div>
                    <div class="playhead" id="playhead"></div>
                </div>
            </div>

            <div class="grid-container">
                <div class="grid" id="grid">
                    <!-- Grid lines -->
                    <div class="grid-line vertical" style="left: 33.33%;"></div>
                    <div class="grid-line vertical" style="left: 66.66%;"></div>
                    <div class="grid-line horizontal" style="top: 33.33%;"></div>
                    <div class="grid-line horizontal" style="top: 66.66%;"></div>
                    
                    <!-- Grid labels -->
                    <div class="grid-label" style="left: 16.66%; top: 16.66%;">Q</div>
                    <div class="grid-label" style="left: 50%; top: 16.66%;">W</div>
                    <div class="grid-label" style="left: 83.33%; top: 16.66%;">E</div>
                    <div class="grid-label" style="left: 16.66%; top: 50%;">A</div>
                    <div class="grid-label" style="left: 50%; top: 50%;">S</div>
                    <div class="grid-label" style="left: 83.33%; top: 50%;">D</div>
                    <div class="grid-label" style="left: 16.66%; top: 83.33%;">Z</div>
                    <div class="grid-label" style="left: 50%; top: 83.33%;">X</div>
                    <div class="grid-label" style="left: 83.33%; top: 83.33%;">C</div>
                </div>
            </div>

            <div class="controls">
                <button id="playBtn" onclick="togglePlayback()">Play</button>
                <button onclick="stopPlayback()">Stop</button>
                <div class="control-group">
                    <label>Time</label>
                    <div class="time-display" id="timeDisplay">0:00</div>
                </div>
                <div class="control-group">
                    <label>Position (ms)</label>
                    <div class="time-display" id="positionDisplay">0</div>
                </div>
                <button onclick="clearAllNotes()">Clear All Notes</button>
                <button onclick="saveProject()">Save Project</button>
            </div>
        </div>
    </div>

    <audio id="audioPlayer" style="display: none;"></audio>

    <script>
        // Global state
        let isPlaying = false;
        let currentTime = 0;
        let notes = [];
        let audioElement = document.getElementById('audioPlayer');
        let quantumMode = false;
        let audioDuration = 0;
        let timelineScale = 100; // pixels per second

        // Key mappings for fixed positions
        const keyMappings = {
            'q': {x: 2, y: 2}, 'w': {x: 1, y: 2}, 'e': {x: 0, y: 2},
            'a': {x: 2, y: 1}, 's': {x: 1, y: 1}, 'd': {x: 0, y: 1},
            'z': {x: 2, y: 0}, 'x': {x: 1, y: 0}, 'c': {x: 0, y: 0}
        };

        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
            setupEventListeners();
            updateTimeline();
            updateNotesList();
        });

        function setupEventListeners() {
            // Audio file handling
            document.getElementById('audioFile').addEventListener('change', handleAudioFile);
            
            // BPM and offset changes
            document.getElementById('bpm').addEventListener('input', updateTimeline);
            document.getElementById('offset').addEventListener('input', updateTimeline);
            
            // Grid clicking
            document.getElementById('grid').addEventListener('click', handleGridClick);
            
            // Quantum toggle
            document.getElementById('quantumToggle').addEventListener('click', toggleQuantum);
            
            // Keyboard input
            document.addEventListener('keydown', handleKeyDown);
            
            // Audio time update
            audioElement.addEventListener('timeupdate', updatePlayhead);
            audioElement.addEventListener('loadedmetadata', function() {
                audioDuration = audioElement.duration;
                updateTimeline();
            });
        }

        function handleAudioFile(event) {
            const file = event.target.files[0];
            if (file) {
                const url = URL.createObjectURL(file);
                audioElement.src = url;
                document.getElementById('audioName').value = file.name.replace(/\.[^/.]+$/, "");
            }
        }

        function toggleQuantum() {
            quantumMode = !quantumMode;
            const toggle = document.getElementById('quantumToggle');
            if (quantumMode) {
                toggle.classList.add('checked');
            } else {
                toggle.classList.remove('checked');
            }
        }

        function handleGridClick(event) {
            const rect = event.target.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width;
            const y = (event.clientY - rect.top) / rect.height;
            
            // Convert to game coordinates (flip Y and scale to 0-2)
            let gameX, gameY;
            
            if (quantumMode) {
                gameX = Math.round((2 - x * 2) * 1000) / 1000; // Limit to 3 decimals
                gameY = Math.round((2 - y * 2) * 1000) / 1000;
            } else {
                // Snap to nearest grid position
                gameX = Math.round(2 - x * 2);
                gameY = Math.round(2 - y * 2);
            }
            
            // Clamp to valid range
            gameX = Math.max(0, Math.min(2, gameX));
            gameY = Math.max(0, Math.min(2, gameY));
            
            placeNote(gameX, gameY, currentTime);
        }

        function handleKeyDown(event) {
            const key = event.key.toLowerCase();
            if (keyMappings[key] && !quantumMode) {
                event.preventDefault();
                const pos = keyMappings[key];
                placeNote(pos.x, pos.y, currentTime);
            }
        }

        function placeNote(x, y, time) {
            const note = {
                x: x,
                y: y,
                time: Math.round(time),
                id: Date.now() + Math.random()
            };
            
            notes.push(note);
            notes.sort((a, b) => a.time - b.time);
            renderNotes();
            updateNotesList();
            updateMapData();
        }

        function renderNotes() {
            // Clear existing notes
            document.querySelectorAll('.note').forEach(note => note.remove());
            
            const grid = document.getElementById('grid');
            
            notes.forEach(note => {
                const noteElement = document.createElement('div');
                noteElement.className = 'note';
                
                // Check if it's a quantum note
                if (note.x % 1 !== 0 || note.y % 1 !== 0) {
                    noteElement.classList.add('quantum');
                }
                
                // Convert game coordinates to screen coordinates
                // For fixed positions, place exactly in the center of each grid square
                let screenX, screenY;
                
                if (note.x % 1 === 0 && note.y % 1 === 0) {
                    // Fixed position - center of grid square
                    const gridSquareX = 2 - note.x; // Convert back to grid index
                    const gridSquareY = 2 - note.y; // Convert back to grid index
                    screenX = (gridSquareX + 0.5) / 3 * 100; // Center of grid square
                    screenY = (gridSquareY + 0.5) / 3 * 100; // Center of grid square
                } else {
                    // Quantum position - precise placement
                    screenX = (2 - note.x) / 2 * 100;
                    screenY = (2 - note.y) / 2 * 100;
                }
                
                noteElement.style.left = screenX + '%';
                noteElement.style.top = screenY + '%';
                noteElement.title = `X: ${note.x}, Y: ${note.y}, Time: ${note.time}ms`;
                
                noteElement.addEventListener('click', function(e) {
                    e.stopPropagation();
                    removeNote(note.id);
                });
                
                grid.appendChild(noteElement);
            });
        }

        function removeNote(id) {
            notes = notes.filter(note => note.id !== id);
            renderNotes();
            updateNotesList();
            updateMapData();
        }

        function updateTimeline() {
            const timeline = document.getElementById('timeline');
            const bpm = parseInt(document.getElementById('bpm').value) || 120;
            const offset = parseInt(document.getElementById('offset').value) || 0;
            
            // Clear existing markers
            timeline.querySelectorAll('.beat-marker, .time-marker').forEach(marker => marker.remove());
            
            if (audioDuration > 0) {
                const beatInterval = 60 / bpm; // seconds per beat
                const timelineWidth = audioDuration * timelineScale;
                timeline.style.width = timelineWidth + 'px';
                
                // Add beat markers
                for (let time = offset / 1000; time < audioDuration; time += beatInterval) {
                    if (time >= 0) {
                        const marker = document.createElement('div');
                        marker.className = 'beat-marker';
                        marker.style.left = (time * timelineScale) + 'px';
                        timeline.appendChild(marker);
                    }
                }
                
                // Add time markers (every second)
                for (let time = 0; time <= audioDuration; time += 1) {
                    const marker = document.createElement('div');
                    marker.className = 'time-marker';
                    marker.style.left = (time * timelineScale) + 'px';
                    timeline.appendChild(marker);
                }
            }
        }

        function togglePlayback() {
            if (isPlaying) {
                audioElement.pause();
                isPlaying = false;
                document.getElementById('playBtn').textContent = 'Play';
            } else {
                if (audioElement.src) {
                    audioElement.play();
                    isPlaying = true;
                    document.getElementById('playBtn').textContent = 'Pause';
                }
            }
        }

        function stopPlayback() {
            audioElement.pause();
            audioElement.currentTime = 0;
            currentTime = 0;
            isPlaying = false;
            document.getElementById('playBtn').textContent = 'Play';
            updateTimeDisplay();
            updatePlayhead();
        }

        function updatePlayhead() {
            if (audioElement.src) {
                currentTime = audioElement.currentTime * 1000; // Convert to milliseconds
                const playhead = document.getElementById('playhead');
                playhead.style.left = (audioElement.currentTime * timelineScale) + 'px';
                updateTimeDisplay();
            }
        }

        function updateTimeDisplay() {
            const minutes = Math.floor(currentTime / 60000);
            const seconds = Math.floor((currentTime % 60000) / 1000);
            document.getElementById('timeDisplay').textContent = 
                minutes + ':' + seconds.toString().padStart(2, '0');
            document.getElementById('positionDisplay').textContent = Math.round(currentTime);
        }

        function updateNotesList() {
            const notesList = document.getElementById('notesList');
            if (notes.length === 0) {
                notesList.textContent = 'No notes placed';
            } else {
                notesList.innerHTML = notes.map((note, index) => 
                    `<div>Note ${index + 1}: (${note.x}, ${note.y}) @ ${note.time}ms</div>`
                ).join('');
            }
        }

        function updateMapData() {
            const audioName = document.getElementById('audioName').value || 'audio';
            const noteData = notes.map(note => `${note.x}|${note.y}|${note.time}`).join(',');
            const mapData = audioName + (noteData ? ',' + noteData : '');
            document.getElementById('mapData').value = mapData;
        }

        function exportMapData() {
            const mapData = document.getElementById('mapData').value;
            if (mapData) {
                const blob = new Blob([mapData], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'map.txt';
                a.click();
                URL.revokeObjectURL(url);
            }
        }

        function importMapData() {
            const mapData = document.getElementById('mapData').value.trim();
            if (!mapData) return;
            
            try {
                const parts = mapData.split(',');
                const audioName = parts[0];
                
                document.getElementById('audioName').value = audioName;
                
                // Clear existing notes
                notes = [];
                
                // Parse notes
                for (let i = 1; i < parts.length; i++) {
                    const noteParts = parts[i].split('|');
                    if (noteParts.length === 3) {
                        notes.push({
                            x: parseFloat(noteParts[0]),
                            y: parseFloat(noteParts[1]),
                            time: parseInt(noteParts[2]),
                            id: Date.now() + Math.random() + i
                        });
                    }
                }
                
                notes.sort((a, b) => a.time - b.time);
                renderNotes();
                updateNotesList();
            } catch (error) {
                alert('Error parsing map data: ' + error.message);
            }
        }

        function clearAllNotes() {
            if (confirm('Are you sure you want to clear all notes?')) {
                notes = [];
                renderNotes();
                updateNotesList();
                updateMapData();
            }
        }

        function saveProject() {
            const project = {
                audioName: document.getElementById('audioName').value,
                bpm: document.getElementById('bpm').value,
                offset: document.getElementById('offset').value,
                notes: notes,
                mapData: document.getElementById('mapData').value
            };
            
            const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'project.json';
            a.click();
            URL.revokeObjectURL(url);
        }
    </script>
</body>
</html>
