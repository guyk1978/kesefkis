import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'

const blank = {
  slug: '',
  title: '',
  description: '',
  image_url: '',
  category: '',
  location: '',
  target_url: '/',
  is_published: false,
}

const field = 'w-full rounded-xl border p-3 text-right'

export function PromotionalPagesAdmin() {
  const [allowed, setAllowed] = useState(false)
  const [checked, setChecked] = useState(false)
  const [pages, setPages] = useState([])
  const [form, setForm] = useState(blank)
  const [editing, setEditing] = useState(null)
  const [message, setMessage] = useState('')

  async function loadPages() {
    const { data, error } = await supabase
      .from('promotional_pages')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) setMessage(error.message)
    else setPages(data || [])
  }

  useEffect(() => {
    let active = true

    async function checkAccess() {
      const { data: auth } = await supabase.auth.getUser()
      if (!auth.user) {
        if (active) setChecked(true)
        return
      }

      const { data } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', auth.user.id)
        .maybeSingle()

      if (!active) return
      setAllowed(!!data)
      setChecked(true)
      if (data) await loadPages()
    }

    checkAccess()
    return () => { active = false }
  }, [])

  function edit(page) {
    setEditing(page.id)
    setForm({
      slug: page.slug || '',
      title: page.title || '',
      description: page.description || '',
      image_url: page.image_url || '',
      category: page.category || '',
      location: page.location || '',
      target_url: page.target_url || '/',
      is_published: !!page.is_published,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function save(event) {
    event.preventDefault()
    setMessage('')

    const slug = form.slug.trim().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\u0590-\u05FF-]/g, '')
      .replace(/-+/g, '-')

    if (!slug || !form.title.trim()) {
      setMessage('יש למלא כותרת וכתובת ייחודית.')
      return
    }

    const payload = {
      ...form,
      slug,
      title: form.title.trim(),
      image_url: form.image_url.trim() || null,
      category: form.category.trim() || null,
      location: form.location.trim() || null,
      updated_at: new Date().toISOString(),
    }

    const result = editing
      ? await supabase.from('promotional_pages').update(payload).eq('id', editing)
      : await supabase.from('promotional_pages').insert(payload)

    if (result.error) {
      setMessage(result.error.code === '23505'
        ? 'הכתובת הזו כבר קיימת.'
        : `שגיאה בשמירה: ${result.error.message}`)
      return
    }

    setMessage('הפרסום נשמר בהצלחה.')
    setForm(blank)
    setEditing(null)
    await loadPages()
  }

  async function remove(page) {
    if (!window.confirm(`למחוק את "${page.title}"?`)) return

    const { error } = await supabase
      .from('promotional_pages')
      .delete()
      .eq('id', page.id)

    setMessage(error ? error.message : 'הפרסום נמחק.')
    if (!error) {
      if (editing === page.id) {
        setEditing(null)
        setForm(blank)
      }
      await loadPages()
    }
  }

  if (!checked) return <main dir="rtl" className="p-6">בודק הרשאות...</main>

  if (!allowed) {
    return (
      <main dir="rtl" className="mx-auto max-w-xl p-6 text-right">
        <h1 className="text-2xl font-bold">ניהול פרסומים</h1>
        <p className="my-4">העמוד מיועד למנהל האתר בלבד.</p>
        <Link to="/">חזרה לאתר</Link>
      </main>
    )
  }

  return (
    <main dir="rtl" className="mx-auto max-w-4xl space-y-6 p-4 text-right">
      <h1 className="text-2xl font-bold">ניהול פרסומים</h1>
      <Link to="/" className="text-teal-700 underline">חזרה לאתר</Link>

      <form onSubmit={save} className="space-y-3 rounded-2xl border p-4">
        <h2 className="text-lg font-bold">{editing ? 'עריכת פרסום' : 'פרסום חדש'}</h2>
        <input className={field} placeholder="כותרת" required value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })} />
        <input className={field} placeholder="כתובת ייחודית באנגלית, למשל local-services"
          required dir="ltr" value={form.slug}
          onChange={e => setForm({ ...form, slug: e.target.value })} />
        <textarea className={field} rows={5} placeholder="תוכן הפרסום"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })} />
        <input className={field} placeholder="כתובת תמונה (URL)" dir="ltr"
          value={form.image_url}
          onChange={e => setForm({ ...form, image_url: e.target.value })} />
        <input className={field} placeholder="קטגוריה" value={form.category}
          onChange={e => setForm({ ...form, category: e.target.value })} />
        <input className={field} placeholder="אזור או יישוב" value={form.location}
          onChange={e => setForm({ ...form, location: e.target.value })} />
        <input className={field} placeholder="נתיב כפתור הפעולה, למשל /"
          dir="ltr" value={form.target_url}
          onChange={e => setForm({ ...form, target_url: e.target.value })} />
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.is_published}
            onChange={e => setForm({ ...form, is_published: e.target.checked })} />
          לפרסם לציבור
        </label>
        <button className="rounded-xl bg-teal-700 px-5 py-3 text-white" type="submit">
          {editing ? 'שמירת שינויים' : 'יצירת פרסום'}
        </button>
        {editing && <button type="button" className="mr-2 rounded-xl border px-4 py-3"
          onClick={() => { setEditing(null); setForm(blank) }}>ביטול</button>}
        {message && <p role="status">{message}</p>}
      </form>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">פרסומים קיימים ({pages.length})</h2>
        {pages.map(page => (
          <article key={page.id} className="rounded-xl border p-4">
            <strong>{page.title}</strong>
            <p className="my-2 text-sm text-gray-600">
              {page.is_published ? 'מפורסם' : 'טיוטה'} · /פרסום/{page.slug}
            </p>
            <button className="ml-3 underline" onClick={() => edit(page)}>עריכה</button>
            {page.is_published && <Link className="ml-3 underline"
              to={`/פרסום/${encodeURIComponent(page.slug)}`} target="_blank">צפייה</Link>}
            <button className="text-red-700 underline" onClick={() => remove(page)}>מחיקה</button>
          </article>
        ))}
      </section>
    </main>
  )
}

