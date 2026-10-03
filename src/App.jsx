import React, { useEffect, useState } from 'react'

function loadGoogleAnalytics() {
  if (window.__kesefkisGA) return

  window.dataLayer = window.dataLayer || []

  window.gtag = function() {
    window.dataLayer.push(arguments)
  }

  window.gtag('js', new Date())
  window.gtag('config', 'G-RD0QFQGNSW')

  const script = document.createElement('script')
  script.async = true
  script.src = 'https://www.googletagmanager.com/gtag/js?id=G-RD0QFQGNSW'
  document.head.appendChild(script)

  window.__kesefkisGA = true
}
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import { israeliLocations } from './data/israeliLocations'
import { supabase } from './supabaseClient'

function App() {

  const navigate = useNavigate()
  const location = useLocation()

  const getRelativeTime = (createdAt) => {
    if (!createdAt) return ''

    const created = new Date(createdAt)
    const now = new Date()

    if (Number.isNaN(created.getTime())) return ''

    const diffMs = now.getTime() - created.getTime()

    // אם מסיבה כלשהי התאריך בעתיד
    if (diffMs < 0) return 'עלה עכשיו'

    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMinutes < 1) {
      return 'עלה עכשיו'
    }

    if (diffMinutes < 60) {
      return diffMinutes === 1
        ? 'עלה לפני דקה'
        : `עלה לפני ${diffMinutes} דקות`
    }

    if (diffHours < 24) {
      if (diffHours === 1) return 'עלה לפני שעה'
      if (diffHours === 2) return 'עלה לפני שעתיים'

      return `עלה לפני ${diffHours} שעות`
    }

    if (diffDays === 1) {
      return 'עלה אתמול'
    }

    if (diffDays < 7) {
      return `עלה לפני ${diffDays} ימים`
    }

    const diffWeeks = Math.floor(diffDays / 7)

    if (diffWeeks < 4) {
      return diffWeeks === 1
        ? 'עלה לפני שבוע'
        : `עלה לפני ${diffWeeks} שבועות`
    }

    const diffMonths = Math.floor(diffDays / 30)

    if (diffMonths < 12) {
      return diffMonths === 1
        ? 'עלה לפני חודש'
        : `עלה לפני ${diffMonths} חודשים`
    }

    const diffYears = Math.floor(diffDays / 365)

    return diffYears === 1
      ? 'עלה לפני שנה'
      : `עלה לפני ${diffYears} שנים`
  }

  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [scrollToListings, setScrollToListings] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault()
      setDeferredPrompt(event)
    }

    const handleAppInstalled = () => {
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallApp = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()

    const { outcome } = await deferredPrompt.userChoice

    console.log(`PWA install result: ${outcome}`)

    setDeferredPrompt(null)
  }

  const categories = [
  'תיקונים לבית',
  'ניקיון',
  'צבע ושיפוצים',
  'אינסטלציה',
  'חשמל',
  'הובלות',
  'הרכבות והתקנות',
  'חפצים',
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

  const [analyticsConsent, setAnalyticsConsent] = useState(() => {
    return localStorage.getItem('kesefkis-analytics-consent') || ''
  })

  useEffect(() => {
    if (analyticsConsent === 'accepted') {
      loadGoogleAnalytics()
    }
  }, [analyticsConsent])

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
const [searchTerm, setSearchTerm] = useState(() => {
  const params = new URLSearchParams(location.search)
  return params.get('search') || ''
})

const [listingTypeFilter, setListingTypeFilter] = useState(() => {
  const params = new URLSearchParams(location.search)
  return params.get('type') || 'all'
})

const [categoryFilter, setCategoryFilter] = useState(() => {
  const params = new URLSearchParams(location.search)

  const pathParts = decodeURIComponent(location.pathname)
    .split('/')
    .filter(Boolean)

  if (
    pathParts.length === 2 &&
    pathParts[0] === 'קטגוריה'
  ) {
    const categorySlug = pathParts[1]

    const category = categories.find((item) => {
      const slug = item
        .trim()
        .replace(/\s+/g, '-')

      return slug === categorySlug
    })

    if (category) {
      return category
    }
  }

  return params.get('category') || 'all'
})

const [locationFilter, setLocationFilter] = useState(() => {
  const params = new URLSearchParams(location.search)

  const pathParts = decodeURIComponent(location.pathname)
    .split('/')
    .filter(Boolean)

  if (
    pathParts.length === 2 &&
    pathParts[0] === 'מיקום'
  ) {
    const locationSlug = pathParts[1]

    return locationSlug.replace(/-/g, ' ')
  }

  return params.get('location') || 'all'
})




// =========================================
// מיקום המשתמש
// =========================================
const [userLocation, setUserLocation] = useState(null)
const [userCity, setUserCity] = useState('')
const [locationLoading, setLocationLoading] = useState(false)
const [locationError, setLocationError] = useState('')
const [nearbyOnly, setNearbyOnly] = useState(false)
const [locationRadius, setLocationRadius] = useState(5)
const [sortByDistance, setSortByDistance] = useState(false)
const [listingSort, setListingSort] = useState('newest')

const requestUserLocation = () => {
  if (!navigator.geolocation) {
    setLocationError('הדפדפן שלך לא תומך בזיהוי מיקום')
    return
  }

  setLocationLoading(true)
  setLocationError('')
  setUserCity('')

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords

      setUserLocation({
        latitude,
        longitude
      })

      console.log('📍 מיקום המשתמש:', {
        latitude,
        longitude
      })

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=he`
        )

        if (!response.ok) {
          throw new Error('שגיאה בקבלת כתובת')
        }

        const data = await response.json()

        const city =
          data.address?.city ||
          data.address?.town ||
          data.address?.village ||
          data.address?.municipality ||
          ''

        if (city) {
          console.log('🏙️ העיר שזוהתה:', city)

          setUserCity(city)
          setLocationError('')
        } else {
          setLocationError('המיקום זוהה, אך לא הצלחנו לזהות את העיר')
        }
      } catch (error) {
        console.error('שגיאה בזיהוי העיר:', error)
        setLocationError('המיקום זוהה, אך לא הצלחנו לזהות את העיר')
      } finally {
        setLocationLoading(false)
      }
    },
    (error) => {
      setLocationLoading(false)

      if (error.code === error.PERMISSION_DENIED) {
        setLocationError('הגישה למיקום נחסמה')
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        setLocationError('לא ניתן לזהות את המיקום כרגע')
      } else {
        setLocationError('לא הצלחנו לזהות את המיקום')
      }

      console.error('שגיאת מיקום:', {
        code: error.code,
        message: error.message,
        error
      })
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000
    }
  )
}




useEffect(() => {
  const params = new URLSearchParams()

  if (searchTerm.trim()) {
    params.set('search', searchTerm.trim())
  }

  if (listingTypeFilter !== 'all') {
    params.set('type', listingTypeFilter)
  }

  if (categoryFilter !== 'all') {
    params.set('category', categoryFilter)
  }

  if (locationFilter !== 'all') {
    params.set('location', locationFilter)
  }

  const query = params.toString()
  const newUrl = query ? `/?${query}` : '/'

  if (
  location.pathname === '/' &&
  location.search !== `?${query}`
) {
  navigate(newUrl, { replace: true })
}
}, [
  searchTerm,
  listingTypeFilter,
  categoryFilter,
  locationFilter
])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ניהול תצוגה: 'home' ללוח הראשי, 'my-listings' למודעות שלי
  const [currentView, setCurrentView] = useState('home')
  const [showAllCategories, setShowAllCategories] = useState(false)


  const [selectedListing, setSelectedListing] = useState(null)
  const [expandedListings, setExpandedListings] = useState({})
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false)
const [reportReason, setReportReason] = useState('')
const [reportDetails, setReportDetails] = useState('')

const [reports, setReports] = useState([])
const [isAdmin, setIsAdmin] = useState(false)
const [showReportsAdmin, setShowReportsAdmin] = useState(false)
const [showFeaturedAdmin, setShowFeaturedAdmin] = useState(false)
const [featuredAdminLoading, setFeaturedAdminLoading] = useState(null)
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





  // ניהול הדגשת מודעות - מנהל בלבד
  const handleFeatureListing = async (listingId) => {
  if (!isAdmin) return

  setFeaturedAdminLoading(listingId)

  try {
    const featuredUntil = new Date()
    featuredUntil.setMonth(featuredUntil.getMonth() + 1)

    const { data, error } = await supabase
  .from('listings')
  .update({
    is_featured: true,
    featured_until: featuredUntil.toISOString()
  })
  .eq('id', listingId)
  .select('id, title, is_featured, featured_until')

console.log('Feature update result:', {
  listingId,
  data,
  error
})

if (error) throw error

if (!data || data.length === 0) {
  throw new Error(
    'Supabase לא עדכן את המודעה. ייתכן שמדיניות ההרשאות (RLS) חוסמת עדכון של המודעה הזו.'
  )
}

    if (error) throw error

    await fetchListings()

    alert('המודעה הודגשה בהצלחה לחודש אחד.')
  } catch (error) {
    console.error('שגיאה בהדגשת המודעה:', error)

    alert(
      'אירעה שגיאה בהדגשת המודעה.\n\n' +
      (error?.message || 'שגיאה לא ידועה')
    )
  } finally {
    setFeaturedAdminLoading(null)
  }
}

const handleUnfeatureListing = async (listingId) => {
  if (!isAdmin) return

  setFeaturedAdminLoading(listingId)

  try {
    const { error } = await supabase
      .from('listings')
      .update({
        is_featured: false,
        featured_until: null
      })
      .eq('id', listingId)

    if (error) throw error

    await fetchListings()

    alert('הדגשת המודעה הוסרה.')
  } catch (error) {
    console.error('שגיאה בהסרת הדגשת המודעה:', error)

    alert(
      'אירעה שגיאה בהסרת ההדגשה.\n\n' +
      (error?.message || 'שגיאה לא ידועה')
    )
  } finally {
    setFeaturedAdminLoading(null)
  }
}

  






  // טעינת מודעות מ-Supabase
  const fetchListings = async () => {
  setLoading(true)

  const { data, error } = await supabase
    .from('listings')
    .select(`
      *,
      profiles (
  id,
  full_name,
  avatar_url,
  created_at
)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching listings:', error)
  } else {
    const advertiserListingCounts = (data || []).reduce(
  (counts, listing) => {
    if (listing.user_id) {
      counts[listing.user_id] =
        (counts[listing.user_id] || 0) + 1
    }

    return counts
  },
  {}
)

const listingsWithAdvertiser = (data || []).map((listing) => ({
  ...listing,
  advertiser_name:
    listing.profiles?.full_name ||
    listing.contact_name ||
    'משתמש רשום',
  advertiser_avatar:
    listing.profiles?.avatar_url ||
    null,
  advertiser_created_at:
    listing.profiles?.created_at ||
    null,
  advertiser_listing_count:
    listing.user_id
      ? advertiserListingCounts[listing.user_id] || 0
      : 0
}))

    setListings(listingsWithAdvertiser)
  }

  setLoading(false)
}


  useEffect(() => {
    fetchListings()
  }, [])


useEffect(() => {
  if (!listings.length) return

  const pathParts = decodeURIComponent(location.pathname)
    .split('/')
    .filter(Boolean)

  if (
    pathParts.length !== 2 ||
    pathParts[0] !== 'מודעה'
  ) {
    return
  }

  const listingId = pathParts[1]

  const listing = listings.find(
    (item) => String(item.id) === String(listingId)
  )

      if (listing) {
      setSelectedListing(listing)
    }
  }, [listings, location.pathname])


  useEffect(() => {
    if (!scrollToListings) return
    if (loading) return

    const listingsSection = document.getElementById('listings-section')

    if (!listingsSection) return

    listingsSection.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })

    setScrollToListings(false)
  }, [scrollToListings, loading, location.pathname])


  useEffect(() => {
    const pathParts = decodeURIComponent(location.pathname)
      .split('/')
      .filter(Boolean)

  const isCategoryPage =
    pathParts.length === 2 &&
    pathParts[0] === 'קטגוריה'

  const isLocationPage =
    pathParts.length === 2 &&
    pathParts[0] === 'מיקום'

  let categoryFromUrl = null

  if (isCategoryPage) {
    const categorySlug = pathParts[1]

    categoryFromUrl = categories.find((item) => {
      const slug = item
        .trim()
        .replace(/\s+/g, '-')

      return slug === categorySlug
    })
  }

  let locationFromUrl = null

  if (isLocationPage) {
    locationFromUrl = pathParts[1]
      .replace(/-/g, ' ')
  }

  if (selectedListing) {
    document.title = `${selectedListing.title} | כסף כיס`
    return
  }

  if (categoryFromUrl) {
    document.title = `${categoryFromUrl} - מודעות, עבודות, שירותים ופריטים | כסף כיס`
    return
  }

  if (locationFromUrl) {
    document.title = `מודעות ועבודות ב${locationFromUrl} | כסף כיס`
    return
  }

  const titleParts = []

  if (categoryFilter !== 'all') {
    titleParts.push(categoryFilter)
  }

  if (locationFilter !== 'all') {
    titleParts.push(locationFilter)
  }

    if (listingTypeFilter === 'offer') {
    titleParts.push('שירותים')
  } else if (listingTypeFilter === 'request') {
    titleParts.push('בקשות שירות')
  } else if (listingTypeFilter === 'item_offer') {
    titleParts.push('פריטים למכירה, מסירה והחלפה')
  } else if (listingTypeFilter === 'item_request') {
    titleParts.push('בקשות לפריטים')
  }

  if (titleParts.length > 0) {
    document.title = `${titleParts.join(' ב')} | כסף כיס`
    return
  }

  if (searchTerm.trim()) {
    document.title = `חיפוש: ${searchTerm.trim()} | כסף כיס`
    return
  }

  document.title = 'כסף כיס - לוח מודעות ועבודות מזדמנות'
}, [
  selectedListing,
  searchTerm,
  listingTypeFilter,
  categoryFilter,
  locationFilter,
  location.pathname
])



useEffect(() => {
  const defaultDescription =
    'כסף כיס - לוח מודעות לעבודות מזדמנות, שירותים ועזרה בין אנשים.'

  const pathParts = decodeURIComponent(location.pathname)
    .split('/')
    .filter(Boolean)

  const isCategoryPage =
    pathParts.length === 2 &&
    pathParts[0] === 'קטגוריה'

  let categoryFromUrl = null

  if (isCategoryPage) {
    const categorySlug = pathParts[1]

    categoryFromUrl = categories.find((item) => {
      const slug = item
        .trim()
        .replace(/\s+/g, '-')

      return slug === categorySlug
    })
  }

  let description = defaultDescription

  if (selectedListing) {
    const parts = [
      selectedListing.title,
      selectedListing.category,
      selectedListing.location
    ].filter(Boolean)

    description = `${parts.join(' | ')} - כסף כיס`
  } else if (categoryFromUrl) {
  description =
    `מודעות, עבודות, שירותים ופריטים בתחום ${categoryFromUrl} - חיפוש ומציאת עבודות, שירותים ופריטים בכסף כיס`
} else if (locationFilter !== 'all') {
  description =
    `מודעות, עבודות, שירותים ופריטים ב${locationFilter} - חיפוש ומציאת עבודות, שירותים ופריטים מקומיים בכסף כיס`
  } else {
    const parts = []

    if (categoryFilter !== 'all') {
      parts.push(categoryFilter)
    }

    if (locationFilter !== 'all') {
      parts.push(locationFilter)
    }

        if (listingTypeFilter === 'offer') {
      parts.push('שירותים')
    } else if (listingTypeFilter === 'request') {
      parts.push('בקשות שירות')
    } else if (listingTypeFilter === 'item_offer') {
      parts.push('פריטים למכירה, מסירה והחלפה')
    } else if (listingTypeFilter === 'item_request') {
      parts.push('בקשות לפריטים')
    }

    if (searchTerm.trim()) {
      parts.push(`חיפוש: ${searchTerm.trim()}`)
    }

    if (parts.length > 0) {
      description =
        `${parts.join(' | ')} - מודעות, שירותים ועבודות מזדמנות בכסף כיס`
    }
  }

  let meta = document.querySelector('meta[name="description"]')

  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('name', 'description')
    document.head.appendChild(meta)
  }

  meta.setAttribute('content', description)
}, [
  selectedListing,
  searchTerm,
  listingTypeFilter,
  categoryFilter,
  locationFilter,
  location.pathname
])


  // טיפול בשינוי קלט בטופס
  const handleChange = (e) => {
  const { name, value } = e.target

  if (name === 'category') {
  setFormData((prev) => ({
    ...prev,
    category: value,

    listing_type:
      value === 'חפצים'
        ? (prev.listing_type === 'item_request' ? 'item_request' : 'item_offer')
        : (prev.listing_type === 'item_request' || prev.listing_type === 'item_offer'
            ? 'offer'
            : prev.listing_type),

    ...(value !== 'חפצים' && prev.payment_type === 'free'
      ? {
          payment_type: 'cash',
          price: ''
        }
      : {})
  }))
  return
}

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

    // שמירת התמונה גם בפרופיל המשתמש
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        avatar_url: avatarUrl
      })

    if (profileError) throw profileError

    // שמירה גם ב-Supabase Auth כדי שהכותרת והפרופיל הקיימים ימשיכו לעבוד
    const { error: authError } = await supabase.auth.updateUser({
      data: { avatar_url: avatarUrl }
    })

    if (authError) throw authError

    // רענון המשתמש המחובר
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
  payment_type: 'cash',
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

