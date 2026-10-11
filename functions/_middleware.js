function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);
  const userAgent = request.headers.get("user-agent") || "";

  const isCrawler =
    /facebookexternalhit|facebot|facebookcatalog|whatsapp|twitterbot|telegrambot|linkedinbot|slackbot|discordbot|pinterest/i.test(userAgent);

  if (!isCrawler || request.method !== "GET") {
    return context.next();
  }

  let pathname;

  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    return context.next();
  }

  const prefix = "/\u05e4\u05e8\u05e1\u05d5\u05dd/";

  if (!pathname.startsWith(prefix)) {
    return context.next();
  }

  const slug = pathname.slice(prefix.length).replace(/\/$/, "");

  if (!slug || slug.includes("/")) {
    return context.next();
  }

  const supabaseUrl = context.env.VITE_SUPABASE_URL;
  const supabaseKey = context.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Promotional share metadata: Supabase environment variables are missing.");
    return context.next();
  }

  try {
    const apiUrl = new URL("/rest/v1/promotional_pages", supabaseUrl);
    apiUrl.searchParams.set("slug", `eq.${slug}`);
    apiUrl.searchParams.set("is_published", "eq.true");
    apiUrl.searchParams.set("select", "slug,title,description,image_url");
    apiUrl.searchParams.set("limit", "1");

    const response = await fetch(apiUrl.toString(), {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });

    if (!response.ok) {
      console.error("Promotional share metadata lookup failed:", response.status);
      return context.next();
    }

    const pages = await response.json();
    const page = pages?.[0];

    if (!page) {
      return context.next();
    }

    const siteName = "\u05db\u05e1\u05e3 \u05db\u05d9\u05e1";
    const title = page.title || siteName;
    const description =
      page.description ||
      "\u05dc\u05d5\u05d7 \u05e2\u05d1\u05d5\u05d3\u05d5\u05ea, \u05e9\u05d9\u05e8\u05d5\u05ea\u05d9\u05dd \u05d5\u05e4\u05e8\u05d9\u05d8\u05d9\u05dd \u05de\u05e7\u05d5\u05de\u05d9\u05d9\u05dd";

    let imageUrl;

    try {
      imageUrl = page.image_url
        ? new URL(page.image_url, url.origin).href
        : new URL("/icon.png", url.origin).href;
    } catch {
      imageUrl = new URL("/icon.png", url.origin).href;
    }

    const canonicalUrl = url.href;

    const html = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)} | ${siteName}</title>
<meta name="description" content="${escapeHtml(description)}">
<link rel="canonical" href="${escapeHtml(canonicalUrl)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${siteName}">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:image" content="${escapeHtml(imageUrl)}">
<meta property="og:url" content="${escapeHtml(canonicalUrl)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:image" content="${escapeHtml(imageUrl)}">
</head>
<body dir="rtl">
<h1>${escapeHtml(title)}</h1>
<p>${escapeHtml(description)}</p>
<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(title)}">
<p><a href="${escapeHtml(canonicalUrl)}">${siteName}</a></p>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=UTF-8",
        "Cache-Control": "public, max-age=300",
        "Vary": "User-Agent",
      },
    });
  } catch (error) {
    console.error("Promotional share metadata error:", error);
    return context.next();
  }
}