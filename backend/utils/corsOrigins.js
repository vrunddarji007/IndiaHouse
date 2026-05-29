/** Comma-separated FRONTEND_URL values, e.g. https://app.vercel.app,http://localhost:4200 */
function getCorsOrigins() {
  const raw = process.env.FRONTEND_URL || 'http://localhost:4200';
  return raw
    .split(',')
    .map((s) => s.trim().replace(/\/$/, ''))
    .filter(Boolean);
}

module.exports = { getCorsOrigins };
