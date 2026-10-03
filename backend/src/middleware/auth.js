const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function protect(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    if (!auth.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication token is required" });
    }

    const decoded = jwt.verify(auth.slice(7), process.env.JWT_SECRET);
    const user = await User.findById(decoded.sub);

    if (!user || !user.active) {
      return res.status(401).json({ message: "User is not available" });
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired authentication token" });
  }
}

function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You are not authorized for this resource" });
    }
    next();
  };
}

module.exports = { protect, allowRoles };
