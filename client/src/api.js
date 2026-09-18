const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const apiFetch = async (path, options = {}) => {
  const headers = new Headers(options.headers || {});
  const bodyIsFormData = options.body instanceof FormData;

  if (options.body && !bodyIsFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const url = path.startsWith("http") ? path : `${backendUrl}${path}`;

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  // Session/token is invalid or expired
  if (response.status === 401) {
    localStorage.removeItem("user");
    window.location.href = "/login";
    return response;
  }

  return response;
};