// שליחת מודעה חדשה (כולל תמונה ומיקום גיאוגרפי)
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

    // ברירת מחדל - אין קואורדינטות
    let latitude = null
    let longitude = null

    // ניסיון לזהות קואורדינטות לפי העיר שהוזנה במודעה
    if (formData.location?.trim()) {
      try {
        const response = await fetch(
  `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=il&accept-language=he&q=${encodeURIComponent(formData.location.trim())}`
)

        if (response.ok) {
          const data = await response.json()

          if (data?.length > 0) {
            latitude = parseFloat(data[0].lat)
            longitude = parseFloat(data[0].lon)

            console.log('📍 מיקום המודעה:', {
              location: formData.location,
              latitude,
              longitude
            })
          }
        }
      } catch (locationError) {
        console.warn(
          '⚠️ לא הצלחנו לזהות קואורדינטות למודעה:',
          locationError
        )
      }
    }

    const newListing = {
      title: formData.title,
      description: formData.description,
      price: formData.price
        ? parseFloat(formData.price)
        : null,
      payment_type: formData.payment_type,
      listing_type: formData.listing_type,
      category: formData.category,
      location: formData.location,
      latitude,
      longitude,
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
    payment_type: item.payment_type || 'cash',
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
  payment_type: formData.payment_type || 'cash',
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

const pathParts = decodeURIComponent(location.pathname)
  .split('/')
  .filter(Boolean)

const isAdvertiserPage =
  pathParts.length === 2 &&
  pathParts[0] === 'מפרסם'

const advertiserFilter = isAdvertiserPage
  ? pathParts[1]
  : null

const baseListings =
  currentView === 'my-listings'
    ? myListings
    : currentView === 'favorites'
      ? listings.filter(item => favoriteListings.includes(item.id))
      : advertiserFilter
        ? listings.filter(
            item => String(item.user_id) === String(advertiserFilter)
          )
        : listings


const normalizeLocation = (value) => {
  return (value || '')
    .trim()
    .replace(/[־–—-]/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase()
}


// חישוב מרחק בקילומטרים בין שתי נקודות GPS
const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  const toRadians = (degrees) => (degrees * Math.PI) / 180

  const earthRadiusKm = 6371

  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return earthRadiusKm * c
}



const getListingDistance = (item) => {
  if (
    !userLocation ||
    !item.latitude ||
    !item.longitude
  ) {
    return null
  }

  return calculateDistanceKm(
    userLocation.latitude,
    userLocation.longitude,
    Number(item.latitude),
    Number(item.longitude)
  )
}



const displayedListings = baseListings
  .filter((item) => {
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

    const matchesNearby =
      !nearbyOnly ||
      (
        userLocation &&
        item.latitude != null &&
        item.longitude != null &&
        calculateDistanceKm(
          userLocation.latitude,
          userLocation.longitude,
          Number(item.latitude),
          Number(item.longitude)
        ) <= locationRadius
      )

    return (
      matchesSearch &&
      matchesType &&
      matchesCategory &&
      matchesLocation &&
      matchesNearby
    )
  })
  .sort((a, b) => {
  const now = new Date()

  const aFeatured =
    a.is_featured === true &&
    a.featured_until &&
    new Date(a.featured_until) > now

  const bFeatured =
    b.is_featured === true &&
    b.featured_until &&
    new Date(b.featured_until) > now

  // מודעות מודגשות תמיד נשארות בראש
  if (aFeatured && !bFeatured) return -1
  if (!aFeatured && bFeatured) return 1

  // מיון לפי מרחק
  if (sortByDistance && userLocation) {
    const distanceA = getListingDistance(a)
    const distanceB = getListingDistance(b)

    if (distanceA === null && distanceB === null) return 0
    if (distanceA === null) return 1
    if (distanceB === null) return -1

    return distanceA - distanceB
  }

  // מיון לפי תאריך
  const dateA = new Date(a.created_at).getTime()
  const dateB = new Date(b.created_at).getTime()

  if (listingSort === 'oldest') {
    return dateA - dateB
  }

  // ברירת מחדל: החדשות ביותר קודם
  return dateB - dateA
})

const advertiserPageProfile = advertiserFilter
  ? listings.find(
      item => String(item.user_id) === String(advertiserFilter)
    )
  : null



const advertiserPageName =
  advertiserPageProfile?.advertiser_name || 'המפרסם'

const advertiserPageCount =
  advertiserPageProfile?.advertiser_listing_count || 0

const advertiserPageCreatedAt =
  advertiserPageProfile?.advertiser_created_at || null

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dir-rtl font-sans flex flex-col">
      {/* סרגל עליון Header */}
      <header
  className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-[0_2px_14px_rgba(15,23,42,0.08)]"
>
  <div className="max-w-6xl mx-auto px-2.5 sm:px-4">


<div className="min-h-[54px] sm:min-h-[60px] flex items-center justify-between gap-2">

  {/* =========================================
      צד ימין - לוגו + משתמש
      ========================================= */}
  <div className="flex items-center gap-2 sm:gap-4 min-w-0 shrink-0">

    {/* לוגו */}
    <button
      type="button"
      onClick={() => setCurrentView('home')}
      className="group flex items-center gap-2 sm:gap-2.5 cursor-pointer min-w-0"
    >
      <div className="relative shrink-0">

        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-950/30 group-hover:scale-105 group-hover:rotate-1 transition-all duration-200">
          <span className="text-xl sm:text-3xl leading-none">
            💰
          </span>
        </div>

      </div>

      <div className="block text-right leading-tight">
  <div className="text-base sm:text-2xl font-bold text-slate-900 tracking-tight whitespace-nowrap">
    כסף כיס
  </div>

  <div className="hidden sm:block text-[10px] sm:text-[11px] font-medium text-slate-500 mt-0.5">
    עבודות • שירותים • אנשים
  </div>
</div>
    </button>


    {/* =========================================
        משתמש מחובר
        ========================================= */}
    {user ? (
      <div className="relative shrink-0">

        <details className="relative">

          {/* תמונת המשתמש - לחיצה פותחת תפריט */}
          <summary
  className="list-none cursor-pointer outline-none select-none"
  title="תפריט המשתמש"
>
  <div className="relative group">

    <div className="p-[2px] rounded-full bg-gradient-to-br from-emerald-300 via-emerald-500 to-slate-500 shadow-lg shadow-black/20 group-hover:shadow-emerald-400/20 group-hover:scale-105 transition-all duration-200">

      {user.user_metadata?.avatar_url ? (
        <img
          src={user.user_metadata.avatar_url}
          alt="Profile"
          className="w-9 h-9 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-white"
          onError={(e) => {
            console.error(
              'Avatar image failed to load:',
              e.currentTarget.src
            )

            e.currentTarget.style.display = 'none'

            const fallback = e.currentTarget.nextElementSibling

            if (fallback) {
              fallback.style.display = 'flex'
            }
          }}
        />
      ) : null}

      <div
        className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-emerald-600 text-white items-center justify-center font-bold text-xs sm:text-sm border-2 border-slate-900 ${
          user.user_metadata?.avatar_url ? 'hidden' : 'flex'
        }`}
      >
        {user.email?.charAt(0).toUpperCase()}
      </div>

    </div>

    {/* נקודת סטטוס */}
    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-emerald-400 rounded-full border-2 border-white shadow-sm" />

  </div>
</summary>


          {/* =========================================
              תפריט המשתמש
              ========================================= */}
          <div
            className="absolute right-0 mt-3 w-64 bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-950/20 overflow-hidden z-[100]"
            dir="rtl"
          >

            {/* פרטי המשתמש */}
            <div className="px-4 py-4 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">

              <div className="flex items-center gap-3">

                <div className="p-[2px] rounded-full bg-gradient-to-br from-emerald-400 to-slate-300 shrink-0">

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
                      className="w-11 h-11 rounded-full object-cover border-2 border-white"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm border-2 border-white">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                  )}

                </div>

                <div className="min-w-0">

                  <div className="font-extrabold text-slate-900 text-sm">
                    {user.user_metadata?.full_name ||
                      user.user_metadata?.name ||
                      'המשתמש שלי'}
                  </div>

                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    {user.email}
                  </div>

                  <div className="flex items-center gap-1 mt-1.5 text-[10px] font-semibold text-emerald-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    מחובר
                  </div>

                </div>

              </div>

            </div>


            {/* פעולות */}
            <div className="p-2">

              {/* המודעות שלי */}
              <button
                type="button"
                onClick={(e) => {
                  e.currentTarget
                    .closest('details')
                    ?.removeAttribute('open')

                  setCurrentView(
                    currentView === 'my-listings'
                      ? 'home'
                      : 'my-listings'
                  )
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-right transition ${
                  currentView === 'my-listings'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-sm">
                  📋
                </span>

                <span className="flex-1">
                  {currentView === 'my-listings'
                    ? 'חזרה ללוח'
                    : 'המודעות שלי'}
                </span>

                <span className="text-slate-300">
                  ‹
                </span>
              </button>


              {/* מועדפים */}
              <button
                type="button"
                onClick={(e) => {
                  e.currentTarget
                    .closest('details')
                    ?.removeAttribute('open')

                  setCurrentView(
                    currentView === 'favorites'
                      ? 'home'
                      : 'favorites'
                  )
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-right transition ${
                  currentView === 'favorites'
                    ? 'bg-red-50 text-red-600'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className="relative w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-sm">
                  ❤️

                  {favoriteListings.length > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[8px] font-extrabold flex items-center justify-center">
                      {favoriteListings.length > 99
                        ? '99+'
                        : favoriteListings.length}
                    </span>
                  )}
                </span>

                <span className="flex-1">
                  שאהבתי
                </span>

                <span className="text-slate-300">
                  ‹
                </span>
              </button>


              {/* הודעות */}
              <button
                type="button"
                onClick={(e) => {
                  e.currentTarget
                    .closest('details')
                    ?.removeAttribute('open')

                  setMessagesModalOpen(true)
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-right text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition"
              >
                <span className="relative w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-sm">
                  💬

                  {unreadMessagesCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[8px] font-extrabold flex items-center justify-center">
                      {unreadMessagesCount > 99
                        ? '99+'
                        : unreadMessagesCount}
                    </span>
                  )}
                </span>

                <span className="flex-1">
                  הודעות
                </span>

                <span className="text-slate-300">
                  ‹
                </span>
              </button>


              {/* ניהול - אדמין */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={async (e) => {
                    e.currentTarget
                      .closest('details')
                      ?.removeAttribute('open')

                    setShowReportsAdmin(true)
                    await fetchReports()
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-right text-red-700 hover:bg-red-50 transition"
                >
                  <span className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-sm">
                    🚨
                  </span>

                  <span className="flex-1">
                    ניהול דיווחים
                  </span>

                  <span className="text-red-200">
                    ‹
                  </span>
                </button>
              )}

            </div>



{isAdmin && (
  <button
    type="button"
    onClick={(e) => {
      e.currentTarget
        .closest('details')
        ?.removeAttribute('open')

      setShowFeaturedAdmin(true)
    }}
    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-right text-amber-700 hover:bg-amber-50 transition"
  >
    <span className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-sm">
      ⭐
    </span>

    <span className="flex-1">
      ניהול מודעות
    </span>

    <span className="text-amber-200">
      ›
    </span>
  </button>
)}



            {/* החלפת תמונה */}
            <div className="px-2 pb-2">

              <label
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition cursor-pointer"
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUpdateAvatar}
                  className="hidden"
                />

                <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-sm">
                  📷
                </span>

                <span>
                  החלף תמונת פרופיל
                </span>

              </label>

            </div>


            {/* יציאה */}
            <div className="border-t border-slate-100 p-2">

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-right text-red-500 hover:bg-red-50 hover:text-red-600 transition"
              >
                <span className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-sm">
                  ↪
                </span>

                <span className="flex-1">
                  התנתקות
                </span>
              </button>

            </div>

          </div>

        </details>

      </div>
    ) : (
  <div>
    {/* התחברות */}
    <button
      type="button"
      onClick={() => {
        setAuthMode('login')
        setIsAuthModalOpen(true)
      }}
      className="h-9 sm:h-10 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-extrabold text-white bg-emerald-600/90 border border-emerald-400/50 shadow-sm hover:bg-emerald-500 hover:border-emerald-300 hover:shadow-md transition-all whitespace-nowrap"
    >
      התחברות
    </button>
  </div>
)}

  </div>


  {/* =========================================
      צד שמאל - פעולות
      ========================================= */}
  <div className="flex items-center gap-0.5 sm:gap-1.5 shrink-0">

    {/* איך זה עובד */}
    <button
      type="button"
      onClick={() => setIsHowItWorksOpen(true)}
      title="איך זה עובד?"
      className="hidden sm:flex h-9 px-2.5 sm:px-3.5 rounded-xl items-center justify-center gap-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
    >
      <span className="text-base">
        ❓
      </span>

      <span className="hidden md:inline text-xs font-bold">
        איך זה עובד?
      </span>
    </button>


    {/* מועדפים */}
    {user && (
      <button
        type="button"
        onClick={() =>
          setCurrentView(
            currentView === 'favorites'
              ? 'home'
              : 'favorites'
          )
        }
        title="המועדפים שלי"
        className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition ${
          currentView === 'favorites'
            ? 'bg-red-500/15 text-red-300'
            : 'text-slate-500 hover:text-red-500 hover:bg-red-50'
        }`}
      >
        <span className="text-base sm:text-lg leading-none">
          ♡
        </span>

        {favoriteListings.length > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-red-500 text-white text-[8px] font-extrabold flex items-center justify-center border-2 border-slate-900">
            {favoriteListings.length > 99
              ? '99+'
              : favoriteListings.length}
          </span>
        )}
      </button>
    )}


    {/* הודעות */}
    {user && (
      <button
        type="button"
        onClick={() => setMessagesModalOpen(true)}
        title="הודעות"
        className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition"
      >
        <span className="text-base sm:text-lg leading-none">
          💬
        </span>

        {unreadMessagesCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-red-500 text-white text-[8px] font-extrabold flex items-center justify-center border-2 border-slate-900">
            {unreadMessagesCount > 99
              ? '99+'
              : unreadMessagesCount}
          </span>
        )}
      </button>
    )}


    {/* המודעות שלי */}
    {user && (
      <button
        type="button"
        onClick={() =>
          setCurrentView(
            currentView === 'my-listings'
              ? 'home'
              : 'my-listings'
          )
        }
        title={
          currentView === 'my-listings'
            ? 'חזרה ללוח'
            : 'המודעות שלי'
        }
        className={`hidden sm:flex h-10 px-3 rounded-xl items-center gap-1.5 text-xs font-bold transition ${
          currentView === 'my-listings'
            ? 'bg-emerald-400/15 text-emerald-300'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
      >
        <span className="text-sm">
          {currentView === 'my-listings' ? '⌂' : '▤'}
        </span>

        <span>
          {currentView === 'my-listings'
            ? 'כל הלוח'
            : 'המודעות שלי'}
        </span>
      </button>
    )}


    {/* התקנת האפליקציה */}
    {deferredPrompt && (
      <button
        type="button"
        onClick={handleInstallApp}
        title="התקנת כסף כיס"
        className="hidden md:flex h-9 px-3 rounded-xl items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition"
      >
        <span>
          📱
        </span>

        <span>
          התקנת האפליקציה
        </span>
      </button>
    )}


    {/* פרסום מודעה */}
<button
  type="button"
  onClick={handleOpenPublishModal}
  className="relative h-10 sm:h-11 px-4 sm:px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-sm sm:text-base shadow-[0_4px_14px_rgba(5,150,105,0.35)] hover:shadow-[0_5px_18px_rgba(5,150,105,0.45)] border border-emerald-700 transition-colors duration-200 flex items-center gap-2 whitespace-nowrap"
>
  <span className="relative text-2xl sm:text-3xl leading-none font-normal">
    +
  </span>

  <span className="relative hidden min-[390px]:inline">
    פרסם
  </span>

  <span className="relative hidden sm:inline">
    מודעה
  </span>
</button>

  </div>

</div>


  </div>
</header>


      {/* אזור מרכזי */}
<main className="w-full min-w-0 max-w-6xl mx-auto px-4 pt-6 sm:pt-8">

  {/* =========================================================
    HERO - כסף כיס
    ========================================================= */}
{(currentView === 'home' ||
  currentView === 'my-listings' ||
  currentView === 'favorites' ||
  isAdvertiserPage) && (
  <section className="relative mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

    {/* פס צבע עליון */}
    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-l from-emerald-500 via-emerald-400 to-cyan-400 z-20" />

    {/* דף הבית */}
    {currentView === 'home' ? (

  <div className="relative">

    {/* =========================
       מובייל — תמונה מעל התוכן
       ========================= */}
    <div className="block lg:hidden">

      <div className="relative w-full overflow-hidden">
        <img
          src="/hero-kesefkis.png"
          alt="כסף כיס - עבודות, שירותים ופריטים מקומיים"
          className="w-full h-auto block"
        />
      </div>

      <div className="relative bg-white px-5 py-7 sm:px-8 sm:py-8 text-center">

        <div className="inline-flex items-center gap-2 mb-3 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-bold">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
         לוח עבודות, שירותים ופריטים מקומיים
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight mb-3">
          כסף כיס
        </h1>

        <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-medium max-w-xl mx-auto">
         מצא עבודות קטנות, שירותים ופריטים בסביבה שלך — או הצע את מה שיש לך
        </p>

        <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">

          <button
            type="button"
            onClick={handleOpenPublishModal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-base shadow-[0_4px_14px_rgba(5,150,105,0.30)] hover:shadow-[0_5px_18px_rgba(5,150,105,0.40)] transition-all duration-200"
          >
            <span className="text-2xl leading-none font-normal">
              +
            </span>

            <span>
              צור מודעה
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              document.getElementById('listings-section')?.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
              })
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white hover:bg-emerald-50 border border-slate-300 hover:border-emerald-300 text-slate-700 hover:text-emerald-700 font-bold text-base shadow-sm hover:shadow-md transition-all duration-200"
          >
            <span>
              מצא עבודות ושירותים
            </span>

            <span className="text-lg">
              ↓
            </span>
          </button>

        </div>

      </div>

    </div>


    {/* =========================
       מחשב — Hero רחב עם התמונה כרקע
       ========================= */}
    <div className="hidden lg:block relative min-h-[390px]">

      <img
        src="/hero-kesefkis.png"
        alt="כסף כיס - עבודות, שירותים ופריטים מקומיים"
        className="absolute inset-0 w-full h-full object-cover object-[65%_center] sm:object-center"
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to left, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.95) 28%, rgba(255,255,255,0.70) 43%, rgba(255,255,255,0.18) 57%, rgba(255,255,255,0) 68%)'
        }}
      />

      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white/50 to-transparent" />

      <div className="relative z-10 min-h-[390px] flex items-center">

        <div className="w-[54%] px-12 py-10 text-right">

          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-white/80 border border-emerald-200 text-emerald-700 text-sm font-bold backdrop-blur-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
           לוח עבודות, שירותים ופריטים מקומיים
          </div>

          <h1 className="text-4xl xl:text-5xl font-extrabold text-slate-900 leading-tight mb-4">
            כסף כיס
          </h1>

          <p className="text-lg xl:text-xl text-slate-700 leading-relaxed font-medium">
           מצא עבודות קטנות, שירותים ופריטים בסביבה שלך — או הצע את מה שיש לך
          </p>

          <div className="mt-6 flex items-center justify-start gap-3">

            <button
              type="button"
              onClick={handleOpenPublishModal}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-base shadow-[0_4px_14px_rgba(5,150,105,0.30)] hover:shadow-[0_5px_18px_rgba(5,150,105,0.40)] transition-all duration-200"
            >
              <span className="text-2xl leading-none font-normal">
                +
              </span>

              <span>
                צור מודעה
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                document.getElementById('listings-section')?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start'
                })
              }}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white/90 hover:bg-white border border-slate-300 hover:border-emerald-300 text-slate-700 hover:text-emerald-700 font-bold text-base shadow-sm hover:shadow-md transition-all duration-200 backdrop-blur-sm"
            >
              <span>
                מצא עבודות ושירותים
              </span>

              <span className="text-lg">
                ↓
              </span>
            </button>

          </div>

        </div>

      </div>

    </div>

  </div>

) : isAdvertiserPage ? (

  <div className="relative px-5 py-8 sm:px-8 sm:py-10">

    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

      <div className="text-center md:text-right">

        <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-bold">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          פרופיל מפרסם
        </div>

        <div className="flex flex-col sm:flex-row items-center md:items-start gap-4">

          {advertiserPageProfile?.advertiser_avatar ? (

            <img
              src={advertiserPageProfile.advertiser_avatar}
              alt={advertiserPageName}
              className="w-16 h-16 shrink-0 rounded-2xl object-cover border-2 border-white shadow-sm"
            />

          ) : (

            <div className="w-16 h-16 shrink-0 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 text-2xl font-extrabold">
              {(advertiserPageName || 'מ')
                .charAt(0)
                .toUpperCase()}
            </div>

          )}

          <div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">
              המודעות של {advertiserPageName}
            </h1>

            <div className="flex flex-col sm:flex-row items-center md:items-start gap-2 sm:gap-5 text-sm sm:text-base text-slate-600">

              <span className="font-medium">
                📋 {advertiserPageCount}{' '}
                {advertiserPageCount === 1
                  ? 'מודעה'
                  : 'מודעות'}
              </span>

              <span className="font-medium">
                📅 פעיל באתר מאז{' '}
                {advertiserPageCreatedAt
                  ? new Date(
                      advertiserPageCreatedAt
                    ).toLocaleDateString('he-IL', {
                      month: 'long',
                      year: 'numeric'
                    })
                  : 'לא ידוע'}
              </span>

            </div>

          </div>

        </div>

      </div>

      <button
        type="button"
        onClick={() => {
  setCurrentView('home')
  setScrollToListings(true)
  navigate('/')
}}
        className="self-center md:self-auto shrink-0 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-slate-700 shadow-sm hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
      >
        <span className="text-lg">
          ←
        </span>
        חזרה לכל המודעות
      </button>

    </div>

  </div>

) : (

      /* =====================================================
         מצב רגיל: המודעות שלי / המודעות שאהבתי
         ===================================================== */
      <div className="relative overflow-hidden min-h-[230px] sm:min-h-[250px]">

  {/* תמונת Hero */}
  <img
    src="/hero-favorites.png"
    alt=""
    aria-hidden="true"
    className="absolute inset-0 w-full h-full object-cover object-center"
  />

  {/* גרדיאנט לבן חזק באזור הטקסט */}
  <div
    className="absolute inset-0"
    style={{
      background:
        'linear-gradient(to left, rgba(255,255,255,1) 0%, rgba(255,255,255,0.99) 34%, rgba(255,255,255,0.94) 48%, rgba(255,255,255,0.72) 60%, rgba(255,255,255,0.20) 76%, rgba(255,255,255,0) 88%)'
    }}
  />

  {/* שכבת ריכוך עדינה בתחתית */}
  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white/35 to-transparent" />

  {/* תוכן */}
  <div className="relative z-10 px-5 py-7 sm:px-8 sm:py-9 min-h-[270px] sm:min-h-[250px] flex items-center">

  <div className="w-full md:w-[58%] text-right">

      {/* תג */}
      <div className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 rounded-full bg-red-50/95 border border-red-200 text-red-600 text-xs font-bold shadow-sm backdrop-blur-sm">

        <span className="w-2 h-2 rounded-full bg-red-500" />

        {currentView === 'favorites'
          ? 'המודעות ששמרת'
          : 'המודעות האישיות שלך'}

      </div>

      {/* כותרת */}
      <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">

        {currentView === 'my-listings'
          ? 'המודעות שפרסמתי'
          : 'המודעות שאהבתי'}

      </h2>

      {/* תיאור */}
      <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-xl mr-0 ml-auto">

        {currentView === 'my-listings'
          ? 'ניהול, עריכה ומחיקת המודעות האישיות שלך'
          : 'כל המודעות ששמרת כמועדפות במקום אחד'}

      </p>

      {/* חזרה ללוח */}
      {currentView === 'my-listings' && (
        <button
          type="button"
          onClick={() => setCurrentView('home')}
          className="mt-5 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/95 border border-slate-200 text-sm font-bold text-slate-700 shadow-sm hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50 transition-colors backdrop-blur-sm"
        >
          <span className="text-lg">
            ←
          </span>
          חזרה לכל הלוח
        </button>
      )}

    </div>

  </div>

</div>

    )}

  </section>
)}




















{/* =========================================================
    בחירת סוג מודעה
========================================================= */}
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

    {/* הכל */}
    <button
      onClick={() => setListingTypeFilter('all')}
      className={`w-full rounded-2xl border-2 p-3.5 text-center transition mb-3 ${
        listingTypeFilter === 'all'
          ? 'border-slate-700 bg-slate-100 shadow-sm'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      <div className="text-xl mb-0.5">
        📋
      </div>

      <div className="font-bold text-slate-800">
        כל המודעות
      </div>

      <div className="text-xs text-slate-500 mt-0.5">
        הצעות ובקשות
      </div>
    </button>


    {/* שירותים */}
    <div className="grid grid-cols-2 gap-3 mb-3">

      {/* מציע שירות */}
      <button
        onClick={() => setListingTypeFilter('offer')}
        className={`rounded-2xl border-2 p-4 text-center transition ${
          listingTypeFilter === 'offer'
            ? 'border-emerald-500 bg-emerald-50 shadow-sm'
            : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/40'
        }`}
      >
        <div className="text-2xl mb-1">
          🟢
        </div>

        <div className="font-bold text-slate-800">
          מציע שירות
        </div>

        <div className="text-xs text-slate-500 mt-1">
          עבודות ושירותים
        </div>
      </button>


      {/* מחפש שירות */}
      <button
        onClick={() => setListingTypeFilter('request')}
        className={`rounded-2xl border-2 p-4 text-center transition ${
          listingTypeFilter === 'request'
            ? 'border-blue-500 bg-blue-50 shadow-sm'
            : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/40'
        }`}
      >
        <div className="text-2xl mb-1">
          🔵
        </div>

        <div className="font-bold text-slate-800">
          מחפש שירות
        </div>

        <div className="text-xs text-slate-500 mt-1">
          עזרה ועבודות
        </div>
      </button>

    </div>


    {/* חפצים */}
    <div className="grid grid-cols-2 gap-3">

      {/* מציע פריט */}
      <button
        onClick={() => setListingTypeFilter('item_offer')}
        className={`rounded-2xl border-2 p-4 text-center transition ${
          listingTypeFilter === 'item_offer'
            ? 'border-orange-500 bg-orange-50 shadow-sm'
            : 'border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50/40'
        }`}
      >
        <div className="text-2xl mb-1">
          🟠
        </div>

        <div className="font-bold text-slate-800">
          מציע פריט
        </div>

        <div className="text-xs text-slate-500 mt-1">
          מכירה, מסירה או החלפה
        </div>
      </button>


      {/* מחפש פריט */}
      <button
        onClick={() => setListingTypeFilter('item_request')}
        className={`rounded-2xl border-2 p-4 text-center transition ${
          listingTypeFilter === 'item_request'
            ? 'border-purple-500 bg-purple-50 shadow-sm'
            : 'border-slate-200 bg-white hover:border-purple-300 hover:bg-purple-50/40'
        }`}
      >
        <div className="text-2xl mb-1">
          🟣
        </div>

        <div className="font-bold text-slate-800">
          מחפש פריט
        </div>

        <div className="text-xs text-slate-500 mt-1">
          מחפש חפץ מסוים
        </div>
      </button>

    </div>

  </div>
)}







{/* חיפוש וסינון */}
{currentView === 'home' && (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-5 mb-8">

    {/* חיפוש */}
    <div className="mb-5">
      <label className="block text-sm font-bold text-slate-700 mb-2">
        🔎 חיפוש במודעות
      </label>

      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="חפש עבודה, שירות, קטגוריה או אזור..."
          className="w-full px-4 py-3.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition text-slate-800 placeholder:text-slate-400"
        />

        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition"
            aria-label="נקה חיפוש"
            title="נקה חיפוש"
          >
            ×
          </button>
        )}
      </div>
    </div>

    {/* פילטרים */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

      {/* קטגוריה */}
      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1.5">
          קטגוריה
        </label>

        <div className="relative">
  <select
    value={categoryFilter}
    onChange={(e) => setCategoryFilter(e.target.value)}
    className={`w-full px-3 py-2.5 pr-10 border rounded-xl appearance-none focus:outline-none focus:ring-2 transition text-sm font-medium ${
      categoryFilter === 'חפצים'
        ? 'border-orange-300 bg-orange-50 text-orange-800 focus:ring-orange-200'
        : 'border-slate-300 bg-slate-50 text-slate-700 focus:bg-white focus:ring-emerald-500'
    }`}
  >
    <option value="all">כל הקטגוריות</option>

    {categories.map((category) => (
      <option key={category} value={category}>
        {category === 'חפצים' ? '📦  חפצים' : category}
      </option>
    ))}
  </select>

  {/* חץ */}
  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
    <svg
      className="w-4 h-4"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  </div>

  {/* סימון כאשר חפצים נבחר */}
  {categoryFilter === 'חפצים' && (
    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-orange-600 pointer-events-none">
      📦
    </div>
  )}
</div>
      </div>

      {/* אזור */}
      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1.5">
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
            className="w-full px-3 py-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 placeholder:text-slate-400"
          />

          {locationFilter !== 'all' &&
            locationFilter.trim().length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">

                {israeliLocations
                  .filter((location) =>
                    location
                      .toLowerCase()
                      .includes(
                        locationFilter.trim().toLowerCase()
                      )
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
                    .includes(
                      locationFilter.trim().toLowerCase()
                    )
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

    {/* שורת תוצאות */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-5 pt-4 border-t border-slate-100">

      <div className="text-sm text-slate-500">
        נמצאו{' '}
        <span className="font-extrabold text-slate-800">
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
          className="text-sm font-bold text-red-500 hover:text-red-600 transition"
        >
          ✕ נקה סינון
        </button>
      )}

    </div>

  </div>
)}



  {/* קטגוריות SEO */}
{currentView === 'home' && (
  <section className="mb-8">

    {/* כותרת האזור */}
    <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-emerald-50/40 shadow-sm p-5 sm:p-6">

      {/* כתם רקע עדין */}
      <div className="absolute -top-20 -left-20 w-48 h-48 rounded-full bg-emerald-200/20 blur-3xl pointer-events-none" />

      <div className="relative">

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5">

          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700">
                🧩
              </span>

              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                קטגוריות
              </h2>
            </div>

            <p className="text-sm text-slate-500">
              מצאו עבודות, שירותים ועזרה לפי תחום
            </p>
          </div>

          {categoryFilter !== 'all' && (
            <button
              onClick={() => {
                setCategoryFilter('all')
                navigate('/')
              }}
              className="self-start sm:self-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white border border-emerald-200 text-sm font-bold text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 transition"
            >
              ↻ הצג את כל הקטגוריות
            </button>
          )}

        </div>

        {/* רשימת קטגוריות */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">

          {(showAllCategories
            ? categories
            : categories.slice(0, 12)
          ).map((category) => {

            const slug = category
              .trim()
              .replace(/\s+/g, '-')

            const isActive = categoryFilter === category

            return (
              <button
                key={category}
                onClick={() => {
                  setCategoryFilter(category)
                  navigate(`/קטגוריה/${slug}`)
                }}
                className={`group min-h-[48px] px-3 py-3 rounded-xl border text-sm font-bold text-right transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                    : 'bg-white/90 border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 hover:-translate-y-0.5 hover:shadow-sm'
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate">
                    {category}
                  </span>

                  <span
                    className={`shrink-0 text-xs transition-transform duration-200 group-hover:-translate-x-0.5 ${
                      isActive
                        ? 'text-emerald-100'
                        : 'text-slate-300 group-hover:text-emerald-400'
                    }`}
                  >
                    ←
                  </span>
                </span>
              </button>
            )
          })}

        </div>

        {/* הצגת כל הקטגוריות */}
        {categories.length > 12 && (
          <div className="flex justify-center mt-5">

            <button
              onClick={() =>
                setShowAllCategories((prev) => !prev)
              }
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50 transition"
            >
              {showAllCategories
                ? '▲ הצג פחות קטגוריות'
                : `▼ הצג את כל הקטגוריות (${categories.length})`}
            </button>

          </div>
        )}

      </div>
    </div>

  </section>
)}









{currentView === 'home' && (
  <div className="mb-7">

    <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-cyan-50/30 shadow-sm p-5 sm:p-6">

      {/* כתמי רקע עדינים */}
      <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-cyan-200/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-16 w-48 h-48 rounded-full bg-emerald-200/15 blur-3xl pointer-events-none" />

      <div className="relative">

        {/* כותרת */}
        <div className="text-center mb-5">

          <div className="flex items-center justify-center gap-2 mb-1.5">
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-cyan-100 text-cyan-700">
              📍
            </span>

            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
              מצאו מודעות בסביבה שלכם
            </h3>
          </div>

          <p className="text-sm text-slate-500">
            אפשרו גישה למיקום כדי למצוא עבודות ושירותים קרובים אליכם
          </p>

        </div>

        {/* כפתור זיהוי מיקום */}
        <div className="flex justify-center">

          <button
            type="button"
            onClick={requestUserLocation}
            disabled={locationLoading}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white border border-emerald-200 text-emerald-700 font-bold text-sm shadow-sm hover:bg-emerald-50 hover:border-emerald-300 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:hover:translate-y-0"
          >
            <span className="text-lg">
              📍
            </span>

            {locationLoading
              ? 'מזהה את המיקום...'
              : userCity
                ? 'עדכן את המיקום שלי'
                : 'מצא את המיקום שלי'}
          </button>

        </div>

                {/* מידע וכלי מיקום */}
        {userCity && (
          <div className="mt-5 pt-5 border-t border-slate-200/80">

            {/* העיר שזוהתה */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-3 mb-4">

              <div className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
                <span>📍</span>

                <span className="text-sm font-extrabold">
                  המיקום שלי: {userCity}
                </span>
              </div>

              {/* הצגת מודעות באזור */}
              <button
                type="button"
                onClick={() => setNearbyOnly(!nearbyOnly)}
                className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                  nearbyOnly
                    ? 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700'
                }`}
              >
                {nearbyOnly
                  ? '📍 הצג מודעות באזור שלי'
                  : 'הצג מודעות באזור שלי'}
              </button>

            </div>

          </div>
        )}

        {/* מיון מודעות - תמיד מוצג */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">

          <div className="flex items-center gap-2 flex-wrap justify-center">

            <span className="text-sm font-bold text-slate-600">
              מיון:
            </span>

            {/* החדשות ביותר */}
            <button
              type="button"
              onClick={() => {
                setSortByDistance(false)
                setListingSort('newest')
              }}
              className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all ${
                !sortByDistance && listingSort === 'newest'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              🕐 החדשות ביותר
            </button>

            {/* הישנות ביותר */}
            <button
              type="button"
              onClick={() => {
                setSortByDistance(false)
                setListingSort('oldest')
              }}
              className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all ${
                !sortByDistance && listingSort === 'oldest'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              🕰️ הישנות ביותר
            </button>

            {/* הקרובות ביותר */}
            {userLocation && (
              <button
                type="button"
                onClick={() => {
                  setSortByDistance(true)
                }}
                className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all ${
                  sortByDistance
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:border-emerald-300'
                }`}
              >
                📍 הקרובות ביותר
              </button>
            )}

          </div>

          {/* רדיוס */}
          {nearbyOnly && userLocation && (
            <div className="flex items-center gap-2">

              <span className="text-sm font-bold text-slate-600">
                רדיוס:
              </span>

              <div className="flex items-center gap-1.5">

                {[1, 5, 10, 20].map((radius) => (
                  <button
                    key={radius}
                    type="button"
                    onClick={() => setLocationRadius(radius)}
                    className={`min-w-[48px] px-2.5 py-2 rounded-xl text-sm font-bold transition-all ${
                      locationRadius === radius
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700'
                    }`}
                  >
                    {radius} ק"מ
                  </button>
                ))}

              </div>

            </div>
          )}

        </div>

          

        {/* שגיאת מיקום */}
        {locationError && (
          <div className="flex justify-center mt-4">

            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
              <span>⚠️</span>
              <span>{locationError}</span>
            </div>

          </div>
        )}

      </div>
    </div>

  </div>
)}







  

    {/* חזרה לכל המודעות - בעמוד מפרסם בלבד */}
  {isAdvertiserPage && (
    <div className="mb-5 flex justify-start">
      <button
        type="button"
        onClick={() => {
          setCurrentView('home')
          navigate('/')
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          })
        }}
        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-slate-700 shadow-sm hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50 hover:-translate-y-0.5 transition-all duration-200"
      >
        <span className="text-lg">←</span>
        חזרה לכל המודעות
      </button>
    </div>
  )}

  <div id="listings-section" className="scroll-mt-6" />

{/* רשימת המודעות */}
{loading ? (
  <div className="flex flex-col items-center justify-center py-16 text-slate-500">
    <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin mb-4" />
    <span className="text-sm font-medium">
      טוען מודעות...
    </span>
  </div>
) : displayedListings.length === 0 ? (
  <div className="relative overflow-hidden bg-white rounded-3xl border border-slate-200 p-10 sm:p-14 text-center shadow-sm">

    <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-emerald-100/40 blur-3xl pointer-events-none" />
    <div className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full bg-cyan-100/30 blur-3xl pointer-events-none" />

    <div className="relative">

      <div className="mx-auto mb-5 w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl">
        🔎
      </div>

      <p className="text-lg font-bold text-slate-700 mb-2">
        {currentView === 'my-listings'
          ? 'עדיין לא פרסמת אף מודעה.'
          : listings.length === 0
            ? 'עדיין אין מודעות בלוח.'
            : 'לא נמצאו מודעות התואמות לחיפוש או לסינון שבחרת.'}
      </p>

      <p className="text-sm text-slate-500 mb-5">
        {currentView === 'my-listings'
          ? 'פרסם את המודעה הראשונה שלך והתחל לקבל פניות.'
          : listings.length === 0
            ? 'היה הראשון לפרסם עבודה או שירות בלוח.'
            : 'אפשר לנסות לשנות את החיפוש או להסיר את הסינון.'}
      </p>

      {currentView === 'my-listings' ? (
        <button
          onClick={handleOpenPublishModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-sm hover:bg-emerald-700 hover:-translate-y-0.5 transition-all"
        >
          ➕ פרסם את המודעה הראשונה שלך
        </button>
      ) : listings.length === 0 ? (
        <button
          onClick={handleOpenPublishModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-sm hover:bg-emerald-700 hover:-translate-y-0.5 transition-all"
        >
          ➕ היה הראשון לפרסם מודעה
        </button>
      ) : (
        <button
          onClick={() => {
            setSearchTerm('')
            setListingTypeFilter('all')
            setCategoryFilter('all')
            setLocationFilter('all')
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-emerald-200 text-emerald-700 font-bold text-sm hover:bg-emerald-50 hover:border-emerald-300 transition-all"
        >
          ↻ נקה את החיפוש והסינון
        </button>
      )}

    </div>
  </div>
) : (
  <div
  id="listings-section"
  className="w-full"
>

    {displayedListings.map((item) => {

  const isOwner =
    user && (item.user_id === user.id || !item.user_id)

  const isExpanded = !!expandedListings[item.id]

  const toggleListingExpanded = (e) => {
    e.stopPropagation()

    setExpandedListings((prev) => ({
      ...prev,
      [item.id]: !prev[item.id]
    }))
  }

  if (!isExpanded) {
  return (
    <div
      key={item.id}
      onClick={toggleListingExpanded}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          toggleListingExpanded(e)
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`פתח את המודעה ${item.title}`}
      className={`group h-[50px] overflow-hidden flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3 border-b cursor-pointer transition-all duration-300 hover:brightness-[0.98] ${
    item.is_featured &&
    item.featured_until &&
    new Date(item.featured_until) > new Date()
      ? 'border-r-4 border-r-amber-400'
      : ''
  } ${
    item.listing_type === 'item_request'
      ? 'bg-purple-50/80 border-purple-200'
      : item.listing_type === 'item_offer'
        ? 'bg-orange-50/80 border-orange-200'
        : item.listing_type === 'request'
          ? 'bg-blue-50/80 border-blue-200'
          : 'bg-emerald-50/80 border-emerald-200'
  }`}
    >

      {/* סוג המודעה */}
      <span
        className={`shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-xl text-sm ${
          item.listing_type === 'item_request'
            ? 'bg-purple-50 text-purple-700'
            : item.listing_type === 'item_offer'
              ? 'bg-orange-50 text-orange-700'
              : item.listing_type === 'request'
                ? 'bg-blue-50 text-blue-700'
                : 'bg-emerald-50 text-emerald-700'
        }`}
        title={
          item.listing_type === 'item_request'
            ? 'מחפש פריט'
            : item.listing_type === 'item_offer'
              ? 'מציע פריט'
              : item.listing_type === 'request'
                ? 'מחפש שירות'
                : 'מציע שירות'
        }
      >
        {item.listing_type === 'item_request'
          ? '🔎'
          : item.listing_type === 'item_offer'
            ? '📦'
            : item.listing_type === 'request'
              ? '🙋'
              : '🛠️'}
      </span>

      {/* כותרת */}
      <div className="min-w-0 flex-1">
        <h3 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
          {item.title}
        </h3>
      </div>

      {/* מיקום */}
      {item.location && (
        <div className="flex items-center gap-1 shrink-0 min-w-0 max-w-[110px] sm:max-w-[150px]">
          <span className="text-xs sm:text-sm shrink-0">📍</span>
          <span className="text-[11px] sm:text-xs font-medium text-slate-600 truncate">
            {item.location}
          </span>
        </div>
      )}

      
            {/* מחיר / תמורה */}
      <div className="shrink-0 hidden sm:block">
        {item.payment_type === 'free' ? (
          <span className="text-xs font-bold text-emerald-700 whitespace-nowrap">
            חינם
          </span>
        ) : item.payment_type === 'barter' ? (
          <span className="text-xs font-bold text-amber-700 whitespace-nowrap">
            🔄 ברטר
          </span>
        ) : item.payment_type === 'cash_or_barter' ? (
          <span className="text-xs font-bold text-purple-700 whitespace-nowrap">
            💰/🔄
          </span>
        ) : item.price ? (
          <span className="text-sm font-extrabold text-slate-800 whitespace-nowrap">
            ₪{item.price}
          </span>
        ) : null}
      </div>

      {/* זמן פרסום */}
      <span className="shrink-0 text-[10px] sm:text-xs font-medium text-slate-500 whitespace-nowrap">
        {getRelativeTime(item.created_at)}
      </span>

    </div>
  )
}

  return (
        <div
  key={item.id}
  onClick={() => {
    if (!isExpanded) {
      setSelectedListing(item)
      navigate(`/מודעה/${item.id}`)
    }
  }}
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (!isExpanded && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      setSelectedListing(item)
      navigate(`/מודעה/${item.id}`)
    }
  }}
  className={`group w-full overflow-hidden border-b transition-all duration-700 ease-in-out ${
    item.is_featured &&
    item.featured_until &&
    new Date(item.featured_until) > new Date()
      ? 'bg-amber-50/70 border-2 border-amber-400 shadow-[0_0_0_2px_rgba(251,191,36,0.18)]'
      : item.listing_type === 'item_request'
        ? 'bg-purple-50/80 border-purple-200'
        : item.listing_type === 'item_offer'
          ? 'bg-orange-50/80 border-orange-200'
          : item.listing_type === 'request'
            ? 'bg-blue-50/80 border-blue-200'
            : 'bg-emerald-50/80 border-emerald-200'
  } ${
    isExpanded
      ? 'max-h-[1400px]'
      : 'h-[50px] max-h-[50px]'
  }`}
>



          {/* =====================================================
              שורת מודעה קומפקטית
              ===================================================== */}
          <div
  className={`h-[50px] min-h-[50px] flex items-center gap-1.5 sm:gap-3 px-2 sm:px-3 cursor-pointer ${
    isExpanded ? 'border-b border-black/5' : ''
  }`}
  onClick={toggleListingExpanded}
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggleListingExpanded(e)
    }
  }}
>

  {/* סוג */}
  <span
    className={`shrink-0 inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs sm:text-sm ${
      item.listing_type === 'item_request'
        ? 'bg-purple-100 text-purple-700'
        : item.listing_type === 'item_offer'
          ? 'bg-orange-100 text-orange-700'
          : item.listing_type === 'request'
            ? 'bg-blue-100 text-blue-700'
            : 'bg-emerald-100 text-emerald-700'
    }`}
  >
    {item.listing_type === 'item_request'
      ? '🟣'
      : item.listing_type === 'item_offer'
        ? '🟠'
        : item.listing_type === 'request'
          ? '🔵'
          : '🟢'}
  </span>

  {/* כותרת */}
  <div className="min-w-0 flex-1">
    <h3 className="text-xs sm:text-base font-extrabold text-slate-900 truncate">
      {item.title}
    </h3>
  </div>

  {/* מיקום */}
  {item.location && (
    <div className="flex items-center gap-0.5 shrink-0 max-w-[82px] sm:max-w-[170px]">
      <span className="text-[11px] sm:text-sm shrink-0">
        📍
      </span>

      <span className="text-[10px] sm:text-xs font-semibold text-slate-600 truncate">
        {item.location}
      </span>
    </div>
  )}

  {/* מחיר — רק בדסקטופ */}
  <div className="hidden sm:block shrink-0">
    {item.payment_type === 'free' ? (
      <span className="text-xs font-bold text-emerald-700 whitespace-nowrap">
        🎁 חינם
      </span>
    ) : item.payment_type === 'barter' ? (
      <span className="text-xs font-bold text-amber-700 whitespace-nowrap">
        🔄 ברטר
      </span>
    ) : item.payment_type === 'cash_or_barter' ? (
      <span className="text-xs font-bold text-purple-700 whitespace-nowrap">
        💰/🔄
      </span>
    ) : item.price ? (
      <span className="text-sm font-extrabold text-slate-800 whitespace-nowrap">
        ₪{item.price}
      </span>
    ) : null}
  </div>

  

</div>



          {/* תמונת המודעה */}
          <div className="relative h-full min-h-[145px] md:h-auto md:min-h-0">

            {item.image_url ? (
              <div className="w-full h-full min-h-[145px] md:h-52 bg-slate-100 overflow-hidden">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
            ) : (
              <div className="w-full h-full min-h-[145px] md:h-36 bg-gradient-to-br from-slate-100 via-slate-50 to-emerald-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-1 text-slate-400">
                  <span className="text-2xl">
                    🖼️
                  </span>
                  <span className="text-xs font-medium">
                    אין תמונה
                  </span>
                </div>
              </div>
            )}





            {/* שכבת מעבר עדינה */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />

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
              className="absolute top-14 left-2 z-10 w-9 h-9 md:top-3 md:left-3 md:w-11 md:h-11 rounded-full bg-white/95 backdrop-blur-sm shadow-md flex items-center justify-center text-xl md:text-2xl hover:scale-110 hover:shadow-lg transition-all"
            >
              {favoriteListings.includes(item.id) ? '❤️' : '🤍'}
            </button>

            {/* תג סוג המודעה */}
            <div className="absolute top-2 right-2 md:top-3 md:right-3">

              {item.listing_type === 'item_request' ? (
  <span className="inline-flex items-center gap-1.5 bg-purple-600/95 text-white text-xs font-bold px-2 py-1 md:px-3 md:py-1.5 rounded-full shadow-md backdrop-blur-sm">
    🟣 מחפש פריט
  </span>
) : item.listing_type === 'item_offer' ? (
  <span className="inline-flex items-center gap-1.5 bg-orange-500/95 text-white text-xs font-bold px-2 py-1 md:px-3 md:py-1.5 rounded-full shadow-md backdrop-blur-sm">
    🟠 מציע פריט
  </span>
) : item.listing_type === 'request' ? (
  <span className="inline-flex items-center gap-1.5 bg-blue-600/95 text-white text-xs font-bold px-2 py-1 md:px-3 md:py-1.5 rounded-full shadow-md backdrop-blur-sm">
    🔵 מחפש שירות
  </span>
) : (
  <span className="inline-flex items-center gap-1.5 bg-emerald-600/95 text-white text-xs font-bold px-2 py-1 md:px-3 md:py-1.5 rounded-full shadow-md backdrop-blur-sm">
    🟢 מציע שירות
  </span>
)}

            </div>

          </div>

          {/* תוכן */}
          <div className="min-w-0 p-4 md:p-5 flex-1 flex flex-col">

                        

            {/* קטגוריה + תמורה */}
            <div className="flex items-start justify-between gap-3 mb-3">

              <span className="inline-flex max-w-[55%] bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-bold px-2.5 py-1 rounded-lg truncate">
                {item.category || 'כללי'}
              </span>

              <div className="flex flex-col items-end gap-1 shrink-0">

                {item.payment_type === 'free' ? (
  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm font-bold px-2.5 py-1 rounded-lg whitespace-nowrap">
    🎁 למסירה בחינם
  </span>
) : item.payment_type === 'barter' ? (
  <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-sm font-bold px-2.5 py-1 rounded-lg whitespace-nowrap">
    🔄 ברטר
  </span>
) : item.payment_type === 'cash_or_barter' ? (
  <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-200 text-sm font-bold px-2.5 py-1 rounded-lg whitespace-nowrap">
    💵🔄 תשלום או ברטר
  </span>
) : item.price ? (
  <span className="text-xl font-extrabold text-slate-900 whitespace-nowrap">
    ₪{item.price}
  </span>
) : (
  <span className="text-xs text-slate-400 font-medium">
    מחיר לא צוין
  </span>
)}

                {item.payment_type === 'cash_or_barter' && item.price && (
                  <span className="text-xs text-slate-500">
                    ₪{item.price} או ברטר
                  </span>
                )}

                {item.payment_type === 'barter' && (
                  <span className="text-xs text-slate-500">
                    תמורה לפי סיכום
                  </span>
                )}

              </div>

            </div>

            {/* כותרת */}
            <div className="mb-2">

              {item.is_demo && (
                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 border border-amber-200 rounded-full px-3 py-1 text-xs font-bold mb-2">
                  💡 מודעת דוגמה
                </span>
              )}

              <h3 className="text-base md:text-xl font-extrabold text-slate-900 line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
                {item.title}
              </h3>

            </div>

            {/* תיאור */}
            <p className="text-slate-600 text-xs md:text-sm leading-5 md:leading-6 mb-3 md:mb-4 line-clamp-2 md:line-clamp-3">
              {item.description || 'ללא תיאור נוסף'}
            </p>

            {/* מיקום ומרחק */}
            {item.location && (
              <div className="mt-auto pt-3 border-t border-slate-100">

                <div className="flex items-center gap-2 text-sm text-slate-500">

                  <span className="w-8 h-8 shrink-0 rounded-xl bg-slate-100 flex items-center justify-center">
                    📍
                  </span>

                  <span className="truncate font-medium">
                    {item.location}
                  </span>

                  {getListingDistance(item) !== null && (
                    <span className="shrink-0 inline-flex items-center bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-1 rounded-lg text-xs font-bold">
                      {getListingDistance(item) < 1
                        ? `${Math.round(getListingDistance(item) * 1000)} מ' ממך`
                        : `${getListingDistance(item).toFixed(1)} ק"מ ממך`}
                    </span>
                  )}

                </div>

              </div>
            )}

            {/* צפייה בפרטים */}
            <div className="mt-auto">

  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation()
      setSelectedListing(item)
      navigate(`/מודעה/${item.id}`)
    }}
    className="w-full flex items-center justify-between pt-4 border-t border-slate-200 text-right"
  >

    <span className="text-emerald-600 text-sm font-bold hover:text-emerald-700 transition-colors">
      צפייה בפרטים
    </span>

    <span className="w-8 h-8 bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition">
      →
    </span>

  </button>

</div>

          </div>

          {/* אזור תחתון */}
          <div className="px-3 pb-4 sm:px-4 md:px-5 md:pb-5">

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
    className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
    onClick={() => {
      setSelectedListing(null)
      navigate('/')
    }}
  >
    <div
  className="bg-white w-full max-w-4xl max-h-[94vh] overflow-y-auto rounded-none shadow-2xl overflow-hidden"
  dir="rtl"
      onClick={(e) => e.stopPropagation()}
    >

      {/* =========================================================
          כותרת המודאל
      ========================================================= */}
      <div className="flex items-center justify-between gap-3 px-5 py-4 sm:px-6 border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur-md z-20">

        <div className="flex items-center gap-3 min-w-0">

          <div className="w-10 h-10 shrink-0 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
            📋
          </div>

          <div className="min-w-0">
            <h2 className="text-lg font-extrabold text-slate-900">
              פרטי המודעה
            </h2>

            <p className="text-xs text-slate-500 mt-0.5">
              כסף כיס
            </p>
          </div>

        </div>

        <div className="flex items-center gap-2 shrink-0">

          {/* שיתוף */}
          <button
            onClick={() => handleShareListing(selectedListing)}
            className="h-10 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-sm transition flex items-center gap-2"
            aria-label="שיתוף המודעה"
          >
            <span>🔗</span>
            <span className="hidden sm:inline">
              שיתוף
            </span>
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
            onClick={() => {
              setSelectedListing(null)
              navigate('/')
            }}
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
      <div className="w-full bg-slate-100 p-3 sm:p-4">

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
              <div className="w-full h-40 sm:h-52 bg-gradient-to-br from-slate-100 via-slate-50 to-emerald-50 rounded-none flex flex-col items-center justify-center text-slate-400 gap-2">
                <span className="text-3xl">
                  🖼️
                </span>

                <span className="text-sm font-medium">
                  ללא תמונה
                </span>
              </div>
            )
          }

          const mainImage = allImages[0]
          const thumbnails = allImages.slice(1)

          return (
            <>

              {/* תמונה ראשית */}
              <button
                type="button"
                onClick={() => setGalleryImage(mainImage)}
                className="relative w-full h-64 sm:h-72 md:h-80 bg-slate-200 rounded-none overflow-hidden group cursor-zoom-in block"
              >

                <img
                  src={mainImage}
                  alt={selectedListing.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center">

                  <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-xl text-sm font-bold">
                    🔍 הגדל תמונה
                  </span>

                </div>

              </button>


              {/* תמונות נוספות */}
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
                        className="relative h-24 sm:h-28 md:h-32 rounded-xl overflow-hidden bg-white border-2 border-transparent hover:border-emerald-500 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                      >

                        <img
                          src={imageUrl}
                          alt={`${selectedListing.title} - תמונה ${index + 2}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

                        <div className="absolute bottom-1 left-1 right-1 flex justify-center">

                          <span className="bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
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
      <div className="p-5 sm:p-6 md:p-8">

        {/* סוג + קטגוריה + מחיר */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">

          <div className="flex flex-wrap items-center gap-2">

            {selectedListing.listing_type === 'item_request' ? (
  <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 border border-purple-100 text-sm font-bold px-3 py-1.5 rounded-xl">
    🟣 מחפש פריט
  </span>
) : selectedListing.listing_type === 'item_offer' ? (
  <span className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-700 border border-orange-100 text-sm font-bold px-3 py-1.5 rounded-xl">
    🟠 מציע פריט
  </span>
) : selectedListing.listing_type === 'request' ? (
  <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-100 text-sm font-bold px-3 py-1.5 rounded-xl">
    🔵 מחפש שירות / עזרה
  </span>
) : (
  <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 text-sm font-bold px-3 py-1.5 rounded-xl">
    🟢 מציע עבודה / שירות
  </span>
)}

            <span className="bg-slate-50 text-slate-700 border border-slate-200 text-sm font-semibold px-3 py-1.5 rounded-xl">
              {selectedListing.category || 'כללי'}
            </span>

          </div>

          {/* מחיר / תמורה */}
          {selectedListing.payment_type === 'free' ? (
  <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-lg font-extrabold px-3 py-1.5 rounded-xl whitespace-nowrap">
    🎁 למסירה בחינם
  </span>
) : selectedListing.payment_type === 'barter' ? (
            <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 text-lg font-extrabold px-3 py-1.5 rounded-xl whitespace-nowrap">
              🔄 ברטר
            </span>
          ) : selectedListing.payment_type === 'cash_or_barter' ? (
            <div className="flex flex-col items-end gap-1">
              <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 border border-purple-200 text-sm font-extrabold px-3 py-1.5 rounded-xl whitespace-nowrap">
                💵🔄 תשלום או ברטר
              </span>

              {selectedListing.price && (
                <span className="text-sm text-slate-500">
                  ₪{selectedListing.price} או ברטר
                </span>
              )}
            </div>
          ) : selectedListing.price ? (
            <span className="text-2xl font-extrabold text-slate-900 whitespace-nowrap">
              ₪{selectedListing.price}
            </span>
          ) : (
            <span className="text-sm text-slate-400 font-medium">
              מחיר לא צוין
            </span>
          )}

        </div>


        {/* כותרת */}
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-5 leading-tight">
          {selectedListing.title}
        </h2>


        {/* פרטי בסיס */}
        <div className="flex flex-wrap gap-2.5 mb-7 text-sm">

          {selectedListing.location && (
            <span className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-600">
              📍 {selectedListing.location}
            </span>
          )}

          {selectedListing.created_at && (
            <span className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-600">
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
              <span className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-700 rounded-xl px-3 py-2">
                🔄 עודכן:{' '}
                {new Date(
                  selectedListing.updated_at
                ).toLocaleDateString('he-IL')}
              </span>
            )}

        </div>


        {/* תיאור מלא */}
        <div className="mb-8">

          <div className="flex items-center gap-2 mb-3">

            <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              📝
            </span>

            <h3 className="text-lg font-extrabold text-slate-900">
              אודות המודעה
            </h3>

          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 sm:p-5">

            <p className="text-slate-600 leading-8 whitespace-pre-wrap">
              {selectedListing.description || 'לא נוסף תיאור למודעה.'}
            </p>

          </div>

        </div>


        {/* =========================================================
            פרטי מפרסם
        ========================================================= */}
        <div className="border-t border-slate-200 pt-6">

          <div className="flex items-center gap-2 mb-4">

            <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              {selectedListing.is_demo ? '💡' : '👤'}
            </span>

            <h3 className="text-lg font-extrabold text-slate-900">
              {selectedListing.is_demo
                ? 'מודעת דוגמה'
                : 'פרטי המפרסם'}
            </h3>

          </div>


          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">

  <div className="flex items-center gap-4">

    {selectedListing.is_demo ? (
      <div className="w-14 h-14 shrink-0 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-2xl">
        💡
      </div>
    ) : selectedListing.advertiser_avatar ? (
      <>
        <img
          src={selectedListing.advertiser_avatar}
          alt={selectedListing.advertiser_name || 'המפרסם'}
          className="w-14 h-14 shrink-0 rounded-full object-cover border-2 border-white"
          onError={(e) => {
            console.error(
              'Advertiser avatar failed to load:',
              e.currentTarget.src
            )

            e.currentTarget.style.display = 'none'

            const fallback = e.currentTarget.nextElementSibling

            if (fallback) {
              fallback.style.display = 'flex'
            }
          }}
        />

        <div
          className="w-14 h-14 shrink-0 rounded-full bg-emerald-100 items-center justify-center text-emerald-700 text-xl font-bold"
          style={{ display: 'none' }}
        >
          {(selectedListing.advertiser_name || 'משתמש')
            .charAt(0)
            .toUpperCase()}
        </div>
      </>
    ) : (
      <div className="w-14 h-14 shrink-0 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xl font-bold">
        {(selectedListing.advertiser_name || 'משתמש')
          .charAt(0)
          .toUpperCase()}
      </div>
    )}

    <div className="min-w-0 flex-1">

      <p className="font-extrabold text-slate-900">
        {selectedListing.is_demo
          ? 'מודעת דוגמה'
          : selectedListing.advertiser_name || 'משתמש רשום'}
      </p>

      {selectedListing.is_demo ? (
        <p className="text-sm text-slate-500 mt-0.5">
          מודעה לדוגמה להצגת השימוש באתר
        </p>
      ) : (
        <div className="mt-2 space-y-1">

          {selectedListing.advertiser_listing_count > 0 && (
            <p className="text-sm text-slate-600">
              📋 {selectedListing.advertiser_listing_count}{' '}
              {selectedListing.advertiser_listing_count === 1
                ? 'מודעה'
                : 'מודעות'}
            </p>
          )}

          {selectedListing.advertiser_created_at && (
            <p className="text-sm text-slate-500">
              📅 פעיל באתר מאז{' '}
              {new Date(
                selectedListing.advertiser_created_at
              ).toLocaleDateString('he-IL', {
                month: 'long',
                year: 'numeric'
              })}
            </p>
          )}

        </div>
      )}

    </div>

  </div>

  {!selectedListing.is_demo && selectedListing.user_id && (
    <button
      type="button"
      onClick={() => {
  setSelectedListing(null)
setScrollToListings(true)
navigate(`/מפרסם/${selectedListing.user_id}`)
  setTimeout(() => {
    document.getElementById('listings-section')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }, 50)
}}
      className="mt-4 w-full flex items-center justify-center gap-2 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 text-emerald-700 font-bold py-3 rounded-xl transition"
    >
      הצג את כל המודעות של {selectedListing.advertiser_name || 'המפרסם'}
      <span>←</span>
    </button>
  )}

</div>


          {/* כפתורי פעולה */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">

            {/* צור קשר */}
            {selectedListing.phone && (
              <button
                onClick={() => setContactListing(selectedListing)}
                className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-sm hover:shadow-md transition-all"
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
          onClick={() => {
            setSelectedListing(null)
            navigate('/')
          }}
          className="w-full mt-5 py-3 text-sm font-semibold text-slate-500 hover:text-slate-800 transition"
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


{/* =========================================================
    מודאל דיווח
========================================================= */}

{isReportModalOpen && (
  <div
    className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
    onClick={() => setIsReportModalOpen(false)}
  >

    <div
      dir="rtl"
      className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >

      {/* כותרת */}
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
            className="w-10 h-10 shrink-0 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-xl transition"
            aria-label="סגירה"
          >
            ×
          </button>

        </div>

      </div>


      {/* תוכן */}
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


        {/* סיבת הדיווח */}
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


        {/* פרטים נוספים */}
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


        {/* הסבר */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">

          <div className="flex gap-3">

            <span className="text-lg">
              💡
            </span>

            <p className="text-sm text-amber-800 leading-6">
              הדיווח ייבדק על ידי מפעיל האתר. אין להשתמש במערכת הדיווחים
              לצורך הטרדה או דיווחים כוזבים.
            </p>

          </div>

        </div>


        {/* פעולות */}
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

                  console.error(
                    'שגיאה בשליחת דיווח:',
                    error
                  )

                  alert(
                    'לא הצלחנו לשלוח את הדיווח.\n\n' +
                    error.message
                  )

                  return
                }

                alert(
                  'הדיווח התקבל. תודה שעזרת לנו לשמור על האתר.'
                )

                setIsReportModalOpen(false)
                setReportReason('')
                setReportDetails('')

              } catch (err) {

                console.error(
                  'שגיאה לא צפויה בשליחת הדיווח:',
                  err
                )

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




{showFeaturedAdmin && (
  <div className="fixed inset-0 z-[90] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">

    <div className="w-full max-w-3xl max-h-[90vh] overflow-hidden bg-white rounded-3xl shadow-2xl border border-amber-100">

      {/* כותרת */}
      <div className="flex items-center justify-between gap-4 px-5 sm:px-6 py-4 border-b border-slate-100 bg-gradient-to-l from-amber-50 to-white">

        <div className="flex items-center gap-3">

          <div className="w-11 h-11 rounded-2xl bg-amber-100 flex items-center justify-center text-xl">
            ⭐
          </div>

          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900">
              ניהול מודעות
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              הדגשת מודעות לחודש אחד
            </p>
          </div>

        </div>

        <button
          type="button"
          onClick={() => setShowFeaturedAdmin(false)}
          className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xl font-bold transition"
          aria-label="סגור"
        >
          ×
        </button>

      </div>


      {/* תוכן */}
      <div className="overflow-y-auto max-h-[calc(90vh-90px)] p-4 sm:p-6">

        {listings.length === 0 ? (

          <div className="py-12 text-center">

            <div className="text-4xl mb-3">
              📋
            </div>

            <p className="font-bold text-slate-700">
              אין כרגע מודעות לניהול
            </p>

          </div>

        ) : (

          <div className="space-y-3">

            {listings.map((listing) => {

              const isFeaturedActive =
                listing.is_featured === true &&
                listing.featured_until &&
                new Date(listing.featured_until) > new Date()

              return (
                <div
                  key={listing.id}
                  className={`rounded-2xl border p-4 transition ${
                    isFeaturedActive
                      ? 'border-amber-300 bg-amber-50/50'
                      : 'border-slate-200 bg-white'
                  }`}
                >

                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">

                    {/* פרטי המודעה */}
                    <div className="min-w-0 flex-1">

                      <div className="flex items-start gap-3">

                        <div className="w-10 h-10 shrink-0 rounded-xl bg-slate-100 flex items-center justify-center text-lg">
                          {isFeaturedActive ? '⭐' : '📄'}
                        </div>

                        <div className="min-w-0">

                          <h3 className="font-extrabold text-slate-900 truncate">
                            {listing.title || 'ללא כותרת'}
                          </h3>

                          <p className="text-sm text-slate-500 mt-1">
                            {listing.advertiser_name || listing.contact_name || 'משתמש רשום'}
                          </p>

                          {listing.location && (
                            <p className="text-xs text-slate-400 mt-1">
                              📍 {listing.location}
                            </p>
                          )}

                        </div>

                      </div>


                      {/* סטטוס הדגשה */}
                      {isFeaturedActive && (
                        <div className="mt-3 mr-12">

                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                            ⭐ מודעה מודגשת
                          </span>

                          <span className="mr-2 text-xs text-slate-500">
                            עד{' '}
                            {new Date(listing.featured_until).toLocaleDateString(
                              'he-IL'
                            )}
                          </span>

                        </div>
                      )}

                    </div>


                    {/* כפתור פעולה */}
                    <div className="shrink-0">

                      {isFeaturedActive ? (

                        <button
                          type="button"
                          disabled={featuredAdminLoading === listing.id}
                          onClick={() => handleUnfeatureListing(listing.id)}
                          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {featuredAdminLoading === listing.id
  ? 'מטפל...'
  : 'הסר הדגשה'}
                        </button>

                      ) : (

                        <button
                          type="button"
                          disabled={featuredAdminLoading === listing.id}
                          onClick={() => handleFeatureListing(listing.id)}
                          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {featuredAdminLoading === listing.id
  ? 'מטפל...'
  : '⭐ הדגש לחודש'}
                        </button>

                      )}

                    </div>

                  </div>

                </div>
              )
            })}

          </div>

        )}

      </div>

    </div>

  </div>
)}






{/* =========================================================
    מודאל אפשרויות יצירת קשר
========================================================= */}

{contactListing && (
  <div
    className="fixed inset-0 z-[60] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4"
    onClick={() => setContactListing(null)}
  >
    <div
      className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
      dir="rtl"
      onClick={(e) => e.stopPropagation()}
    >

      {/* פס עליון */}
      <div className="h-1.5 bg-gradient-to-l from-emerald-500 via-cyan-500 to-emerald-600" />

      {/* כותרת */}
      <div className="px-6 pt-6 pb-5 border-b border-slate-100">

        <div className="flex items-start justify-between gap-4">

          <div className="flex items-center gap-3">

            <div className="w-12 h-12 shrink-0 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
              💬
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                צור קשר עם המפרסם
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                בחרו את הדרך שנוחה לכם
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={() => setContactListing(null)}
            className="w-10 h-10 shrink-0 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xl transition flex items-center justify-center"
            aria-label="סגירת חלון"
          >
            ×
          </button>

        </div>

        {/* שם המודעה */}
        <div className="mt-4 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3">

          <p className="text-xs font-bold text-slate-400 mb-1">
            בקשר למודעה
          </p>

          <p className="text-sm font-extrabold text-slate-800 line-clamp-2">
            {contactListing.title}
          </p>

        </div>

      </div>


      {/* אפשרויות קשר */}
      <div className="p-6">

        <div className="space-y-3">

          {/* הודעה פרטית באתר */}
          <button
            type="button"
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
            className="group w-full flex items-center gap-4 p-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow-md transition-all"
          >

            <div className="w-11 h-11 shrink-0 rounded-xl bg-white/15 flex items-center justify-center text-xl">
              ✉️
            </div>

            <div className="flex-1 text-right">
              <div className="font-extrabold text-sm">
                שלח הודעה פרטית באתר
              </div>

              <div className="text-xs text-emerald-100 mt-0.5">
                הדרך המומלצת ליצירת קשר
              </div>
            </div>

            <span className="text-lg opacity-70 group-hover:-translate-x-1 transition-transform">
              ←
            </span>

          </button>


          {/* WhatsApp */}
          {contactListing.phone && (
            <a
              href={`https://wa.me/${contactListing.phone
                .replace(/[\s\-()+]/g, "")
                .replace(/^0/, "972")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group w-full flex items-center gap-4 p-4 rounded-2xl bg-green-50 hover:bg-green-100 border border-green-200 text-green-800 transition-all"
            >

              <div className="w-11 h-11 shrink-0 rounded-xl bg-green-100 flex items-center justify-center text-xl">
                💬
              </div>

              <div className="flex-1 text-right">
                <div className="font-extrabold text-sm">
                  שלח הודעה ב־WhatsApp
                </div>

                <div className="text-xs text-green-600 mt-0.5">
                  פתיחת שיחה ב־WhatsApp
                </div>
              </div>

              <span className="text-lg opacity-60 group-hover:-translate-x-1 transition-transform">
                ←
              </span>

            </a>
          )}


          {/* טלפון */}
          {contactListing.phone && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">

              <div className="flex items-center gap-3">

                <div className="w-11 h-11 shrink-0 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl">
                  📞
                </div>

                <div className="flex-1 min-w-0">

                  <p className="text-xs font-bold text-slate-400 mb-0.5">
                    מספר הטלפון של המפרסם
                  </p>

                  <p
                    className="text-lg font-extrabold text-slate-900 truncate"
                    dir="ltr"
                  >
                    {contactListing.phone}
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      contactListing.phone
                    )
                    alert("המספר הועתק בהצלחה")
                  }}
                  className="shrink-0 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold transition"
                >
                  📋 העתק
                </button>

              </div>

            </div>
          )}

        </div>


        {/* הערה קטנה */}
        <div className="mt-5 flex items-start gap-2 text-xs text-slate-400 leading-5">

          <span className="shrink-0">
            💡
          </span>

          <span>
            אפשר ליצור קשר ישירות דרך האתר, ב־WhatsApp או בטלפון.
          </span>

        </div>


        {/* ביטול */}
        <button
          type="button"
          onClick={() => setContactListing(null)}
          className="w-full mt-5 py-3 text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition"
        >
          ביטול
        </button>

      </div>

    </div>
  </div>
)}


