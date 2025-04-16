// middleware/roleMiddleware.js

const adminOrManager = (allowedRoles) => {
    return (req, res, next) => {
      // Ensure user is authenticated
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized: User not logged in" });
      }
  
      // Check if user's role is allowed
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: "Forbidden: Access denied" });
      }
  
      next(); // User is allowed, move on
    };
  };
  
module.exports = adminOrManager;  