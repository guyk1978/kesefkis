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
      )}&select=title,description,image_url`,
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

    const title = listing.title || 'מודעה בכסף כיס'

    const description =
      listing.description ||
      'לוח עבודות, שירותים ופריטים מקומיים'

    const imageUrl = listing.image_url
      ? new URL(listing.image_url, context.request.url).toString()
      : new URL('/icon.png', context.request.url).toString()

    const shareUrl = new URL(
      `/share/${encodeURIComponent(id)}`,
      context.request.url
    )

    const listingUrl = new URL(
      `/מודעה/${encodeURIComponent(id)}`,
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
  <meta property="og:site_name" content="כסף כיס" />
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

  <title>${escapeHtml(title)} - כסף כיס</title>
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