{/* =========================================================
    חלון הודעות שלי
========================================================= */}

{messagesModalOpen && (
  <div
    className="fixed inset-0 z-[80] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
    onClick={() => setMessagesModalOpen(false)}
  >
    <div
      className="bg-white w-full max-w-2xl max-h-[88vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
      dir="rtl"
      onClick={(e) => e.stopPropagation()}
    >

      {/* =====================================================
          כותרת
      ===================================================== */}
      <div className="px-5 py-5 sm:px-6 border-b border-slate-100 bg-white">

        <div className="flex items-center justify-between gap-4">

          <div className="flex items-center gap-3 min-w-0">

            <div className="w-12 h-12 shrink-0 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
              💬
            </div>

            <div className="min-w-0">

              <div className="flex items-center gap-2">

                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  הודעות שלי
                </h2>

                {unreadMessagesCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full bg-red-500 text-white text-[11px] font-extrabold">
                    {unreadMessagesCount}
                  </span>
                )}

              </div>

              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                השיחות שלך עם מפרסמים ומשתמשים
              </p>

            </div>

          </div>


          <button
            type="button"
            onClick={() => setMessagesModalOpen(false)}
            className="w-10 h-10 shrink-0 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xl transition flex items-center justify-center"
            aria-label="סגירת חלון"
          >
            ×
          </button>

        </div>

      </div>


      {/* =====================================================
          תוכן
      ===================================================== */}
      <div className="p-4 sm:p-5 overflow-y-auto flex-1">

        {loadingMessages ? (

          <div className="flex flex-col items-center justify-center py-16">

            <div className="w-11 h-11 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin mb-4" />

            <p className="text-sm font-semibold text-slate-500">
              טוען שיחות...
            </p>

          </div>

        ) : conversationList.length === 0 ? (

          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 px-6 py-14 text-center">

            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-emerald-100/40 blur-3xl pointer-events-none" />

            <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-cyan-100/30 blur-3xl pointer-events-none" />

            <div className="relative">

              <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-3xl shadow-sm">
                💬
              </div>

              <h3 className="text-lg font-extrabold text-slate-800 mb-2">
                אין עדיין שיחות
              </h3>

              <p className="text-sm text-slate-500 max-w-sm mx-auto leading-6">
                כאשר תשלח או תקבל הודעה, השיחה תופיע כאן.
              </p>

            </div>

          </div>

        ) : (

          <div className="space-y-3">

            {conversationList.map((conversation) => (

              <div
                key={`${conversation.listingId}_${conversation.otherUserId}`}
                className={`group rounded-2xl border p-4 transition-all duration-200 ${
                  conversation.unreadCount > 0
                    ? 'border-emerald-300 bg-emerald-50/60 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-emerald-200 hover:shadow-sm'
                }`}
              >

                <div className="flex items-start gap-3 sm:gap-4">

                  {/* =================================================
                      אייקון
                  ================================================= */}
                  <div
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                      conversation.unreadCount > 0
                        ? 'bg-emerald-100'
                        : 'bg-slate-100'
                    }`}
                  >
                    💬
                  </div>


                  {/* =================================================
                      תוכן
                  ================================================= */}
                  <div className="flex-1 min-w-0">

                    {/* כותרת + תאריך */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">

                      <div className="flex items-center gap-2 min-w-0">

                        <span className="font-extrabold text-slate-900">
                          שיחה פרטית
                        </span>

                        {conversation.unreadCount > 0 && (
                          <span className="shrink-0 text-[10px] font-extrabold bg-red-500 text-white px-2 py-0.5 rounded-full">
                            {conversation.unreadCount === 1
                              ? 'חדשה'
                              : `${conversation.unreadCount} חדשות`}
                          </span>
                        )}

                      </div>

                      <span className="text-[11px] text-slate-400 whitespace-nowrap">
                        {new Date(
                          conversation.lastCreatedAt
                        ).toLocaleString('he-IL')}
                      </span>

                    </div>


                    {/* המודעה */}
                    <div className="flex items-center gap-1.5 mt-1.5">

                      <span className="text-xs text-slate-400">
                        📋
                      </span>

                      <p className="text-xs text-slate-400 truncate">
                        מודעה #{conversation.listingId}
                      </p>

                    </div>


                    {/* הודעה אחרונה */}
                    <div className={`mt-3 rounded-xl p-3 border ${
                      conversation.unreadCount > 0
                        ? 'bg-white border-emerald-100'
                        : 'bg-slate-50 border-slate-100'
                    }`}>

                      <p className="text-sm text-slate-700 leading-6 line-clamp-2">
                        {conversation.lastMessage}
                      </p>

                    </div>


                    {/* תחתית */}
                    <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

                      <span className={`text-xs ${
                        conversation.unreadCount > 0
                          ? 'text-emerald-700 font-bold'
                          : 'text-slate-400'
                      }`}>
                        {conversation.unreadCount > 0
                          ? '● יש הודעות שטרם נקראו'
                          : '✓ אין הודעות חדשות'}
                      </span>


                      <button
                        type="button"
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
                        className="self-stretch sm:self-auto inline-flex items-center justify-center gap-2 text-sm font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 hover:border-emerald-200 px-4 py-2.5 rounded-xl transition-all"
                      >
                        💬 פתח שיחה
                        <span className="group-hover:-translate-x-0.5 transition-transform">
                          ←
                        </span>
                      </button>

                    </div>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>


      {/* =====================================================
          תחתית
      ===================================================== */}
      <div className="border-t border-slate-100 p-4 bg-slate-50">

        <button
          type="button"
          onClick={() => {
            loadMyMessages()
          }}
          className="w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-700 font-bold py-3 rounded-xl transition-all"
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
    className="fixed inset-0 z-[90] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
    onClick={() => setSelectedConversation(null)}
  >
    <div
      className="bg-white w-full max-w-2xl max-h-[88vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
      dir="rtl"
      onClick={(e) => e.stopPropagation()}
    >

      {/* =====================================================
          כותרת השיחה
      ===================================================== */}
      <div className="px-5 py-4 sm:px-6 border-b border-slate-100 bg-white">

        <div className="flex items-center justify-between gap-4">

          <div className="flex items-center gap-3 min-w-0">

            <div className="w-11 h-11 shrink-0 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
              💬
            </div>

            <div className="min-w-0">

              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                שיחה פרטית
              </h2>

              <div className="flex items-center gap-1.5 mt-1">

                <span className="text-xs text-slate-400">
                  📋
                </span>

                <p className="text-xs text-slate-500 truncate">
                  מודעה #{selectedConversation.listingId}
                </p>

              </div>

            </div>

          </div>


          <button
            type="button"
            onClick={() => setSelectedConversation(null)}
            className="w-10 h-10 shrink-0 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xl transition flex items-center justify-center"
            aria-label="סגירת שיחה"
          >
            ×
          </button>

        </div>

      </div>


      {/* =====================================================
          אזור ההודעות
      ===================================================== */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-slate-50 min-h-[300px] max-h-[52vh]">

        {loadingConversation ? (

          <div className="flex items-center justify-center h-full min-h-[280px]">

            <div className="text-center">

              <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />

              <p className="text-sm font-semibold text-slate-500">
                טוען שיחה...
              </p>

            </div>

          </div>

        ) : conversationMessages.length === 0 ? (

          <div className="flex items-center justify-center min-h-[280px]">

            <div className="text-center">

              <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-3xl shadow-sm">
                💬
              </div>

              <h3 className="text-base font-extrabold text-slate-700 mb-1">
                עדיין אין הודעות
              </h3>

              <p className="text-sm text-slate-400">
                אפשר להיות הראשון ששולח הודעה בשיחה הזאת.
              </p>

            </div>

          </div>

        ) : (

          <div className="space-y-3">

            {conversationMessages.map((message) => {

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
                    className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 shadow-sm ${
                      isMine
                        ? 'bg-emerald-600 text-white rounded-2xl rounded-br-md'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-bl-md'
                    }`}
                  >

                    <p className="text-sm leading-6 whitespace-pre-wrap break-words">
                      {message.content}
                    </p>

                    <div
                      className={`flex items-center gap-1.5 mt-2 ${
                        isMine
                          ? 'justify-start'
                          : 'justify-end'
                      }`}
                    >

                      <span
                        className={`text-[10px] ${
                          isMine
                            ? 'text-emerald-100'
                            : 'text-slate-400'
                        }`}
                      >
                        {new Date(
                          message.created_at
                        ).toLocaleString('he-IL')}
                      </span>

                      {isMine && (
                        <span className="text-[10px] text-emerald-100">
                          ✓
                        </span>
                      )}

                    </div>

                  </div>

                </div>
              )

            })}

          </div>

        )}

      </div>


      {/* =====================================================
          אזור כתיבת הודעה
      ===================================================== */}
      <div className="border-t border-slate-100 p-4 sm:p-5 bg-white">

        <div className="relative">

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
            className="w-full border border-slate-200 rounded-2xl px-4 py-3.5 pl-20 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 resize-none bg-slate-50 focus:bg-white transition disabled:bg-slate-100"
          />

          <button
            type="button"
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
            className="absolute left-2 bottom-2 h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-bold transition flex items-center gap-1.5"
          >
            {isSendingConversationMessage
              ? 'שולח...'
              : '📤 שלח'}
          </button>

        </div>


        <div className="flex items-center justify-between mt-2 px-1">

          <span className="text-[11px] text-slate-400">
            ההודעה תישלח למפרסם
          </span>

          <span className="text-xs text-slate-400">
            {conversationContent.length}/2000
          </span>

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
    className="fixed inset-0 z-[70] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
    onClick={() => {
      if (!isSendingMessage) {
        setMessageModalOpen(false)
      }
    }}
  >
    <div
      className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
      dir="rtl"
      onClick={(e) => e.stopPropagation()}
    >

      {/* פס עליון */}
      <div className="h-1.5 bg-gradient-to-l from-emerald-500 via-cyan-500 to-emerald-600" />


      {/* =====================================================
          כותרת
      ===================================================== */}
      <div className="px-5 py-5 sm:px-6 border-b border-slate-100">

        <div className="flex items-start justify-between gap-4">

          <div className="flex items-center gap-3 min-w-0">

            <div className="w-12 h-12 shrink-0 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
              ✉️
            </div>

            <div className="min-w-0">

              <h2 className="text-xl font-extrabold text-slate-900">
                שליחת הודעה פרטית
              </h2>

              <p className="text-sm text-slate-500 mt-1 truncate">
                שלחו הודעה למפרסם
              </p>

            </div>

          </div>


          <button
            type="button"
            onClick={() => {
              if (!isSendingMessage) {
                setMessageModalOpen(false)
              }
            }}
            disabled={isSendingMessage}
            className="w-10 h-10 shrink-0 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xl transition flex items-center justify-center disabled:opacity-50"
            aria-label="סגירת חלון"
          >
            ×
          </button>

        </div>


        {/* המודעה */}
        <div className="mt-4 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3">

          <div className="flex items-start gap-2">

            <span className="shrink-0 text-sm">
              📋
            </span>

            <div className="min-w-0">

              <p className="text-xs font-bold text-slate-400 mb-1">
                בקשר למודעה
              </p>

              <p className="text-sm font-extrabold text-slate-800 line-clamp-2">
                {contactListing.title}
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          תוכן
      ===================================================== */}
      <div className="p-5 sm:p-6">

        {/* הודעת מערכת */}
        {messageStatus && (
          <div
            className={`mb-5 rounded-2xl px-4 py-3.5 text-sm font-semibold border ${
              messageStatus.startsWith("שגיאה")
                ? "bg-red-50 text-red-700 border-red-100"
                : "bg-emerald-50 text-emerald-700 border-emerald-100"
            }`}
          >
            <div className="flex items-start gap-2">

              <span>
                {messageStatus.startsWith("שגיאה")
                  ? "⚠️"
                  : "✅"}
              </span>

              <span>
                {messageStatus}
              </span>

            </div>
          </div>
        )}


        {/* שדה הודעה */}
        <div>

          <div className="flex items-center justify-between mb-2">

            <label
              htmlFor="private-message"
              className="text-sm font-extrabold text-slate-800"
            >
              ההודעה שלך
            </label>

            <span className="text-xs text-slate-400">
              עד 2,000 תווים
            </span>

          </div>


          <textarea
            id="private-message"
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            placeholder="כתוב כאן את ההודעה שלך למפרסם..."
            rows={7}
            maxLength={2000}
            disabled={isSendingMessage}
            className="w-full border border-slate-200 rounded-2xl px-4 py-3.5 text-sm leading-6 text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 resize-none bg-slate-50 focus:bg-white transition disabled:bg-slate-100"
          />


          <div className="flex items-center justify-between mt-2 px-1">

            <span className="text-[11px] text-slate-400">
              ההודעה תישלח באופן פרטי למפרסם
            </span>

            <span className="text-xs text-slate-400">
              {messageContent.length}/2000
            </span>

          </div>

        </div>


        {/* כפתורים */}
        <div className="grid grid-cols-2 gap-3 mt-6">

          <button
            type="button"
            onClick={() => {
              if (!isSendingMessage) {
                setMessageModalOpen(false)
              }
            }}
            disabled={isSendingMessage}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-xl transition disabled:opacity-50"
          >
            ביטול
          </button>


          <button
            type="button"
            onClick={async () => {

              if (!user) {
                setMessageStatus("שגיאה: יש להתחבר כדי לשלוח הודעה.")
                return
              }

              const trimmedMessage =
                messageContent.trim()

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
                  console.error(
                    "שגיאה בשליחת הודעה:",
                    error
                  )
                  throw error
                }

                setMessageStatus(
                  "ההודעה נשלחה בהצלחה! ✓"
                )

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
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2"
          >
            {isSendingMessage
              ? 'שולח...'
              : '✉️ שלח הודעה'}
          </button>

        </div>

      </div>

    </div>
  </div>
)}

      {/* =========================================================
    מודאל התחברות / הרשמה
========================================================= */}

