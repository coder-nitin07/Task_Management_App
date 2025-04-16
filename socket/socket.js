// socket/socket.js
const socketIO = require('socket.io');
const http = require('http');

let io;
let server;

function initSocket(app) {
    server = http.createServer(app);      // Attach express app to server
    io = socketIO(server);                // Attach socket.io to that server

    // Optional: handle global socket events here if needed
    io.on('connection', (socket) => {
        console.log('A user connected');

        socket.emit('taskCreated', { title: "Test Task", description: "This is a test task." });

        socket.on('taskCreated', (task) => {
            console.log('Task created:', task);
        });

        socket.on('disconnect', () => {
            console.log('A user disconnected');
        });
    });

    return { io, server };
}

function getIO() {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
}

module.exports = { initSocket, getIO };
