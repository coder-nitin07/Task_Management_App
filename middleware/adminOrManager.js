const adminOrManager = (allowedRoles) => {
    return (req, res, next) => {
      
      // user should be authenticated
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized: User not logged in" });
      }
  
      // Checking the user's role is allowed
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: "Forbidden: Access denied" });
      }
  
      next();
    };
  };
  
module.exports = adminOrManager;  