export async function onRequestGet(context) {
  const { id } = context.params

  if (!id) {
    return new Response('Missing listing ID', { status: 400 })
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
      `${supabaseUrl}/rest/v1/listings?id=eq.${encodeURIComponent(id)}&select=title,description,image_url`,
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
      return new Response('Listing not found', { status: 404 })
    }

    const title = listing.title || 'מודעה בכסף כיס'
    const description =
      listing.description || 'לוח עבודות, שירותים ופריטים מקומיים'

    const imageUrl =
      listing.image_url || `${new URL('/icon.png', context.request.url)}`

    const shareUrl = new URL(`/share/${encodeURIComponent(id)}`, context.request.url)
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

    const html = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8" />

  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="כסף כיס" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${escapeHtml(imageUrl)}" />
  <meta property="og:url" content="${escapeHtml(shareUrl.toString())}" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(imageUrl)}" />

  <title>${escapeHtml(title)} - כסף כיס</title>

  <meta http-equiv="refresh" content="0;url=${escapeHtml(listingUrl.toString())}" />
</head>
<body>
  <script>
    window.location.replace(${JSON.stringify(listingUrl.toString())})
  </script>
  <p>מעביר אתכם למודעה...</p>
</body>
</html>`

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=UTF-8',
        'Cache-Control': 'public, max-age=300',
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