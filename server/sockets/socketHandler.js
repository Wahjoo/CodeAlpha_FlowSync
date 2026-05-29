const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join a project-specific room
    socket.on('project:join', (projectId) => {
      socket.join(`project:${projectId}`);
      console.log(`Socket ${socket.id} joined project room: project:${projectId}`);
    });

    // Leave a project-specific room
    socket.on('project:leave', (projectId) => {
      socket.leave(`project:${projectId}`);
      console.log(`Socket ${socket.id} left project room: project:${projectId}`);
    });

    // Join user-specific notification room
    socket.on('user:join', (userId) => {
      socket.join(`user:${userId}`);
      console.log(`Socket ${socket.id} joined user room: user:${userId}`);
    });

    // Leave user-specific notification room
    socket.on('user:leave', (userId) => {
      socket.leave(`user:${userId}`);
      console.log(`Socket ${socket.id} left user room: user:${userId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

export default socketHandler;
