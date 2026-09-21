import React from 'react'
import ReactDOM from 'react-dom/client'

function App() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>💰 כסף כיס</h1>
      <p>ברוכים הבאים ללוח העבודות והשירותים המקומי!</p>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)