export function PromotionalPage({ isModal = false, onClose }) {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [page, setPage] = useState(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let active = true
    supabase.from('promotional_pages').select('*')
      .eq('slug', slug).maybeSingle()
      .then(({ data }) => {
        if (active) {
          setPage(data)
          setLoaded(true)
        }
      })
    return () => { active = false }
  }, [slug])

  useEffect(() => {
    if (!page) return
    document.title = page.title + ' | כסף כיס'
    let meta = document.querySelector('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'description'
      document.head.appendChild(meta)
    }
    meta.content = page.description || page.title
  }, [page])

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title: page.title, url: window.location.href })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        window.alert('הקישור הועתק.')
      }
    } catch (error) {
      if (error.name !== 'AbortError') window.prompt('העתק את הקישור:', window.location.href)
    }
  }

  function wrap(content) {
    if (!isModal) return content

    return (
      <div
        dir="rtl"
        className="fixed inset-0 z-[9999] overflow-y-auto bg-black/60 p-3 sm:p-6"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) onClose?.()
        }}
      >
        <section
          role="dialog"
          aria-modal="true"
          aria-label={page?.title || 'פרסום'}
          className="relative mx-auto my-4 w-full max-w-3xl rounded-2xl bg-white shadow-2xl"
        >
          <button
            type="button"
            aria-label="סגירת הפרסום"
            onClick={onClose}
            className="absolute left-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-2xl shadow"
          >
            ×
          </button>
          {content}
        </section>
      </div>
    )
  }

  if (!loaded) return wrap(<main dir="rtl" className="p-6">טוען פרסום...</main>)
  if (!page) return wrap(<main dir="rtl" className="p-6">הפרסום לא נמצא.</main>)

  return wrap(
    <main dir="rtl" className="mx-auto max-w-3xl p-4 text-right">
      {!isModal && <Link to="/" className="mb-4 inline-block text-teal-700 underline">חזרה לאתר</Link>}
      <article className="overflow-hidden rounded-2xl border bg-white">
        {page.image_url && <img src={page.image_url} alt={page.title}
          className="max-h-[480px] w-full object-cover" />}
        <div className="space-y-4 p-5">
          <h1 className="text-2xl font-bold">{page.title}</h1>
          {(page.category || page.location) &&
            <p className="text-sm text-gray-600">{[page.category, page.location].filter(Boolean).join(' · ')}</p>}
          <p className="whitespace-pre-wrap leading-8">{page.description}</p>
          <button className="rounded-xl bg-teal-700 px-5 py-3 text-white"
            onClick={() => page.target_url?.startsWith('/')
              ? navigate(page.target_url)
              : window.location.assign(page.target_url || '/')}>
            לפרסום מודעה באתר
          </button>
          <button className="mr-2 rounded-xl border px-5 py-3" onClick={share}>שיתוף הפרסום</button>
        </div>
      </article>
    </main>
  )
}
