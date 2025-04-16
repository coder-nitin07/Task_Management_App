const Task = require("../models/taskSchema");
const Team = require("../models/teamSchema");
const { getIO } = require('../socket/socket');

const createTask = async (req, res)=>{
    try {
        const { title, description, dueDate, priority, status, teamId } = req.body;
        const userId = req.body.assignedTo;

        const mandatoryFields = [ 'title', 'description', 'dueDate' ];

        const missingFields = mandatoryFields.filter((fields) => !Object.keys(req.body).includes(fields));

        const team = await Team.findById(teamId);
        if(!team){
            return res.status(404).json({ message: 'Team not found' });
        }

        console.log("userID is are ", userId);
        const isUserInTeam = team.members.includes(userId);

        if(!isUserInTeam){
            return res.status(401).json({ message: 'This user is not a member of the specified team, so the task cannot be assigned to them.' })
        }

        if(missingFields.length > 0){
            // throw new Error('Fields are missing');
            throw new Error(`Missing fields: ${missingFields.join(", ")}`);
        }

        const taskData = { 
            title, 
            description, 
            dueDate, 
            priority,
            status,
            assignedTo: userId,
            teamId
        };

        const newTask = await Task.create(taskData);

         try {
            // Emit event only if task creation is successful
            const io = getIO();
            io.emit('taskCreated', newTask);
        } catch (err) {
            console.log('Socket Emit Error:', err);
            // Optionally, continue execution and return success even if socket.emit fails
        }
        res.status(201).json({ message: 'Task successfully created', task: newTask });
    } catch (err) {
        console.log(err);
        res.status(400).json({ error: err, message: 'Something went wrong' });
    }
};

const getAllTasks = async (req, res)=>{
    try {
        const tasks = await Task.find({ assignedTo: req.user._id });

        if(tasks.length === 0){
            return res.status(200).json({ message: 'No Tasks found' });
        }

        res.status(200).json({ tasks });
    } catch (err) {
        console.log(err);
        res.status(400).json({ error: err, message: 'Something went wrong' });
    }
};

const updateTask = async (req, res)=>{
    try {
        const { id } = req.params;
        const { title, description, dueDate, priority, status } = req.body;

        // find the task by the userID
        const task = await Task.findById(id);

        if(!task){
            return res.status(404).json({ message: 'Task not found' });
        }

        if(req.user.role === 'User'){
            if(task.assignedTo.toString() !== req.user._id.toString()){
                return res.status(404).json({ message: 'You can only update your own task.' });
            }
        } else if(req.user.role === 'Manager'){
            const team = await Team.findById(task.teamId);

            if(!team || team.manager.toString() !== req.user._id.toString() ){
                return res.status(403).json({ message: 'You can only update from your own team task not others team tasks' });
            }
        } else{
            if(req.user.role !== 'Admin'){
                return res.status(400).json({ message: 'Unauthorized role' });
            }
        }
     

        task.title = req.body.title || task.title;
        task.description = req.body.description || task.description;
        task.dueDate = req.body.dueDate || task.dueDate;
        task.priority = req.body.priority || task.priority;
        task.status = req.body.status || task.status;

        await task.save();

       try {
            const io = getIO();
            io.emit('taskUpdated', {
                taskId: task._id,
                title: task.title,
                updatedBy: req.user._id,
                updatedAt: new Date(),
            });
       } catch (error) {
            console.log("scoket emit erro in UpdteTask", error);
       }

        res.status(200).json({ message: 'Task Updated Successfully', task });
    } catch (err) {
        console.log(err);
        res.status(400).json({ error: err, message: 'Something went wrong' });
    }
};

const deleteTask = async (req, res)=>{
    try {
        const { id } = req.params;
        
        const task = await Task.findById(id);

        if(!task){
            return res.status(404).json({ message: 'Task not found' });
        }

        // we check that the user really owner of the task or not
        console.log(task.assignedTo.toString(), "this si the assigned String");
        console.log(req.user._id.toString(), "this si the userID String");
        
        if(task.assignedTo.toString() !== req.user._id.toString() ){
            return res.status(403).json({ message: 'You can only update your own task not others task' });
        }

        // await Task.findByIdAndDelete(id); 

        // or you can delete the task bt this -

        await task.deleteOne();

        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (err) {
        console.log(err);
        res.status(400).json({ error: err, message: 'Something went wrong' });
    }
};

const assignTaskToTeam = async (req, res)=>{
    try {
        const { taskID, userID, teamID } = req.body;

        const team = await Team.findOne({
            members: userID,
            _id: teamID
        });

        if(!team){
            return res.status(404).json({ message: 'User does not belong to this team' });
        }

        const task = await Task.findById(taskID);
        if(!task){
            return res.status(404).json({ message: 'Task not found' });
        }

        task.assignedTo = userID;
        task.teamId = teamID;

        await task.save();

        res.status(200).json({ message: 'Task successfully assigned to the user', task });
    } catch (err) {
        console.log(err);
        res.status(400).json({ message: 'Error assign Task to the Teams', error: err });
    }
};

const getTaskDetails = async (req, res)=>{
    try {
        const id = req.params.id;

        const taskId = await Task.findById(id)
            .populate('assignedTo', 'userName email')
            .populate('teamId', 'teamName manager');
            //  We use poplate to fetch the data assigned user and team data in an array.

        if(!taskId){
            return res.status(404).json({ message: 'Task not found' });
        }

        const user = req.user;

        if(user.role === 'User'){
            if(taskId.assignedTo._id.toString() !== user._id.toString()){ // comparing the taskUserID with the userID who trying to get the details
                return res.status(403).json({ message: 'Access denied: Fetch data only your assigned task' });
            }
        } else if(user.role === 'Manager'){
            if(taskId.assignedTo._id.toString() !== user._id.toString()){
                return res.status(403).json({ message: 'Access denied: Fetch the details only your Team assigned task.' })
            }
        } else{
            if(user.role !== 'Admin'){
                return res.status(403).json({ message: 'Access denied: Unauthorized role' });
            }
        }

        res.json({ taskId });
    } catch (err) {
        console.log(err);
        res.status(404).json({ error: err, message: 'Something went wrong' });
    }
};

const filterTheTasks = async (req, res) => {
    try {
        const { status, priority, dueBefore } = req.query;

        let filter = {};

        if (status) filter.status = status;
        if (priority) filter.priority = priority;
        if (dueBefore) {
            filter.dueDate = { $lte: new Date(dueBefore) };
        }

        let tasks = await Task.find(filter)
            .populate('assignedTo', 'userName email')
            .populate('teamId', 'manager');

        const user = req.user;

        if (user.role === 'User') {
            const userTasks = tasks.filter(task => task.assignedTo._id.toString() === user._id.toString());
        
            if (userTasks.length === 0) {
                return res.status(403).json({ message: 'You can only access your assigned data' });
            }
        
            tasks = userTasks;
        }else if (user.role === 'Manager') {
            const userTasks = tasks.filter(task => task.teamId.manager.toString() === user._id.toString());
            
            if (userTasks.length === 0) {
                return res.status(403).json({ message: 'You can only access your Team assigned data' });
            }
        
            tasks = userTasks;
        } else if (user.role !== 'Admin') {
            return res.status(403).json({ message: 'Access denied: Unauthorized role' });
        }

        if (tasks.length === 0) {
            return res.status(200).json({ tasks: [], message: 'No tasks found or assigned to you' });
        }

        res.send({ tasks });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err, message: 'Something went wrong' });
    }
};

module.exports = { createTask, getAllTasks, updateTask, deleteTask, assignTaskToTeam, getTaskDetails, filterTheTasks };