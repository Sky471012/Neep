const requestMeta = (req) => ({
  method: req?.method,
  path: req?.originalUrl || req?.url,
  origin: req?.get?.("origin") || undefined,
  ua: (req?.get?.("user-agent") || "").slice(0, 60) || undefined,
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