{isAuthModalOpen && (
  <div
    className="fixed inset-0 z-[100] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
    onClick={() => setIsAuthModalOpen(false)}
  >
    <div
      className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
      dir="rtl"
      onClick={(e) => e.stopPropagation()}
    >

      {/* פס עליון */}
      <div className="h-1.5 bg-gradient-to-l from-emerald-500 via-cyan-500 to-emerald-600" />


      {/* =====================================================
          כותרת
      ===================================================== */}
      <div className="px-6 pt-7 pb-5 text-center">

        <button
          type="button"
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-5 left-5 w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 text-lg transition flex items-center justify-center"
          aria-label="סגירת חלון"
        >
          ×
        </button>


        <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl shadow-sm">
          💰
        </div>

        <h3 className="text-2xl font-extrabold text-slate-900">
          {authMode === 'login'
            ? 'התחברות למערכת'
            : 'הרשמה למערכת'}
        </h3>

        <p className="text-sm text-slate-500 mt-2">
          {authMode === 'login'
            ? 'התחברו כדי לפרסם מודעות, לשלוח הודעות ולנהל את הפעילות שלכם.'
            : 'צרו חשבון והתחילו להשתמש בכסף כיס.'}
        </p>

      </div>


      {/* =====================================================
          תוכן
      ===================================================== */}
      <div className="px-6 pb-6">

        {/* שגיאה */}
        {authError && (
          <div className="mb-4 rounded-2xl bg-red-50 border border-red-100 px-4 py-3">

            <div className="flex items-start gap-2">

              <span className="shrink-0">
                ⚠️
              </span>

              <p className="text-sm font-semibold text-red-700 leading-5">
                {authError}
              </p>

            </div>

          </div>
        )}


        {/* Google */}
        <button
          onClick={handleGoogleLogin}
          type="button"
          className="w-full py-3.5 px-4 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all text-slate-700 shadow-sm"
        >
          <span className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-base">
            🌐
          </span>

          <span>
            התחבר באמצעות Google
          </span>
        </button>


        {/* מפריד */}
        <div className="relative flex items-center gap-3 my-5">

          <div className="flex-1 border-t border-slate-200" />

          <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
            או באמצעות אימייל
          </span>

          <div className="flex-1 border-t border-slate-200" />

        </div>


        {/* טופס */}
        <form
          onSubmit={handleAuth}
          className="space-y-4"
        >

          {/* אימייל */}
          <div>

            <label className="block text-sm font-bold text-slate-700 mb-2">
              כתובת אימייל
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-4 py-3.5 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 text-sm text-slate-800 placeholder:text-slate-400 transition"
            />

          </div>


          {/* סיסמה */}
          <div>

            <label className="block text-sm font-bold text-slate-700 mb-2">
              סיסמה
            </label>

            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="לפחות 6 תווים"
              className="w-full px-4 py-3.5 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 text-sm text-slate-800 placeholder:text-slate-400 transition"
            />

          </div>


          {/* כפתור */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-2xl font-extrabold text-sm transition-all shadow-sm hover:shadow-md mt-2"
          >
            {isSubmitting
              ? 'מעבד...'
              : authMode === 'login'
                ? 'התחבר לחשבון'
                : 'הירשם כעת'}
          </button>

        </form>


        {/* מעבר התחברות / הרשמה */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-center">

          {authMode === 'login' ? (

            <p className="text-sm text-slate-500">

              אין לך חשבון עדיין?{' '}

              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup')
                  setAuthError('')
                }}
                className="text-emerald-600 font-extrabold hover:text-emerald-700 hover:underline transition"
              >
                הירשם כאן
              </button>

            </p>

          ) : (

            <p className="text-sm text-slate-500">

              כבר רשום במערכת?{' '}

              <button
                type="button"
                onClick={() => {
                  setAuthMode('login')
                  setAuthError('')
                }}
                className="text-emerald-600 font-extrabold hover:text-emerald-700 hover:underline transition"
              >
                התחבר כאן
              </button>

            </p>

          )}

        </div>

      </div>

    </div>
  </div>
)}

      
{/* =========================================================
    מודאל פרסום מודעה חדשה
========================================================= */}

