import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { SiteLayout } from './components/SiteLayout'
import { AuthProvider } from './hooks/useAuth'
import { SoundtrackPlayerProvider } from './hooks/SoundtrackPlayerProvider'
import { AboutPage } from './pages/AboutPage'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { ScrapbookPage } from './pages/ScrapbookPage'

function App() {
  return (
    <AuthProvider>
      <SoundtrackPlayerProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route element={<SiteLayout />}>
              <Route path="/home" element={<ScrapbookPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/login" element={<LoginPage />} />
            </Route>
            <Route path="/admin" element={<Navigate to="/home" replace />} />
          </Routes>
        </BrowserRouter>
      </SoundtrackPlayerProvider>
    </AuthProvider>
  )
}

export default App
