import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { t } from '../utils/translations'
import '../App.css'

function Login() {
  const { language, toggleLanguage } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(email, password)
    setLoading(false)

    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.message || 'Login failed')
    }
  }

  return (
    <div className="app">
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <div className="card" style={{ width: '450px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
            <button
              onClick={toggleLanguage}
              className="btn"
              style={{ backgroundColor: '#6c757d', color: 'white', padding: '8px 16px', fontSize: '12px' }}
            >
              {language === 'ar' ? 'English' : 'العربية'}
            </button>
          </div>
          <h2 style={{ 
            marginBottom: '30px', 
            textAlign: 'center',
            color: '#007bff',
            fontSize: '32px',
            fontWeight: '700'
          }}>
            {language === 'ar' ? 'تسجيل الدخول' : 'Admin Login'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                {t('Email', language)}
              </label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={language === 'ar' ? 'أدخل البريد الإلكتروني' : 'Enter your email'}
                required
              />
            </div>
            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                {t('Password', language)}
              </label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={language === 'ar' ? 'أدخل كلمة المرور' : 'Enter your password'}
                required
              />
            </div>
            {error && <div className="error">{error}</div>}
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '16px' }}
              disabled={loading}
            >
              {loading 
                ? (language === 'ar' ? 'جاري تسجيل الدخول...' : 'Logging in...')
                : t('Login', language)}
            </button>
          </form>
          <div style={{ marginTop: '25px', textAlign: 'center' }}>
            <a 
              href="/search" 
              style={{ 
                color: '#667eea', 
                textDecoration: 'none',
                fontWeight: '600',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => e.target.style.color = '#764ba2'}
              onMouseLeave={(e) => e.target.style.color = '#667eea'}
            >
              {language === 'ar' ? '→ الانتقال إلى البحث' : '→ Go to Search'}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login

