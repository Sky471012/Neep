const { authLog } = require("../utils/authLog");

const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "neep_auth";

const AUTH_MAX_AGE_MS = Number(
  process.env.AUTH_COOKIE_MAX_AGE_MS || 7 * 24 * 60 * 60 * 1000
);

const getAuthCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.AUTH_COOKIE_SECURE === "true",
  sameSite: process.env.AUTH_COOKIE_SAME_SITE || "lax",
  path: "/",
  maxAge: AUTH_MAX_AGE_MS,
});

const decodeExp = (token) => {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const parsed = JSON.parse(Buffer.from(payload, "base64").toString("utf8"));
    return parsed?.exp || null;
  } catch {
    return null;
  }
};

const setAuthCookie = (res, token) => {
  const options = getAuthCookieOptions();
  res.cookie(AUTH_COOKIE_NAME, token, options);

  const exp = decodeExp(token);
  authLog("cookie_set", {
    maxAgeMs: options.maxAge,
    secure: options.secure,
    sameSite: options.sameSite,
    jwtExpiresAt: exp ? new Date(exp * 1000).toISOString() : "none",
    ttlSec: exp ? exp - Math.floor(Date.now() / 1000) : null,
  });
};

const clearAuthCookie = (res) => {
  res.clearCookie(AUTH_COOKIE_NAME, getAuthCookieOptions());
  authLog("cookie_clear", {});
};

const getTokenFromRequest = (req) => req.cookies?.[AUTH_COOKIE_NAME];

module.exports = {
  AUTH_COOKIE_NAME,
  AUTH_MAX_AGE_MS,
  getAuthCookieOptions,
  setAuthCookie,
  clearAuthCookie,
  getTokenFromRequest,
};
