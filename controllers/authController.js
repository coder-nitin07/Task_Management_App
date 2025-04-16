const User = require("../models/userSchema");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const Team = require("../models/teamSchema");
const Task = require("../models/taskSchema");

const register = async (req, res)=>{
    try {
        const { userName, email, password, role } = req.body;

        const mandatoryFields = [ 'userName', 'email', 'password' ];

        const isAllowed = mandatoryFields.filter((k)=> !Object.keys(req.body).includes(k));

        if(isAllowed.length > 0) {
            throw new Error(`Missing fields: ${isAllowed.join(', ')}`);
        }

        if(!(req.body.userName.length >= 3 && req.body.userName.length <= 20)){
            res.status(400).send("Name should have atleast 3 char and atmost 20 char");
            throw new Error('Name should have atleast 3 char and atmost 20 char');
        }

        if(!validator.isEmail(req.body.email)) {
            res.status(400).send("Invalid Email");
            throw new Error('Invalid Email');
        }        
        
        if(!validator.isStrongPassword(req.body.password)){
            res.status(400).send("Weak Password");
            throw new Error('Weak Password');
        }

      

        // hash the password
        const hashPassword = await bcrypt.hash(password, 10);

        // Create the user with hash password
        const userData = { userName, email, password: hashPassword, role };

        await User.create(userData);
        res.status(201).json({ message: 'User successfully registered' });
    } catch (err) {
        console.log(err);
        res.status(400).json({ error: err, msg: 'Something went wrong' });
    }
};

const login = async (req, res)=>{
    try {
        const { userName, password } = req.body;
        const secretKey = process.env.SECRET_KEY;

        const user = await User.findOne({ userName: userName });

        if(!user){
            return res.status(401).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(401).json({ message: 'Invalid Credentails' });
        }

        // Create the payload for the JWT token
        const payload = { _id: user.id, userName: user.userName, role: user.role };

        // Create the JWT token with teh payload and secret key
        const jwtToken = jwt.sign(payload, secretKey, { expiresIn: '1h' });

        res.send({ token:  jwtToken });
    } catch (err) {
        console.log(err);
        res.status(400).json({ error: err, message: 'Something went wrong' });
    }
};

const getProfile = async (req, res)=>{
    try {
        const userID = req.params.id;
        const user = await User.findById(userID).select('-password')
       
        const tasks = await Task.find({ assignedTo: userID })
                .populate('teamId', 'teamName manager')
                .select('title description dueDate status');
    
        const requestUser = req.user;

        if (requestUser.role === 'User' && requestUser._id.toString() !== userID) {
            return res.status(403).json({ message: 'You can only access your own profile' });
        }

        if(requestUser.role === 'Manager'){
            const team = await Team.findOne({
                manager: requestUser._id,
                members: userID
            })

            if(!team){
                return res.status(403).json({ message: 'You can only access the profile of your team Users' });
            }
        }

        if(!user){
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ user, assignTasks: tasks });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err, message: 'Something went wrong' });
    }
};

const updateProfile = async (req, res)=>{
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        const { userName, password, role } = req.body;

        console.log("Uer Id is", user, "and the id" ,id);
        if(!user){
            return res.status(404).json({ message: 'User not found' });
        }

        if(!(userName.length >= 3 && userName.length <= 20)){
            res.status(400).send("Name should have atleast 3 char and atmost 20 char");
            throw new Error('Name should have atleast 3 char and atmost 20 char');
        }

        if(password && !validator.isStrongPassword(password)){
            res.status(400).send("Weak Password");
            throw new Error('Weak Password');
        }

        if (userName) {
            user.userName = userName;
        }

        if(password){
            user.password = await bcrypt.hash(password, 10);
        }

        if(req.user.role === 'Admin' && role){
            user.role = role;
        }

        await user.save();
        res.json({ message: 'userupdated ussscesflly', user });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err, message: 'Something went wrong' });
    }
};

module.exports = { register, login, getProfile, updateProfile };