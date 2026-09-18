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

  // Don't redirect for login/authentication requests.
  // 401 is a normal response here when credentials are invalid.
  const isLoginRequest = url.includes("/api/auth/login/");

  // Redirect only when an already-authenticated page
  // makes a protected request and its session is invalid.
  if (
    response.status === 401 &&
    !isLoginRequest &&
    window.location.pathname !== "/login"
  ) {
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("branch");

    window.location.href = "/login";
  }

  return response;
};