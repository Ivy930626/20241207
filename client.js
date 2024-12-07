const socket = io();
let isDrawer = false;

// 畫布設定
const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
let drawing = false;

// 畫布大小
canvas.width = 800;
canvas.height = 600;

// 畫畫事件處理
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

function startDrawing(e) {
  if (!isDrawer) return;
  drawing = true;
  draw(e); // 確保點擊的第一點也畫出來
}

function draw(e) {
  if (!drawing || !isDrawer) return;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#000000';

  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y);

  // 傳送畫圖數據到伺服器
  socket.emit('draw', { x, y });
}

function stopDrawing() {
  if (!isDrawer) return;
  drawing = false;
  ctx.beginPath();
}

// 接收伺服器傳來的畫圖數據，顯示在畫布上
socket.on('draw', (data) => {
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#000000';

  ctx.lineTo(data.x, data.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(data.x, data.y);
});

// 設定畫家角色
socket.on('setDrawer', () => {
  isDrawer = true;
  document.getElementById('role').textContent = 'You are the drawer!';
});

// 初始化畫布清空按鈕
document.getElementById('clearCanvas').addEventListener('click', () => {
  if (!isDrawer) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  socket.emit('clearCanvas');
});

// 接收清空畫布的命令
socket.on('clearCanvas', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});
