const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Invalid token" });
    req.user = decoded;
    next();
  });
};

exports.isStudent = (req, res, next) => {
  if (req.user.role !== 'student') return res.status(403).send("Access denied");
  next();
};

exports.isTeacher = (req, res, next) => {
  if (req.user.role !== 'teacher') return res.status(403).send("Access denied");
  next();
};

exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).send("Access denied");
  next();
};