{isModalOpen && (
  <div
    className="fixed inset-0 z-[70] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
    onClick={() => setIsModalOpen(false)}
  >
    <div
      className="relative bg-white w-full max-w-2xl max-h-[92vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
      dir="rtl"
      onClick={(e) => e.stopPropagation()}
    >

      {/* פס עליון */}
      <div className="h-1.5 shrink-0 bg-gradient-to-l from-emerald-500 via-cyan-500 to-emerald-600" />


      {/* =====================================================
          כותרת
      ===================================================== */}
      <div className="px-5 py-5 sm:px-6 border-b border-slate-100 bg-white shrink-0">

        <div className="flex items-start justify-between gap-4">

          <div className="flex items-center gap-3 min-w-0">

            <div className="w-12 h-12 shrink-0 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
              📢
            </div>

            <div className="min-w-0">

              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                פרסום מודעה חדשה
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                ספרו לקהילה מה אתם מציעים או מה אתם מחפשים
              </p>

            </div>

          </div>


          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className="w-10 h-10 shrink-0 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xl transition flex items-center justify-center"
            aria-label="סגירת חלון"
          >
            ×
          </button>

        </div>

      </div>


      {/* =====================================================
          טופס
      ===================================================== */}
      <div className="overflow-y-auto flex-1">

        <form
          onSubmit={handleSubmit}
          className="p-5 sm:p-6 space-y-5"
        >

          {/* =================================================
              פרטי המודעה
          ================================================= */}

          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">

            <div className="flex items-center gap-2 mb-4">

              <span className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-sm">
                📝
              </span>

              <div>
                <h3 className="text-sm font-extrabold text-slate-800">
                  פרטי המודעה
                </h3>

                <p className="text-xs text-slate-400 mt-0.5">
                  תנו למודעה כותרת ברורה ובחרו את סוגה
                </p>
              </div>

            </div>


            {/* כותרת */}
            <div className="mb-4">

              <label className="block text-sm font-bold text-slate-700 mb-2">
                כותרת המודעה *
              </label>

              <input
                type="text"
                name="title"
                required
                placeholder="למשל: דרוש בייביסיטר לערב / תיקון צבע בסלון"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3.5 border border-slate-200 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 text-sm text-slate-800 placeholder:text-slate-400 transition"
              />

            </div>


            {/* סוג + קטגוריה */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* סוג המודעה */}
              <div>

                <label className="block text-sm font-bold text-slate-700 mb-2">
                  סוג המודעה
                </label>

                <select
  name="listing_type"
  value={formData.listing_type}
  onChange={handleChange}
  className="w-full px-4 py-3.5 border border-slate-200 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 text-sm text-slate-700 transition"
>
  {formData.category === 'חפצים' ? (
    <>
      <option value="item_offer">
        🟠 מציע פריט
      </option>

      <option value="item_request">
        🟣 מחפש פריט
      </option>
    </>
  ) : (
    <>
      <option value="offer">
        🟢 מציע שירות
      </option>

      <option value="request">
        🔵 מחפש שירות
      </option>
    </>
  )}
</select>

              </div>


              {/* קטגוריה */}
              <div>

                <label className="block text-sm font-bold text-slate-700 mb-2">
                  קטגוריה
                </label>

                <div className="relative">
  <select
    name="category"
    value={formData.category}
    onChange={handleChange}
    className={`w-full px-4 py-3.5 pr-11 border rounded-2xl appearance-none focus:outline-none focus:ring-2 transition text-sm font-medium ${
      formData.category === 'חפצים'
        ? 'border-orange-300 bg-orange-50 text-orange-800 focus:ring-orange-200'
        : 'border-slate-200 bg-white text-slate-700 focus:ring-emerald-200 focus:border-emerald-400'
    }`}
  >
    {categories.map((category) => (
      <option key={category} value={category}>
        {category === 'חפצים' ? '📦  חפצים' : category}
      </option>
    ))}
  </select>

  {/* חץ */}
  <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
    <svg
      className="w-4 h-4"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 111.08 1.04l-4.25-4.51a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  </div>

  {/* סימון כאשר חפצים נבחר */}
  {formData.category === 'חפצים' && (
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none">
      📦
    </div>
  )}
</div>

              </div>

            </div>

          </div>


          {/* =================================================
              מחיר + מיקום
          ================================================= */}

          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">

            <div className="flex items-center gap-2 mb-4">

              <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-sm">
                📍
              </span>

              <div>
                <h3 className="text-sm font-extrabold text-slate-800">
                  מחיר ומיקום
                </h3>

                <p className="text-xs text-slate-400 mt-0.5">
                  עזרו למשתמשים להבין מה התמורה והיכן השירות ניתן
                </p>
              </div>

            </div>


            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* מחיר */}
              <div>

                <label className="block text-sm font-bold text-slate-700 mb-2">
                  מחיר (₪)
                </label>

                <input
                  type="number"
                  name="price"
                  placeholder="למשל: 150"
                  value={formData.price}
                  onChange={handleChange}
                  disabled={
  formData.payment_type === 'barter' ||
  formData.payment_type === 'free'
}
                  className="w-full px-4 py-3.5 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 text-sm text-slate-800 placeholder:text-slate-400 transition disabled:bg-slate-100 disabled:text-slate-400"
                />

                {formData.payment_type === 'barter' && (
                  <p className="text-xs text-amber-600 mt-2">
                    🔄 בברטר אין צורך לציין מחיר
                  </p>
                )}
                {formData.payment_type === 'free' && (
  <p className="text-xs text-emerald-600 mt-2">
    🎁 פריט זה יימסר בחינם
  </p>
)}

              </div>


              {/* עיר / אזור */}
              <div>

                <label className="block text-sm font-bold text-slate-700 mb-2">
                  עיר / אזור
                </label>

                <div className="relative">

                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="הקלד עיר או יישוב..."
                    autoComplete="off"
                    className="w-full px-4 py-3.5 border border-slate-200 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 text-sm text-slate-800 placeholder:text-slate-400 transition"
                  />

                  {formData.location.trim().length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto">

                      {israeliLocations
                        .filter((location) =>
                          location
                            .toLowerCase()
                            .includes(
                              formData.location.trim().toLowerCase()
                            )
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
                          .includes(
                            formData.location.trim().toLowerCase()
                          )
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

          </div>


          {/* =================================================
              אופן התמורה
          ================================================= */}

          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">

            <div className="flex items-center gap-2 mb-4">

              <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-sm">
                💵
              </span>

              <div>
                <h3 className="text-sm font-extrabold text-slate-800">
                  אופן התמורה
                </h3>

                <p className="text-xs text-slate-400 mt-0.5">
                  בחרו כיצד תרצו לקבל או להציע תמורה
                </p>
              </div>

            </div>


            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">

              {/* תשלום */}
              <button
                type="button"
                onClick={() =>
                  setFormData((previous) => ({
                    ...previous,
                    payment_type: 'cash'
                  }))
                }
                className={`px-2 py-3.5 rounded-2xl border-2 text-sm font-bold transition-all ${
                  formData.payment_type === 'cash'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/40'
                }`}
              >
                <span className="text-xl">
                  💵
                </span>

                <span className="block mt-1.5">
                  תשלום
                </span>
              </button>


              {/* ברטר */}
              <button
                type="button"
                onClick={() =>
                  setFormData((previous) => ({
                    ...previous,
                    payment_type: 'barter',
                    price: ''
                  }))
                }
                className={`px-2 py-3.5 rounded-2xl border-2 text-sm font-bold transition-all ${
                  formData.payment_type === 'barter'
                    ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-amber-200 hover:bg-amber-50/40'
                }`}
              >
                <span className="text-xl">
                  🔄
                </span>

                <span className="block mt-1.5">
                  ברטר
                </span>
              </button>


              {/* תשלום או ברטר */}
              <button
                type="button"
                onClick={() =>
                  setFormData((previous) => ({
                    ...previous,
                    payment_type: 'cash_or_barter'
                  }))
                }
                className={`px-2 py-3.5 rounded-2xl border-2 text-sm font-bold transition-all ${
                  formData.payment_type === 'cash_or_barter'
                    ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-purple-200 hover:bg-purple-50/40'
                }`}
              >
                <span className="text-xl">
                  💵🔄
                </span>

                <span className="block mt-1.5">
                  תשלום או ברטר
                </span>
              </button>


              {formData.category === 'חפצים' && (
  <button
    type="button"
    onClick={() =>
      setFormData((previous) => ({
        ...previous,
        payment_type: 'free',
        price: ''
      }))
    }
    className={`px-2 py-3.5 rounded-2xl border-2 text-sm font-bold transition-all ${
      formData.payment_type === 'free'
        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
        : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/40'
    }`}
  >
    <span className="text-xl">
      🎁
    </span>

    <span className="block mt-1.5">
      למסירה בחינם
    </span>
  </button>
)}

            </div>

        


            {formData.payment_type === 'barter' && (
              <div className="mt-3 rounded-xl bg-amber-50 border border-amber-100 px-3.5 py-2.5">
                <p className="text-xs text-amber-700 font-medium leading-5">
                  🔄 המודעה מיועדת לברטר. ציין בתיאור מה תרצה לקבל בתמורה.
                </p>
              </div>
            )}

            {formData.payment_type === 'cash_or_barter' && (
              <div className="mt-3 rounded-xl bg-purple-50 border border-purple-100 px-3.5 py-2.5">
                <p className="text-xs text-purple-700 font-medium leading-5">
                  💵🔄 ניתן להציע תשלום או שירות / מוצר בתמורה.
                </p>
              </div>
            )}

          </div>


          {/* =================================================
              תמונות
          ================================================= */}

          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">

            <div className="flex items-center gap-2 mb-4">

              <span className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center text-sm">
                🖼️
              </span>

              <div>
                <h3 className="text-sm font-extrabold text-slate-800">
                  תמונות
                </h3>

                <p className="text-xs text-slate-400 mt-0.5">
                  הוסיפו תמונה ראשית ועד 4 תמונות נוספות
                </p>
              </div>

            </div>


            {/* תמונה ראשית */}
            <div className="mb-4">

              <label className="block text-sm font-bold text-slate-700 mb-2">
                תמונה ראשית
              </label>

              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setImageFile(e.target.files[0] || null)
                  }
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 file:cursor-pointer"
                />

                <p className="text-xs text-slate-400 mt-2">
                  התמונה הזו תופיע כתמונה הראשית של המודעה.
                </p>

              </div>

            </div>


            {/* תמונות נוספות */}
            <div>

              <label className="block text-sm font-bold text-slate-700 mb-2">
                תמונות נוספות
              </label>

              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const selectedFiles = Array.from(
                      e.target.files || []
                    )

                    setAdditionalImageFiles((previousFiles) => {
                      const combinedFiles = [
                        ...previousFiles,
                        ...selectedFiles
                      ]

                      return combinedFiles.slice(0, 4)
                    })

                    e.target.value = ''
                  }}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 file:cursor-pointer"
                />

                {additionalImageFiles.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">

                    {additionalImageFiles.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="relative rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm"
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
                              previousFiles.filter(
                                (_, fileIndex) =>
                                  fileIndex !== index
                              )
                            )
                          }}
                          className="absolute top-1.5 left-1.5 w-7 h-7 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center text-sm font-bold shadow-md transition"
                          title="הסר תמונה"
                        >
                          ×
                        </button>

                      </div>
                    ))}

                  </div>
                )}

                <p className="text-xs text-slate-400 mt-2">
                  ניתן להוסיף עד 4 תמונות נוספות.
                </p>

              </div>

            </div>

          </div>


          {/* =================================================
              תיאור
          ================================================= */}

          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">

            <div className="flex items-center gap-2 mb-4">

              <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center text-sm">
                ✍️
              </span>

              <div>
                <h3 className="text-sm font-extrabold text-slate-800">
                  תיאור המודעה
                </h3>

                <p className="text-xs text-slate-400 mt-0.5">
                  הוסיפו פרטים שיעזרו לאחרים להבין בדיוק מה נדרש
                </p>
              </div>

            </div>


            <textarea
              name="description"
              rows="5"
              placeholder={
                formData.payment_type === 'barter'
                  ? 'פרט מה אתה מציע ומה תרצה לקבל בתמורה...'
                  : 'פרט מה העבודה כוללת, ימים, שעות וכו\'...'
              }
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3.5 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 text-sm leading-6 text-slate-800 placeholder:text-slate-400 resize-none transition"
            ></textarea>

          </div>


          {/* =================================================
              איש קשר
          ================================================= */}

          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">

            <div className="flex items-center gap-2 mb-4">

              <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center text-sm">
                👤
              </span>

              <div>
                <h3 className="text-sm font-extrabold text-slate-800">
                  פרטי קשר
                </h3>

                <p className="text-xs text-slate-400 mt-0.5">
                  איך יוכלו ליצור איתכם קשר בנוגע למודעה
                </p>
              </div>

            </div>


            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* שם */}
              <div>

                <label className="block text-sm font-bold text-slate-700 mb-2">
                  שם איש קשר
                </label>

                <input
                  type="text"
                  name="contact_name"
                  placeholder="שמך"
                  value={formData.contact_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 border border-slate-200 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 text-sm text-slate-800 placeholder:text-slate-400 transition"
                />

              </div>


              {/* טלפון */}
              <div>

                <label className="block text-sm font-bold text-slate-700 mb-2">
                  מספר טלפון
                </label>

                <input
                  type="tel"
                  name="phone"
                  placeholder="050-0000000"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 border border-slate-200 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 text-sm text-slate-800 placeholder:text-slate-400 transition"
                />

              </div>

            </div>

          </div>


          {/* =================================================
              כפתורי פעולה
          ================================================= */}

          <div className="sticky bottom-0 -mx-5 sm:-mx-6 px-5 sm:px-6 py-4 bg-white/95 backdrop-blur-md border-t border-slate-100 flex gap-3">

            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition"
            >
              ביטול
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-[1.5] py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-extrabold text-sm shadow-sm hover:shadow-md transition-all"
            >
              {isSubmitting
                ? 'מפרסם...'
                : '📢 פרסם כעת'}
            </button>

          </div>

        </form>

      </div>

    </div>
  </div>
)}



 {/* =========================================================
    מודאל עריכת מודעה
========================================================= */}

