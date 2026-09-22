import React, { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

export default function App() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ניהול תצוגה: 'home' ללוח הראשי, 'my-listings' למודעות שלי
  const [currentView, setCurrentView] = useState('home')


  const [selectedListing, setSelectedListing] = useState(null)
  const [contactModalItem, setContactModalItem] = useState(null);
  const [contactListing, setContactListing] = useState(null);

  // ניהול מערכת הודעות פרטיות
const [messageModalOpen, setMessageModalOpen] = useState(false)
const [messageContent, setMessageContent] = useState('')
const [isSendingMessage, setIsSendingMessage] = useState(false)
const [messageStatus, setMessageStatus] = useState('')


// מערכת הודעות
const [messagesModalOpen, setMessagesModalOpen] = useState(false)
const [unreadMessagesCount, setUnreadMessagesCount] = useState(0)
const [myMessages, setMyMessages] = useState([])
const [loadingMessages, setLoadingMessages] = useState(false)
const [conversationList, setConversationList] = useState([])

const [selectedConversation, setSelectedConversation] = useState(null)
const [conversationMessages, setConversationMessages] = useState([])
const [loadingConversation, setLoadingConversation] = useState(false)
const [conversationContent, setConversationContent] = useState('')
const [isSendingConversationMessage, setIsSendingConversationMessage] = useState(false)


  // ניהול מצב עריכה
  const [editingListing, setEditingListing] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // ניהול מצב משתמש והתחברות
  const [user, setUser] = useState(null)
  const [authMode, setAuthMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')

  // שדות הטופס ליצירת/עריכת מודעה (כולל קובץ תמונה)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'עבודות מזדמנות',
    location: '',
    contact_name: '',
    phone: ''
  })
  const [imageFile, setImageFile] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)

    // מעקב אחר מצב ההתחברות של המשתמש
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])


  // טעינת ההודעות של המשתמש
  const loadMyMessages = async () => {
    if (!user) return

    setLoadingMessages(true)

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          listing_id,
          sender_id,
          receiver_id,
          content,
          created_at,
          is_read
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('שגיאה בטעינת הודעות:', error)
        return
      }

      setMyMessages(data || [])

      const unreadCount = (data || []).filter(
        (message) =>
          message.receiver_id === user.id &&
          message.is_read === false
      ).length

      setUnreadMessagesCount(unreadCount)

    } catch (error) {
      console.error('שגיאה בטעינת הודעות:', error)
    } finally {
      setLoadingMessages(false)
    }
  }



    // בניית רשימת שיחות מתוך כל ההודעות
  useEffect(() => {
    if (!user) {
      setConversationList([])
      return
    }

    const conversationsMap = new Map()

    for (const message of myMessages) {
      const otherUserId =
        message.sender_id === user.id
          ? message.receiver_id
          : message.sender_id

      const key = `${message.listing_id}_${otherUserId}`

      if (!conversationsMap.has(key)) {
        conversationsMap.set(key, {
          otherUserId,
          listingId: message.listing_id,
          lastMessage: message.content,
          lastCreatedAt: message.created_at,
          unreadCount: 0
        })
      }

      const conversation = conversationsMap.get(key)

      if (
        message.receiver_id === user.id &&
        message.is_read === false
      ) {
        conversation.unreadCount += 1
      }
    }

    setConversationList(
      Array.from(conversationsMap.values()).sort(
        (a, b) =>
          new Date(b.lastCreatedAt) -
          new Date(a.lastCreatedAt)
      )
    )
  }, [myMessages, user])



  // האזנה בזמן אמת להודעות חדשות
