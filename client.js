const socket = io();

document.getElementById('join-room-btn').addEventListener('click', () => {
  const roomId = document.getElementById('room-id').value.trim();
  const playerName = document.getElementById('player-name').value.trim();

  if (roomId && playerName) {
    socket.emit('joinRoom', roomId, playerName);
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('room-screen').style.display = 'block';
  } else {
    alert('請輸入房間名稱和玩家名稱！');
  }
});

document.getElementById('start-game-btn').addEventListener('click', () => {
  const roomId = document.getElementById('room-id').value.trim();
  socket.emit('startGame', roomId);
});

socket.on('updatePlayers', (players) => {
  const playerList = document.getElementById('player-list');
  playerList.innerHTML = ''; // 清空玩家列表
  players.forEach(player => {
    const listItem = document.createElement('li');
    listItem.textContent = player.name;
    playerList.appendChild(listItem);
  });
});

socket.on('isRoomOwner', () => {
  document.getElementById('start-game-btn').style.display = 'block';
});

socket.on('gameStarted', ({ drawer, word }) => {
  alert(`${drawer.name} 是畫畫者，準備開始遊戲！`);

  if (socket.id === drawer.id) {
    // 畫畫者能看到題目
    document.getElementById('word-to-draw').innerText = `你的題目是：${word}`;
    enableDrawing(); // 只有畫畫者能畫
    document.getElementById('clear-btn').style.display = 'block';
  } else {
    // 非畫畫者看不到題目
    document.getElementById('word-to-draw').innerText = '';
    disableDrawing(); // 禁止其他人畫
    document.getElementById('clear-btn').style.display = 'none';
  }

  document.getElementById('room-screen').style.display = 'none';
  document.getElementById('game-screen').style.display = 'block';
});

// 繪圖相關
const canvas = document.getElementById('drawing-canvas');
const ctx = canvas.getContext('2d');
let drawing = false;
let lastPos = null;

function enableDrawing() {
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mousemove', draw);
}

function disableDrawing() {
  canvas.removeEventListener('mousedown', startDrawing);
  canvas.removeEventListener('mouseup', stopDrawing);
  canvas.removeEventListener('mousemove', draw);
}

function startDrawing(e) {
  drawing = true;
  lastPos = { x: e.offsetX, y: e.offsetY };
}

function stopDrawing() {
  drawing = false;
  lastPos = null;
}

function draw(e) {
  if (!drawing) return;

  const currentPos = { x: e.offsetX, y: e.offsetY };
  drawLine(lastPos, currentPos);
  const roomId = document.getElementById('room-id').value.trim();
  socket.emit('draw', roomId, { start: lastPos, end: currentPos });
  lastPos = currentPos;
}

function drawLine(start, end) {
  if (!start || !end) return;
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();
}

socket.on('draw', (data) => {
  drawLine(data.start, data.end);
});

document.getElementById('clear-btn').addEventListener('click', () => {
  const roomId = document.getElementById('room-id').value.trim();
  socket.emit('clearCanvas', roomId);
});

socket.on('clearCanvas', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// 猜測功能
document.getElementById('guess-btn').addEventListener('click', () => {
  const guess = document.getElementById('guess-input').value.trim();
  const roomId = document.getElementById('room-id').value.trim();
  if (guess) {
    socket.emit('guess', roomId, guess);
    document.getElementById('guess-input').value = ''; // 清空輸入框
  }
});

socket.on('correctGuess', (message) => alert(message));
socket.on('incorrectGuess', (message) => alert(message));
