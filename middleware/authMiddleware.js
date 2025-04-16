const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next)=>{
    const token = req.header('Authorization') && req.header('Authorization').split(' ')[1];
    
    if(!token){
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try{
        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        req.user = decoded;
        // console.log(req.user, "this is req.user");

        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = authMiddleware;