{isEditModalOpen && (
  <div
    className="fixed inset-0 z-[70] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
    onClick={() => setIsEditModalOpen(false)}
  >
    <div
      className="relative bg-white w-full max-w-2xl max-h-[92vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
      dir="rtl"
      onClick={(e) => e.stopPropagation()}
    >

      {/* פס עליון */}
      <div className="h-1.5 shrink-0 bg-gradient-to-l from-emerald-500 via-cyan-500 to-emerald-600" />


      {/* =====================================================
          כותרת
      ===================================================== */}
      <div className="px-5 py-5 sm:px-6 border-b border-slate-100 bg-white shrink-0">

        <div className="flex items-start justify-between gap-4">

          <div className="flex items-center gap-3 min-w-0">

            <div className="w-12 h-12 shrink-0 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
              ✏️
            </div>

            <div className="min-w-0">

              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                עריכת מודעה
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                עדכנו את פרטי המודעה ושמרו את השינויים
              </p>

            </div>

          </div>


          <button
            type="button"
            onClick={() => setIsEditModalOpen(false)}
            className="w-10 h-10 shrink-0 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xl transition flex items-center justify-center"
            aria-label="סגירת חלון"
          >
            ×
          </button>

        </div>

      </div>


      {/* =====================================================
          תוכן הטופס
      ===================================================== */}
      <div className="overflow-y-auto flex-1">

        <form
          onSubmit={handleUpdateListing}
          className="p-5 sm:p-6 space-y-5"
        >

          {/* =================================================
              סוג המודעה
          ================================================= */}

          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">

            <div className="flex items-center gap-2 mb-4">

              <span className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-sm">
                📢
              </span>

              <div>
                <h3 className="text-sm font-extrabold text-slate-800">
                  סוג המודעה
                </h3>

                <p className="text-xs text-slate-400 mt-0.5">
                  האם אתם מציעים שירות או מחפשים עזרה?
                </p>
              </div>

            </div>


            <div
  className={
    formData.category === 'חפצים'
      ? 'grid grid-cols-1 sm:grid-cols-2 gap-3'
      : 'grid grid-cols-1 sm:grid-cols-2 gap-3'
  }
>

  {formData.category === 'חפצים' ? (
    <>

      {/* מציע פריט */}
      <button
        type="button"
        onClick={() =>
          setFormData((prev) => ({
            ...prev,
            listing_type: 'item_offer'
          }))
        }
        className={`p-4 rounded-2xl border-2 text-sm font-bold transition-all ${
          formData.listing_type === 'item_offer'
            ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm'
            : 'border-slate-200 bg-white text-slate-600 hover:border-orange-200 hover:bg-orange-50/40'
        }`}
      >
        <span className="block text-xl mb-1">
          🟠
        </span>

        מציע פריט
      </button>


      {/* מחפש פריט */}
      <button
        type="button"
        onClick={() =>
          setFormData((prev) => ({
            ...prev,
            listing_type: 'item_request'
          }))
        }
        className={`p-4 rounded-2xl border-2 text-sm font-bold transition-all ${
          formData.listing_type === 'item_request'
            ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-sm'
            : 'border-slate-200 bg-white text-slate-600 hover:border-purple-200 hover:bg-purple-50/40'
        }`}
      >
        <span className="block text-xl mb-1">
          🟣
        </span>

        מחפש פריט
      </button>

    </>
  ) : (
    <>

      {/* מציע שירות */}
      <button
        type="button"
        onClick={() =>
          setFormData((prev) => ({
            ...prev,
            listing_type: 'offer'
          }))
        }
        className={`p-4 rounded-2xl border-2 text-sm font-bold transition-all ${
          formData.listing_type === 'offer'
            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
            : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/40'
        }`}
      >
        <span className="block text-xl mb-1">
          🟢
        </span>

        מציע שירות
      </button>


      {/* מחפש שירות */}
      <button
        type="button"
        onClick={() =>
          setFormData((prev) => ({
            ...prev,
            listing_type: 'request'
          }))
        }
        className={`p-4 rounded-2xl border-2 text-sm font-bold transition-all ${
          formData.listing_type === 'request'
            ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
            : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50/40'
        }`}
      >
        <span className="block text-xl mb-1">
          🔵
        </span>

        מחפש שירות
      </button>

    </>
  )}

</div>

          </div>


          {/* =================================================
              פרטי המודעה
          ================================================= */}

          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">

            <div className="flex items-center gap-2 mb-4">

              <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-sm">
                📝
              </span>

              <div>
                <h3 className="text-sm font-extrabold text-slate-800">
                  פרטי המודעה
                </h3>

                <p className="text-xs text-slate-400 mt-0.5">
                  עדכנו את הכותרת והקטגוריה
                </p>
              </div>

            </div>


            {/* כותרת */}
            <div className="mb-4">

              <label className="block text-sm font-bold text-slate-700 mb-2">
                כותרת המודעה *
              </label>

              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3.5 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 text-sm text-slate-800 transition"
              />

            </div>


            {/* קטגוריה */}
            <div>

              <label className="block text-sm font-bold text-slate-700 mb-2">
                קטגוריה
              </label>

              <div className="relative">
  <select
    name="category"
    value={formData.category}
    onChange={handleChange}
    className={`w-full px-4 py-3.5 pr-11 border rounded-2xl appearance-none focus:outline-none focus:ring-2 transition text-sm font-medium ${
      formData.category === 'חפצים'
        ? 'border-orange-300 bg-orange-50 text-orange-800 focus:ring-orange-200'
        : 'border-slate-200 bg-slate-50 text-slate-700 focus:bg-white focus:ring-emerald-200 focus:border-emerald-400'
    }`}
  >
    {categories.map((category) => (
      <option key={category} value={category}>
        {category === 'חפצים' ? '📦  חפצים' : category}
      </option>
    ))}
  </select>

  {/* חץ */}
  <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
    <svg
      className="w-4 h-4"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51A.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  </div>

  {/* סימון כאשר חפצים נבחר */}
  {formData.category === 'חפצים' && (
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none">
      📦
    </div>
  )}
</div>

            </div>

          </div>


          {/* =================================================
              מחיר + מיקום
          ================================================= */}

          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">

            <div className="flex items-center gap-2 mb-4">

              <span className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center text-sm">
                📍
              </span>

              <div>
                <h3 className="text-sm font-extrabold text-slate-800">
                  מחיר ומיקום
                </h3>

                <p className="text-xs text-slate-400 mt-0.5">
                  עדכנו את המחיר ואת אזור השירות
                </p>
              </div>

            </div>


            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* מחיר */}
              <div>

                <label className="block text-sm font-bold text-slate-700 mb-2">
                  מחיר (₪)
                </label>

                
                  <input
  type="number"
  name="price"
  value={formData.price}
  onChange={handleChange}
  disabled={
    formData.payment_type === 'barter' ||
    formData.payment_type === 'free'
  }
  className="w-full px-4 py-3.5 border border-slate-200 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 text-sm text-slate-800 transition disabled:bg-slate-100 disabled:text-slate-400"
/>
{formData.payment_type === 'free' && (
  <p className="text-xs text-emerald-600 mt-2">
    🎁 פריט זה יימסר בחינם
  </p>
)}

              </div>


              {/* עיר / אזור */}
              <div>

                <label className="block text-sm font-bold text-slate-700 mb-2">
                  עיר / אזור
                </label>

                <select
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 border border-slate-200 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 text-sm text-slate-700 transition"
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

          </div>



{/* =================================================
    אופן התמורה
================================================= */}

<div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">

  <div className="flex items-center gap-2 mb-4">

    <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-sm">
      💵
    </span>

    <div>
      <h3 className="text-sm font-extrabold text-slate-800">
        אופן התמורה
      </h3>

      <p className="text-xs text-slate-400 mt-0.5">
        בחרו כיצד תרצו לקבל או להציע תמורה
      </p>
    </div>

  </div>


  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">

    {/* תשלום */}
    <button
      type="button"
      onClick={() =>
        setFormData((previous) => ({
          ...previous,
          payment_type: 'cash'
        }))
      }
      className={`px-2 py-3.5 rounded-2xl border-2 text-sm font-bold transition-all ${
        formData.payment_type === 'cash'
          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
          : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/40'
      }`}
    >
      <span className="text-xl">
        💵
      </span>

      <span className="block mt-1.5">
        תשלום
      </span>
    </button>


    {/* ברטר */}
    <button
      type="button"
      onClick={() =>
        setFormData((previous) => ({
          ...previous,
          payment_type: 'barter',
          price: ''
        }))
      }
      className={`px-2 py-3.5 rounded-2xl border-2 text-sm font-bold transition-all ${
        formData.payment_type === 'barter'
          ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-sm'
          : 'border-slate-200 bg-white text-slate-600 hover:border-amber-200 hover:bg-amber-50/40'
      }`}
    >
      <span className="text-xl">
        🔄
      </span>

      <span className="block mt-1.5">
        ברטר
      </span>
    </button>


    {/* תשלום או ברטר */}
    <button
      type="button"
      onClick={() =>
        setFormData((previous) => ({
          ...previous,
          payment_type: 'cash_or_barter'
        }))
      }
      className={`px-2 py-3.5 rounded-2xl border-2 text-sm font-bold transition-all ${
        formData.payment_type === 'cash_or_barter'
          ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-sm'
          : 'border-slate-200 bg-white text-slate-600 hover:border-purple-200 hover:bg-purple-50/40'
      }`}
    >
      <span className="text-xl">
        💵🔄
      </span>

      <span className="block mt-1.5">
        תשלום או ברטר
      </span>
        </button>

    {formData.category === 'חפצים' && (
      <button
        type="button"
        onClick={() =>
          setFormData((previous) => ({
            ...previous,
            payment_type: 'free',
            price: ''
          }))
        }
        className={`px-2 py-3.5 rounded-2xl border-2 text-sm font-bold transition-all ${
          formData.payment_type === 'free'
            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
            : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/40'
        }`}
      >
        <span className="text-xl">
          🎁
        </span>

        <span className="block mt-1.5">
          למסירה בחינם
        </span>
      </button>
    )}

  </div>


  {formData.payment_type === 'barter' && (
    <div className="mt-3 rounded-xl bg-amber-50 border border-amber-100 px-3.5 py-2.5">
      <p className="text-xs text-amber-700 font-medium leading-5">
        🔄 המודעה מיועדת לברטר. ציין בתיאור מה תרצה לקבל בתמורה.
      </p>
    </div>
  )}


  {formData.payment_type === 'cash_or_barter' && (
    <div className="mt-3 rounded-xl bg-purple-50 border border-purple-100 px-3.5 py-2.5">
      <p className="text-xs text-purple-700 font-medium leading-5">
        💵🔄 ניתן להציע תשלום או שירות / מוצר בתמורה.
      </p>
    </div>
  )}

</div>



          {/* =================================================
              תמונה ראשית
          ================================================= */}

          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">

            <div className="flex items-center gap-2 mb-4">

              <span className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center text-sm">
                🖼️
              </span>

              <div>
                <h3 className="text-sm font-extrabold text-slate-800">
                  תמונה ראשית
                </h3>

                <p className="text-xs text-slate-400 mt-0.5">
                  החליפו או הסירו את התמונה הראשית
                </p>
              </div>

            </div>


            {editingListing?.image_url && !removeMainImage && (
              <div className="relative mb-4 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm">

                <img
                  src={
                    imageFile
                      ? URL.createObjectURL(imageFile)
                      : editingListing.image_url
                  }
                  alt="תמונה ראשית"
                  className="w-full h-48 object-cover"
                />

                <button
                  type="button"
                  onClick={() => {
                    setRemoveMainImage(true)
                    setImageFile(null)
                  }}
                  className="absolute top-3 left-3 w-9 h-9 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center font-bold shadow-md transition"
                  title="הסר תמונה ראשית"
                >
                  ×
                </button>

                {imageFile && (
                  <div className="absolute bottom-3 right-3 bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow">
                    תמונה חדשה
                  </div>
                )}

              </div>
            )}


            {removeMainImage && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-2xl p-3.5 text-sm text-red-700 flex items-center justify-between gap-3">

                <span className="font-medium">
                  🗑️ התמונה הראשית תוסר בשמירה
                </span>

                <button
                  type="button"
                  onClick={() => setRemoveMainImage(false)}
                  className="shrink-0 text-xs font-bold text-red-700 hover:text-red-900 underline"
                >
                  ביטול
                </button>

              </div>
            )}


            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">

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
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 file:cursor-pointer"
              />

              <p className="text-xs text-slate-400 mt-2">
                בחר תמונה חדשה אם ברצונך להחליף את התמונה הראשית.
              </p>

            </div>

          </div>


          {/* =================================================
              תמונות נוספות
          ================================================= */}

          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">

            <div className="flex items-center justify-between mb-4">

              <div className="flex items-center gap-2">

                <span className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-sm">
                  🖼️
                </span>

                <div>
                  <h3 className="text-sm font-extrabold text-slate-800">
                    תמונות נוספות
                  </h3>

                  <p className="text-xs text-slate-400 mt-0.5">
                    ניהול התמונות הנוספות של המודעה
                  </p>
                </div>

              </div>

              <span className="inline-flex items-center justify-center min-w-[40px] px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-extrabold text-slate-600">
                {existingAdditionalImages.length}/4
              </span>

            </div>


            {/* תמונות קיימות */}
            {existingAdditionalImages.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mb-4">

                {existingAdditionalImages.map(
                  (imageUrl, index) => (
                    <div
                      key={`${imageUrl}-${index}`}
                      className="relative rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm"
                    >

                      <img
                        src={imageUrl}
                        alt={`תמונה נוספת ${index + 1}`}
                        className="w-full h-32 object-cover"
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
                        className="absolute top-2 left-2 w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center font-bold shadow-md transition"
                        title="מחק תמונה"
                      >
                        ×
                      </button>

                    </div>
                  )
                )}

              </div>
            )}


            {/* תמונות חדשות */}
            {additionalImageFiles.length > 0 && (
              <div className="mb-4">

                <div className="text-xs font-bold text-emerald-700 mb-2">
                  תמונות חדשות שנבחרו
                </div>

                <div className="grid grid-cols-2 gap-3">

                  {additionalImageFiles.map(
                    (file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="relative rounded-2xl overflow-hidden border border-emerald-200 bg-emerald-50 shadow-sm"
                      >

                        <img
                          src={URL.createObjectURL(file)}
                          alt={`תמונה חדשה ${index + 1}`}
                          className="w-full h-32 object-cover"
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
                          className="absolute top-2 left-2 w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center font-bold shadow-md transition"
                          title="הסר תמונה"
                        >
                          ×
                        </button>

                        <div className="absolute bottom-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow">
                          חדשה
                        </div>

                      </div>
                    )
                  )}

                </div>

              </div>
            )}


            {/* הוספת תמונות */}
            {existingAdditionalImages.length +
              additionalImageFiles.length < 4 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4">

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
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 file:cursor-pointer"
                />

                <p className="text-xs text-slate-400 mt-2">
                  ניתן להוסיף עד 4 תמונות נוספות בסך הכול.
                </p>

              </div>
            )}


            {existingAdditionalImages.length +
              additionalImageFiles.length >= 4 && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-3.5 py-2.5">

                <p className="text-xs text-emerald-700 font-semibold">
                  ✓ הגעת למקסימום של 4 תמונות נוספות.
                </p>

              </div>
            )}

          </div>


          {/* =================================================
              תיאור
          ================================================= */}

          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">

            <div className="flex items-center gap-2 mb-4">

              <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center text-sm">
                ✍️
              </span>

              <div>
                <h3 className="text-sm font-extrabold text-slate-800">
                  תיאור המודעה
                </h3>

                <p className="text-xs text-slate-400 mt-0.5">
                  עדכנו את הפרטים והמידע למשתמשים
                </p>
              </div>

            </div>


            <textarea
              name="description"
              rows="5"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3.5 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 text-sm leading-6 text-slate-800 placeholder:text-slate-400 resize-none transition"
            />

          </div>


          {/* =================================================
              פרטי קשר
          ================================================= */}

          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">

            <div className="flex items-center gap-2 mb-4">

              <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center text-sm">
                👤
              </span>

              <div>
                <h3 className="text-sm font-extrabold text-slate-800">
                  פרטי קשר
                </h3>

                <p className="text-xs text-slate-400 mt-0.5">
                  עדכנו את פרטי הקשר של המודעה
                </p>
              </div>

            </div>


            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* שם */}
              <div>

                <label className="block text-sm font-bold text-slate-700 mb-2">
                  שם איש קשר
                </label>

                <input
                  type="text"
                  name="contact_name"
                  value={formData.contact_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 border border-slate-200 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 text-sm text-slate-800 transition"
                />

              </div>


              {/* טלפון */}
              <div>

                <label className="block text-sm font-bold text-slate-700 mb-2">
                  מספר טלפון
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 border border-slate-200 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 text-sm text-slate-800 transition"
                />

              </div>

            </div>

          </div>


          {/* =================================================
              כפתורי פעולה
          ================================================= */}

          <div className="sticky bottom-0 -mx-5 sm:-mx-6 px-5 sm:px-6 py-4 bg-white/95 backdrop-blur-md border-t border-slate-100 flex gap-3">

            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="flex-1 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition"
            >
              ביטול
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-[1.5] py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-extrabold text-sm shadow-sm hover:shadow-md transition-all"
            >
              {isSubmitting
                ? 'מעדכן...'
                : '✓ שמור שינויים'}
            </button>

          </div>

        </form>

      </div>

    </div>
  </div>
)}




