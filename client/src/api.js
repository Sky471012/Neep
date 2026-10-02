// Local dev calls the backend directly (client/.env, e.g. http://localhost:5000).
// Production builds always call their own origin: Vercel forwards /api and
// /uploads to Render (see client/vercel.json). Keeping every request
// same-origin makes the neep_auth cookie first-party, so browsers
// (Brave, Chrome, Safari) keep it instead of deleting third-party cookies.
const devBase = import.meta.env.DEV ? (import.meta.env.VITE_BACKEND_URL || "") : "";

const withoutOrigin = (path) => {
  if (typeof path !== "string" || !/^https?:\/\//i.test(path)) return path;
  try {
    const url = new URL(path);
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return path;
  }
};

export const apiUrl = (path) => `${devBase}${withoutOrigin(path)}`;

const SESSION_KEYS = ["role", "user", "branch", "branches"];

export const clearStoredSession = () => {
  SESSION_KEYS.forEach((key) => localStorage.removeItem(key));
};

// 401 bodies that mean "this session is dead" (verifyToken and
// branchMiddleware), as opposed to login failures like "Invalid credentials".
const SESSION_EXPIRED_MESSAGES = new Set([
  "No token provided",
  "Invalid token",
  "Authentication cookie missing",
  "Invalid or expired token",
]);

// Shared by apiFetch and the axios interceptor in main.jsx: clear the local
// session and let listeners (Navbar) drop UI state / leave the page.
export const noteAuthFailure = (status, data) => {
  if (status !== 401 || !SESSION_EXPIRED_MESSAGES.has(data?.message)) return;
  clearStoredSession();
  window.dispatchEvent(new Event("authExpired"));
};

export const apiFetch = async (path, options = {}) => {
  const headers = new Headers(options.headers || {});
  const bodyIsFormData = options.body instanceof FormData;

  if (options.body && !bodyIsFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(apiUrl(path), {
    ...options,
    headers,
    credentials: "include",
  });

  if (response.status === 401) {
    try {
      noteAuthFailure(401, await response.clone().json());
    } catch {
      // Unreadable body → nothing to identify it as a session failure.
    }
  }

  return response;
};
