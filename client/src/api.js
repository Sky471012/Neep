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

  // Don't redirect for authentication/login APIs.
  // 401 from these endpoints means invalid credentials/OTP,
  // not an expired logged-in session.
  const isAuthRequest = new URL(url).pathname.startsWith("/api/auth/");

  if (response.status === 401 && !isAuthRequest) {
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("branch");

    window.location.href = "/login";
    return response;
  }

  return response;
};