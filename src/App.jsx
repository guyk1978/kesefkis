import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { israeliLocations } from './data/israeliLocations'
import { supabase } from './supabaseClient'

function App() {

  const categories = [
  'תיקונים לבית',
  'ניקיון',
  'צבע ושיפוצים',
  'אינסטלציה',
  'חשמל',
  'הובלות',
  'הרכבות והתקנות',
  'מחשבים ודיגיטל',
  'עיצוב ויצירה',
  'צילום ווידאו',
  'חיות מחמד',
  'ילדים ומשפחה',
  'עזרה לקשישים',
  'שיעורים פרטיים',
  'עבודות משרדיות',
  'גינה וחצר',
  'רכב',
  'אופניים וקורקינטים',
  'שליחויות',
  'עבודות מזדמנות',
  'אירועים ובילויים',
  'אוכל ובישול',
  'ביגוד ואביזרים',
  'ריהוט לבית',
  'מוצרי חשמל ואלקטרוניקה',
  'טלפונים וסלולר',
  'מכירה ומסירה',
  'קנייה וחיפוש',
  'השכרה',
  'שירותים לעסקים',
  'יופי וטיפוח',
  'ספורט וכושר',
  'תחביבים ואוספים',
  'שירותים אישיים',
  'אחר'
]




// ניווט בין עמודי האתר
  const openPage = (page) => {
    setCurrentView(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

const handleShareListing = async (listing) => {
  if (!listing) return

  const shareUrl =
    `${window.location.origin}${window.location.pathname}` +
    `?listing=${listing.id}`

  const shareData = {
    title: listing.title || 'מודעה בכסף כיס',
    text: listing.description
      ? `${listing.title}\n\n${listing.description}`
      : listing.title || 'מודעה בכסף כיס',
    url: shareUrl
  }

  try {
    if (navigator.share) {
      await navigator.share(shareData)
      return
    }

    await navigator.clipboard.writeText(shareUrl)

    alert('הקישור למודעה הועתק בהצלחה.')
  } catch (error) {
    // המשתמש סגר את חלון השיתוף — לא צריך להציג שגיאה
    if (error?.name === 'AbortError') {
      return
    }

    try {
      await navigator.clipboard.writeText(shareUrl)
      alert('הקישור למודעה הועתק בהצלחה.')
    } catch (clipboardError) {
      console.error('שגיאה בשיתוף המודעה:', clipboardError)
      alert('לא ניתן היה ליצור קישור לשיתוף.')
    }
  }
}

  const [listings, setListings] = useState([])

// =========================================================
// מודעות שאהבתי
// =========================================================

const [favoriteListings, setFavoriteListings] = useState(() => {
  try {
    const savedFavorites = localStorage.getItem('kesefkis-favorites')
    return savedFavorites ? JSON.parse(savedFavorites) : []
  } catch (error) {
    console.error('שגיאה בטעינת מועדפים:', error)
    return []
  }
})


useEffect(() => {
  localStorage.setItem(
    'kesefkis-favorites',
    JSON.stringify(favoriteListings)
  )
}, [favoriteListings])



  const [loading, setLoading] = useState(true)

  // חיפוש וסינון מודעות
const [searchTerm, setSearchTerm] = useState('')
const [listingTypeFilter, setListingTypeFilter] = useState('all')
const [categoryFilter, setCategoryFilter] = useState('all')
const [locationFilter, setLocationFilter] = useState('all')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ניהול תצוגה: 'home' ללוח הראשי, 'my-listings' למודעות שלי
  const [currentView, setCurrentView] = useState('home')


  const [selectedListing, setSelectedListing] = useState(null)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false)
const [reportReason, setReportReason] = useState('')
const [reportDetails, setReportDetails] = useState('')

const [reports, setReports] = useState([])
const [isAdmin, setIsAdmin] = useState(false)
const [showReportsAdmin, setShowReportsAdmin] = useState(false)
const [reportsLoading, setReportsLoading] = useState(false)

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
  listing_type: 'offer',
  category: 'עבודות מזדמנות',
  location: '',
  contact_name: '',
  phone: ''
})
const [imageFile, setImageFile] = useState(null)
const [additionalImageFiles, setAdditionalImageFiles] = useState([])
const [existingAdditionalImages, setExistingAdditionalImages] = useState([])
const [removeMainImage, setRemoveMainImage] = useState(false)
const [avatarFile, setAvatarFile] = useState(null)
const [galleryImage, setGalleryImage] = useState(null)

    // מעקב אחר מצב ההתחברות של המשתמש
  useEffect(() => {
  supabase.auth.getSession().then(async ({ data: { session } }) => {
  const currentUser = session?.user ?? null

  setUser(currentUser)

  if (currentUser) {
    await checkAdmin(currentUser)
  } else {
    setIsAdmin(false)
  }
})

  const {
    data: { subscription }
  } = supabase.auth.onAuthStateChange(async (_event, session) => {
    const currentUser = session?.user ?? null

setUser(currentUser)

if (currentUser) {
  await checkAdmin(currentUser)

  if (_event === 'SIGNED_IN') {
    const googleOAuthStarted = localStorage.getItem('kesefkis-google-oauth-started')

    if (googleOAuthStarted === '1') {
      localStorage.removeItem('kesefkis-google-oauth-started')

      const googleIdentity = currentUser.identities?.find(
        identity => identity.provider === 'google'
      )

      if (googleIdentity) {
        const oauthStartedAt = Number(
          localStorage.getItem('kesefkis-google-oauth-time') || '0'
        )

        const identityCreatedAt = new Date(
          googleIdentity.created_at
        ).getTime()

        localStorage.removeItem('kesefkis-google-oauth-time')

        if (oauthStartedAt && identityCreatedAt >= oauthStartedAt - 60000) {
          if (window.gtag) {
            window.gtag('event', 'sign_up', {
              method: 'google'
            })
          }
        }
      }
    }
  }
} else {
  setIsAdmin(false)
}
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




const checkAdmin = async (currentUser) => {
  if (!currentUser) {
    setIsAdmin(false)
    return false
  }

  const { data, error } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', currentUser.id)
    .maybeSingle()

  if (error) {
    console.error('שגיאה בבדיקת הרשאת מנהל:', error)
    setIsAdmin(false)
    return false
  }

  const admin = !!data
  setIsAdmin(admin)

  return admin
}





const fetchReports = async () => {
  if (!isAdmin) return

  setReportsLoading(true)

  try {
    const { data, error } = await supabase
      .from('reports')
      .select(`
        id,
        listing_id,
        reporter_id,
        reason,
        details,
        status,
        admin_note,
        created_at,
        listings (
          id,
          title,
          description,
          category,
          price,
          location,
          phone
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('שגיאה בטעינת דיווחים:', error)

      alert(
        'לא הצלחנו לטעון את הדיווחים.\n\n' +
        error.message
      )

      return
    }

    setReports(data || [])
  } catch (err) {
    console.error('שגיאה לא צפויה בטעינת דיווחים:', err)

    alert(
      'אירעה שגיאה בטעינת הדיווחים.\n\n' +
      (err?.message || 'שגיאה לא ידועה')
    )
  } finally {
    setReportsLoading(false)
  }
}





const updateReportStatus = async (reportId, status, adminNote = null) => {
  if (!isAdmin) return

  try {
    const { error } = await supabase
      .from('reports')
      .update({
        status,
        admin_note: adminNote?.trim() || null,
        handled_at: status === 'pending' ? null : new Date().toISOString()
      })
      .eq('id', reportId)

    if (error) {
      console.error('שגיאה בעדכון דיווח:', error)

      alert(
        'לא הצלחנו לעדכן את הדיווח.\n\n' +
        error.message
      )

      return
    }

    await fetchReports()
  } catch (err) {
    console.error('שגיאה לא צפויה בעדכון דיווח:', err)

    alert(
      'אירעה שגיאה בעדכון הדיווח.\n\n' +
      (err?.message || 'שגיאה לא ידועה')
    )
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
    if (window.gtag) {
      window.gtag('event', 'sign_up', {
        method: 'email'
      })
    }

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

// התחברות באמצעות Google
const handleGoogleLogin = async () => {
  const redirectUrl = window.location.origin

  localStorage.setItem('kesefkis-google-oauth-started', '1')
  localStorage.setItem('kesefkis-google-oauth-time', String(Date.now()))

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl
    }
  })

  if (error) {
    localStorage.removeItem('kesefkis-google-oauth-started')
    localStorage.removeItem('kesefkis-google-oauth-time')
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
      listing_type: 'offer',
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
    let imageUrls = []

    // העלאת התמונה הראשית
    if (imageFile) {
      imageUrl = await uploadFileToStorage(
        imageFile,
        'listings-images'
      )
    }

    // העלאת התמונות הנוספות
    if (additionalImageFiles.length > 0) {
      imageUrls = await Promise.all(
        additionalImageFiles.map((file) =>
          uploadFileToStorage(file, 'listings-images')
        )
      )
    }

    const newListing = {
      title: formData.title,
      description: formData.description,
      price: formData.price
        ? parseFloat(formData.price)
        : null,
      listing_type: formData.listing_type,
      category: formData.category,
      location: formData.location,
      contact_name: formData.contact_name,
      phone: formData.phone,
      image_url: imageUrl,
      image_urls: imageUrls,
      user_id: user.id
    }

    const { error } = await supabase
      .from('listings')
      .insert([newListing])

    if (error) throw error

    setIsModalOpen(false)

    setImageFile(null)
    setAdditionalImageFiles([])

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
    listing_type: item.listing_type || 'offer',
    category: item.category || 'עבודות מזדמנות',
    location: item.location || '',
    contact_name: item.contact_name || '',
    phone: item.phone || ''
  })

  setImageFile(null)

  setExistingAdditionalImages(
    Array.isArray(item.image_urls)
      ? item.image_urls
      : []
  )

  setAdditionalImageFiles([])

  setRemoveMainImage(false)

  setIsEditModalOpen(true)
}

// שמירת שינויים בעריכת מודעה
const handleUpdateListing = async (e) => {
  e.preventDefault()
  if (!editingListing) return

  setIsSubmitting(true)

  try {
    // =========================================================
    // תמונה ראשית
    // =========================================================

    let imageUrl = removeMainImage
      ? null
      : editingListing.image_url || null

    // אם נבחרה תמונה חדשה - היא מחליפה את הראשית
    if (imageFile) {
      imageUrl = await uploadFileToStorage(
        imageFile,
        'listings-images'
      )
    }

    // =========================================================
    // תמונות נוספות קיימות
    // =========================================================

    const currentAdditionalImages = Array.isArray(
      existingAdditionalImages
    )
      ? existingAdditionalImages
      : []

    // =========================================================
    // תמונות נוספות חדשות
    // =========================================================

    let newAdditionalImageUrls = []

    if (additionalImageFiles.length > 0) {
      newAdditionalImageUrls = await Promise.all(
        additionalImageFiles.map((file) =>
          uploadFileToStorage(
            file,
            'listings-images'
          )
        )
      )
    }

    // לא יותר מ-4 תמונות נוספות
    const finalAdditionalImages = [
      ...currentAdditionalImages,
      ...newAdditionalImageUrls
    ].slice(0, 4)

    // =========================================================
    // נתוני המודעה
    // =========================================================

    const updatedData = {
      title: formData.title,
      description: formData.description,
      price: formData.price
        ? parseFloat(formData.price)
        : null,
      listing_type: formData.listing_type,
      category: formData.category,
      location: formData.location,
      contact_name: formData.contact_name,
      phone: formData.phone,
      image_url: imageUrl,
      image_urls: finalAdditionalImages,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('listings')
      .update(updatedData)
      .eq('id', editingListing.id)
      .select()

    if (error) {
      throw error
    }

    console.log('Updated successfully:', data)

    // איפוס
    setIsEditModalOpen(false)
    setEditingListing(null)
    setImageFile(null)
    setAdditionalImageFiles([])
    setExistingAdditionalImages([])
    setRemoveMainImage(false)

    await fetchListings()

  } catch (error) {
    console.error('Update error details:', error)

    alert(
      'שגיאה בעדכון המודעה: ' +
      (error.message || JSON.stringify(error))
    )

  } finally {
    setIsSubmitting(false)
  }
}



// =========================================================
// הוספה או הסרה ממודעות שאהבתי
// =========================================================

const toggleFavorite = (listingId) => {
  setFavoriteListings((previousFavorites) => {
    if (previousFavorites.includes(listingId)) {
      return previousFavorites.filter((id) => id !== listingId)
    }

    return [...previousFavorites, listingId]
  })
}



// מחיקת מודעה
const handleDeleteListing = async (id) => {
  if (!window.confirm('האם אתה בטוח שברצונך למחוק מודעה זו?')) return

  try {
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('שגיאה במחיקת מודעה:', error)

      alert(
        'שגיאה במחיקת המודעה:\n\n' +
        error.message
      )

      return
    }

    // רענון הרשימה לאחר מחיקה מוצלחת
    await fetchListings()

    alert('המודעה נמחקה בהצלחה.')
  } catch (err) {
    console.error('שגיאה לא צפויה במחיקת מודעה:', err)

    alert(
      'אירעה שגיאה לא צפויה במחיקת המודעה.\n\n' +
      (err?.message || 'שגיאה לא ידועה')
    )
  }
}

  const myListings = user
  ? listings.filter(item => item.user_id === user.id || !item.user_id)
  : []

const baseListings =
  currentView === 'my-listings'
    ? myListings
    : currentView === 'favorites'
      ? listings.filter(item => favoriteListings.includes(item.id))
      : listings

const displayedListings = baseListings.filter((item) => {
  const search = searchTerm.trim().toLowerCase()

  const matchesSearch =
    !search ||
    (item.title || '').toLowerCase().includes(search) ||
    (item.description || '').toLowerCase().includes(search) ||
    (item.category || '').toLowerCase().includes(search) ||
    (item.location || '').toLowerCase().includes(search)

  const matchesType =
    listingTypeFilter === 'all' ||
    item.listing_type === listingTypeFilter

  const matchesCategory =
    categoryFilter === 'all' ||
    item.category === categoryFilter

  const matchesLocation =
    locationFilter === 'all' ||
    item.location === locationFilter

  return (
    matchesSearch &&
    matchesType &&
    matchesCategory &&
    matchesLocation
  )
})

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dir-rtl font-sans pb-12">
      {/* סרגל עליון Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
  <div className="max-w-6xl mx-auto px-4 py-3">

    <div className="flex flex-wrap items-center justify-between gap-3">

      {/* לוגו */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-3xl">💰</span>

        <h1
          onClick={() => setCurrentView('home')}
          className="text-2xl font-extrabold text-slate-900 tracking-tight cursor-pointer"
        >
          כסף כיס
        </h1>
      </div>

      {/* צד ימין / מרכז */}
      <div className="flex items-center gap-2 flex-wrap justify-end">

        {/* משתמש מחובר */}
        {user ? (
          <div className="flex items-center gap-2 bg-slate-100 px-2 py-1.5 rounded-xl border border-slate-200">

            {/* תמונת פרופיל */}
            <label
              className="relative cursor-pointer group shrink-0"
              title="החלף תמונת פרופיל"
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleUpdateAvatar}
                className="hidden"
              />

              {(
                user.user_metadata?.avatar_url ||
                user.user_metadata?.picture ||
                user.identities?.[0]?.identity_data?.avatar_url ||
                user.identities?.[0]?.identity_data?.picture
              ) ? (
                <img
                  src={
                    user.user_metadata?.avatar_url ||
                    user.user_metadata?.picture ||
                    user.identities?.[0]?.identity_data?.avatar_url ||
                    user.identities?.[0]?.identity_data?.picture
                  }
                  alt="Profile"
                  className="w-9 h-9 rounded-full object-cover border border-slate-300"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
              )}
            </label>

            {/* מייל - רק במסכים גדולים */}
            <span className="text-xs text-slate-600 hidden lg:inline max-w-[150px] truncate">
              {user.email}
            </span>

            {/* המודעות שלי */}
            <button
              onClick={() =>
                setCurrentView(
                  currentView === 'my-listings'
                    ? 'home'
                    : 'my-listings'
                )
              }
              className={`text-xs font-bold px-2.5 py-1.5 rounded-lg transition whitespace-nowrap ${
                currentView === 'my-listings'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {currentView === 'my-listings'
                ? 'כל הלוח'
                : 'המודעות שלי'}
            </button>

            {/* מועדפים */}
            <button
              onClick={() =>
                setCurrentView(
                  currentView === 'favorites'
                    ? 'home'
                    : 'favorites'
                )
              }
              className={`relative text-xs font-bold px-2.5 py-1.5 rounded-lg transition whitespace-nowrap ${
                currentView === 'favorites'
                  ? 'bg-red-500 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              ❤️
              <span className="hidden sm:inline mr-1">
                שאהבתי
              </span>

              {favoriteListings.length > 0 && (
                <span className="absolute -top-2 -right-2 min-w-[19px] h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {favoriteListings.length > 99
                    ? '99+'
                    : favoriteListings.length}
                </span>
              )}
            </button>

            {/* הודעות */}
            <button
              onClick={() => setMessagesModalOpen(true)}
              className="relative text-xs font-bold px-2.5 py-1.5 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 transition whitespace-nowrap"
            >
              💬
              <span className="hidden sm:inline mr-1">
                הודעות
              </span>

              {unreadMessagesCount > 0 && (
                <span className="absolute -top-2 -right-2 min-w-[19px] h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadMessagesCount > 99
                    ? '99+'
                    : unreadMessagesCount}
                </span>
              )}
            </button>

            {/* ניהול דיווחים */}
            {isAdmin && (
              <button
                type="button"
                onClick={async () => {
                  setShowReportsAdmin(true)
                  await fetchReports()
                }}
                className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition whitespace-nowrap"
              >
                🚨
                <span className="hidden sm:inline mr-1">
                  ניהול
                </span>
              </button>
            )}

            {/* התנתקות */}
            <button
              onClick={handleLogout}
              className="text-xs text-red-600 hover:text-red-700 font-bold px-1.5 py-1 transition whitespace-nowrap"
            >
              יציאה
            </button>
          </div>
        ) : (
          /* התחברות */
          <button
            onClick={() => {
              setAuthMode('login')
              setIsAuthModalOpen(true)
            }}
            className="text-sm font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition whitespace-nowrap"
          >
            התחברות / הרשמה
          </button>
        )}

        {/* איך זה עובד */}
        <button
          type="button"
          onClick={() => setIsHowItWorksOpen(true)}
          className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition whitespace-nowrap"
        >
          ❓
          <span>איך זה עובד?</span>
        </button>

        {/* פרסם מודעה */}
        <button
          onClick={handleOpenPublishModal}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 sm:px-5 py-2.5 rounded-xl shadow-sm transition duration-150 flex items-center gap-2 cursor-pointer whitespace-nowrap"
        >
          <span className="text-lg leading-none">+</span>
          <span>פרסם מודעה</span>
        </button>

      </div>
    </div>
  </div>
</header>

      {/* אזור מרכזי */}
<main className="max-w-5xl mx-auto px-4 pt-8">
 {(currentView === 'home' || currentView === 'my-listings') && (
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
)}



















{/* בחירת סוג מודעה */}
{currentView === 'home' && (
  <div className="mb-5">
    <div className="text-center mb-3">
      <h3 className="text-lg font-bold text-slate-800">
        מה אתה מחפש?
      </h3>
      <p className="text-sm text-slate-500">
        בחר את סוג המודעות שמעניין אותך
      </p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

      {/* כל המודעות */}
      <button
        onClick={() => setListingTypeFilter('all')}
        className={`rounded-2xl border-2 p-4 text-center transition ${
          listingTypeFilter === 'all'
            ? 'border-slate-700 bg-slate-100 shadow-sm'
            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
        }`}
      >
        <div className="text-2xl mb-1">⚪</div>
        <div className="font-bold text-slate-800">
          כל המודעות
        </div>
        <div className="text-xs text-slate-500 mt-1">
          הצעות ובקשות
        </div>
      </button>

      {/* מציע עבודה */}
      <button
        onClick={() => setListingTypeFilter('offer')}
        className={`rounded-2xl border-2 p-4 text-center transition ${
          listingTypeFilter === 'offer'
            ? 'border-emerald-500 bg-emerald-50 shadow-sm'
            : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/40'
        }`}
      >
        <div className="text-2xl mb-1">🟢</div>
        <div className="font-bold text-slate-800">
          מציע עבודה / שירות
        </div>
        <div className="text-xs text-slate-500 mt-1">
          אנשים שמציעים שירות או עבודה
        </div>
      </button>

      {/* מחפש עבודה */}
      <button
        onClick={() => setListingTypeFilter('request')}
        className={`rounded-2xl border-2 p-4 text-center transition ${
          listingTypeFilter === 'request'
            ? 'border-blue-500 bg-blue-50 shadow-sm'
            : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/40'
        }`}
      >
        <div className="text-2xl mb-1">🔵</div>
        <div className="font-bold text-slate-800">
          מחפש שירות / עזרה
        </div>
        <div className="text-xs text-slate-500 mt-1">
          אנשים שמחפשים שירות או עזרה
        </div>
      </button>

    </div>
  </div>
)}

{currentView === 'home' && (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-5 mb-8">

    {/* חיפוש */}
    <div className="mb-4">
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        🔎 חיפוש במודעות
      </label>

      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="חפש עבודה, שירות, קטגוריה או אזור..."
        className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
      />
    </div>

    {/* מסננים */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

      {/* סוג מודעה */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
          סוג מודעה
        </label>

        <select
          value={listingTypeFilter}
          onChange={(e) => setListingTypeFilter(e.target.value)}
          className="w-full px-3 py-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">כל סוגי המודעות</option>
          <option value="offer">🟢 מציע עבודה / שירות</option>
          <option value="request">🔵 מחפש שירות / עזרה</option>
        </select>
      </div>

      {/* קטגוריה */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
          קטגוריה
        </label>

        <select
  value={categoryFilter}
  onChange={(e) => setCategoryFilter(e.target.value)}
  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
>
  <option value="all">כל הקטגוריות</option>

  {categories.map((category) => (
    <option key={category} value={category}>
      {category}
    </option>
  ))}
</select>
      </div>

      {/* אזור */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
          אזור
        </label>

        <div className="relative">
  <input
    type="text"
    value={locationFilter === 'all' ? '' : locationFilter}
    onChange={(e) => {
      setLocationFilter(e.target.value)
    }}
    placeholder="חפש עיר או יישוב..."
    autoComplete="off"
    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
  />

  {locationFilter !== 'all' && locationFilter.trim().length > 0 && (
    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
      {israeliLocations
        .filter((location) =>
          location
            .toLowerCase()
            .includes(locationFilter.trim().toLowerCase())
        )
        .slice(0, 12)
        .map((location) => (
          <button
            key={location}
            type="button"
            onClick={() => setLocationFilter(location)}
            className="w-full text-right px-4 py-3 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition border-b border-slate-100 last:border-b-0"
          >
            📍 {location}
          </button>
        ))}

      {israeliLocations.filter((location) =>
        location
          .toLowerCase()
          .includes(locationFilter.trim().toLowerCase())
      ).length === 0 && (
        <div className="px-4 py-3 text-sm text-slate-500">
          לא נמצא יישוב מתאים
        </div>
      )}
    </div>
  )}

  {locationFilter === 'all' && (
    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-sm">
      כל האזורים
    </div>
  )}

  {locationFilter !== 'all' && (
    <button
      type="button"
      onClick={() => setLocationFilter('all')}
      className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center text-sm transition"
      aria-label="נקה אזור"
      title="נקה אזור"
    >
      ×
    </button>
  )}
</div>
      </div>

    </div>

    {/* שורת תוצאות + ניקוי */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 pt-4 border-t border-slate-100">

      <div className="text-sm text-slate-500">
        נמצאו{' '}
        <span className="font-bold text-slate-800">
          {displayedListings.length}
        </span>{' '}
        מודעות
      </div>

      {(searchTerm ||
        listingTypeFilter !== 'all' ||
        categoryFilter !== 'all' ||
        locationFilter !== 'all') && (
        <button
          onClick={() => {
            setSearchTerm('')
            setListingTypeFilter('all')
            setCategoryFilter('all')
            setLocationFilter('all')
          }}
          className="text-sm font-semibold text-red-500 hover:text-red-600 transition"
        >
          ✕ נקה סינון
        </button>
      )}

    </div>
  </div>
)}
  

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
    : listings.length === 0
      ? 'עדיין אין מודעות בלוח.'
      : 'לא נמצאו מודעות התואמות לחיפוש או לסינון שבחרת.'}
</p>

      {currentView === 'my-listings' ? (
  <button
    onClick={handleOpenPublishModal}
    className="text-emerald-600 font-semibold hover:underline"
  >
    פרסם את המודעה הראשונה שלך!
  </button>
) : listings.length === 0 ? (
  <button
    onClick={handleOpenPublishModal}
    className="text-emerald-600 font-semibold hover:underline"
  >
    היה הראשון לפרסם מודעה!
  </button>
) : (
  <button
    onClick={() => {
      setSearchTerm('')
      setListingTypeFilter('all')
      setCategoryFilter('all')
      setLocationFilter('all')
    }}
    className="text-emerald-600 font-semibold hover:underline"
  >
    נקה את החיפוש והסינון
  </button>
)}
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
        className="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col cursor-pointer"
      >
        {/* תמונת המודעה */}
        <div className="relative">
          {item.image_url ? (
            <div className="w-full h-52 bg-slate-100 overflow-hidden">
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
              />
            </div>
          ) : (
            <div className="w-full h-32 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
              <span className="text-slate-400 text-sm font-medium">
                אין תמונה
              </span>
            </div>
          )}

          {/* כפתור מועדפים */}
<button
  type="button"
  onClick={(e) => {
    e.stopPropagation()
    toggleFavorite(item.id)
  }}
  aria-label={
    favoriteListings.includes(item.id)
      ? 'הסר מהמועדפים'
      : 'הוסף למועדפים'
  }
  className="absolute top-3 left-3 z-10 w-11 h-11 rounded-full bg-white/95 backdrop-blur-sm shadow-md flex items-center justify-center text-2xl hover:scale-110 transition-transform"
>
  {favoriteListings.includes(item.id) ? '❤️' : '🤍'}
</button>

          {/* תג סוג המודעה על התמונה */}
          <div className="absolute top-3 right-3">
            {item.listing_type === 'request' ? (
              <span className="inline-flex items-center gap-1.5 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                🔵 מחפש שירות
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                🟢 מציע שירות
              </span>
            )}
          </div>
        </div>

        {/* תוכן */}
        <div className="p-5 flex-1 flex flex-col">

          {/* קטגוריה + מחיר */}
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="inline-flex bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-bold px-2.5 py-1 rounded-lg">
              {item.category || 'כללי'}
            </span>

            {item.price ? (
              <span className="text-xl font-extrabold text-slate-900 whitespace-nowrap">
                ₪{item.price}
              </span>
            ) : (
              <span className="text-xs text-slate-400 font-medium">
                מחיר לא צוין
              </span>
            )}
          </div>

          {/* כותרת */}
          <h3 className="text-xl font-extrabold text-slate-900 mb-2 line-clamp-2 leading-snug group-hover:text-emerald-700 transition">
            {item.title}
          </h3>

          {/* תיאור */}
          <p className="text-slate-600 text-sm leading-6 mb-4 line-clamp-3">
            {item.description || 'ללא תיאור נוסף'}
          </p>

          {/* מיקום */}
          {item.location && (
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
              <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                📍
              </span>
              <span className="truncate">
                {item.location}
              </span>
            </div>
          )}

          {/* צפייה בפרטים */}
          <div className="mt-auto">
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-emerald-600 text-sm font-bold group-hover:translate-x-[-3px] transition-transform">
                לצפייה בפרטים
              </span>

              <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition">
                ←
              </span>
            </div>
          </div>
        </div>

        {/* אזור תחתון */}
        <div className="px-5 pb-5">

          {/* טלפון */}
          {item.phone && (
            <a
              href={`tel:${item.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2.5 rounded-xl text-sm font-semibold transition"
            >
              📞 {item.phone}
            </a>
          )}

          {/* פעולות בעל המודעה */}
          {isOwner && (
            <div className="flex gap-2 mt-2 pt-3 border-t border-slate-100">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleOpenEditModal(item)
                }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl text-xs font-bold transition"
              >
                ✏️ עריכה
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteListing(item.id)
                }}
                className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-xl text-xs font-bold transition"
              >
                🗑️ מחיקה
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
      <div className="flex items-center justify-between gap-3 p-5 border-b border-slate-100 sticky top-0 bg-white z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
            📋
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              פרטי המודעה
            </h2>

            <p className="text-xs text-slate-500 mt-0.5">
              כסף כיס
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* שיתוף */}
          <button
            onClick={() => handleShareListing(selectedListing)}
            className="h-10 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-sm transition flex items-center gap-2"
            aria-label="שיתוף המודעה"
          >
            <span>🔗</span>
            <span className="hidden sm:inline">שיתוף</span>
          </button>

          {/* דיווח */}
          <button
            type="button"
            onClick={() => {
              setReportReason('')
              setReportDetails('')
              setIsReportModalOpen(true)
            }}
            className="h-10 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-sm font-bold transition flex items-center gap-2"
          >
            ⚠️
            <span className="hidden sm:inline">
              דיווח
            </span>
          </button>

          {/* סגירה */}
          <button
            onClick={() => setSelectedListing(null)}
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xl transition"
            aria-label="סגירת חלון"
          >
            ×
          </button>
        </div>
      </div>

      {/* =========================================================
          גלריית תמונות
          ========================================================= */}
      <div className="w-full bg-slate-100 p-3 md:p-4">

        {(() => {
          const allImages = [
            ...(selectedListing.image_url
              ? [selectedListing.image_url]
              : []),
            ...(Array.isArray(selectedListing.image_urls)
              ? selectedListing.image_urls
              : [])
          ]

          if (allImages.length === 0) {
            return (
              <div className="w-full h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center text-slate-400">
                ללא תמונה
              </div>
            )
          }

          const mainImage = allImages[0]
          const thumbnails = allImages.slice(1)

          return (
            <>
              {/* =====================================================
                  תמונה ראשית
                  ===================================================== */}
              <button
                type="button"
                onClick={() => setGalleryImage(mainImage)}
                className="relative w-full h-64 md:h-80 bg-slate-200 rounded-2xl overflow-hidden group cursor-zoom-in block"
              >
                <img
                  src={mainImage}
                  alt={selectedListing.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white px-4 py-2 rounded-xl text-sm font-bold">
                    🔍 הגדל תמונה
                  </span>
                </div>
              </button>

              {/* =====================================================
                  תמונות נוספות
                  ===================================================== */}
              {thumbnails.length > 0 && (
                <div className="mt-3">

                  <div className="flex items-center justify-between mb-2 px-1">
                    <span className="text-xs font-bold text-slate-500">
                      📸 תמונות נוספות
                    </span>

                    <span className="text-xs text-slate-400">
                      {thumbnails.length} תמונות
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">

                    {thumbnails.map((imageUrl, index) => (
                      <button
                        key={`${imageUrl}-${index}`}
                        type="button"
                        onClick={() => {
                          setSelectedListing((previous) => ({
                            ...previous,
                            image_url: imageUrl,
                            image_urls: [
                              mainImage,
                              ...thumbnails.filter(
                                (_, thumbnailIndex) =>
                                  thumbnailIndex !== index
                              )
                            ]
                          }))
                        }}
                        className="relative h-28 sm:h-32 rounded-xl overflow-hidden bg-white border-2 border-transparent hover:border-emerald-500 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                      >
                        <img
                          src={imageUrl}
                          alt={`${selectedListing.title} - תמונה ${index + 2}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />

                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

                        <div className="absolute bottom-1 left-1 right-1 flex justify-center">
                          <span className="bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            הצג כתמונה ראשית
                          </span>
                        </div>
                      </button>
                    ))}

                  </div>
                </div>
              )}
            </>
          )
        })()}
      </div>

      {/* =========================================================
          תוכן המודעה
          ========================================================= */}
      <div className="p-6 md:p-8">

        {/* סוג המודעה + קטגוריה + מחיר */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">

          <div className="flex flex-wrap items-center gap-2">

            {selectedListing.listing_type === 'request' ? (
              <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-100 text-sm font-bold px-3 py-1.5 rounded-lg">
                🔵 מחפש שירות / עזרה
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 text-sm font-bold px-3 py-1.5 rounded-lg">
                🟢 מציע עבודה / שירות
              </span>
            )}

            <span className="bg-slate-50 text-slate-700 border border-slate-200 text-sm font-semibold px-3 py-1.5 rounded-lg">
              {selectedListing.category || 'כללי'}
            </span>

          </div>

          {selectedListing.price && (
            <span className="text-2xl font-extrabold text-slate-900 whitespace-nowrap">
              ₪{selectedListing.price}
            </span>
          )}

        </div>

        {/* כותרת */}
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-5 leading-tight">
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
              📅 פורסם:{' '}
              {new Date(
                selectedListing.created_at
              ).toLocaleDateString('he-IL')}
            </span>
          )}

          {selectedListing.updated_at &&
            selectedListing.created_at &&
            new Date(selectedListing.updated_at).getTime() >
              new Date(selectedListing.created_at).getTime() + 60000 && (
              <span className="bg-blue-50 border border-blue-100 text-blue-700 rounded-lg px-3 py-2">
                🔄 עודכן:{' '}
                {new Date(
                  selectedListing.updated_at
                ).toLocaleDateString('he-IL')}
              </span>
            )}

        </div>

        {/* תיאור מלא */}
        <div className="mb-8">

          <h3 className="text-lg font-bold text-slate-900 mb-3">
            אודות המודעה
          </h3>

          <p className="text-slate-600 leading-8 whitespace-pre-wrap">
            {selectedListing.description || 'לא נוסף תיאור למודעה.'}
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
                {user?.user_metadata?.full_name || 'משתמש רשום'}
              </p>

              <p className="text-sm text-slate-500">
                מפרסם מודעה בלוח המקומי
              </p>
            </div>

          </div>

          {/* כפתורי פעולה */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">

            {/* צור קשר */}
            {selectedListing.phone && (
              <button
                onClick={() => setContactListing(selectedListing)}
                className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition"
              >
                💬 צור קשר עם המפרסם
              </button>
            )}

            {/* שיתוף */}
            <button
              onClick={() => handleShareListing(selectedListing)}
              className="flex items-center justify-center gap-2 w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3.5 rounded-xl transition"
            >
              🔗 שתף את המודעה
            </button>

          </div>
        </div>

        {/* סגירה */}
        <button
          onClick={() => setSelectedListing(null)}
          className="w-full mt-4 py-3 text-sm font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          סגור
        </button>

      </div>
    </div>

    {/* =========================================================
        חלון תמונה מוגדלת
        ========================================================= */}
    {galleryImage && (
      <div
        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={() => setGalleryImage(null)}
      >

        {/* סגירה */}
        <button
          type="button"
          onClick={() => setGalleryImage(null)}
          className="absolute top-4 right-4 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl flex items-center justify-center transition"
          aria-label="סגור תמונה"
        >
          ×
        </button>

        {/* התמונה */}
        <img
          src={galleryImage}
          alt={selectedListing.title}
          onClick={(e) => e.stopPropagation()}
          className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
        />

      </div>
    )}

  </div>
)}



{isReportModalOpen && (
  <div
    className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    onClick={() => setIsReportModalOpen(false)}
  >
    <div
      dir="rtl"
      className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-gradient-to-br from-red-500 to-rose-600 px-6 py-6 text-white">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-3xl mb-2">
              ⚠️
            </div>

            <h2 className="text-2xl font-extrabold">
              דיווח על מודעה
            </h2>

            <p className="text-red-50 text-sm mt-1">
              עזור לנו לשמור על לוח מודעות בטוח ואמין
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsReportModalOpen(false)}
            className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-xl transition"
            aria-label="סגירה"
          >
            ×
          </button>
        </div>
      </div>

      <div className="p-6 space-y-5">

        {selectedListing && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <p className="text-xs text-slate-400 font-semibold mb-1">
              המודעה שעליה מדווחים
            </p>

            <p className="font-extrabold text-slate-900 line-clamp-2">
              {selectedListing.title}
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-extrabold text-slate-800 mb-2">
            סיבת הדיווח
          </label>

          <select
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition"
          >
            <option value="">
              בחר סיבה
            </option>

            <option value="תוכן אסור">
              תוכן אסור
            </option>

            <option value="תוכן מיני">
              תוכן מיני
            </option>

            <option value="הונאה או התחזות">
              הונאה או התחזות
            </option>

            <option value="ספאם">
              ספאם או פרסום לא רצוי
            </option>

            <option value="תוכן פוגעני">
              תוכן פוגעני או מאיים
            </option>

            <option value="מידע מטעה">
              מידע מטעה או שקרי
            </option>

            <option value="אחר">
              סיבה אחרת
            </option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-extrabold text-slate-800 mb-2">
            פרטים נוספים
            <span className="text-slate-400 font-normal mr-1">
              (לא חובה)
            </span>
          </label>

          <textarea
            value={reportDetails}
            onChange={(e) => setReportDetails(e.target.value)}
            rows={4}
            maxLength={1000}
            placeholder="אפשר לפרט מה הבעיה במודעה..."
            className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition resize-none"
          />

          <div className="text-left text-xs text-slate-400 mt-1">
            {reportDetails.length}/1000
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-sm text-amber-800 leading-6">
            הדיווח ייבדק על ידי מפעיל האתר. אין להשתמש במערכת הדיווחים
            לצורך הטרדה או דיווחים כוזבים.
          </p>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={() => setIsReportModalOpen(false)}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold transition"
          >
            ביטול
          </button>

          <button
  type="button"
  disabled={!reportReason}
  onClick={async () => {
    if (!reportReason || !selectedListing) return

    if (!user) {
      alert('כדי לדווח על מודעה צריך להתחבר לחשבון.')
      return
    }

    try {
      const { error } = await supabase
        .from('reports')
        .insert({
          listing_id: selectedListing.id,
          reporter_id: user.id,
          reason: reportReason,
          details: reportDetails.trim() || null
        })

      if (error) {
        console.error('שגיאה בשליחת דיווח:', error)

        alert(
          'לא הצלחנו לשלוח את הדיווח.\n\n' +
          error.message
        )

        return
      }

      alert('הדיווח התקבל. תודה שעזרת לנו לשמור על האתר.')

      setIsReportModalOpen(false)
      setReportReason('')
      setReportDetails('')
    } catch (err) {
      console.error('שגיאה לא צפויה בשליחת דיווח:', err)

      alert(
        'אירעה שגיאה בשליחת הדיווח.\n\n' +
        (err?.message || 'שגיאה לא ידועה')
      )
    }
  }}
  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold transition"
>
  שליחת דיווח
</button>
        </div>

      </div>
    </div>
  </div>
)}





{showReportsAdmin && (
  <div
    className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    onClick={() => setShowReportsAdmin(false)}
  >
    <div
      dir="rtl"
      className="w-full max-w-5xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >

      {/* כותרת */}
      <div className="bg-gradient-to-br from-red-600 to-rose-700 px-6 py-6 text-white flex items-center justify-between gap-4">
        <div>
          <div className="text-3xl mb-2">
            🚨
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold">
            ניהול דיווחים
          </h2>

          <p className="text-red-100 text-sm mt-1">
            דיווחים שהתקבלו ממשתמשי האתר
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowReportsAdmin(false)}
          className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-xl transition"
          aria-label="סגירה"
        >
          ×
        </button>
      </div>

      {/* תוכן */}
      <div className="p-6 overflow-y-auto">

        {reportsLoading ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-4">
              ⏳
            </div>

            <p className="text-slate-500 font-semibold">
              טוען דיווחים...
            </p>
          </div>
        ) : reports.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-5xl mb-4">
              ✅
            </div>

            <h3 className="text-xl font-extrabold text-slate-900">
              אין דיווחים
            </h3>

            <p className="text-slate-500 mt-2">
              כרגע לא התקבלו דיווחים על מודעות.
            </p>
          </div>
        ) : (
          <div className="space-y-5">

            {reports.map((report) => (
              <div
                key={report.id}
                className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm"
              >

                {/* כותרת הדיווח */}
                <div className="p-5 bg-slate-50 border-b border-slate-200">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">

                        <span className="text-xs font-bold bg-red-100 text-red-700 px-2.5 py-1 rounded-lg">
                          ⚠️ {report.reason}
                        </span>

                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                            report.status === 'pending'
                              ? 'bg-amber-100 text-amber-700'
                              : report.status === 'resolved'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {report.status === 'pending'
                            ? 'ממתין לטיפול'
                            : report.status === 'resolved'
                              ? 'טופל'
                              : 'נסגר'}
                        </span>

                      </div>

                      <h3 className="text-lg font-extrabold text-slate-900">
                        {report.listings?.title || 'המודעה אינה זמינה'}
                      </h3>

                      <p className="text-xs text-slate-400 mt-1">
                        דווח בתאריך:{' '}
                        {new Date(report.created_at).toLocaleString('he-IL')}
                      </p>
                    </div>

                  </div>
                </div>

                {/* תוכן הדיווח */}
                <div className="p-5 space-y-4">

                  {report.listings && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                      <p className="text-xs font-bold text-slate-400 mb-2">
                        פרטי המודעה
                      </p>

                      <p className="font-bold text-slate-900">
                        {report.listings.title}
                      </p>

                      {report.listings.description && (
                        <p className="text-sm text-slate-600 mt-2 leading-6">
                          {report.listings.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2 mt-3">

                        {report.listings.category && (
                          <span className="text-xs bg-white border border-slate-200 text-slate-600 px-2.5 py-1 rounded-lg">
                            {report.listings.category}
                          </span>
                        )}

                        {report.listings.location && (
                          <span className="text-xs bg-white border border-slate-200 text-slate-600 px-2.5 py-1 rounded-lg">
                            📍 {report.listings.location}
                          </span>
                        )}

                        {report.listings.price && (
                          <span className="text-xs bg-white border border-slate-200 text-slate-600 px-2.5 py-1 rounded-lg">
                            ₪{report.listings.price}
                          </span>
                        )}

                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-bold text-slate-400 mb-1">
                      פרטי הדיווח
                    </p>

                    <p className="text-sm text-slate-700 leading-6">
                      {report.details || 'המשתמש לא הוסיף פרטים נוספים.'}
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
  <p className="text-xs font-bold text-blue-600 mb-1">
    מזהה המדווח
  </p>

  <p className="text-xs text-blue-800 break-all font-mono">
    {report.reporter_id || 'לא זמין'}
  </p>
</div>

<div className="border-t border-slate-200 pt-4 mt-4">

  <label className="block text-xs font-extrabold text-slate-500 mb-2">
    הערה פנימית למנהל
  </label>

  <textarea
    defaultValue={report.admin_note || ''}
    id={`report-note-${report.id}`}
    rows={3}
    placeholder="לדוגמה: בדקתי את המודעה ונראה שהכול תקין..."
    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 resize-none"
  />

  <div className="flex flex-wrap gap-2 mt-3">

    <button
      type="button"
      onClick={() => {
        const note =
          document.getElementById(`report-note-${report.id}`)?.value || ''

        updateReportStatus(
          report.id,
          'resolved',
          note
        )
      }}
      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition"
    >
      🟢 סמן כטופל
    </button>

    <button
      type="button"
      onClick={() => {
        const note =
          document.getElementById(`report-note-${report.id}`)?.value || ''

        updateReportStatus(
          report.id,
          'dismissed',
          note
        )
      }}
      className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold transition"
    >
      ⚪ סגור ללא פעולה
    </button>

    {report.status !== 'pending' && (
      <button
        type="button"
        onClick={() => {
          const note =
            document.getElementById(`report-note-${report.id}`)?.value || ''

          updateReportStatus(
            report.id,
            'pending',
            note
          )
        }}
        className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-4 py-2.5 rounded-xl text-sm font-bold transition"
      >
        ↩️ החזר להמתנה
      </button>
    )}

  </div>

</div>

                </div>

              </div>
            ))}

          </div>
        )}

      </div>

      {/* תחתית */}
      <div className="border-t border-slate-200 p-4 bg-slate-50 flex justify-end">
        <button
          type="button"
          onClick={() => setShowReportsAdmin(false)}
          className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-5 py-2.5 rounded-xl font-bold transition"
        >
          סגור
        </button>
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
  <label className="block text-xs font-medium text-slate-700 mb-1">
    סוג המודעה
  </label>

  <select
    name="listing_type"
    value={formData.listing_type}
    onChange={handleChange}
    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
  >
    <option value="offer">🟢 אני מציע עבודה / שירות</option>
    <option value="request">🔵 אני מחפש שירות / עזרה</option>
  </select>
</div>

<div>
  <label className="block text-xs font-medium text-slate-700 mb-1">
    קטגוריה
  </label>

  <select
    name="category"
    value={formData.category}
    onChange={handleChange}
    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
  >
    {categories.map((category) => (
      <option key={category} value={category}>
        {category}
      </option>
    ))}
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
                  <div className="relative">
  <input
    type="text"
    name="location"
    value={formData.location}
    onChange={handleChange}
    placeholder="הקלד עיר או יישוב..."
    autoComplete="off"
    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
  />

  {formData.location.trim().length > 0 && (
    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
      {israeliLocations
        .filter((location) =>
          location
            .toLowerCase()
            .includes(formData.location.trim().toLowerCase())
        )
        .slice(0, 12)
        .map((location) => (
          <button
            key={location}
            type="button"
            onClick={() =>
              setFormData((previous) => ({
                ...previous,
                location
              }))
            }
            className="w-full text-right px-4 py-3 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition border-b border-slate-100 last:border-b-0"
          >
            📍 {location}
          </button>
        ))}

      {israeliLocations.filter((location) =>
        location
          .toLowerCase()
          .includes(formData.location.trim().toLowerCase())
      ).length === 0 && (
        <div className="px-4 py-3 text-sm text-slate-500">
          לא נמצא יישוב מתאים
        </div>
      )}
    </div>
  )}
</div>
                </div>
              </div>

              <div>
  <label className="block text-xs font-medium text-slate-700 mb-1">
    תמונה ראשית
  </label>

  <input
    type="file"
    accept="image/*"
    onChange={(e) => setImageFile(e.target.files[0] || null)}
    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
  />

  <p className="text-xs text-slate-400 mt-1">
    התמונה הזו תופיע כתמונה הראשית של המודעה.
  </p>
</div>

<div>
  <label className="block text-xs font-medium text-slate-700 mb-1">
    תמונות נוספות
  </label>

  <input
    type="file"
    accept="image/*"
    multiple
    onChange={(e) => {
  const selectedFiles = Array.from(e.target.files || [])

  setAdditionalImageFiles((previousFiles) => {
    const combinedFiles = [...previousFiles, ...selectedFiles]

    return combinedFiles.slice(0, 4)
  })

  e.target.value = ''
}}
    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
  />

  {additionalImageFiles.length > 0 && (
  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
    {additionalImageFiles.map((file, index) => (
      <div
        key={`${file.name}-${index}`}
        className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50"
      >
        <img
          src={URL.createObjectURL(file)}
          alt={`תמונה נוספת ${index + 1}`}
          className="w-full h-24 object-cover"
        />

        <button
          type="button"
          onClick={() => {
            setAdditionalImageFiles((previousFiles) =>
              previousFiles.filter((_, fileIndex) => fileIndex !== index)
            )
          }}
          className="absolute top-1 left-1 w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center text-sm font-bold shadow"
          title="הסר תמונה"
        >
          ×
        </button>
      </div>
    ))}
  </div>
)}

  <p className="text-xs text-slate-400 mt-1">
    ניתן להוסיף עד 4 תמונות נוספות.
  </p>
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
      {/* מודאל עריכת מודעה */}
{isEditModalOpen && (
  <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">

      {/* סגירה */}
      <button
        type="button"
        onClick={() => setIsEditModalOpen(false)}
        className="absolute top-4 left-4 text-slate-400 hover:text-slate-600 text-xl font-bold"
      >
        ✕
      </button>

      <h3 className="text-xl font-bold text-slate-900 mb-5">
        עריכת מודעה
      </h3>

      <form onSubmit={handleUpdateListing} className="space-y-4">

        {/* =====================================================
            סוג המודעה
            ===================================================== */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-2">
            סוג המודעה
          </label>

          <div className="grid grid-cols-2 gap-3">

            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  listing_type: 'request'
                }))
              }
              className={`p-3 rounded-xl border-2 text-sm font-bold transition ${
                formData.listing_type === 'request'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200'
              }`}
            >
              🔵 מחפש שירות / עזרה
            </button>

            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  listing_type: 'offer'
                }))
              }
              className={`p-3 rounded-xl border-2 text-sm font-bold transition ${
                formData.listing_type === 'offer'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-200'
              }`}
            >
              🟢 מציע עבודה / שירות
            </button>

          </div>
        </div>

        {/* =====================================================
            כותרת
            ===================================================== */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            כותרת המודעה *
          </label>

          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* =====================================================
            קטגוריה
            ===================================================== */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            קטגוריה
          </label>

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* =====================================================
            מחיר + מיקום
            ===================================================== */}
        <div className="grid grid-cols-2 gap-3">

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              מחיר (₪)
            </label>

            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              עיר / אזור
            </label>

            <select
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">
                בחר עיר / יישוב
              </option>

              {israeliLocations.map((location) => (
                <option
                  key={location}
                  value={location}
                >
                  {location}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* =====================================================
            תמונה ראשית
            ===================================================== */}
        <div>

          <label className="block text-xs font-medium text-slate-700 mb-2">
            תמונה ראשית
          </label>

          {editingListing?.image_url && !removeMainImage && (
            <div className="relative mb-3 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">

              <img
                src={
                  imageFile
                    ? URL.createObjectURL(imageFile)
                    : editingListing.image_url
                }
                alt="תמונה ראשית"
                className="w-full h-40 object-cover"
              />

              <button
                type="button"
                onClick={() => {
                  setRemoveMainImage(true)
                  setImageFile(null)
                }}
                className="absolute top-2 left-2 w-9 h-9 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center font-bold shadow"
                title="הסר תמונה ראשית"
              >
                ×
              </button>

              {imageFile && (
                <div className="absolute bottom-2 right-2 bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                  תמונה חדשה
                </div>
              )}

            </div>
          )}

          {removeMainImage && (
            <div className="mb-3 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 flex items-center justify-between gap-3">

              <span>
                🗑️ התמונה הראשית תוסר בשמירה
              </span>

              <button
                type="button"
                onClick={() => setRemoveMainImage(false)}
                className="text-xs font-bold text-red-700 hover:text-red-900 underline"
              >
                ביטול
              </button>

            </div>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0] || null

              if (file) {
                setImageFile(file)
                setRemoveMainImage(false)
              }
            }}
            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
          />

          <p className="text-xs text-slate-400 mt-1">
            בחר תמונה חדשה אם ברצונך להחליף את התמונה הראשית.
          </p>

        </div>

        {/* =====================================================
            תמונות נוספות קיימות
            ===================================================== */}
        <div>

          <div className="flex items-center justify-between mb-2">

            <label className="block text-xs font-medium text-slate-700">
              תמונות נוספות
            </label>

            <span className="text-xs text-slate-400">
              {existingAdditionalImages.length}/4
            </span>

          </div>

          {existingAdditionalImages.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mb-3">

              {existingAdditionalImages.map(
                (imageUrl, index) => (
                  <div
                    key={`${imageUrl}-${index}`}
                    className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50"
                  >

                    <img
                      src={imageUrl}
                      alt={`תמונה נוספת ${index + 1}`}
                      className="w-full h-28 object-cover"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        setExistingAdditionalImages(
                          (previousImages) =>
                            previousImages.filter(
                              (_, imageIndex) =>
                                imageIndex !== index
                            )
                        )
                      }}
                      className="absolute top-2 left-2 w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center font-bold shadow"
                      title="מחק תמונה"
                    >
                      ×
                    </button>

                  </div>
                )
              )}

            </div>
          )}

          {/* ===================================================
              תמונות חדשות שנבחרו
              =================================================== */}
          {additionalImageFiles.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mb-3">

              {additionalImageFiles.map(
                (file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="relative rounded-xl overflow-hidden border border-emerald-200 bg-emerald-50"
                  >

                    <img
                      src={URL.createObjectURL(file)}
                      alt={`תמונה חדשה ${index + 1}`}
                      className="w-full h-28 object-cover"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        setAdditionalImageFiles(
                          (previousFiles) =>
                            previousFiles.filter(
                              (_, fileIndex) =>
                                fileIndex !== index
                            )
                        )
                      }}
                      className="absolute top-2 left-2 w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center font-bold shadow"
                      title="הסר תמונה"
                    >
                      ×
                    </button>

                    <div className="absolute bottom-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                      חדשה
                    </div>

                  </div>
                )
              )}

            </div>
          )}

          {/* ===================================================
              הוספת תמונות
              =================================================== */}
          {existingAdditionalImages.length +
            additionalImageFiles.length < 4 && (
            <>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {

                  const selectedFiles = Array.from(
                    e.target.files || []
                  )

                  const remainingSlots =
                    4 -
                    existingAdditionalImages.length -
                    additionalImageFiles.length

                  const filesToAdd =
                    selectedFiles.slice(
                      0,
                      remainingSlots
                    )

                  setAdditionalImageFiles(
                    (previousFiles) => [
                      ...previousFiles,
                      ...filesToAdd
                    ]
                  )

                  e.target.value = ''
                }}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
              />

              <p className="text-xs text-slate-400 mt-1">
                ניתן להוסיף עד 4 תמונות נוספות בסך הכול.
              </p>
            </>
          )}

          {existingAdditionalImages.length +
            additionalImageFiles.length >= 4 && (
            <p className="text-xs text-emerald-600 font-semibold mt-1">
              ✓ הגעת למקסימום של 4 תמונות נוספות.
            </p>
          )}

        </div>

        {/* =====================================================
            תיאור
            ===================================================== */}
        <div>

          <label className="block text-xs font-medium text-slate-700 mb-1">
            תיאור מפורט
          </label>

          <textarea
            name="description"
            rows="3"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

        </div>

        {/* =====================================================
            פרטי קשר
            ===================================================== */}
        <div className="grid grid-cols-2 gap-3">

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              שם איש קשר
            </label>

            <input
              type="text"
              name="contact_name"
              value={formData.contact_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              מספר טלפון
            </label>

            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

        </div>

        {/* =====================================================
            כפתורים
            ===================================================== */}
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
            {isSubmitting
              ? 'מעדכן...'
              : 'שמור שינויים'}
          </button>

        </div>

      </form>
    </div>
  </div>
)}



{isHowItWorksOpen && (
  <div
    className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
    onClick={() => setIsHowItWorksOpen(false)}
  >
    <div
      className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-200"
      onClick={(e) => e.stopPropagation()}
      dir="rtl"
    >
      {/* כותרת */}
      <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-slate-100">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">
            💰 איך כסף כיס עובד?
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            מקום פשוט לחבר בין אנשים שמציעים עבודה ושירותים לבין מי שצריך אותם.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsHowItWorksOpen(false)}
          className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xl transition"
          aria-label="סגור"
        >
          ×
        </button>
      </div>

      <div className="p-6 space-y-5">

        {/* מציע */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-start gap-3">
            <div className="text-3xl">🟢</div>

            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                מציע עבודה / שירות
              </h3>

              <p className="text-sm text-slate-700 mt-2 leading-6">
                יש לך שירות, עבודה או משימה שאתה מוכן לבצע?
                פרסם מודעה עם פרטים, מחיר ואזור — ואנשים שמחפשים
                שירות יוכלו למצוא אותך וליצור איתך קשר.
              </p>
            </div>
          </div>
        </div>

        {/* מחפש */}
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <div className="flex items-start gap-3">
            <div className="text-3xl">🔵</div>

            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                מחפש שירות / עזרה
              </h3>

              <p className="text-sm text-slate-700 mt-2 leading-6">
  צריך שמישהו יבצע עבורך עבודה, משימה או שירות?
  חפש בלוח לפי תחום, אזור וסוג מודעה,
  פתח את המודעה שמעניינת אותך ושלח למפרסם הודעה.
</p>
            </div>
          </div>
        </div>

        {/* פרסום */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="text-lg font-extrabold text-slate-900 mb-4">
            📢 איך מפרסמים מודעה?
          </h3>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="w-7 h-7 shrink-0 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold">
                1
              </span>
              <p className="text-sm text-slate-700 pt-1">
                נרשמים או מתחברים באמצעות Google.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-7 h-7 shrink-0 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold">
                2
              </span>
              <p className="text-sm text-slate-700 pt-1">
                לוחצים על <strong>פרסם מודעה</strong>.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-7 h-7 shrink-0 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold">
                3
              </span>
              <p className="text-sm text-slate-700 pt-1">
                בוחרים אם אתם מציעים שירות או מחפשים משימה.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-7 h-7 shrink-0 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold">
                4
              </span>
              <p className="text-sm text-slate-700 pt-1">
                מוסיפים כותרת, תיאור, מחיר ואזור ומפרסמים.
              </p>
            </div>
          </div>
        </div>

        {/* כלים */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
            <div className="text-2xl mb-2">❤️</div>
            <h3 className="font-extrabold text-slate-900">
              שמירת מודעות
            </h3>
            <p className="text-sm text-slate-600 mt-1 leading-6">
              מצאת מודעה שמעניינת אותך?
              לחץ על הלב והיא תישמר תחת "שאהבתי".
            </p>
          </div>

          <div className="rounded-2xl border border-purple-100 bg-purple-50 p-5">
            <div className="text-2xl mb-2">💬</div>
            <h3 className="font-extrabold text-slate-900">
              שליחת הודעות
            </h3>
            <p className="text-sm text-slate-600 mt-1 leading-6">
              אפשר ליצור קשר עם מפרסם המודעה
              באמצעות מערכת ההודעות באתר.
            </p>
          </div>

        </div>

        {/* סיום */}
        <div className="rounded-2xl bg-slate-900 text-white p-5 text-center">
          <div className="text-lg font-extrabold">
            פשוט מפרסמים, מחפשים ומתחברים.
          </div>

          <p className="text-sm text-slate-300 mt-1">
            כסף כיס — לוח עבודות ושירותים מקומיים.
          </p>
        </div>

      </div>

      {/* תחתית */}
      <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
        <button
          type="button"
          onClick={() => setIsHowItWorksOpen(false)}
          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold transition"
        >
          הבנתי
        </button>
      </div>
    </div>
  </div>
)}



      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer className="mt-16 bg-white border-t border-slate-200">
  <div className="max-w-5xl mx-auto px-4 py-10">

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">

      {/* לוגו ותיאור */}
      <div className="text-center md:text-right">
        <div className="flex items-center justify-center md:justify-start gap-2">
          <span className="text-3xl">💰</span>
          <span className="text-xl font-extrabold text-slate-900">
            כסף כיס
          </span>
        </div>

        <p className="text-sm text-slate-500 mt-2 leading-6">
          לוח עבודות ושירותים מקומיים
        </p>

        <p className="text-xs text-slate-400 mt-1">
          מפרסמים, מחפשים ומתחברים.
        </p>
      </div>

      {/* שיתוף האתר */}
      <div className="text-center">
        <h3 className="text-sm font-extrabold text-slate-900 mb-2">
          📣 שתפו את כסף כיס
        </h3>

        <p className="text-xs text-slate-500 leading-5 mb-4">
          מכירים מישהו שמחפש עבודה או שירות?
          <br />
          שתפו את הלוח והגיעו לעוד אנשים.
        </p>

        <div className="flex items-center justify-center gap-2 flex-wrap">

          {/* WhatsApp */}
          <button
            type="button"
            onClick={() => {
              const text =
                'כסף כיס – לוח עבודות ושירותים מקומיים. מציעים עבודה או מחפשים שירות? בואו לראות:'
              const url = window.location.origin

              window.open(
                `https://wa.me/?text=${encodeURIComponent(
                  `${text} ${url}`
                )}`,
                '_blank',
                'noopener,noreferrer'
              )
            }}
            className="w-10 h-10 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center text-lg transition hover:-translate-y-0.5"
            aria-label="שתף בוואטסאפ"
            title="שתף בוואטסאפ"
          >
            💬
          </button>

          {/* Facebook */}
          <button
            type="button"
            onClick={() => {
              const url = window.location.origin

              window.open(
                `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                  url
                )}`,
                '_blank',
                'width=600,height=500,noopener,noreferrer'
              )
            }}
            className="w-10 h-10 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center text-lg font-bold transition hover:-translate-y-0.5"
            aria-label="שתף בפייסבוק"
            title="שתף בפייסבוק"
          >
            f
          </button>

          {/* Telegram */}
          <button
            type="button"
            onClick={() => {
              const url = window.location.origin
              const text = 'כסף כיס – לוח עבודות ושירותים מקומיים'

              window.open(
                `https://t.me/share/url?url=${encodeURIComponent(
                  url
                )}&text=${encodeURIComponent(text)}`,
                '_blank',
                'noopener,noreferrer'
              )
            }}
            className="w-10 h-10 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 flex items-center justify-center text-lg transition hover:-translate-y-0.5"
            aria-label="שתף בטלגרם"
            title="שתף בטלגרם"
          >
            ✈️
          </button>

          {/* העתקת קישור */}
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(
                  window.location.origin
                )
                alert('הקישור לאתר הועתק בהצלחה.')
              } catch (error) {
                console.error('שגיאה בהעתקת הקישור:', error)
                alert('לא הצלחנו להעתיק את הקישור.')
              }
            }}
            className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center text-lg transition hover:-translate-y-0.5"
            aria-label="העתק קישור לאתר"
            title="העתק קישור"
          >
            🔗
          </button>

        </div>
      </div>

      {/* ניווט */}
      <div className="text-center md:text-right">
        <h3 className="text-sm font-extrabold text-slate-900 mb-3">
          קישורים
        </h3>

        <nav className="flex flex-col gap-2 text-sm">
          <Link
            to="/"
            className="text-slate-600 hover:text-emerald-600 transition"
          >
            לוח המודעות
          </Link>

          <Link
            to="/contact"
            className="text-slate-600 hover:text-emerald-600 transition"
          >
            צור קשר
          </Link>

          <Link
            to="/terms"
            className="text-slate-600 hover:text-emerald-600 transition"
          >
            תנאי שימוש
          </Link>

          <Link
            to="/privacy"
            className="text-slate-600 hover:text-emerald-600 transition"
          >
            מדיניות פרטיות
          </Link>
        </nav>
      </div>

    </div>

    {/* תחתית */}
    <div className="border-t border-slate-100 mt-8 pt-5 text-center">
      <p className="text-xs text-slate-400">
        © {new Date().getFullYear()} כסף כיס. כל הזכויות שמורות.
      </p>
    </div>

  </div>
</footer>

    </div>
  )
}

function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    setSuccess('')
    setError('')

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.subject.trim() ||
      !formData.message.trim()
    ) {
      setError('נא למלא את כל השדות.')
      return
    }

    setSending(true)

    try {
      const { data, error: invokeError } = await supabase.functions.invoke(
        'send-contact-email',
        {
          body: {
            name: formData.name,
            email: formData.email,
            subject: formData.subject,
            message: formData.message
          }
        }
      )

      if (invokeError) {
        throw invokeError
      }

      if (data?.error) {
        throw new Error(data.error)
      }

      setSuccess('הפנייה נשלחה בהצלחה! נחזור אליך בהקדם.')

      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      })
    } catch (err) {
      console.error('שגיאה בשליחת טופס צור קשר:', err)

      setError(
        err?.message ||
        'אירעה שגיאה בשליחת הפנייה. נסה שוב בעוד כמה רגעים.'
      )
    } finally {
      setSending(false)
    }
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-slate-50 text-slate-900"
    >
      <div className="max-w-4xl mx-auto px-4 py-10 md:py-16">

        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition"
          >
            ← חזרה ללוח המודעות
          </Link>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 px-6 py-10 md:px-10 text-white">
            <div className="text-4xl mb-4">
              💬
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
              צור קשר
            </h1>

            <p className="text-emerald-50 text-base md:text-lg leading-8">
              יש לך שאלה, הצעה לשיפור או דיווח על בעיה?
              אפשר לשלוח לנו הודעה ישירות דרך הטופס.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-6 md:p-10 space-y-6"
          >

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  שם
                </label>

                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value
                    })
                  }
                  placeholder="השם שלך"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  אימייל
                </label>

                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value
                    })
                  }
                  placeholder="name@example.com"
                  dir="ltr"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  required
                />
              </div>

            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                נושא הפנייה
              </label>

              <input
                type="text"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    subject: e.target.value
                  })
                }
                placeholder="במה אפשר לעזור?"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                הודעה
              </label>

              <textarea
                value={formData.message}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    message: e.target.value
                  })
                }
                placeholder="כתוב כאן את הפנייה שלך..."
                rows={7}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 resize-y"
                required
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                {success}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={sending}
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-8 py-3.5 font-bold transition shadow-sm"
              >
                {sending ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    שולח...
                  </>
                ) : (
                  <>
                    📩 שליחת פנייה
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-6">
              הפרטים שתמסור בטופס ישמשו לצורך מענה לפנייה שלך.
            </p>

          </form>
        </div>
      </div>
    </div>
  )
}




function TermsPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-10 md:py-16">

        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition"
          >
            ← חזרה ללוח המודעות
          </Link>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 px-6 py-10 md:px-10 text-white">
            <div className="text-4xl mb-4">
              📋
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
              תנאי שימוש
            </h1>

            <p className="text-emerald-50 text-sm md:text-base">
              תנאי השימוש באתר כסף כיס
            </p>
          </div>

          <div className="p-6 md:p-10 space-y-8 text-slate-700 leading-8">

            <div>
              <p className="text-sm text-slate-400 mb-6">
                עודכן לאחרונה: ספטמבר 2026
              </p>

              <p>
                ברוכים הבאים לאתר <strong>כסף כיס</strong> (להלן:
                "האתר"). האתר נועד לשמש לוח מקוון המאפשר למשתמשים
                לפרסם, למצוא וליצור קשר בנוגע לעבודות, שירותים ומשימות שונות.
              </p>

              <p className="mt-4">
                השימוש באתר, לרבות גלישה בו, יצירת חשבון, פרסום מודעה,
                שליחת הודעה או יצירת קשר עם משתמש אחר, מהווה הסכמה לתנאי
                שימוש אלה.
              </p>
            </div>

            <section>
              <h2 className="text-xl font-extrabold text-slate-900 mb-3">
                1. הגדרות
              </h2>

              <p>
                <strong>"האתר"</strong> – אתר כסף כיס וכל השירותים המקוונים
                המופעלים במסגרתו.
              </p>

              <p className="mt-2">
                <strong>"משתמש"</strong> – כל אדם הגולש באתר או עושה בו שימוש.
              </p>

              <p className="mt-2">
                <strong>"מודעה"</strong> – כל פרסום, הצעה, בקשה או תוכן
                שמועלה לאתר על ידי משתמש.
              </p>

              <p className="mt-2">
                <strong>"שירות"</strong> – מערכת, כלי או אפשרות המוצעים
                באמצעות האתר, לרבות פרסום מודעות, חיפוש מודעות, יצירת קשר
                והודעות בין משתמשים.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-slate-900 mb-3">
                2. השימוש באתר
              </h2>

              <p>האתר מיועד לשימוש חוקי בלבד.</p>

              <p className="mt-3">
                המשתמש מתחייב שלא להשתמש באתר לצורך:
              </p>

              <ul className="list-disc pr-6 mt-2 space-y-1">
                <li>פעילות בלתי חוקית.</li>
                <li>הונאה, התחזות או הטעיה.</li>
                <li>פרסום מידע כוזב ביודעין.</li>
                <li>פגיעה, איום או הטרדה של משתמשים אחרים.</li>
                <li>הפצת תוכן פוגעני, בלתי חוקי או מפר זכויות.</li>
                <li>איסוף אוטומטי או שיטתי של מידע ממשתמשים ללא הרשאה.</li>
                <li>ניסיון לפגוע בפעילות האתר, במערכותיו או באבטחתו.</li>
                <li>שימוש באתר לצורך שליחת הודעות ספאם או פרסום בלתי רצוי.</li>
              </ul>

              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
                <h3 className="text-lg font-extrabold text-red-800 mb-3">
                  תוכן מיני ותוכן אסור
                </h3>

                <p className="text-red-900">
                  אין לפרסם באתר, להעלות אליו או להעביר באמצעותו תוכן בעל
                  אופי מיני או פורנוגרפי.
                </p>

                <p className="mt-3 text-red-900">
                  האיסור כולל, בין היתר:
                </p>

                <ul className="list-disc pr-6 mt-2 space-y-1 text-red-900">
                  <li>הצעה או פרסום של שירותי מין.</li>
                  <li>
                    הצעה או פרסום של מפגשים בעלי אופי מיני בתשלום.
                  </li>
                  <li>תמונות עירום או תמונות בעלות אופי מיני בוטה.</li>
                  <li>סרטונים או הקלטות בעלי אופי מיני.</li>
                  <li>תוכן פורנוגרפי.</li>
                  <li>
                    פרסום תמונה, סרטון או הקלטה של אדם אחר ללא הסכמתו.
                  </li>
                  <li>
                    תוכן מיני הקשור לקטינים או המתאר קטינים.
                  </li>
                  <li>
                    הצעות, הודעות או פניות בעלות אופי מיני המפרות את החוק
                    או את זכויותיו של אדם אחר.
                  </li>
                </ul>

                <p className="mt-4 text-red-900">
                  מפעיל האתר רשאי להסיר ללא הודעה מוקדמת כל תוכן המפר
                  סעיף זה, וכן להגביל או להשעות את חשבון המשתמש שפרסם אותו.
                </p>

                <p className="mt-3 text-red-900">
                  במקרים שבהם הדבר נדרש לפי דין, ניתן יהיה להעביר מידע
                  לרשויות המוסמכות.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-slate-900 mb-3">
                3. חשבון משתמש
              </h2>

              <p>
                חלק מהשירותים באתר עשויים לדרוש התחברות באמצעות חשבון משתמש.
              </p>

              <p className="mt-3">
                המשתמש אחראי לשמירה על הגישה לחשבונו ועל הפעולות המתבצעות
                באמצעותו.
              </p>

              <p className="mt-3">
                אין להעביר לאחרים פרטי התחברות או לאפשר שימוש בלתי מורשה
                בחשבון.
              </p>

              <p className="mt-3">
                במקרה של חשד לשימוש בלתי מורשה בחשבון, מומלץ לפנות לאתר
                בהקדם.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-slate-900 mb-3">
                4. פרסום מודעות
              </h2>

              <p>
                המשתמש אחראי באופן מלא לתוכן המודעה שהוא מפרסם.
              </p>

              <p className="mt-3">
                בעת פרסום מודעה, המשתמש מתחייב כי:
              </p>

              <ul className="list-disc pr-6 mt-2 space-y-1">
                <li>המידע שמסר נכון ככל הידוע לו.</li>
                <li>המודעה אינה מטעה.</li>
                <li>התוכן אינו מפר את החוק.</li>
                <li>התוכן אינו מפר זכויות של אדם או גוף אחר.</li>
                <li>
                  אין לפרסם פרטים אישיים של אדם אחר ללא הרשאה מתאימה.
                </li>
                <li>
                  אין לפרסם תוכן פוגעני, מאיים או בלתי חוקי.
                </li>
              </ul>

              <p className="mt-3">
                האתר רשאי להסיר מודעה או להגביל את החשבון של משתמש במקרה
                של הפרת תנאים אלה, שימוש לרעה באתר או חשש להפרת החוק.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-slate-900 mb-3">
                5. אחריות על עסקאות והתקשרויות בין משתמשים
              </h2>

              <p>
                האתר משמש כפלטפורמה לפרסום וקישור בין משתמשים.
              </p>

              <p className="mt-3">
                האתר <strong>אינו צד להתקשרות</strong> בין משתמשים ואינו
                אחראי לעסקה, עבודה, שירות, תשלום או הסכמה שנוצרו בעקבות מודעה.
              </p>

              <p className="mt-3">
                כל התקשרות בין משתמשים נעשית באחריותם הבלעדית.
              </p>

              <p className="mt-3">
                המשתמשים אחראים בעצמם לבדוק את זהות הצד השני, את פרטי
                העבודה או השירות, את המחיר, את תנאי ההתקשרות ואת התאמתם
                לצורכיהם.
              </p>

              <p className="mt-3">
                האתר אינו מתחייב כי כל מודעה, משתמש, שירות או הצעה המופיעים
                באתר הם אמינים, זמינים, מתאימים או נטולי סיכון.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-slate-900 mb-3">
                6. תשלומים
              </h2>

              <p>
                האתר אינו מבצע, נכון למועד פרסום תנאים אלה, תשלומים או
                סליקה בין משתמשים עבור העסקאות המבוצעות בעקבות מודעות.
              </p>

              <p className="mt-3">
                כל תשלום בין משתמשים, אם יבוצע, הוא באחריות הצדדים
                המעורבים בלבד.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-slate-900 mb-3">
                7. תוכן שמועלה על ידי משתמשים
              </h2>

              <p>
                תוכן שמועלה לאתר על ידי משתמשים עשוי להיות גלוי למשתמשים
                אחרים בהתאם לאופן השימוש באתר.
              </p>

              <p className="mt-3">
                המשתמש אחראי לכך שיש לו את הזכויות וההרשאות הדרושות
                להעלאת התוכן.
              </p>

              <p className="mt-3">
                אין להעלות תמונות, טקסטים או חומרים השייכים לאחרים ללא
                הרשאה מתאימה.
              </p>

              <p className="mt-3">
                האתר רשאי להסיר תוכן אשר לדעתו מפר את תנאי השימוש, את
                החוק או את זכויותיהם של אחרים.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-slate-900 mb-3">
                8. הודעות ותקשורת בין משתמשים
              </h2>

              <p>
                האתר עשוי לאפשר למשתמשים לשלוח הודעות פרטיות זה לזה.
              </p>

              <p className="mt-3">
                אין להשתמש במערכת ההודעות לצורך הטרדה, איום, הונאה,
                ספאם או פעילות בלתי חוקית.
              </p>

              <p className="mt-3">
                המשתמש אחראי לתוכן ההודעות שהוא שולח.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-slate-900 mb-3">
                9. זמינות האתר
              </h2>

              <p>
                האתר מופעל במטרה לספק שירות זמין ותקין, אולם לא ניתן
                להבטיח זמינות רציפה או פעולה ללא תקלות.
              </p>

              <p className="mt-3">
                ייתכנו הפסקות זמניות עקב תחזוקה, תקלות טכניות, עדכונים,
                בעיות תשתית או גורמים שאינם בשליטת מפעיל האתר.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-slate-900 mb-3">
                10. קישורים ושירותים של צדדים שלישיים
              </h2>

              <p>
                האתר עשוי לעשות שימוש בשירותים חיצוניים או להפנות לשירותים
                ואתרים של צדדים שלישיים.
              </p>

              <p className="mt-3">
                השימוש בשירות חיצוני עשוי להיות כפוף לתנאים ולמדיניות
                הפרטיות של אותו גורם.
              </p>

              <p className="mt-3">
                האתר אינו אחראי לתוכן, לזמינות או להתנהלות של שירותים
                חיצוניים שאינם בשליטתו.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-slate-900 mb-3">
                11. זכויות באתר
              </h2>

              <p>
                האתר, לרבות העיצוב, הקוד, המבנה, הלוגו, השם, הגרפיקה
                ורכיבים מקוריים אחרים, עשוי להיות מוגן בזכויות לפי כל דין.
              </p>

              <p className="mt-3">
                אין להעתיק, לשכפל, להפיץ, למכור או לעשות שימוש מסחרי
                בתוכן או ברכיבים השייכים לאתר ללא הרשאה מתאימה.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-slate-900 mb-3">
                12. הגבלת אחריות
              </h2>

              <p>
                האתר מסופק כפי שהוא (AS IS), בכפוף להוראות כל דין.
              </p>

              <p className="mt-3">
                מפעיל האתר אינו מתחייב כי המידע המופיע במודעות יהיה מדויק,
                מלא או עדכני בכל עת.
              </p>

              <p className="mt-3">
                מפעיל האתר אינו אחראי לתוצאות של התקשרות, עבודה, שירות,
                עסקה או מפגש בין משתמשים.
              </p>

              <p className="mt-3">
                אין באמור בסעיף זה כדי לגרוע מאחריות שלא ניתן להגביל או
                לשלול על פי דין.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-slate-900 mb-3">
                13. פרטיות
              </h2>

              <p>
                השימוש במידע אישי במסגרת האתר נעשה בהתאם למדיניות הפרטיות
                של האתר.
              </p>

              <p className="mt-3">
                ניתן לעיין במדיניות הפרטיות בעמוד
                {' '}
                <Link
                  to="/privacy"
                  className="font-bold text-emerald-600 hover:text-emerald-700"
                >
                  מדיניות פרטיות
                </Link>
                {' '}
                באתר.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-slate-900 mb-3">
                14. שינויים באתר ובתנאים
              </h2>

              <p>
                מפעיל האתר רשאי לשנות, לעדכן, להוסיף או להסיר תכונות
                ושירותים באתר מעת לעת.
              </p>

              <p className="mt-3">
                כמו כן, ניתן לעדכן תנאי שימוש אלה מעת לעת בהתאם לשינויים
                באתר, בדין או באופן הפעלתו.
              </p>

              <p className="mt-3">
                תאריך העדכון האחרון יופיע בראש מסמך זה.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-slate-900 mb-3">
                15. דין וסמכות שיפוט
              </h2>

              <p>
                על השימוש באתר ועל תנאי שימוש אלה יחולו דיני מדינת ישראל.
              </p>

              <p className="mt-3">
                כל מחלוקת הנוגעת לשימוש באתר תהיה כפופה לסמכותם של בתי
                המשפט המוסמכים בישראל, בכפוף להוראות הדין.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-slate-900 mb-3">
                16. יצירת קשר
              </h2>

              <p>
                לשאלות, דיווח על תוכן בעייתי, פנייה בנושא האתר או בירור
                בנוגע לתנאי השימוש ניתן לפנות דרך עמוד
                {' '}
                <Link
                  to="/contact"
                  className="font-bold text-emerald-600 hover:text-emerald-700"
                >
                  צור קשר
                </Link>
                {' '}
                באתר.
              </p>
            </section>

            <div className="border-t border-slate-200 pt-6 mt-10">
              <p className="text-sm text-slate-400">
                כסף כיס – לוח עבודות ושירותים מקומיים
              </p>

              <p className="text-xs text-slate-400 mt-1">
                תאריך עדכון: ספטמבר 2026
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}





function PrivacyPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-10 md:py-16">

        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition"
          >
            ← חזרה ללוח המודעות
          </Link>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 px-6 py-10 md:px-10 text-white">
            <div className="text-4xl mb-4">
              🔒
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
              מדיניות פרטיות
            </h1>

            <p className="text-emerald-50 text-sm md:text-base">
              כיצד כסף כיס אוסף, משתמש ושומר מידע אישי
            </p>
          </div>

          <div className="p-6 md:p-10 space-y-8 text-slate-700 leading-8">

            <div>
              <p className="text-sm text-slate-400 mb-6">
                עודכן לאחרונה: ספטמבר 2026
              </p>

              <p>
                אתר <strong>כסף כיס</strong> מכבד את פרטיות המשתמשים שלו.
                מדיניות זו מסבירה איזה מידע עשוי להיאסף במסגרת השימוש באתר,
                כיצד נעשה בו שימוש, עם אילו ספקי שירות הוא עשוי להיות מעובד
                ומהן האפשרויות העומדות לרשות המשתמשים.
              </p>

              <p className="mt-4">
                מדיניות זו חלה על השימוש באתר ובשירותים המופעלים במסגרתו.
              </p>
            </div>

            <section>
              <h2 className="text-xl font-extrabold text-slate-900 mb-3">
                1. איזה מידע עשוי להיאסף?
              </h2>

              <p>
                בהתאם לאופן השימוש באתר, עשוי להיאסף או להימסר מידע כגון:
              </p>

              <ul className="list-disc pr-6 mt-3 space-y-1">
                <li>שם או שם תצוגה של המשתמש.</li>
                <li>כתובת דואר אלקטרוני.</li>
                <li>מספר טלפון, כאשר המשתמש בוחר לפרסם אותו במודעה.</li>
                <li>תוכן מודעות שהמשתמש מפרסם.</li>
                <li>קטגוריה, מחיר, מיקום ותיאור של מודעה.</li>
                <li>תמונות שהמשתמש בוחר להעלות למודעה.</li>
                <li>הודעות הנשלחות באמצעות מערכת ההודעות באתר.</li>
                <li>פרטים שנמסרים באמצעות טופס "צור קשר".</li>
                <li>מידע טכני הנדרש להפעלת האתר, אבטחתו ושיפור השירות.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-slate-900 mb-3">
                2. התחברות באמצעות Google
              </h2>

              <p>
                האתר מאפשר התחברות באמצעות חשבון Google.
              </p>

              <p className="mt-3">
                כאשר משתמש בוחר להתחבר באמצעות Google, האתר עשוי לקבל מ-Google
                פרטי חשבון בסיסיים הנדרשים ליצירת וניהול חשבון המשתמש באתר,
                בהתאם להרשאות ולמידע ש-Google מאפשרת להעביר.
              </p>

              <p className="mt-3">
                השימוש של Google במידע כפוף למדיניות הפרטיות ולתנאי השימוש
                של Google.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-slate-900 mb-3">
                3. מידע שמופיע במודעות
              </h2>

              <p>
                כאשר משתמש מפרסם מודעה, הוא עשוי לבחור לפרסם מידע כגון שם,
                מספר טלפון, מיקום, מחיר, תיאור ותמונה.
              </p>

              <p className="mt-3">
                מידע שהמשתמש בוחר להציג במסגרת מודעה עשוי להיות גלוי למשתמשים
                אחרים באתר.
              </p>

              <p className="mt-3">
                לכן מומלץ שלא לפרסם במודעות מידע אישי שאינו נחוץ לצורך
                המודעה, כגון מספרי תעודות, סיסמאות, פרטי אשראי או מידע
                אישי רגיש אחר.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-slate-900 mb-3">
                4. מערכת ההודעות
              </h2>

              <p>
                האתר מאפשר למשתמשים לשלוח הודעות פרטיות למשתמשים אחרים
                בקשר למודעות.
              </p>

              <p className="mt-3">
                הודעות אלה עשויות להישמר במערכות האתר לצורך הפעלת שירות
                ההודעות, הצגת שיחות קודמות, סימון הודעות שנקראו ותפעול
                השירות.
              </p>

              <p className="mt-3">
                אין לשלוח באמצעות מערכת ההודעות מידע שאינו נדרש לצורך
                ההתקשרות או מידע רגיש שאינך מעוניין להעביר לצד השני.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-slate-900 mb-3">
                5. טופס "צור קשר"
              </h2>

              <p>
                כאשר משתמש שולח פנייה באמצעות טופס "צור קשר", המידע שהוא
                מוסר בטופס עשוי לכלול שם, כתובת דואר אלקטרוני, נושא ותוכן
                ההודעה.
              </p>

              <p className="mt-3">
                המידע משמש לצורך קבלת הפנייה, טיפול בה ומתן מענה למשתמש.
              </p>

              <p className="mt-3">
                הפנייה נשלחת לכתובת הדואר האלקטרוני של מפעיל האתר.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-slate-900 mb-3">
                6. מטרות השימוש במידע
              </h2>

              <p>
                המידע שנאסף או נמסר במסגרת השימוש באתר עשוי לשמש, בהתאם
                לנסיבות, למטרות הבאות:
              </p>

              <ul className="list-disc pr-6 mt-3 space-y-1">
                <li>יצירת וניהול חשבון משתמש.</li>
                <li>הפעלת שירותי האתר.</li>
                <li>פרסום והצגת מודעות.</li>
                <li>אפשרות ליצור קשר בין משתמשים.</li>
                <li>הפעלת מערכת ההודעות.</li>
                <li>מענה לפניות שירות ותמיכה.</li>
                <li>טיפול בתקלות ובבעיות טכניות.</li>
                <li>אבטחת האתר ומניעת שימוש לרעה.</li>
                <li>שיפור השירות והתפקוד של האתר.</li>
                <li>עמידה בדרישות הדין, כאשר הדבר נדרש.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-slate-900 mb-3">
                7. שירותים וספקים חיצוניים
              </h2>

              <p>
                לצורך הפעלת האתר עשויים להיות בשימוש ספקי שירות חיצוניים
                המספקים תשתיות טכנולוגיות, אחסון, אימות משתמשים, שירותי
                דואר אלקטרוני או שירותים טכניים אחרים.
              </p>

              <p className="mt-3">
                נכון למועד עדכון מדיניות זו, האתר משתמש בין היתר בשירותי
                <strong> Supabase </strong>
                לצורך תשתיות backend, מסד נתונים ואימות משתמשים, ובשירותי
                <strong> Resend </strong>
                לצורך שליחת הודעות דואר אלקטרוני מטופס "צור קשר".
              </p>

              <p className="mt-3">
                ספקים אלה עשויים לעבד מידע בהתאם לשירות שהם מספקים ולתנאים
                ולמדיניות הפרטיות החלים עליהם.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-slate-900 mb-3">
                8. שמירת מידע
              </h2>

              <p>
                מידע עשוי להישמר למשך התקופה הנדרשת לצורך המטרות שלשמן נאסף,
                לצורך הפעלת השירות, שמירה על אבטחתו, טיפול במחלוקות או
                בהתאם לדרישות הדין.
              </p>

              <p className="mt-3">
                כאשר מידע אינו נדרש עוד למטרות אלה, ניתן למחוק אותו או
                להפוך אותו למידע שאינו מאפשר זיהוי, בכפוף למגבלות טכניות
                ולדרישות הדין.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-slate-900 mb-3">
                9. אבטחת מידע
              </h2>

              <p>
                אנו נוקטים אמצעים סבירים ומתאימים במטרה להגן על המידע
                שבמערכות האתר מפני גישה בלתי מורשית, שימוש לרעה, שינוי,
                אובדן או חשיפה.
              </p>

              <p className="mt-3">
                עם זאת, אין מערכת מקוונת שניתן להבטיח שתהיה חסינה לחלוטין
                מפני כל סיכון אבטחה.
              </p>

              <p className="mt-3">
                במקרה של אירוע אבטחה המחייב פעולה או דיווח בהתאם לדין,
                יינקטו הצעדים הנדרשים לפי הוראות הדין.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-slate-900 mb-3">
                10. מסירת מידע לצדדים שלישיים
              </h2>

              <p>
                האתר אינו מוכר מידע אישי של משתמשים לצדדים שלישיים לצורך
                מכירת מאגרי מידע.
              </p>

              <p className="mt-3">
                מידע עשוי להיות מועבר או להיות נגיש לספקי שירות הנדרשים
                להפעלת האתר, כמפורט במדיניות זו.
              </p>

              <p className="mt-3">
                מידע עשוי להימסר גם כאשר הדבר נדרש או מותר על פי דין,
                לרבות בעקבות דרישה של רשות מוסמכת.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-slate-900 mb-3">
                11. מידע ציבורי
              </h2>

              <p>
                מידע שמשתמש בוחר לפרסם במודעה, לרבות פרטי התקשרות, עשוי
                להיות מידע גלוי למשתמשים אחרים באתר.
              </p>

              <p className="mt-3">
                המשתמש אחראי לבחירת המידע שהוא מפרסם במסגרת מודעה.
              </p>

              <p className="mt-3">
                לאחר פרסום מידע בפומבי, ייתכן שמשתמשים אחרים יוכלו להעתיק,
                לשמור או לעשות בו שימוש בהתאם לנסיבות. לכן מומלץ להימנע
                מפרסום מידע אישי שאינו נדרש לצורך המודעה.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-slate-900 mb-3">
                12. עוגיות וטכנולוגיות דומות
              </h2>

              <p>
                האתר עשוי להשתמש בעוגיות (Cookies), אחסון מקומי או
                טכנולוגיות דומות הנדרשות להפעלת האתר, לשמירת העדפות,
                לניהול התחברות ולשיפור חוויית השימוש.
              </p>

              <p className="mt-3">
                ניתן לשנות הגדרות מסוימות בדפדפן בנוגע לעוגיות, אולם
                חסימתן עשויה להשפיע על חלק מהפונקציות באתר.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-slate-900 mb-3">
                13. זכויות המשתמש
              </h2>

              <p>
                בהתאם להוראות הדין, עשויות לעמוד לאדם זכויות ביחס למידע
                אישי הנוגע אליו, לרבות זכויות עיון ותיקון, והכול בכפוף
                לתנאים, לסייגים ולחריגים הקבועים בדין.
              </p>

              <p className="mt-3">
                בקשות הנוגעות למידע אישי ניתן להפנות באמצעות עמוד
                <Link
                  to="/contact"
                  className="font-bold text-emerald-600 hover:text-emerald-700 mx-1"
                >
                  צור קשר
                </Link>
                באתר.
              </p>

              <p className="mt-3">
                כדי שנוכל לטפל בבקשה, ייתכן שנבקש פרטים סבירים הדרושים
                לצורך זיהוי הפונה ובדיקת הבקשה.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-slate-900 mb-3">
                14. מחיקת חשבון ומידע
              </h2>

              <p>
                משתמש המעוניין למחוק את חשבונו או לבקש את מחיקת מידע
                אישי הנוגע אליו יכול לפנות באמצעות עמוד "צור קשר".
              </p>

              <p className="mt-3">
                בקשת מחיקה תיבחן בהתאם להוראות הדין, לצרכים התפעוליים של
                האתר ולחובות שמירת מידע החלות, ככל שישנן.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-slate-900 mb-3">
                15. מידע של קטינים
              </h2>

              <p>
                האתר אינו מיועד לאיסוף מכוון של מידע אישי מילדים או קטינים
                ללא הסכמה או אישור הנדרשים לפי דין.
              </p>

              <p className="mt-3">
                אם נודע לנו כי נאסף מידע אישי של קטין בניגוד לדין, ניתן
                לפנות אלינו באמצעות עמוד "צור קשר".
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-slate-900 mb-3">
                16. עדכונים למדיניות הפרטיות
              </h2>

              <p>
                אנו עשויים לעדכן מדיניות זו מעת לעת, למשל בעקבות שינוי
                בשירותי האתר, בטכנולוגיה, באופן השימוש במידע או בדרישות
                הדין.
              </p>

              <p className="mt-3">
                תאריך העדכון האחרון יופיע בראש מדיניות זו.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-slate-900 mb-3">
                17. יצירת קשר בנושא פרטיות
              </h2>

              <p>
                לשאלות, בקשות או פניות הנוגעות לפרטיות ולמידע אישי ניתן
                לפנות באמצעות עמוד
                <Link
                  to="/contact"
                  className="font-bold text-emerald-600 hover:text-emerald-700 mx-1"
                >
                  צור קשר
                </Link>
                באתר.
              </p>
            </section>

            <div className="border-t border-slate-200 pt-6 mt-10">
              <p className="text-sm text-slate-400">
                כסף כיס – לוח עבודות ושירותים מקומיים
              </p>

              <p className="text-xs text-slate-400 mt-1">
                תאריך עדכון: ספטמבר 2026
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}


export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="*" element={<App />} />
      </Routes>
    </BrowserRouter>
  )
}