{isHowItWorksOpen && (
  <div
    className="fixed inset-0 z-[100] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
    onClick={() => setIsHowItWorksOpen(false)}
  >
    <div
      className="w-full max-w-2xl max-h-[92vh] overflow-hidden bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col"
      onClick={(e) => e.stopPropagation()}
      dir="rtl"
    >

      {/* פס עליון */}
      <div className="h-1.5 shrink-0 bg-gradient-to-l from-emerald-500 via-cyan-500 to-emerald-600" />

      {/* כותרת */}
      <div className="flex items-start justify-between gap-4 px-5 sm:px-6 py-5 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 shrink-0 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl">
            💰
          </div>

          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              איך כסף כיס עובד?
            </h2>

            <p className="text-sm text-slate-500 mt-1 leading-5">
              מחברים בין אנשים שמציעים עבודה ושירותים לבין מי שצריך אותם.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsHowItWorksOpen(false)}
          className="w-10 h-10 shrink-0 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xl transition flex items-center justify-center"
          aria-label="סגור"
        >
          ×
        </button>
      </div>

      {/* תוכן */}
      <div className="overflow-y-auto flex-1">
        <div className="p-5 sm:p-6 space-y-5">

          {/* מציע */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-white border border-emerald-100 flex items-center justify-center text-xl">
                🟢
              </div>

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
              <div className="w-10 h-10 shrink-0 rounded-xl bg-white border border-blue-100 flex items-center justify-center text-xl">
                🔵
              </div>

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

          {/* ברטר */}
          <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-white border border-amber-100 flex items-center justify-center text-xl shadow-sm">
                🔄
              </div>

              <div className="min-w-0">
                <h3 className="text-lg font-extrabold text-slate-900">
                  ברטר — אפשר גם להחליף שירות בשירות
                </h3>

                <p className="text-sm text-slate-700 mt-2 leading-6">
                  לא חייבים לשלם בכסף. אפשר לבחור במודעה אפשרות של
                  <strong className="text-slate-900"> ברטר </strong>
                  ולהציע תמורה אחרת במקום תשלום.
                </p>

                <div className="mt-4 rounded-2xl bg-white/80 border border-amber-100 p-4">
                  <div className="text-sm font-extrabold text-slate-800 mb-2">
                    איך זה עובד?
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-start gap-2.5">
                      <span className="w-6 h-6 shrink-0 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">
                        1
                      </span>
                      <p className="text-sm text-slate-700 leading-5">
                        מפרסם מודעה ובוחר שסוג התמורה הוא <strong>ברטר</strong>.
                      </p>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="w-6 h-6 shrink-0 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">
                        2
                      </span>
                      <p className="text-sm text-slate-700 leading-5">
                        מציינים איזו תמורה או שירות אפשר להציע בתמורה.
                      </p>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="w-6 h-6 shrink-0 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">
                        3
                      </span>
                      <p className="text-sm text-slate-700 leading-5">
                        משתמש אחר יכול לבחור במודעה וליצור קשר כדי לבדוק אם ההחלפה מתאימה לשני הצדדים.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 rounded-xl bg-amber-100/70 px-3.5 py-3">
                  <p className="text-xs text-amber-900 leading-5">
                    💡 <strong>דוגמה:</strong> אתה עוזר למישהו להרכיב רהיט,
                    ובתמורה הוא מציע לך תיקון קטן בבית או שירות אחר.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* בחירת ברטר קיים */}
          <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-white border border-cyan-100 flex items-center justify-center text-xl shadow-sm">
                🤝
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  בחירת ברטר קיים
                </h3>

                <p className="text-sm text-slate-700 mt-2 leading-6">
                  אם קיימות מודעות שמציעות ברטר, אפשר לחפש אותן בלוח
                  ולבדוק מה מציעים בתמורה. מצאת הצעה שמתאימה לך?
                  פתח את המודעה ושלח למפרסם הודעה כדי לבדוק את פרטי ההחלפה.
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-cyan-100 text-xs font-bold text-cyan-800">
                    🔍 חיפוש
                  </span>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-cyan-100 text-xs font-bold text-cyan-800">
                    🔄 ברטר
                  </span>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-cyan-100 text-xs font-bold text-cyan-800">
                    💬 פנייה למפרסם
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* פרסום */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl">
                📢
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  איך מפרסמים מודעה?
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  כמה צעדים פשוטים ואתם בלוח
                </p>
              </div>
            </div>

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
              <div className="w-10 h-10 rounded-xl bg-white border border-red-100 flex items-center justify-center text-xl mb-3">
                ❤️
              </div>

              <h3 className="font-extrabold text-slate-900">
                שמירת מודעות
              </h3>

              <p className="text-sm text-slate-600 mt-1 leading-6">
                מצאת מודעה שמעניינת אותך?
                לחץ על הלב והיא תישמר תחת "שאהבתי".
              </p>
            </div>

            <div className="rounded-2xl border border-purple-100 bg-purple-50 p-5">
              <div className="w-10 h-10 rounded-xl bg-white border border-purple-100 flex items-center justify-center text-xl mb-3">
                💬
              </div>

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
          <div className="rounded-2xl bg-slate-900 text-white p-5 text-center shadow-sm">
            <div className="text-lg font-extrabold">
              פשוט מפרסמים, מחפשים ומתחברים.
            </div>

            <p className="text-sm text-slate-300 mt-1">
              כסף כיס — לוח עבודות, שירותים ופריטים מקומיים.
            </p>
          </div>

        </div>
      </div>

      {/* תחתית */}
      <div className="px-5 sm:px-6 py-4 border-t border-slate-100 bg-white shrink-0 flex justify-end">
        <button
          type="button"
          onClick={() => setIsHowItWorksOpen(false)}
          className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold shadow-sm transition"
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

<footer className="mt-12 bg-slate-950 text-white">
  <div className="max-w-5xl mx-auto px-4 py-10 sm:py-12">

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 items-start">

      {/* לוגו ותיאור */}
      <div className="text-center md:text-right">
        <div className="flex items-center justify-center md:justify-start gap-2.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center text-2xl">
            💰
          </div>

          <span className="text-xl font-extrabold text-white">
            כסף כיס
          </span>
        </div>

        <p className="text-sm text-slate-300 mt-3 leading-6">
          לוח עבודות, שירותים ופריטים מקומיים
        </p>

        <p className="text-xs text-slate-500 mt-1">
          מפרסמים, מחפשים ומתחברים.
        </p>
      </div>


      {/* שיתוף האתר */}
      <div className="text-center">
        <h3 className="text-sm font-extrabold text-white mb-2">
          📣 שתפו את כסף כיס
        </h3>

        <p className="text-xs text-slate-400 leading-5 mb-4">
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
                'כסף כיס – לוח עבודות, שירותים ופריטים מקומיים. מצאו עבודה, שירות או פריט בסביבה שלכם, או פרסמו בעצמכם:'
              const url = window.location.origin

              window.open(
                `https://wa.me/?text=${encodeURIComponent(
                  `${text} ${url}`
                )}`,
                '_blank',
                'noopener,noreferrer'
              )
            }}
            className="w-10 h-10 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-400/20 flex items-center justify-center text-lg transition hover:-translate-y-0.5"
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
            className="w-10 h-10 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-400/20 flex items-center justify-center text-lg font-bold transition hover:-translate-y-0.5"
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
              const text = 'כסף כיס – לוח עבודות, שירותים ופריטים מקומיים'

              window.open(
                `https://t.me/share/url?url=${encodeURIComponent(
                  url
                )}&text=${encodeURIComponent(text)}`,
                '_blank',
                'noopener,noreferrer'
              )
            }}
            className="w-10 h-10 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-400/20 flex items-center justify-center text-lg transition hover:-translate-y-0.5"
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
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 flex items-center justify-center text-lg transition hover:-translate-y-0.5"
            aria-label="העתק קישור לאתר"
            title="העתק קישור"
          >
            🔗
          </button>

        </div>
      </div>


      {/* ניווט */}
      <div className="text-center md:text-right">
        <h3 className="text-sm font-extrabold text-white mb-3">
          קישורים
        </h3>

        <nav className="flex flex-col gap-2.5 text-sm">
          <Link
            to="/"
            className="text-slate-400 hover:text-emerald-400 transition"
          >
            לוח המודעות
          </Link>

          <Link
            to="/contact"
            className="text-slate-400 hover:text-emerald-400 transition"
          >
            צור קשר
          </Link>

          <Link
            to="/terms"
            className="text-slate-400 hover:text-emerald-400 transition"
          >
            תנאי שימוש
          </Link>

          <Link
            to="/privacy"
            className="text-slate-400 hover:text-emerald-400 transition"
          >
            מדיניות פרטיות
          </Link>
        </nav>
      </div>

    </div>


    {/* תחתית */}
    <div className="border-t border-white/10 mt-9 pt-5 text-center">
      <p className="text-xs text-slate-500">
        © {new Date().getFullYear()} כסף כיס. כל הזכויות שמורות.
      </p>
    </div>

  </div>
