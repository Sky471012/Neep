const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "neep_auth";

const getAuthCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.AUTH_COOKIE_SECURE === "true",
  sameSite: process.env.AUTH_COOKIE_SAME_SITE || "lax",
  path: "/",
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
  getAuthCookieOptions,
  setAuthCookie,
  clearAuthCookie,
  getTokenFromRequest,
};
