const requestMeta = (req) => ({
  method: req?.method,
  path: req?.originalUrl || req?.url,
  // Which hostname the client actually called (two Render hostnames or a
  // Vercel preview with a different VITE_BACKEND_URL show up here).
  host: req?.get?.("host") || undefined,
  origin: req?.get?.("origin") || undefined,
  // Real client IP behind Cloudflare — tells two devices apart.
  ip: req?.get?.("cf-connecting-ip") || req?.ip || undefined,
  ua: (req?.get?.("user-agent") || "").slice(0, 120) || undefined,
});

// Single-line JSON so it is easy to grep in the Render log stream.
// Never log the token itself.
const authLog = (event, details = {}) => {
  if (process.env.AUTH_LOG === "false") return;

  console.log(
    `[auth] ${JSON.stringify({
      t: new Date().toISOString(),
      event,
      ...details,
    })}`
  );
};

module.exports = { authLog, requestMeta };
