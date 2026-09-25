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

const setAuthCookie = (res, token) => {
  res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
};

const clearAuthCookie = (res) => {
  res.clearCookie(AUTH_COOKIE_NAME, getAuthCookieOptions());
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
