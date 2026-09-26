import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import App from './App.jsx'
import '@fortawesome/fontawesome-free/css/all.css'
import { logAuth, readAuthLog, clearAuthLog } from './authDebug'
import { apiFetch } from './api'

axios.defaults.withCredentials = true;

localStorage.removeItem("authToken");

const nativeFetch = window.fetch.bind(window);
window.fetch = (input, init = {}) => {
  const headers = new Headers(init.headers || {});
  headers.delete("Authorization");

  return nativeFetch(input, {
    ...init,
    headers,
    credentials: "include",
  });
};

// Diagnostics: run __authLog() in the devtools console to dump the trail.
window.__authLog = readAuthLog;
window.__clearAuthLog = clearAuthLog;

logAuth("app_load", {
  hasLocalUser: Boolean(localStorage.getItem("user")),
  ua: navigator.userAgent.slice(0, 80),
});

document.addEventListener("visibilitychange", () =>
  logAuth("visibility", { state: document.visibilityState })
);
window.addEventListener("online", () => logAuth("network", { online: true }));
window.addEventListener("offline", () => logAuth("network", { online: false }));
window.addEventListener("pageshow", (event) =>
  logAuth("pageshow", { persisted: Boolean(event.persisted) })
);
window.addEventListener("focus", () => logAuth("focus", {}));

// Heartbeat: if it stops, the tab/app was frozen or killed.
setInterval(() => logAuth("heartbeat", {}), 30 * 60 * 1000);

// Session probe: ask the server every 5 minutes whether the cookie still
// arrives, so an overnight loss is pinned to an exact time (and to whether
// the client still believes it is logged in).
const probeSession = () => {
  apiFetch("/api/auth/me")
    .then((res) =>
      logAuth("session_probe", {
        status: res.status,
        local: Boolean(localStorage.getItem("user")),
      })
    )
    .catch((err) => logAuth("session_probe", { error: String(err) }));
};

probeSession();
setInterval(probeSession, 5 * 60 * 1000);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
