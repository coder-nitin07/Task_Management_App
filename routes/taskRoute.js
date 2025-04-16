const express = require('express');
const { createTask, getAllTasks, updateTask, deleteTask, assignTaskToTeam, getTaskDetails, filterTheTasks  } = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');
const checkAdminOrManager = require('../middleware/roleMiddleware');
const rout = express.Router();

rout.post('/createTask', authMiddleware, checkAdminOrManager, createTask);
rout.get('/getAllTask', authMiddleware, getAllTasks);
rout.put('/updateTask/:id', authMiddleware, updateTask);
rout.delete('/deleteTask/:id', authMiddleware, deleteTask);
rout.post('/assignTaskToTeam', authMiddleware, checkAdminOrManager, assignTaskToTeam);
rout.get('/getTaskDetails/:id', authMiddleware, getTaskDetails);
rout.get('/filterTheTasks', authMiddleware, filterTheTasks);

module.exports = rout;