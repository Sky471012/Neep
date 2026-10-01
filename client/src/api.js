// Local dev calls the backend directly (client/.env, e.g. http://localhost:5000).
// Production builds always call their own origin: Vercel forwards /api and
// /uploads to the Render backend (see client/vercel.json). Keeping every
// request same-origin makes the neep_auth cookie first-party, so browsers
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

export const apiFetch = (path, options = {}) => {
  const headers = new Headers(options.headers || {});
  const bodyIsFormData = options.body instanceof FormData;

  if (options.body && !bodyIsFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(apiUrl(path), {
    ...options,
    headers,
    credentials: "include",
  });
};
