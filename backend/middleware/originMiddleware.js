const allowedOrigins = (process.env.CLIENT_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

module.exports = (req, res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();

  const origin = req.get("origin");
  if (origin && !allowedOrigins.includes(origin)) {
    return res.status(403).json({ message: "Origin not allowed" });
  }

  next();
};
