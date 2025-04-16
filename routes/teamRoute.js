const express = require('express');
const { createTeam, addMembersToTeam, getTeamDetails, updateTeamDetails, deleteTeamMember, archiveTeam, getTeamDetailsWithPagination } = require('../controllers/teamContoller');
const authMiddleware = require('../middleware/authMiddleware');
const checkAdminOrManager = require('../middleware/roleMiddleware');
const route = express.Router();

route.post('/createTeam', authMiddleware, createTeam);
route.post('/addMembersToTeam/:id', authMiddleware, addMembersToTeam);
route.get('/getTeamDetails', authMiddleware, getTeamDetails);
route.put('/updateTeamDetails/:id', authMiddleware, checkAdminOrManager, updateTeamDetails);
route.delete('/deleteTeamMember/:id', authMiddleware, checkAdminOrManager, deleteTeamMember);
route.patch('/archiveTeam/:id', authMiddleware, checkAdminOrManager, archiveTeam);
route.get('/teams', authMiddleware, getTeamDetailsWithPagination);

module.exports = route;