useEffect(() => {
  if (!user) return

  const channel = supabase
    .channel(`messages-realtime-${user.id}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      },
      (payload) => {
        const newMessage = payload.new

        if (
          newMessage.sender_id !== user.id &&
          newMessage.receiver_id !== user.id
        ) {
          return
        }

        setMyMessages((currentMessages) => {
          const alreadyExists = currentMessages.some(
            (message) => message.id === newMessage.id
          )

          if (alreadyExists) {
            return currentMessages
          }

          return [newMessage, ...currentMessages]
        })

        if (
          newMessage.receiver_id === user.id &&
          newMessage.is_read === false
        ) {
          setUnreadMessagesCount((count) => count + 1)
        }

        if (
          selectedConversation &&
          (
            (
              newMessage.sender_id === user.id &&
              newMessage.receiver_id === selectedConversation.otherUserId
            ) ||
            (
              newMessage.sender_id === selectedConversation.otherUserId &&
              newMessage.receiver_id === user.id
            )
          ) &&
          newMessage.listing_id === selectedConversation.listingId
        ) {
          setConversationMessages((currentMessages) => {
            const alreadyExists = currentMessages.some(
              (message) => message.id === newMessage.id
            )

            if (alreadyExists) {
              return currentMessages
            }

            return [...currentMessages, newMessage]
          })
        }
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [user, selectedConversation])



// טעינת שיחה בין המשתמש הנוכחי למשתמש אחר
const loadConversation = async (otherUserId, listingId) => {
  if (!user || !otherUserId) return

  setLoadingConversation(true)

  try {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id,
        listing_id,
        sender_id,
        receiver_id,
        content,
        created_at,
        is_read
      `)
      .eq('listing_id', listingId)
      .or(
        `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
      )
      .order('created_at', { ascending: true })

    if (error) {
      console.error('שגיאה בטעינת השיחה:', error)
      return
    }

    setConversationMessages(data || [])

    // סימון הודעות שהתקבלו כנקראו
    const unreadMessages = (data || []).filter(
      (message) =>
        message.receiver_id === user.id &&
        message.is_read === false
    )

    if (unreadMessages.length > 0) {
      const unreadIds = unreadMessages.map((message) => message.id)

      const { error: updateError } = await supabase
        .from('messages')
        .update({ is_read: true })
        .in('id', unreadIds)

      if (updateError) {
        console.error(
          'שגיאה בסימון הודעות כנקראו:',
          updateError
        )
      } else {
        setConversationMessages((currentMessages) =>
          currentMessages.map((message) =>
            unreadIds.includes(message.id)
              ? { ...message, is_read: true }
              : message
          )
        )

        setUnreadMessagesCount((count) =>
          Math.max(count - unreadMessages.length, 0)
        )

        setMyMessages((currentMessages) =>
          currentMessages.map((message) =>
            unreadIds.includes(message.id)
              ? { ...message, is_read: true }
              : message
          )
        )
      }
    }

  } catch (error) {
    console.error('שגיאה בטעינת השיחה:', error)
  } finally {
    setLoadingConversation(false)
  }
}



  // טעינת מודעות מ-Supabase
  const fetchListings = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching listings:', error)
    } else {
      setListings(data || [])
    }

    setLoading(false)
  }


  useEffect(() => {
    fetchListings()
  }, [])

  // טיפול בשינוי קלט בטופס
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // פונקציית עזר להעלאת קובץ ל-Supabase Storage
  const uploadFileToStorage = async (file, bucketName) => {
    if (!file) return null
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file)

    if (uploadError) {
      throw uploadError
    }

    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  // טיפול בהתחברות / הרשמה
  const handleAuth = async (e) => {
    e.preventDefault()
    setAuthError('')
    setIsSubmitting(true)

    if (authMode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setAuthError(error.message)
      } else {
        alert('נרשמת בהצלחה! כעת תוכל להתחבר.')
        setAuthMode('login')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setAuthError(error.message)
      } else {
        setIsAuthModalOpen(false)
        setEmail('')
        setPassword('')
      }
    }
    setIsSubmitting(false)
  }

  // התחברות באמצעות Google
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
    if (error) {
      setAuthError(error.message)
    }
  }

  // התנתקות מהמערכת
  const handleLogout = async () => {
    await supabase.auth.signOut()
    setCurrentView('home')
  }

  // העלאת תמונת פרופיל למשתמש המחובר
  const handleUpdateAvatar = async (e) => {
    const file = e.target.files[0]
    if (!file || !user) return

    try {
      setIsSubmitting(true)
      const avatarUrl = await uploadFileToStorage(file, 'avatars')
      
      const { error } = await supabase.auth.updateUser({
        data: { avatar_url: avatarUrl }
      })

      if (error) throw error
      
      // רענון מצב המשתמש המקומי
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      alert('תמונת הפרופיל עודכנה בהצלחה!')
    } catch (error) {
      alert('שגיאה בעדכון תמונת הפרופיל: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // פתיחת מודל פרסום מודעה
  const handleOpenPublishModal = () => {
    if (!user) {
      setAuthMode('login')
      setIsAuthModalOpen(true)
    } else {
      setFormData({
        title: '',
        description: '',
        price: '',
        category: 'עבודות מזדמנות',
        location: '',
        contact_name: '',
        phone: ''
      })
      setImageFile(null)
      setIsModalOpen(true)
    }
  }

  // שליחת מודעה חדשה (כולל תמונה)
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)
    try {
      let imageUrl = null
      if (imageFile) {
        imageUrl = await uploadFileToStorage(imageFile, 'listings-images')
      }

      const newListing = {
        title: formData.title,
        description: formData.description,
        price: formData.price ? parseFloat(formData.price) : null,
        category: formData.category,
        location: formData.location,
        contact_name: formData.contact_name,
        phone: formData.phone,
        image_url: imageUrl,
        user_id: user.id
      }

      const { error } = await supabase.from('listings').insert([newListing])
      if (error) throw error

      setIsModalOpen(false)
      fetchListings()
    } catch (error) {
      alert('שגיאה בפרסום המודעה: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // פתיחת מודל עריכה
  const handleOpenEditModal = (item) => {
    setEditingListing(item)
    setFormData({
      title: item.title || '',
      description: item.description || '',
      price: item.price || '',
      category: item.category || 'עבודות מזדמנות',
      location: item.location || '',
      contact_name: item.contact_name || '',
      phone: item.phone || ''
    })
    setImageFile(null)
    setIsEditModalOpen(true)
  }

  // שמירת שינויים בעריכת מודעה
  // שמירת שינויים בעריכת מודעה
  const handleUpdateListing = async (e) => {
    e.preventDefault()
    if (!editingListing) return

    setIsSubmitting(true)
    try {
      let imageUrl = editingListing.image_url
      if (imageFile) {
        imageUrl = await uploadFileToStorage(imageFile, 'listings-images')
      }

      const updatedData = {
        title: formData.title,
        description: formData.description,
        price: formData.price ? parseFloat(formData.price) : null,
        category: formData.category,
        location: formData.location,
        contact_name: formData.contact_name,
        phone: formData.phone,
        image_url: imageUrl
      }

      const { data, error } = await supabase
        .from('listings')
        .update(updatedData)
        .eq('id', editingListing.id)
        .select() // מוסיף את זה כדי לראות מה חזר מהשרת

      if (error) {
        throw error
      }

      console.log('Updated successfully:', data)
      setIsEditModalOpen(false)
      setEditingListing(null)
      setImageFile(null)
      await fetchListings() // מוודא טעינה מחדש של הנתונים מהשרת
    } catch (error) {
      console.error('Update error details:', error)
      alert('שגיאה בעדכון המודעה: ' + (error.message || JSON.stringify(error)))
    } finally {
      setIsSubmitting(false)
    }
  }

  // מחיקת מודעה
  const handleDeleteListing = async (id) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק מודעה זו?')) return

    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', id)

    if (error) {
      alert('שגיאה במחיקת המודעה: ' + error.message)
    } else {
      fetchListings()
    }
  }

  const myListings = user ? listings.filter(item => item.user_id === user.id || !item.user_id) : []
  const displayedListings = currentView === 'my-listings' ? myListings : listings

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dir-rtl font-sans pb-12">
      {/* סרגל עליון Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
  <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
    <div className="flex items-center space-x-3 space-x-reverse">
      <span className="text-3xl">💰</span>
      <h1
        onClick={() => setCurrentView('home')}
        className="text-2xl font-bold text-slate-900 tracking-tight cursor-pointer"
      >
        כסף כיס
      </h1>
    </div>

    <div className="flex items-center gap-3">
      {user ? (
        <div className="flex items-center gap-3 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">

          {/* תמונת פרופיל בסרגל */}
          <label
            className="relative cursor-pointer group"
            title="החלף תמונת פרופיל"
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleUpdateAvatar}
              className="hidden"
            />

            {user.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover border border-slate-300"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                {user.email?.charAt(0).toUpperCase()}
              </div>
            )}
          </label>

          <span className="text-xs text-slate-700 hidden sm:inline font-medium">
            {user.email}
          </span>

          {/* המודעות שלי */}
          <button
            onClick={() =>
              setCurrentView(
                currentView === 'my-listings' ? 'home' : 'my-listings'
              )
            }
            className={`text-xs font-semibold px-2 py-1 rounded-lg transition ${
              currentView === 'my-listings'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            {currentView === 'my-listings' ? 'כל הלוח' : 'המודעות שלי'}
          </button>

          {/* הודעות שלי */}
          <button
            onClick={() => setMessagesModalOpen(true)}
            className="relative text-xs font-semibold px-2 py-1 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 transition"
          >
            הודעות שלי

            {unreadMessagesCount > 0 && (
              <span className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
              </span>
            )}
          </button>

          {/* התנתקות */}
          <button
            onClick={handleLogout}
            className="text-xs text-red-600 hover:text-red-700 font-semibold transition"
          >
            התנתק
          </button>
        </div>
      ) : (
        <button
          onClick={() => {
            setAuthMode('login')
            setIsAuthModalOpen(true)
          }}
          className="text-sm font-medium text-slate-700 hover:text-slate-900 px-3 py-2 rounded-lg transition"
        >
          התחברות / הרשמה
        </button>
      )}

      <button
        onClick={handleOpenPublishModal}
        className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-2.5 rounded-xl shadow-sm transition duration-150 flex items-center gap-2 cursor-pointer"
      >
        <span>+</span> פרסם מודעה
      </button>
    </div>
  </div>
</header>

      {/* אזור מרכזי */}
<main className="max-w-5xl mx-auto px-4 pt-8">
  <div className="mb-8 text-center md:text-right flex flex-col md:flex-row md:items-center md:justify-between">
    <div>
      <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
        {currentView === 'my-listings'
          ? 'המודעות שפרסמתי'
          : 'לוח עבודות ושירותים מקומיים'}
      </h2>

      <p className="text-slate-600">
        {currentView === 'my-listings'
          ? 'ניהול, עריכה ומחיקת המודעות האישיות שלך'
          : 'מצא עבודות קטנות בסביבה שלך או הצע את השירותים שלך'}
      </p>
    </div>

    {currentView === 'my-listings' && (
      <button
        onClick={() => setCurrentView('home')}
        className="mt-4 md:mt-0 text-sm font-semibold text-emerald-600 hover:underline"
      >
        ← חזרה לכל הלוח
      </button>
    )}
  </div>

  {/* רשימת המודעות */}
  {loading ? (
    <div className="text-center py-12 text-slate-500">
      טוען מודעות...
    </div>
  ) : displayedListings.length === 0 ? (
    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
      <p className="text-lg text-slate-600 mb-4">
        {currentView === 'my-listings'
          ? 'עדיין לא פרסמת אף מודעה.'
          : 'עדיין אין מודעות בלוח.'}
      </p>

      <button
        onClick={handleOpenPublishModal}
        className="text-emerald-600 font-semibold hover:underline"
      >
        {currentView === 'my-listings'
          ? 'פרסם את המודעה הראשונה שלך!'
          : 'היה הראשון לפרסם מודעה!'}
      </button>
    </div>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {displayedListings.map((item) => {
        const isOwner =
          user && (item.user_id === user.id || !item.user_id)

        return (
          <div
            key={item.id}
            onClick={() => setSelectedListing(item)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setSelectedListing(item)
              }
            }}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition duration-200 flex flex-col justify-between cursor-pointer"
          >
            <div>
              {/* תמונת המודעה */}
              {item.image_url ? (
                <div className="w-full h-48 bg-slate-100 overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover transition duration-300 hover:scale-105"
                  />
                </div>
              ) : (
                <div className="w-full h-24 bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                  ללא תמונה
                </div>
              )}

              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-md">
                    {item.category || 'כללי'}
                  </span>

                  {item.price && (
                    <span className="text-lg font-bold text-slate-900">
                      ₪{item.price}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1">
                  {item.title}
                </h3>

                <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                  {item.description}
                </p>

                <div className="text-emerald-600 text-sm font-semibold">
                  לצפייה בפרטים המלאים ←
                </div>
              </div>
            </div>

            <div className="p-5 pt-0">
              <div className="border-t border-slate-100 pt-3 mt-2 flex justify-between items-center text-xs text-slate-500 mb-2">
                <div>
                  {item.location && (
                    <span>📍 {item.location}</span>
                  )}
                </div>

                {item.phone && (
                  <a
                    href={`tel:${item.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-lg font-medium transition"
                  >
                    📞 {item.phone}
                  </a>
                )}
              </div>

              {isOwner && (
                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleOpenEditModal(item)
                    }}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 rounded-lg text-xs font-semibold transition"
                  >
                    עריכה ✏️
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteListing(item.id)
                    }}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-1.5 rounded-lg text-xs font-semibold transition"
                  >
                    מחיקה 🗑️
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )}
</main>


{/* =========================================================
    מודאל פרטי המודעה
========================================================= */}

{selectedListing && (
  <div
    className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
    onClick={() => setSelectedListing(null)}
  >
    <div
      className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl"
      dir="rtl"
      onClick={(e) => e.stopPropagation()}
    >
      {/* כותרת המודאל */}
      <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white z-10">
        <h2 className="text-lg font-bold text-slate-900">
          פרטי המודעה
        </h2>

        <button
          onClick={() => setSelectedListing(null)}
          className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xl transition"
          aria-label="סגירת חלון"
        >
          ×
        </button>
      </div>

      {/* תמונה */}
      {selectedListing.image_url ? (
        <div className="w-full h-64 md:h-80 bg-slate-100">
          <img
            src={selectedListing.image_url}
            alt={selectedListing.title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-full h-32 bg-slate-100 flex items-center justify-center text-slate-400">
          ללא תמונה
        </div>
      )}

      <div className="p-6 md:p-8">

        {/* קטגוריה ומחיר */}
        <div className="flex justify-between items-start gap-4 mb-4">
          <span className="bg-emerald-50 text-emerald-700 text-sm font-semibold px-3 py-1.5 rounded-lg">
            {selectedListing.category || "כללי"}
          </span>

          {selectedListing.price && (
            <span className="text-2xl font-extrabold text-slate-900">
              ₪{selectedListing.price}
            </span>
          )}
        </div>

        {/* כותרת */}
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-5">
          {selectedListing.title}
        </h2>

        {/* פרטי בסיס */}
        <div className="flex flex-wrap gap-3 mb-6 text-sm text-slate-600">
          {selectedListing.location && (
            <span className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
              📍 {selectedListing.location}
            </span>
          )}

          {selectedListing.created_at && (
            <span className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
              📅{" "}
              {new Date(
                selectedListing.created_at
              ).toLocaleDateString("he-IL")}
            </span>
          )}
        </div>

        {/* תיאור מלא */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-slate-900 mb-3">
            אודות המודעה
          </h3>

          <p className="text-slate-600 leading-8 whitespace-pre-wrap">
            {selectedListing.description || "לא נוסף תיאור למודעה."}
          </p>
        </div>

        {/* פרטי מפרסם */}
        <div className="border-t border-slate-200 pt-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            👤 פרטי המפרסם
          </h3>

          <div className="flex items-center gap-4 bg-slate-50 rounded-2xl p-4">
            {user?.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt="תמונת פרופיל"
                className="w-14 h-14 rounded-full object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xl font-bold">
                👤
              </div>
            )}

            <div>
              <p className="font-bold text-slate-900">
                {user?.user_metadata?.full_name || "משתמש רשום"}
              </p>

              <p className="text-sm text-slate-500">
                מפרסם מודעה בלוח המקומי
              </p>
            </div>
          </div>

          {/* כפתור יצירת קשר */}
          {selectedListing.phone && (
            <button
              onClick={() => setContactListing(selectedListing)}
              className="mt-4 flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition"
            >
              💬 צור קשר עם המפרסם
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
)}


{/* =========================================================
    מודאל אפשרויות יצירת קשר
========================================================= */}

{contactListing && (
  <div
    className="fixed inset-0 z-[60] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
    onClick={() => setContactListing(null)}
  >
    <div
      className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6"
      dir="rtl"
      onClick={(e) => e.stopPropagation()}
    >

      {/* כותרת */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900">
          צור קשר עם המפרסם
        </h2>

        <button
          onClick={() => setContactListing(null)}
          className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xl transition"
          aria-label="סגירת חלון"
        >
          ×
        </button>
      </div>

      {/* מספר טלפון */}
      {contactListing.phone && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-5 text-center">
          <p className="text-sm text-slate-500 mb-2">
            מספר הטלפון של המפרסם
          </p>

          <p className="text-xl font-bold text-slate-900" dir="ltr">
            {contactListing.phone}
          </p>

          <button
            onClick={() => {
              navigator.clipboard.writeText(contactListing.phone)
              alert("המספר הועתק בהצלחה")
            }}
            className="mt-3 text-sm font-semibold text-emerald-600 hover:underline"
          >
            📋 העתק מספר
          </button>
        </div>
      )}

      {/* WhatsApp */}
      {contactListing.phone && (
        <a
          href={`https://wa.me/${contactListing.phone
            .replace(/[\s\-()+]/g, "")
            .replace(/^0/, "972")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition mb-3"
        >
          💬 שלח הודעה ב־WhatsApp
        </a>
      )}

      {/* הודעה פרטית באתר */}
      <button
        onClick={() => {
          if (!user) {
            setContactListing(null)
            setIsAuthModalOpen(true)
            return
          }

          setMessageContent('')
          setMessageStatus('')
          setMessageModalOpen(true)
        }}
        className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition"
      >
        ✉️ שלח הודעה פרטית באתר
      </button>

      {/* ביטול */}
      <button
        onClick={() => setContactListing(null)}
        className="mt-4 w-full text-sm text-slate-500 hover:text-slate-700"
      >
        ביטול
      </button>

    </div>
  </div>
)}


{/* חלון הודעות שלי */}
{/* חלון הודעות שלי */}
{messagesModalOpen && (
  <div
    className="fixed inset-0 z-[80] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
    onClick={() => setMessagesModalOpen(false)}
  >
    <div
      className="bg-white w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl overflow-hidden"
      dir="rtl"
      onClick={(e) => e.stopPropagation()}
    >

      {/* כותרת */}
      <div className="flex items-center justify-between p-6 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            הודעות שלי
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            השיחות שלך עם מפרסמים ומשתמשים
          </p>
        </div>

        <button
          onClick={() => setMessagesModalOpen(false)}
          className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xl transition"
          aria-label="סגירת חלון"
        >
          ×
        </button>
      </div>

      {/* תוכן */}
      <div className="p-6 overflow-y-auto max-h-[65vh]">

        {loadingMessages ? (
          <div className="text-center py-12">
            <div className="text-3xl mb-3">
              ⏳
            </div>

            <p className="text-slate-500">
              טוען שיחות...
            </p>
          </div>

        ) : conversationList.length === 0 ? (

          <div className="text-center py-12">
            <div className="text-5xl mb-4">
              💬
            </div>

            <h3 className="text-lg font-bold text-slate-800 mb-2">
              אין עדיין שיחות
            </h3>

            <p className="text-sm text-slate-500">
              כאשר תשלח או תקבל הודעה, השיחה תופיע כאן.
            </p>
          </div>

        ) : (

          <div className="space-y-3">

            {conversationList.map((conversation) => (

              <div
                key={`${conversation.listingId}_${conversation.otherUserId}`}
                className={`border rounded-2xl p-4 transition ${
                  conversation.unreadCount > 0
                    ? 'border-emerald-300 bg-emerald-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >

                <div className="flex items-start gap-4">

                  {/* אייקון */}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0 ${
                      conversation.unreadCount > 0
                        ? 'bg-emerald-100'
                        : 'bg-slate-100'
                    }`}
                  >
                    💬
                  </div>

                  {/* תוכן */}
                  <div className="flex-1 min-w-0">

                    <div className="flex items-center justify-between gap-3">

                      <div className="flex items-center gap-2">

                        <span className="font-bold text-slate-900">
                          שיחה פרטית
                        </span>

                        {conversation.unreadCount > 0 && (
                          <span className="text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">
                            {conversation.unreadCount === 1
                              ? 'חדשה'
                              : `${conversation.unreadCount} חדשות`}
                          </span>
                        )}

                      </div>

                      <span className="text-xs text-slate-400 whitespace-nowrap">
                        {new Date(
                          conversation.lastCreatedAt
                        ).toLocaleString('he-IL')}
                      </span>

                    </div>

                    {/* המודעה */}
                    <p className="text-xs text-slate-400 mt-1">
                      מודעה #{conversation.listingId}
                    </p>

                    {/* הודעה אחרונה */}
                    <div className="mt-3 bg-slate-50 border border-slate-100 rounded-xl p-3">

                      <p className="text-sm text-slate-700 line-clamp-2">
                        {conversation.lastMessage}
                      </p>

                    </div>

                    {/* תחתית */}
                    <div className="mt-3 flex items-center justify-between gap-3">

                      <span className="text-xs text-slate-400">
                        {conversation.unreadCount > 0
                          ? 'יש הודעות שטרם נקראו'
                          : 'אין הודעות חדשות'}
                      </span>

                      <button
                        onClick={async () => {
                          if (!user) return

                          setSelectedConversation({
                            otherUserId:
                              conversation.otherUserId,
                            listingId:
                              conversation.listingId
                          })

                          setConversationContent('')

                          await loadConversation(
                            conversation.otherUserId,
                            conversation.listingId
                          )
                        }}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-lg transition"
                      >
                        💬 פתח שיחה
                      </button>

                    </div>

                  </div>

                </div>

              </div>

            ))}

          </div>
        )}

      </div>

      {/* תחתית */}
      <div className="border-t border-slate-200 p-4 bg-slate-50">

        <button
          onClick={() => {
            loadMyMessages()
          }}
          className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 rounded-xl transition"
        >
          🔄 רענן שיחות
        </button>

      </div>

    </div>
  </div>
)}


{/* =========================================================
    חלון שיחה פרטית
    ========================================================= */}

{selectedConversation && (
  <div
    className="fixed inset-0 z-[90] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
    onClick={() => setSelectedConversation(null)}
  >
    <div
      className="bg-white w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
      dir="rtl"
      onClick={(e) => e.stopPropagation()}
    >

      {/* כותרת השיחה */}
      <div className="flex items-center justify-between p-5 border-b border-slate-200">

        <div>
          <h2 className="text-xl font-bold text-slate-900">
            שיחה פרטית
          </h2>

          <p className="text-xs text-slate-500 mt-1">
            מודעה #{selectedConversation.listingId}
          </p>
        </div>

        <button
          onClick={() => setSelectedConversation(null)}
          className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xl transition"
          aria-label="סגירת שיחה"
        >
          ×
        </button>

      </div>


      {/* הודעות השיחה */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3 min-h-[300px] max-h-[50vh]">

        {loadingConversation ? (

          <div className="flex items-center justify-center py-12">

            <div className="text-center">

              <div className="text-3xl mb-3">
                ⏳
              </div>

              <p className="text-sm text-slate-500">
                טוען שיחה...
              </p>

            </div>

          </div>

        ) : conversationMessages.length === 0 ? (

          <div className="text-center py-12 text-slate-400">

            <div className="text-4xl mb-3">
              💬
            </div>

            <p className="text-sm">
              עדיין אין הודעות בשיחה הזאת.
            </p>

          </div>

        ) : (

          conversationMessages.map((message) => {

            const isMine =
              message.sender_id === user?.id

            return (
              <div
                key={message.id}
                className={`flex ${
                  isMine
                    ? 'justify-start'
                    : 'justify-end'
                }`}
              >

                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    isMine
                      ? 'bg-emerald-600 text-white rounded-br-md'
                      : 'bg-slate-100 text-slate-800 rounded-bl-md'
                  }`}
                >

                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>

                  <p
                    className={`text-[10px] mt-2 ${
                      isMine
                        ? 'text-emerald-100'
                        : 'text-slate-400'
                    }`}
                  >
                    {new Date(
                      message.created_at
                    ).toLocaleString('he-IL')}
                  </p>

                </div>

              </div>
            )

          })

        )}

      </div>


      {/* אזור כתיבת הודעה */}
      <div className="border-t border-slate-200 p-4 bg-slate-50">

        <textarea
          value={conversationContent}
          onChange={(e) =>
            setConversationContent(e.target.value)
          }
          placeholder="כתוב תשובה..."
          rows={3}
          maxLength={2000}
          disabled={
            loadingConversation ||
            isSendingConversationMessage
          }
          className="w-full border border-slate-200 rounded-2xl p-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none bg-white"
        />

        <div className="flex items-center justify-between mt-3">

          <span className="text-xs text-slate-400">
            {conversationContent.length}/2000
          </span>

          <button
            onClick={async () => {

              if (!user || !selectedConversation) {
                return
              }

              const trimmedMessage =
                conversationContent.trim()

              if (!trimmedMessage) {
                return
              }

              setIsSendingConversationMessage(true)

              try {

                const { data, error } = await supabase
                  .from('messages')
                  .insert({
                    listing_id:
                      selectedConversation.listingId,
                    sender_id: user.id,
                    receiver_id:
                      selectedConversation.otherUserId,
                    content: trimmedMessage,
                    is_read: false
                  })
                  .select()
                  .single()

                if (error) {
                  console.error(
                    'שגיאה בשליחת תשובה:',
                    error
                  )
                  return
                }

                if (data) {
                  setConversationMessages(
                    (currentMessages) => [
                      ...currentMessages,
                      data
                    ]
                  )
                }

                setConversationContent('')

                await loadMyMessages()

              } catch (error) {

                console.error(
                  'שגיאה בשליחת תשובה:',
                  error
                )

              } finally {

                setIsSendingConversationMessage(false)

              }

            }}
            disabled={
              isSendingConversationMessage ||
              !conversationContent.trim()
            }
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold px-5 py-3 rounded-xl transition"
          >
            {isSendingConversationMessage
              ? 'שולח...'
              : '📤 שלח'}
          </button>

        </div>

      </div>

    </div>
  </div>
)}


{/* =========================================================
    מודאל כתיבת הודעה פרטית
========================================================= */}

{messageModalOpen && contactListing && (
  <div
    className="fixed inset-0 z-[70] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
    onClick={() => {
      if (!isSendingMessage) {
        setMessageModalOpen(false)
      }
    }}
  >
    <div
      className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6"
      dir="rtl"
      onClick={(e) => e.stopPropagation()}
    >

      {/* כותרת */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            שליחת הודעה פרטית
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            בקשר למודעה: {contactListing.title}
          </p>
        </div>

        <button
          onClick={() => {
            if (!isSendingMessage) {
              setMessageModalOpen(false)
            }
          }}
          disabled={isSendingMessage}
          className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xl transition disabled:opacity-50"
          aria-label="סגירת חלון"
        >
          ×
        </button>
      </div>

      {/* הודעת מערכת */}
      {messageStatus && (
        <div
          className={`mb-4 rounded-xl px-4 py-3 text-sm font-semibold ${
            messageStatus.startsWith("שגיאה")
              ? "bg-red-50 text-red-700 border border-red-100"
              : "bg-emerald-50 text-emerald-700 border border-emerald-100"
          }`}
        >
          {messageStatus}
        </div>
      )}

      {/* שדה הודעה */}
      <div className="mb-5">
        <label
          htmlFor="private-message"
          className="block text-sm font-bold text-slate-700 mb-2"
        >
          ההודעה שלך
        </label>

        <textarea
          id="private-message"
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          placeholder="כתוב כאן את ההודעה שלך למפרסם..."
          rows={6}
          maxLength={2000}
          disabled={isSendingMessage}
          className="w-full border border-slate-200 rounded-2xl p-4 text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none disabled:bg-slate-100"
        />

        <div className="flex justify-between items-center mt-2 text-xs text-slate-400">
          <span>עד 2,000 תווים</span>
          <span>{messageContent.length}/2000</span>
        </div>
      </div>

      {/* כפתורים */}
      <div className="flex gap-3">

        <button
          onClick={() => {
            if (!isSendingMessage) {
              setMessageModalOpen(false)
            }
          }}
          disabled={isSendingMessage}
          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-xl transition disabled:opacity-50"
        >
          ביטול
        </button>

        <button
          onClick={async () => {

            if (!user) {
              setMessageStatus("שגיאה: יש להתחבר כדי לשלוח הודעה.")
              return
            }

            const trimmedMessage = messageContent.trim()

            if (!trimmedMessage) {
              setMessageStatus("שגיאה: יש לכתוב הודעה לפני השליחה.")
              return
            }

            if (!contactListing.user_id) {
              setMessageStatus(
                "שגיאה: לא נמצא מזהה המשתמש של מפרסם המודעה."
              )
              return
            }

            if (contactListing.user_id === user.id) {
              setMessageStatus(
                "שגיאה: לא ניתן לשלוח הודעה לעצמך."
              )
              return
            }

            setIsSendingMessage(true)
            setMessageStatus('')

            try {
              const { error } = await supabase
                .from('messages')
                .insert({
                  listing_id: contactListing.id,
                  sender_id: user.id,
                  receiver_id: contactListing.user_id,
                  content: trimmedMessage,
                  is_read: false
                })

              if (error) {
                console.error("שגיאה בשליחת הודעה:", error)
                throw error
              }

              setMessageStatus("ההודעה נשלחה בהצלחה! ✓")
              setMessageContent('')

              setTimeout(() => {
                setMessageModalOpen(false)
                setContactListing(null)
                setMessageStatus('')
              }, 1200)

            } catch (error) {
              console.error(error)

              setMessageStatus(
                "שגיאה: לא ניתן לשלוח את ההודעה כרגע. נסה שוב."
              )
            } finally {
              setIsSendingMessage(false)
            }
          }}
          disabled={isSendingMessage}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSendingMessage ? "שולח..." : "✉️ שלח הודעה"}
        </button>

      </div>

    </div>
  </div>
)}

      {/* מודאל התחברות / הרשמה */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl relative">
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-4 left-4 text-slate-400 hover:text-slate-600 text-xl font-bold"
            >
              ✕
            </button>

            <h3 className="text-xl font-bold text-slate-900 mb-4">
              {authMode === 'login' ? 'התחברות למערכת' : 'הרשמה למערכת'}
            </h3>

            {authError && (
              <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg mb-4">
                {authError}
              </div>
            )}

            <button
              onClick={handleGoogleLogin}
              type="button"
              className="w-full mb-4 py-2.5 px-4 border border-slate-300 hover:bg-slate-50 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition text-slate-700"
            >
              <span>🌐</span> התחבר באמצעות Google
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-4 text-slate-400 text-xs">או באמצעות אימייל</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <form onSubmit={handleAuth} className="space-y-4 mt-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">כתובת אימייל</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">סיסמה</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="לפחות 6 תווים"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-sm transition disabled:opacity-50 mt-2"
              >
                {isSubmitting ? 'מעבד...' : authMode === 'login' ? 'התחבר לחשבון' : 'הירשם כעת'}
              </button>
            </form>

            <div className="mt-4 text-center text-xs text-slate-600">
              {authMode === 'login' ? (
                <p>
                  אין לך חשבון עדיין?{' '}
                  <button
                    onClick={() => {
                      setAuthMode('signup')
                      setAuthError('')
                    }}
                    className="text-emerald-600 font-semibold hover:underline"
                  >
                    הירשם כאן
                  </button>
                </p>
              ) : (
                <p>
                  כבר רשום במערכת?{' '}
                  <button
                    onClick={() => {
                      setAuthMode('login')
                      setAuthError('')
                    }}
                    className="text-emerald-600 font-semibold hover:underline"
                  >
                    התחבר כאן
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* מודאל פרסום מודעה חדשה */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 left-4 text-slate-400 hover:text-slate-600 text-xl font-bold"
            >
              ✕
            </button>

            <h3 className="text-xl font-bold text-slate-900 mb-4">פרסום מודעה חדשה</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">כותרת המודעה *</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="למשל: דרוש בייביסיטר לערב / תיקון צבע בסלון"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">קטגוריה</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="עבודות מזדמנות">עבודות מזדמנות</option>
                  <option value="שירותים לבית">שירותים לבית</option>
                  <option value="שיעורים פרטיים">שיעורים פרטיים</option>
                  <option value="טיפול בילדים / חיות">טיפול בילדים / חיות</option>
                  <option value="הובלות ואיסוף">הובלות ואיסוף</option>
                  <option value="אחר">אחר</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">מחיר (₪)</label>
                  <input
                    type="number"
                    name="price"
                    placeholder="למשל: 150"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">עיר / אזור</label>
                  <input
                    type="text"
                    name="location"
                    placeholder="למשל: תל אביב"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">תמונת המודעה</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">תיאור מפורט</label>
                <textarea
                  name="description"
                  rows="3"
                  placeholder="פרט מה העבודה כוללת, ימים, שעות וכו'..."
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">שם איש קשר</label>
                  <input
                    type="text"
                    name="contact_name"
                    placeholder="שמך"
                    value={formData.contact_name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">מספר טלפון</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="050-0000000"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2 space-x-reverse">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-sm"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-sm transition disabled:opacity-50"
                >
                  {isSubmitting ? 'מפרסם...' : 'פרסם כעת'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* מודאל עריכת מודעה */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 left-4 text-slate-400 hover:text-slate-600 text-xl font-bold"
            >
              ✕
            </button>

            <h3 className="text-xl font-bold text-slate-900 mb-4">עריכת מודעה</h3>

            <form onSubmit={handleUpdateListing} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">כותרת המודעה *</label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">קטגוריה</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="עבודות מזדמנות">עבודות מזדמנות</option>
                  <option value="שירותים לבית">שירותים לבית</option>
                  <option value="שיעורים פרטיים">שיעורים פרטיים</option>
                  <option value="טיפול בילדים / חיות">טיפול בילדים / חיות</option>
                  <option value="הובלות ואיסוף">הובלות ואיסוף</option>
                  <option value="אחר">אחר</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">מחיר (₪)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">עיר / אזור</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">החלף תמונת מודעה (אופציונלי)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">תיאור מפורט</label>
                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">שם איש קשר</label>
                  <input
                    type="text"
                    name="contact_name"
                    value={formData.contact_name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">מספר טלפון</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2 space-x-reverse">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-sm"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-sm transition disabled:opacity-50"
                >
                  {isSubmitting ? 'מעדכן...' : 'שמור שינויים'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}