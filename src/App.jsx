import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

export default function App() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchListings()
  }, [])

  async function fetchListings() {
    try {
      setLoading(true)
      // פנייה לטבלת listings שכבר יצרת ב-Supabase
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setListings(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-amber-600 flex items-center gap-2">
            <span>💰</span> כסף כיס
          </h1>
          <button className="bg-amber-500 hover:bg-amber-600 text-white font-medium px-4 py-2 rounded-lg text-sm transition">
            + פרסם מודעה
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <section className="text-center mb-8">
          <h2 className="text-3xl font-extrabold mb-2">לוח עבודות ושירותים מקומיים</h2>
          <p className="text-gray-600">מצא עבודות קטנות בסביבה שלך או הצע את השירותים שלך</p>
        </section>

        {loading && (
          <div className="text-center py-12 text-gray-500">
            <p className="animate-pulse text-lg">טוען מודעות...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg text-center border border-red-200 my-4">
            שגיאה בטעינת הנתונים: {error}
          </div>
        )}

        {!loading && !error && listings.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200 shadow-sm">
            <p className="text-lg font-medium mb-1">עדיין אין מודעות בלוח</p>
            <p className="text-sm text-gray-400">המודעות שתפרסם יופיעו כאן מיד.</p>
          </div>
        )}

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((item) => (
            <article
              key={item.id}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    {item.category || 'כללי'}
                  </span>
                  <span className="text-xs text-gray-400">
                    📍 {item.city || 'כל הארץ'}
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">{item.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{item.description}</p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-between items-center mt-auto">
                <div>
                  <span className="text-xs text-gray-400 block">מחיר / תקציב</span>
                  <span className="text-lg font-bold text-amber-600">₪{item.price}</span>
                </div>
                <button className="bg-gray-900 hover:bg-gray-800 text-white text-xs px-3 py-2 rounded-md font-medium transition">
                  פרטים נוספים
                </button>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  )
}