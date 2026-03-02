
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { UserProvider } from './context/UserContext'
import { PomodoroProvider } from './context/PomodoroContext'
import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <UserProvider>
      <PomodoroProvider>
        <App />
        <Toaster position="top-center" />
      </PomodoroProvider>
    </UserProvider>
  </React.StrictMode>,
)
