const Task = require("../models/taskSchema");
const Team = require("../models/teamSchema");
const User = require("../models/userSchema");

// Task Analystics
const getTaskStats = async (req, res)=>{
    try {
        const totalTasks = await Task.countDocuments();
        const completeTasks = await Task.countDocuments({ status: 'Completed' });
        const pendingTasks = await Task.countDocuments({ status: 'Not Completed' });
        const overdueTasks = await Task.countDocuments({
            dueDate: { $lt: new Date() },
            status: { $ne: 'Completed' }
        })

        res.status(200).json({ totalTasks, completeTasks, pendingTasks, overdueTasks });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Something went wrong', error: err });
    }
};

const getUserStats = async (req, res)=>{
    try {
        const totalUsers = await User.countDocuments();
        const admins = await User.countDocuments({ role: 'Admin' });
        const managers = await User.countDocuments({ role: 'Manager' });
        const regularUsers = await User.countDocuments({ role: 'User' });

        res.status(200).json({ totalUsers, admins, managers, regularUsers });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Something went wrong', error: err });
    }
};

const getAdminDashboard = async (req, res)=>{
    try {
        const totalUsers = await User.countDocuments();
        const admins = await User.countDocuments({ role: 'Admin' });
        const managers = await User.countDocuments({ role: 'Manager' });
        const regularUsers = await User.countDocuments({ role: 'User' });


        const totalTasks = await Task.countDocuments();
        const completeTasks = await Task.countDocuments({ status: 'Completed' });
        const pendingTasks = await Task.countDocuments({ status: 'Not Completed' });
        const overdueTasks = await Task.countDocuments({
            dueDate: { $lt: new Date() },
            status: { $ne: 'Completed' }
        })

        const totalTeams = await Team.countDocuments();
        const archievedTeams = await Team.countDocuments({ isArchived: true });
        const activeTeams = totalTeams - archievedTeams;

        res.status(200).json({
            userStats: { totalUsers, admins, managers, regularUsers },
            taskStats: { totalTasks, completeTasks, pendingTasks, overdueTasks },
            teamStats: { totalTeams, archievedTeams, activeTeams }
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

module.exports = { getTaskStats, getUserStats, getAdminDashboard };