const jwt = require("jsonwebtoken");
const { getTokenFromRequest, setAuthCookie } = require("../config/authCookie");
const { authLog, requestMeta } = require("../utils/authLog");

const JWT_OPTIONS = { expiresIn: process.env.JWT_EXPIRES_IN || "7d" };

const signToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET, JWT_OPTIONS);

// Sliding session: once a token has burned through half of its lifetime,
// re-issue it (and re-set the cookie) so an active user is never logged out
// while they are still using the app.
const slideSession = (res, req, decoded) => {
  const { iat, exp, ...claims } = decoded;
  if (!iat || !exp) return;

  const now = Math.floor(Date.now() / 1000);
  if (exp - now > (exp - iat) / 2) return;

  setAuthCookie(res, signToken(claims));
  authLog("session_slide", {
    ttlLeftSec: exp - now,
    ...requestMeta(req),
  });
};

exports.verifyToken = (req, res, next) => {
  const token = getTokenFromRequest(req);
  if (!token) {
    authLog("verify_fail", { reason: "no_cookie", ...requestMeta(req) });
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      authLog("verify_fail", {
        reason: "invalid_token",
        code: err.name,
        message: err.message,
        ...requestMeta(req),
      });
      return res.status(401).json({ message: "Invalid token" });
    }
    req.user = decoded;
    slideSession(res, req, decoded);
    next();
  });
};

exports.isStudent = (req, res, next) => {
  if (req.user.role !== 'student') return res.status(403).send("Access denied");
  next();
};

exports.isTeacher = (req, res, next) => {
  if (req.user.role !== 'Teacher' && req.user.role !== 'Admin') return res.status(403).send("Access denied");
  next();
};

exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'Admin') return res.status(403).send("Access denied");
  next();
};
