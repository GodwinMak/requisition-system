const jwt = require("jsonwebtoken");
const db = require("../models");
const Users = db.user;

/**
 * Verify JWT token and attach user to request
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database to ensure they still exist and get current role
    console.log(decoded);
    const user = await Users.findByPk(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: "User account is deactivated" });
    }

    // If the user changed their password after the token was issued, reject the token
    if (user.passwordChangedAt) {
      const tokenIat = decoded.iat; // issued at (seconds)
      const pwdChangedAtSec = Math.floor(new Date(user.passwordChangedAt).getTime() / 1000);
      if (tokenIat < pwdChangedAtSec) {
        return res.status(401).json({ message: "Password changed. Please login again." });
      }
    }

    // Attach user and permissions to request
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    console.error("Auth middleware error:", error);
    return res.status(500).json({ message: "Authentication error" });
  }
};

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: "Access denied. Insufficient permissions.",
        requiredRoles: allowedRoles,
        yourRole: req.user.role
      });
    }

    next();
  };
};

const adminOnly = requireRole("admin");

module.exports = {
  verifyToken,
  adminOnly,
};