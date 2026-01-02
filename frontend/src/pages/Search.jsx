import React, { useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import api from '../services/api'
import { t } from '../utils/translations'
import '../App.css'

function Search() {
  const { language, toggleLanguage } = useLanguage()
  const [seatNumber, setSeatNumber] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!seatNumber.trim()) {
      setError(language === 'ar' ? 'الرجاء إدخال كود الطالب' : 'Please enter Student ID')
      return
    }

    setLoading(true)
    setError('')
    setResults(null)

    try {
      const response = await api.post('/materials/search', {
        seat_number: seatNumber.trim(),
      })

      if (response.data.success) {
        setResults(response.data)
      } else {
        setError(response.data.message || 'Search failed')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred')
      setResults(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <div className="container">
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{
              color: '#007bff',
              fontSize: '36px',
              fontWeight: '700',
              margin: 0
            }}>
              {language === 'ar' ? 'بحث توزيع المواد' : 'Material Distribution Search'}
            </h1>
            <button
              onClick={toggleLanguage}
              className="btn btn-primary"
            >
              {language === 'ar' ? 'English' : 'العربية'}
            </button>
          </div>
          <a
            href="/dashboard"
            style={{
              color: '#007bff',
              textDecoration: 'none',
              marginLeft: '20px',
            }}
          >
            {language === 'ar' ? 'لوحة التحكم' : 'Admin Dashboard'}
          </a>
        </div>

        <div className="card">
          <form onSubmit={handleSearch}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <input
                type="text"
                className="input"
                placeholder={language === 'ar' ? 'أدخل كود الطالب' : 'Enter Student ID'}
                value={seatNumber}
                onChange={(e) => setSeatNumber(e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading 
                  ? (language === 'ar' ? 'جاري البحث...' : 'Searching...')
                  : t('Search', language)}
              </button>
            </div>
          </form>

          {error && <div className="error">{error}</div>}

          {results && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{
                  color: results.exists ? '#28a745' : '#dc3545',
                  fontSize: '24px',
                  fontWeight: '600'
                }}>
                  {results.exists
                    ? `${t('Found', language)} ${results.total_count} ${t('material(s) for Seat Number', language)}: ${seatNumber}`
                    : `${t('No materials found for Seat Number', language)}: ${seatNumber}`}
                </h2>
              </div>

              {results.exists && results.materials.length > 0 && (
                <div>
                  {results.materials.map((material) => (
                    <div key={material.id} className="material-card">
                      <h3>{material.material_name}</h3>
                      <p>
                        <span className="label">{t('Subject', language)}:</span> {material.subject_name}
                      </p>
                      <p>
                        <span className="label">{t('Hall', language)}:</span> {material.hall}
                      </p>
                      <p>
                        <span className="label">{t('Seat', language)}:</span> {language === 'ar' ? `كرسي ${material.seat}` : material.seat}
                      </p>
                      {material.stage && (
                        <p>
                          <span className="label">{t('Stage', language)}:</span> {material.stage}
                        </p>
                      )}
                      <p>
                        <span className="label">{t('Received Status', language)}:</span>{' '}
                        {material.received ? (
                          <span style={{ color: 'green', fontWeight: 'bold' }}>✓ {t('Received', language)}</span>
                        ) : (
                          <span style={{ color: '#dc3545' }}>{t('Not Received', language)}</span>
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Copyright Footer */}
      <div style={{
        marginTop: '40px',
        padding: '20px',
        textAlign: 'center',
        color: '#6c757d',
        fontSize: '14px',
        borderTop: '1px solid #dee2e6'
      }}>
        <p style={{ margin: '5px 0' }}>
          {language === 'ar' ? 'جميع الحقوق محفوظة' : 'All rights reserved'} © {new Date().getFullYear()}
        </p>
        <p style={{ margin: '5px 0', fontWeight: 'bold' }}>
          {language === 'ar' ? 'تم التطوير بواسطة' : 'Developed by'} <span style={{ color: '#007bff' }}>Omar Fahem</span>
        </p>
        <p style={{ margin: '5px 0' }}>
          {language === 'ar' ? 'شركة' : 'Company'}: <span style={{ color: '#007bff', fontWeight: 'bold' }}>Weza Production</span>
        </p>
      </div>
    </div>
  )
}

export default Search

