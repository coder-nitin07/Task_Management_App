const io = require('socket.io-client');

const socket = io('http://localhost:3000');

// Connect to the server
socket.on('connect', () => {
    console.log('Connected to the Socket.IO server!');
});

socket.on('taskCreated', (task) => {
    console.log('New Task Created:', task);
});