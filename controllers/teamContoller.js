const Team = require("../models/teamSchema");
const User = require("../models/userSchema");
const mongoose = require('mongoose');

const createTeam = async (req, res)=>{
    try {
        const { teamName, managerID, members } = req.body;

        if(req.user.role !== 'Admin'){
            return res.status(403).json({ message: 'Only Admin can create the Teams' });
        }

        // Checking if the team already exists
        const existingTeam = await Team.findOne({ teamName });
        if (existingTeam) {
            return res.status(400).json({ message: 'A team with this name already exists' });
        }

        // Process the team craetion

        // checking the manager is exist or not
        console.log('Manager ID:', managerID);
        const manager = await User.findById(managerID);
        console.log('Manager:', manager)
        if(!manager){
            return res.status(400).json({ message: 'Manager not found' });
        }

        // creation of the team
        const createTeam = await Team.create({
            teamName,
            manager: managerID,
            members: [ members ],
            currentSize: 1
        });

        return res.status(201).json({ message: 'Team successfully created',  team: createTeam });
    } catch (err) {
        console.log(err);
        res.status(400).json({ error: err, message: 'Something went wrong' });
    }
};

const addMembersToTeam = async (req, res)=>{
    try {
        const { id } = req.params;
        let { members } = req.body;

        members = [ ...new Set(members) ];

        console.log("Members being added:", members);

        const team = await Team.findById(id);
        if(!team){
            return res.status(400).json({ message: 'team not found' });
        }

        if(team.currentSize + members.length > 4){
            return res.status(400).json({ message: 'Team is already full' });
        }

        const existingMembers = team.members.filter(memberID => members.includes(memberID));
    
        if(existingMembers.length > 0){
            return res.status(400).json({ message: `The following member already exist in the Team: ${ existingMembers.join(', ') }` });
        }

        for (const memberID of members) {
            if (team.members.includes(memberID)) {
                return res.status(403).json({ message: `The member with ID ${memberID} already exists in the team` });
            }
        }

        const newMembers = members.filter(memberID => !team.members.includes(memberID));

        team.members.push(...newMembers);
        team.currentSize += newMembers.length;
        console.log("Updated Team:", team);
        await team.save();

        return res.status(200).json({ message: 'Memebrs added to the Team', team });
    } catch (err) {
        console.log(err);
        res.status(400).json({ error: err, message: 'Soemthing went wrong' });
    }
};

const getTeamDetails = async (req, res) => {
    try {
        // Get the user ID from the decoded JWT token
        const userId = req.user._id;
        console.log('User ID:', userId);  // Debugging line to ensure user ID is correct

        // Convert the userId to ObjectId (if it's a string) to ensure compatibility with MongoDB
        console.log('Without converted in userObjectID : ', userId);
        const userObjectId = new mongoose.Types.ObjectId(userId);
        console.log('Converted userObjectId:', userObjectId);  // Debugging line to verify conversion

        console.log("Role is here : ", req.user.role);
        // Check if the user is an admin (Admins can see all teams)
        const isAdmin = req.user.role === 'Admin';

        // If the user is an admin, they can see all teams
        let teams;
        if (isAdmin) {
            teams = await Team.find({});
        } else {
            // If the user is not an admin, they can see teams where they are either the manager or a member
            teams = await Team.find({
                $or: [
                    { manager: userObjectId },  // Match the user as the manager
                    { members: userObjectId }   // Match the user as a member
                ]
            });
        }

        console.log('Teams:', teams);  // Debugging line to verify the teams returned

        // If no teams are found, return a message
        if (!teams || teams.length === 0) {
            return res.status(400).json({ message: 'No teams found for this user' });
        }

        // Return the found teams
        res.status(200).json({ teams });
    } catch (err) {
        console.log(err);
        res.status(400).json({ error: err, message: 'Something went wrong' });
    }
};

const updateTeamDetails = async (req, res)=>{
    try {
        const teamID = req.params.id;
        const { teamName, members } = req.body;

        const updatedTeamData = await Team.findByIdAndUpdate(
            teamID,
            { teamName, members },
            { new: true }
        );

        if(!updatedTeamData){
            return res.status(404).json({ message: 'Team not found' });
        }

        res.status(200).json({ message: 'Team Updated Successfully', team: updatedTeamData });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err, message: 'Something went wrong' });
    }
};

const deleteTeamMember = async (req, res)=>{
    try {
        const teamID = req.params.id;
        const memberIDs = req.body.memberId;

        const team = await Team.findById(teamID);
        if(!team){
            return res.status(404).json({ message: 'Team not found' });
        }

        if(req.user.role === 'User'){
            return res.status(403).json({ message: 'You cannot delete any members' });
        }

        if(req.user.role === 'Manager'){
            for (let memberID of memberIDs){
                if(team.manager.toString() === memberID){
                    return res.status(403).json({ message: 'Cannot remove the manager' });
                }

                if(req.user.id === memberID){
                    return res.status(403).json({ message: 'A manager can not deleet themselebes' });
                }
            }
        }

        for(let memberID of memberIDs){
            if (!team.members.includes(memberID)) {
                return res.status(404).json({ message: `Member with the ID ${ memberID } not found in the team` });
            }
        }

        const updateTeam = await Team.findByIdAndUpdate(
            teamID,
            { 
                $pull: { members: { $in: memberIDs } }, 
                $inc: { currentSize: -memberIDs.length }  // Make sure you're updating the size based on the number of members removed
            },
            { new: true }
        );

        updateTeam.currentSize = updateTeam.members.length;

        await updateTeam.save();

        if(!updateTeam){
            return res.status(404).json({ message: 'Member could not be removed' });
        }

        res.status(200).json({ message: 'Members removed successfully', team: updateTeam });
    } catch (err) {
        console.log(err);
        res.status(404).json({ error: err, message: 'Something went wrong' });
    }
};

const archiveTeam = async (req, res)=>{
    try {
        const teamID = req.params.id;

        const team = await Team.findById(teamID);
        if(!team){
            return res.status(404).json({ message: 'Team not found' });
        }

        team.archived = true;
        await team.save();

        res.status(200).json({ message: 'Team archieved successfully', team });
    } catch (err) {
        console.log(err);
        res.status(400).json({ error: err, message: 'Something went wrong' });
    }
};

const getTeamDetailsWithPagination = async (req, res)=>{
    try {
        const { page = 1, limit = 1 } = req.query;
        const skip = (page - 1) * limit;

        const teams = await Team.find({ archived: false }) // only get non-archievde teams
                .skip(skip)
                .limit(parseInt(limit))
                .sort({ createdAt: -1 });

        const totalTeams = await Team.countDocuments({ archived: false });
        const totalPages = Math.ceil(totalTeams / limit);

        res.status(200).json({ teams, totalTeams, totalPages, currentPage: page, teamsPerPage: limit });
    } catch (err) {
        console.log(err);
        res.status(404).json({ error: err, message: 'Something went wrong' });
    }
};

module.exports = { createTeam, addMembersToTeam, getTeamDetails, updateTeamDetails, deleteTeamMember, archiveTeam, getTeamDetailsWithPagination };