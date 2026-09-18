const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const apiFetch = (path, options = {}) => {
  const headers = new Headers(options.headers || {});
  const bodyIsFormData = options.body instanceof FormData;

  if (options.body && !bodyIsFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const url = path.startsWith("http") ? path : `${backendUrl}${path}`;

  return fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });
};
