const jwt = require("jsonwebtoken");
const { getDBConnection } = require("../config/dbManager");
const { getTokenFromRequest } = require("../config/authCookie");

module.exports = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);
    if (!token)
      return res.status(401).json({ message: "Authentication cookie missing" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const branch = decoded.branch;
    if (!branch)
      return res.status(400).json({ message: "Branch info missing in token" });

    const db = await getDBConnection(branch);
    req.db = db;
    req.branch = branch;
    req.user = decoded;

    next();
  } catch (err) {
    console.error("Branch middleware error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};