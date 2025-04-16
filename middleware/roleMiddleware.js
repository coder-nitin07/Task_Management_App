const Team = require("../models/teamSchema");

const checkAdminOrManager = async (req, res, next)=>{
    try {
        const teamID = req.params.id  || req.body.teamID || req.body.teamId;
        const team = await Team.findById(teamID);
        // console.log("team, is", team);

        if(!team){
            return res.status(404).json({ message: 'Team not found' });
        }

        if(!team.manager){
            return res.status(400).json({ message: 'Manager is missing from the Team.' });
        }

        // check if the user if Admin or manager
        if(team.manager.toString() === req.user.id || req.user.role === 'Admin'){
            return next();
        }

        return res.status(403).json({ message: 'You are not authorized to update this Team' });
    } catch (err) {
        console.log(err);
        res.status(400).json({ error: err, message: 'Something went wrong' });
    }
};

module.exports = checkAdminOrManager;