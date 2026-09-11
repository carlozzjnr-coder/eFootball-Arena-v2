const socketHandlers = (socket, io) => {
  // Match events
  socket.on('match:join', (data) => {
    socket.join(`match_${data.matchId}`);
    io.to(`match_${data.matchId}`).emit('match:player-joined', {
      playerId: socket.id,
      timestamp: new Date()
    });
  });

  socket.on('match:update-score', (data) => {
    io.to(`match_${data.matchId}`).emit('match:score-updated', {
      player1Score: data.player1Score,
      player2Score: data.player2Score,
      timestamp: new Date()
    });
  });

  socket.on('match:end', (data) => {
    io.to(`match_${data.matchId}`).emit('match:status-changed', {
      status: 'completed',
      winner: data.winner,
      timestamp: new Date()
    });
  });

  // Chat events
  socket.on('chat:join-room', (data) => {
    socket.join(`chat_${data.roomId}`);
    io.to(`chat_${data.roomId}`).emit('chat:user-joined', {
      username: data.username,
      timestamp: new Date()
    });
  });

  socket.on('chat:message', (data) => {
    io.to(`chat_${data.roomId}`).emit('chat:new-message', {
      username: data.username,
      content: data.content,
      timestamp: new Date()
    });
  });

  socket.on('chat:leave-room', (data) => {
    socket.leave(`chat_${data.roomId}`);
    io.to(`chat_${data.roomId}`).emit('chat:user-left', {
      username: data.username,
      timestamp: new Date()
    });
  });

  // Tournament events
  socket.on('tournament:subscribe', (data) => {
    socket.join(`tournament_${data.tournamentId}`);
  });

  socket.on('tournament:bracket-update', (data) => {
    io.to(`tournament_${data.tournamentId}`).emit('tournament:bracket-updated', data);
  });

  // Notification events
  socket.on('notification:subscribe', (data) => {
    socket.join(`notifications_${data.playerId}`);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`Socket ${socket.id} disconnected`);
  });
};

module.exports = socketHandlers;
