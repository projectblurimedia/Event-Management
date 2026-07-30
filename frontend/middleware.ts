// Vercel Edge Middleware — runs BEFORE static file resolution, which is
// what a plain vercel.json rewrite cannot do for "/" (Vercel always serves
// the literal index.html for the root path before evaluating rewrites).
// Social-media link-preview crawlers (WhatsApp, Facebook, Twitter, ...)
// fetch the page as plain HTML and never run the JS that updates <title>
// via react-helmet-async, so without this they'd always see the static
// build's fallback title instead of the live business name. Only known
// non-JS-executing crawler user-agents are intercepted — everyone else
// (including Googlebot, which does render JS) falls through to the normal
// SPA untouched.

export const config = {
  matcher: '/((?!assets|favicon\\.svg).*)',
};

const CRAWLER_UA =
  /facebookexternalhit|WhatsApp|Twitterbot|LinkedInBot|TelegramBot|Slackbot|Discordbot|SkypeUriPreview|Pinterest|redditbot|Iframely|Embedly/i;

interface SiteSettings {
  businessName?: string;
  heroSubheadline?: string;
  logoUrl?: string | null;
  heroImageUrl?: string | null;
}

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export default async function middleware(request: Request) {
  const userAgent = request.headers.get('user-agent') || '';
  if (!CRAWLER_UA.test(userAgent)) return; // not a link-preview crawler — serve the normal SPA

  let settings: SiteSettings | null = null;
  try {
    const apiBase = (process.env.VITE_API_URL || 'https://backend-six-teal-83.vercel.app/api').replace(/\/$/, '');
    const response = await fetch(`${apiBase}/settings`, { signal: AbortSignal.timeout(3000) });
    if (response.ok) settings = (await response.json()) as SiteSettings;
  } catch {
    // Settings fetch failed/timed out — fall through to generic defaults below.
  }

  const businessName = settings?.businessName || 'Event Management';
  const description =
    settings?.heroSubheadline || `${businessName} — premium event management, wedding planning & catering.`;
  const image = settings?.heroImageUrl || settings?.logoUrl || '';
  const title = escapeHtml(`${businessName} | Premium Event Management & Catering`);
  const desc = escapeHtml(description);

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${title}</title>
<meta name="description" content="${desc}">
<meta property="og:type" content="website">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
${image ? `<meta property="og:image" content="${escapeHtml(image)}">` : ''}
<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}">
</head>
<body></body>
</html>`;

  return new Response(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 's-maxage=120, stale-while-revalidate=600',
    },
  });
}
