const fs = require('fs')
const path = require('path')

const API_BASE =
  'https://data.gov.il/api/3/action/datastore_search'

const RESOURCE_ID =
  '8f714b6f-c35c-4b40-a0e7-547b675eee0e'

const PAGE_SIZE = 500

async function fetchPage(offset) {
  const url =
    `${API_BASE}?resource_id=${RESOURCE_ID}` +
    `&limit=${PAGE_SIZE}&offset=${offset}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(
      `שגיאה בקבלת הנתונים: ${response.status} ${response.statusText}`
    )
  }

  return response.json()
}

async function main() {
  console.log('מתחיל להוריד את רשימת היישובים הרשמית...')

  const allRecords = []
  let offset = 0

  while (true) {
    console.log(`מוריד רשומות ${offset + 1} עד ${offset + PAGE_SIZE}...`)

    const data = await fetchPage(offset)
    const records = data?.result?.records || []

    allRecords.push(...records)

    if (records.length < PAGE_SIZE) {
      break
    }

    offset += PAGE_SIZE
  }

  console.log(`נמצאו בסך הכול ${allRecords.length} רשומות.`)

  const locations = allRecords
    .map((item) => item.city_name_he)
    .filter(Boolean)
    .map((name) => name.trim())
    .filter((name) => name.length > 0)

    // רשומות שאינן יישובים רגילים
    .filter((name) => !name.includes('(שבט)'))
    .filter((name) => !name.includes('(כפר נוער)'))
    .filter((name) => !name.includes('(מוסד)'))
    .filter((name) => !name.includes('(מוסד חינוכי)'))
    .filter((name) => !name.includes('(בית ספר)'))
    .filter((name) => !name.includes('(ישיבה)'))
    .filter((name) => !name.includes('(כפר)'))
    .filter((name) => !name.includes('(מחנה)'))
    .filter((name) => !name.includes('(בסיס)'))
    .filter((name) => !name.includes('(מתקן)'))
    .filter((name) => !name.includes('(אתר)'))
    .filter((name) => !name.includes('(מרכז)'))
    .filter((name) => !name.includes('(מוסד סגור)'))
    .filter((name) => !name.includes('(בית חולים)'))
    .filter((name) => !name.includes('(בית עלמין)'))
    .filter((name) => !name.includes('(תחנה)'))
    .filter((name) => !name.includes('(חווה)'))
    .filter((name) => !name.includes('(מחוז)'))
    .filter((name) => !name.includes('(אזור)'))
    .filter((name) => !name.includes('(שכונה)'))
    .filter((name) => !name.includes('(רובע)'))
    .filter((name) => !name.includes('(חלקה)'))
    .filter((name) => !name.includes('(שטח)'))
    .filter((name) => !name.includes('(אזור תעשיה)'))
    .filter((name) => !name.includes('(אזור תעשייה)'))
    .filter((name) => !name.includes('(קמפוס)'))
    .filter((name) => !name.includes('(תחום)'))
    .filter((name) => !name.includes('(מתחם)'))
    .filter((name) => !name.includes('(אתר ארכיאולוגי)'))
    .filter((name) => !name.includes('(אתר היסטורי)'))
    .filter((name) => !name.includes('(שמורה)'))
    .filter((name) => !name.includes('(גן לאומי)'))
    .filter((name) => !name.includes('(פארק)'))
    .filter((name) => !name.includes('(נמל)'))
    .filter((name) => !name.includes('(שדה תעופה)'))
    .filter((name) => !name.includes('(תחנת רכבת)'))

  const uniqueLocations = [...new Set(locations)].sort((a, b) =>
    a.localeCompare(b, 'he')
  )

  const output = `export const israeliLocations = ${JSON.stringify(
    uniqueLocations,
    null,
    2
  )}\n`

  const outputPath = path.join(
    __dirname,
    'src',
    'data',
    'israeliLocations.js'
  )

  fs.writeFileSync(outputPath, output, 'utf8')

  console.log('')
  console.log('✅ הרשימה נוצרה בהצלחה!')
  console.log(`📍 מספר יישובים לאחר סינון: ${uniqueLocations.length}`)
  console.log(`📄 קובץ: ${outputPath}`)
}

main().catch((error) => {
  console.error('')
  console.error('❌ אירעה שגיאה:')
  console.error(error.message)
  process.exit(1)
})