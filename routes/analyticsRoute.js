const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { getTaskStats, getUserStats, getAdminDashboard } = require('../controllers/analyticsController');
const adminOrManager = require('../middleware/adminOrManager');
const routerAnaly = express.Router();

routerAnaly.get('/task', authMiddleware, adminOrManager(['Admin', 'Manager']), getTaskStats);
routerAnaly.get('/users', authMiddleware, adminOrManager(['Admin']), getUserStats);
routerAnaly.get('/admindashboard', authMiddleware, adminOrManager(['Admin']), getAdminDashboard);

module.exports = routerAnaly;