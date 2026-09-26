const jwt = require("jsonwebtoken");
const { getTokenFromRequest, setAuthCookie } = require("../config/authCookie");
const { authLog, requestMeta } = require("../utils/authLog");

const JWT_OPTIONS = { expiresIn: process.env.JWT_EXPIRES_IN || "7d" };

const signToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET, JWT_OPTIONS);

// The server-side "the cookie arrived" marker: logged once per session and
// re-logged after any failure, so the log shows exactly which device lost
// its cookie and when (pair with the UA on verify_fail no_cookie lines).
let lastSessionKey = null;
let failureSinceSession = false;

const logSessionSeen = (req, decoded) => {
  const key = `${decoded.id}:${decoded.exp || "legacy"}`;
  if (key === lastSessionKey && !failureSinceSession) return;

  lastSessionKey = key;
  failureSinceSession = false;

  authLog("verify_ok", {
    session: key,
    role: decoded.role,
    branch: decoded.branch,
    ...requestMeta(req),
  });
};

const logVerifyFail = (req, details) => {
  failureSinceSession = true;
  authLog("verify_fail", { ...details, ...requestMeta(req) });
};

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
    logVerifyFail(req, { reason: "no_cookie" });
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      logVerifyFail(req, {
        reason: "invalid_token",
        code: err.name,
        message: err.message,
      });
      return res.status(401).json({ message: "Invalid token" });
    }
    req.user = decoded;
    logSessionSeen(req, decoded);
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