</footer>


{/* =========================================================
    ANALYTICS CONSENT
========================================================= */}

{analyticsConsent === '' && (
  <div className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4">

    <div className="max-w-5xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">

      {/* פס עליון */}
      <div className="h-1 bg-gradient-to-l from-emerald-500 via-cyan-500 to-emerald-600" />

      <div className="p-4 md:p-5">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          {/* טקסט */}
          <div className="text-right">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm">
                🔒
              </span>

              <h3 className="font-extrabold text-slate-900">
                פרטיות ושימוש בנתוני גלישה
              </h3>
            </div>

            <p className="text-sm text-slate-600 leading-6">
              אנו משתמשים ב-Google Analytics כדי להבין כיצד משתמשים באתר
              ולשפר אותו. ניתן לאשר או לדחות שימוש זה.
              השימוש באתר עצמו אינו תלוי בהסכמה.
            </p>
          </div>


          {/* כפתורים */}
          <div className="flex flex-col sm:flex-row gap-2 shrink-0">

            <button
              onClick={() => {
                localStorage.setItem(
                  'kesefkis-analytics-consent',
                  'accepted'
                )
                setAnalyticsConsent('accepted')
              }}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition"
            >
              אישור ניתוח נתונים
            </button>

            <button
              onClick={() => {
                localStorage.setItem(
                  'kesefkis-analytics-consent',
                  'rejected'
                )
                setAnalyticsConsent('rejected')
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition"
            >
              דחייה
            </button>

            <Link
              to="/privacy"
              className="px-5 py-2.5 rounded-xl text-center text-emerald-700 font-bold text-sm hover:bg-emerald-50 transition"
            >
              מדיניות פרטיות
            </Link>

          </div>

        </div>

      </div>
    </div>
  </div>
)}


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
                כסף כיס – לוח עבודות, שירותים ופריטים מקומיים
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
                כסף כיס – לוח עבודות, שירותים ופריטים מקומיים
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

