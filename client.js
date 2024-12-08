socket.on('gameStarted', ({ drawer, word }) => {
  alert(`${drawer.name} 是畫畫者，準備開始遊戲！`);
  
  if (socket.id === drawer.id) {
    console.log(`你是畫畫者，收到題目：${word}`); // 日誌檢查題目是否正確收到
    document.getElementById('word-to-draw').innerText = `你的題目是：${word}`;
    enableDrawing(); // 啟用繪畫功能
    document.getElementById('clear-btn').style.display = 'block';
  } else {
    console.log('你是猜題者，無法看到題目。'); // 日誌檢查非畫畫者的行為
    document.getElementById('word-to-draw').innerText = '';
    disableDrawing(); // 禁用繪畫功能
    document.getElementById('clear-btn').style.display = 'none';
  }

  document.getElementById('room-screen').style.display = 'none';
  document.getElementById('game-screen').style.display = 'block';
});
