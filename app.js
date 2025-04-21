const express = require('express');
const dbConnection = require('./config/db');
const router = require('./routes/authRoute');
const rout = require('./routes/taskRoute');
const route = require('./routes/teamRoute');
const app = express();
const { initSocket } = require('./socket/socket');
const routerAnaly = require('./routes/analyticsRoute');
require('dotenv').config();

app.use(express.json());

app.get('/', (req, res)=>{
    res.send("THis is the Resful API Project");
});

// DB Connection
dbConnection();

app.use('/api', router);
app.use('/api', rout);
app.use('/api', route);
app.use('/api', routerAnaly);

// Initialize socket with app
const { io, server } = initSocket(app);

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


const PORT = process.env.PORT || 5000;
server.listen(PORT, ()=>{
    console.log(`Server is running on PORT ${ PORT }`)
});