const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let rooms = {};

// 題目列表
const topics = ['樹', '房子', '太陽', '小貓', '車子', '山', '河流', '雲', '船', '飛機'];

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log(`玩家 ${socket.id} 已連接`);

  socket.on('joinRoom', (roomId, playerName) => {
    if (!rooms[roomId]) {
      rooms[roomId] = { players: [], gameStarted: false };
    }

    const room = rooms[roomId];
    room.players.push({ id: socket.id, name: playerName });
    socket.join(roomId);

    io.to(roomId).emit('updatePlayers', room.players);

    if (room.players.length === 1) {
      socket.emit('isRoomOwner');
    }
  });

  socket.on('startGame', (roomId) => {
    const room = rooms[roomId];
    if (room && room.players.length > 1) {
      room.gameStarted = true;

      // 隨機選擇畫畫者
      const drawerIndex = Math.floor(Math.random() * room.players.length);
      room.drawer = room.players[drawerIndex];

      // 隨機選擇題目
      room.word = topics[Math.floor(Math.random() * topics.length)];

      console.log(`房間 ${roomId} 遊戲開始，題目為：${room.word}`);

      // 發送遊戲開始的訊息
      room.players.forEach(player => {
        if (player.id === room.drawer.id) {
          io.to(player.id).emit('gameStarted', {
            drawer: room.drawer,
            word: room.word,  // 傳送隨機題目給畫畫者
          });
          console.log(`題目已發送給畫畫者 ${player.name} (${player.id})`);
        } else {
          io.to(player.id).emit('gameStarted', {
            drawer: room.drawer,
            word: null,  // 非畫畫者不顯示題目
          });
        }
      });
    } else {
      socket.emit('error', '無法開始遊戲，玩家人數不足或房間不存在。');
    }
  });

  socket.on('draw', (roomId, data) => {
    const room = rooms[roomId];
    if (room && room.drawer.id === socket.id) {
      socket.to(roomId).emit('draw', data);
    }
  });

  socket.on('clearCanvas', (roomId) => {
    const room = rooms[roomId];
    if (room && room.drawer.id === socket.id) {
      io.to(roomId).emit('clearCanvas');
    }
  });

  socket.on('guess', (roomId, guess) => {
    const room = rooms[roomId];
    if (room && room.word === guess) {
      io.to(roomId).emit('correctGuess', `${guess} 是正確答案！`);
    } else {
      socket.emit('incorrectGuess', `${guess} 錯誤，再試試！`);
    }
  });

  socket.on('disconnect', () => {
    for (const roomId in rooms) {
      const room = rooms[roomId];
      room.players = room.players.filter(player => player.id !== socket.id);

      if (room.players.length === 0) {
        delete rooms[roomId];
      } else {
        io.to(roomId).emit('updatePlayers', room.players);
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`伺服器運行中，監聽端口：${PORT}`);
});
