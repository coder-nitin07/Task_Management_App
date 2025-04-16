const io = require('socket.io-client');

// Replace with your backend URL
const socket = io('http://localhost:3000'); // assuming your backend is running on port 5000

// Connect to the server
socket.on('connect', () => {
    console.log('Connected to the Socket.IO server!');
});

// Listen for the "taskCreated" event
socket.on('taskCreated', (task) => {
    console.log('New Task Created:', task);
});