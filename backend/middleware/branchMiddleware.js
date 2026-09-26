const jwt = require("jsonwebtoken");
const { getDBConnection } = require("../config/dbManager");
const { getTokenFromRequest } = require("../config/authCookie");
const { authLog, requestMeta } = require("../utils/authLog");

module.exports = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      authLog("branch_verify_fail", { reason: "no_cookie", ...requestMeta(req) });
      return res.status(401).json({ message: "Authentication cookie missing" });
    }

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
    authLog("branch_verify_fail", {
      reason: err.name || "error",
      message: err.message,
      ...requestMeta(req),
    });
    console.error("Branch middleware error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
