// Vercel serverless function — the static SPA's index.html can't carry a
// dynamic business name, since social-media crawlers (WhatsApp, Facebook,
// Twitter, ...) fetch the page as plain HTML and never run the JS that
// updates <title> via react-helmet-async. vercel.json routes those crawler
// user-agents here instead of to index.html, so the link preview reflects
// whatever business name is live in Site Settings right now.

interface SiteSettings {
  businessName?: string;
  heroHeadline?: string;
  heroSubheadline?: string;
  logoUrl?: string | null;
  heroImageUrl?: string | null;
}

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export default async function handler(req: { headers: Record<string, string | string[] | undefined> }, res: {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => { send: (body: string) => void };
}) {
  const apiBase = (process.env.VITE_API_URL || 'https://backend-six-teal-83.vercel.app/api').replace(/\/$/, '');

  let settings: SiteSettings | null = null;
  try {
    const response = await fetch(`${apiBase}/settings`);
    if (response.ok) settings = (await response.json()) as SiteSettings;
  } catch {
    // Network hiccup fetching settings — fall through to generic defaults below.
  }

  const businessName = settings?.businessName || 'Event Management';
  const description =
    settings?.heroSubheadline || `${businessName} — premium event management, wedding planning &amp; catering.`;
  const image = settings?.heroImageUrl || settings?.logoUrl || '';
  const host = req.headers.host as string | undefined;
  const url = host ? `https://${host}/` : '';

  const title = escapeHtml(businessName);
  const desc = escapeHtml(description);

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=3600');
  res.status(200).send(`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${title}</title>
<meta name="description" content="${desc}">
<meta property="og:type" content="website">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
${url ? `<meta property="og:url" content="${escapeHtml(url)}">` : ''}
${image ? `<meta property="og:image" content="${escapeHtml(image)}">` : ''}
<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${desc}">
${image ? `<meta name="twitter:image" content="${escapeHtml(image)}">` : ''}
</head>
<body></body>
</html>`);
}
