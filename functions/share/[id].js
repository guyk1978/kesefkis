export async function onRequestGet(context) {
  const { id } = context.params

  if (!id) {
    return new Response('Missing listing ID', {
      status: 400,
    })
  }

  const supabaseUrl = context.env.VITE_SUPABASE_URL
  const supabaseAnonKey = context.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return new Response('Supabase environment variables are missing', {
      status: 500,
    })
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/listings?id=eq.${encodeURIComponent(
        id
      )}&select=title,description,image_url,image_urls`,
      {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Supabase request failed: ${response.status}`)
    }

    const listings = await response.json()
    const listing = listings?.[0]

    if (!listing) {
      return new Response('Listing not found', {
        status: 404,
      })
    }

    const title = listing.title || '\u05de\u05d5\u05d3\u05e2\u05d4 \u05d1\u05db\u05e1\u05e3 \u05db\u05d9\u05e1'

    const description =
      listing.description ||
      '\u05dc\u05d5\u05d7 \u05e2\u05d1\u05d5\u05d3\u05d5\u05ea, \u05e9\u05d9\u05e8\u05d5\u05ea\u05d9\u05dd \u05d5\u05e4\u05e8\u05d9\u05d8\u05d9\u05dd \u05de\u05e7\u05d5\u05de\u05d9\u05d9\u05dd'

    const imageValue = listing.image_url || (
      Array.isArray(listing.image_urls)
        ? listing.image_urls.find((url) => typeof url === 'string' && url.trim())
        : null
    )

    const imageUrl = imageValue
      ? new URL(imageValue, context.request.url).toString()
      : new URL('/icon.png', context.request.url).toString()

    const shareUrl = new URL(
      `/share/${encodeURIComponent(id)}`,
      context.request.url
    )

    const listingUrl = new URL(
      `/\u05de\u05d5\u05d3\u05e2\u05d4/${encodeURIComponent(id)}`,
      context.request.url
    )

    const escapeHtml = (value) =>
      String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')

    const userAgent =
      context.request.headers.get('User-Agent') || ''

    /*
     * סורקים של רשתות חברתיות צריכים לקבל את
     * HTML ה-Open Graph ישירות, בלי redirect.
     *
     * אחרת Facebook למשל ממשיך ל-/מודעה/ID
     * ושם הוא רואה את ה-HTML הכללי של אפליקציית React.
     */
    const crawlerPatterns = [
      /facebookexternalhit/i,
      /facebot/i,
      /facebookcatalog/i,
      /whatsapp/i,
      /twitterbot/i,
      /telegrambot/i,
      /linkedinbot/i,
      /slackbot/i,
      /discordbot/i,
      /pinterest/i,
    ]

    const isCrawler = crawlerPatterns.some((pattern) =>
      pattern.test(userAgent)
    )

    /*
     * גולש רגיל:
     * redirect אמיתי למודעה הקנונית.
     */
    if (!isCrawler) {
      return Response.redirect(listingUrl.toString(), 302)
    }

    /*
     * סורק רשת חברתית:
     * מחזירים HTML עם כל נתוני השיתוף,
     * בלי meta refresh ובלי JavaScript redirect.
     */
    const html = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8" />

  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="\u05db\u05e1\u05e3 \u05db\u05d9\u05e1" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${escapeHtml(imageUrl)}" />
  <meta property="og:url" content="${escapeHtml(
    shareUrl.toString()
  )}" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(
    description
  )}" />
  <meta name="twitter:image" content="${escapeHtml(imageUrl)}" />

  <link
    rel="canonical"
    href="${escapeHtml(listingUrl.toString())}"
  />

  <title>${escapeHtml(title)} - \u05db\u05e1\u05e3 \u05db\u05d9\u05e1</title>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(description)}</p>
</body>
</html>`

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=UTF-8',
        'Cache-Control': 'public, max-age=300',
        'Vary': 'User-Agent',
      },
    })
  } catch (error) {
    console.error('Share preview error:', error)

    return new Response('Unable to load listing', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain; charset=UTF-8',
      },
    })
  }
}