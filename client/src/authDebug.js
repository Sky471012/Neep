const STORAGE_KEY = "neep_auth_debug";
const MAX_ENTRIES = 300;

const readList = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

// Append a timestamped entry to a localStorage ring buffer.
// Consecutive identical events are collapsed (count + latest timestamp) so
// long-lived tabs do not flood the buffer.
export const logAuth = (event, details = {}) => {
  const now = new Date().toISOString();
  const sig = JSON.stringify(details);

  try {
    console.debug("[auth]", event, details);

    const list = readList();
    const last = list[list.length - 1];

    if (last && last.event === event && last.sig === sig) {
      last.t = now;
      last.count = (last.count || 1) + 1;
    } else {
      list.push({
        t: now,
        // Which site is running (Vercel preview vs custom domain) and which
        // backend it was built against (VITE_BACKEND_URL is baked in at build
        // time, and Preview/Production scopes can differ).
        page: window.location.host,
        api: import.meta.env.VITE_BACKEND_URL || "(same-origin)",
        path: window.location.pathname,
        online: navigator.onLine,
        vis: document.visibilityState,
        event,
        details,
        sig,
      });
      while (list.length > MAX_ENTRIES) list.shift();
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // logging must never break the app
  }
};

export const readAuthLog = () => readList();

export const clearAuthLog = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
};
