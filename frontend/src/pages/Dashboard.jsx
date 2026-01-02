import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import api from '../services/api'
import { t } from '../utils/translations'
import '../App.css'

function Dashboard() {
  const { user, logout } = useAuth()
  const { language, toggleLanguage } = useLanguage()
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')
  const [stageFilter, setStageFilter] = useState('')
  const [receivedFilter, setReceivedFilter] = useState('')
  const [statistics, setStatistics] = useState(null)
  const [statisticsDateFrom, setStatisticsDateFrom] = useState('')
  const [statisticsDateTo, setStatisticsDateTo] = useState('')
  const [showBulkEdit, setShowBulkEdit] = useState(false)
  const [selectedMaterials, setSelectedMaterials] = useState([])
  const [bulkEditField, setBulkEditField] = useState('material_name')
  const [bulkEditValue, setBulkEditValue] = useState('')
  const [bulkEditPerPage, setBulkEditPerPage] = useState(200)
  const [bulkEditFilters, setBulkEditFilters] = useState({
    subject: '',
    stage: '',
    received: '',
  })
  const [showUpload, setShowUpload] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showUsers, setShowUsers] = useState(false)
  const [showDeleteAll, setShowDeleteAll] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [editingMaterial, setEditingMaterial] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({ subjects: [], stages: [] })
  const [users, setUsers] = useState([])
  const [showUserForm, setShowUserForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    password: '',
    is_admin: false,
    is_assistant: false,
  })

  // Form states
  const [formData, setFormData] = useState({
    seat_number: '',
    subject_name: '',
    material_name: '',
    hall: '',
    seat: '',
    stage: '',
  })

  useEffect(() => {
    fetchMaterials()
    fetchFilters()
    fetchStatistics()
  }, [currentPage, searchTerm, subjectFilter, stageFilter, receivedFilter, showBulkEdit, bulkEditPerPage])

  useEffect(() => {
    console.log('User object:', user)
    console.log('Is admin:', user?.is_admin)
  }, [user])

  useEffect(() => {
    fetchStatistics()
  }, [materials, statisticsDateFrom, statisticsDateTo])

  useEffect(() => {
    if (showUsers) {
      fetchUsers()
    }
  }, [showUsers])

  const fetchFilters = async () => {
    try {
      const response = await api.get('/materials/filters/list')
      if (response.data.success) {
        setFilters(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching filters:', error)
    }
  }

  const fetchMaterials = async (customPerPage = null, customFilters = null) => {
    setLoading(true)
    try {
      const perPage = customPerPage || (showBulkEdit ? bulkEditPerPage : 15)
      const filters = customFilters || {
        search: searchTerm || undefined,
        subject: subjectFilter || undefined,
        stage: stageFilter !== '' && stageFilter !== 'null' ? stageFilter : (stageFilter === 'null' ? '__null__' : undefined),
        received: receivedFilter !== '' ? receivedFilter : undefined,
      }

      const response = await api.get('/materials', {
        params: {
          per_page: perPage,
          page: currentPage,
          ...filters,
        },
      })
      if (response.data.success) {
        setMaterials(response.data.data.data)
        setTotalPages(response.data.data.last_page)
      }
    } catch (error) {
      console.error('Error fetching materials:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStatistics = async () => {
    try {
      const params = new URLSearchParams()
      if (statisticsDateFrom) params.append('date_from', statisticsDateFrom)
      if (statisticsDateTo) params.append('date_to', statisticsDateTo)

      const response = await api.get(`/materials/statistics?${params.toString()}`)
      if (response.data.success) {
        setStatistics(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching statistics:', error)
    }
  }

  const handleExportMaterials = async () => {
    try {
      const params = new URLSearchParams()
      if (subjectFilter) params.append('subject', subjectFilter)
      if (stageFilter) params.append('stage', stageFilter)
      if (receivedFilter) params.append('received', receivedFilter)
      if (statisticsDateFrom) params.append('date_from', statisticsDateFrom)
      if (statisticsDateTo) params.append('date_to', statisticsDateTo)

      const response = await api.get(`/materials/export?${params.toString()}`, {
        responseType: 'blob',
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `materials_export_${new Date().toISOString().split('T')[0]}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      alert('Error exporting materials: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleExportStatistics = async () => {
    try {
      const response = await api.get('/materials/export-statistics', {
        responseType: 'blob',
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `statistics_export_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      alert('Error exporting statistics: ' + (error.response?.data?.message || error.message))
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users')
      if (response.data.success) {
        setUsers(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    const formData = new FormData()
    const fileInput = document.getElementById('excel-file')
    const stageInput = document.getElementById('stage-input')
    const replaceModeInput = document.getElementById('replace-mode')

    if (!fileInput.files[0]) {
      alert('Please select a file')
      return
    }

    formData.append('file', fileInput.files[0])
    formData.append('stage', stageInput.value || '')
    formData.append('replace_mode', replaceModeInput.checked ? '1' : '0')

    setLoading(true)
    try {
      const response = await api.post('/excel/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data.success) {
        alert(
          `Upload successful! Processed: ${response.data.data.processed}, Skipped: ${response.data.data.skipped}`
        )
        setShowUpload(false)
        fetchMaterials()
        fetchFilters()
      } else {
        alert('Upload failed: ' + response.data.message)
      }
    } catch (error) {
      alert('Upload error: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await api.post('/materials', formData)
      if (response.data.success) {
        alert('Material added successfully')
        setShowAddForm(false)
        resetForm()
        fetchMaterials()
        fetchFilters()
      } else {
        alert('Error: ' + response.data.message)
      }
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async (e) => {
    e.preventDefault()

    if (!confirm(language === 'ar'
      ? 'هل أنت متأكد من تحديث هذه المادة؟'
      : 'Are you sure you want to update this material?')) {
      return
    }

    setLoading(true)
    try {
      const response = await api.put(`/materials/${editingMaterial.id}`, formData)
      if (response.data.success) {
        alert(language === 'ar' ? 'تم تحديث المادة بنجاح' : 'Material updated successfully')
        setEditingMaterial(null)
        resetForm()
        fetchMaterials()
        fetchFilters()
      } else {
        alert('Error: ' + response.data.message)
      }
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm(language === 'ar'
      ? 'هل أنت متأكد من حذف هذه المادة؟'
      : 'Are you sure you want to delete this material?')) {
      return
    }

    setLoading(true)
    try {
      const response = await api.delete(`/materials/${id}`)
      if (response.data.success) {
        alert(language === 'ar' ? 'تم حذف المادة بنجاح' : 'Material deleted successfully')
        fetchMaterials()
        fetchFilters()
        fetchStatistics()
      }
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handleBulkUpdate = async (e) => {
    e.preventDefault()
    if (selectedMaterials.length === 0) {
      alert(language === 'ar' ? 'الرجاء تحديد المواد المراد تعديلها' : 'Please select materials to update')
      return
    }
    if (!bulkEditValue.trim()) {
      alert(language === 'ar' ? 'الرجاء إدخال القيمة الجديدة' : 'Please enter the new value')
      return
    }

    if (!confirm(language === 'ar'
      ? `هل أنت متأكد من تحديث ${selectedMaterials.length} مادة؟`
      : `Are you sure you want to update ${selectedMaterials.length} materials?`)) {
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/materials/bulk-update', {
        ids: selectedMaterials,
        field: bulkEditField,
        value: bulkEditValue.trim(),
      })
      if (response.data.success) {
        alert(language === 'ar'
          ? `تم تحديث ${response.data.data.updated_count} مادة بنجاح`
          : `Updated ${response.data.data.updated_count} materials successfully`)
        setSelectedMaterials([])
        setBulkEditValue('')
        fetchMaterials()
        fetchFilters()
        fetchStatistics()
      }
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedMaterials.length === 0) {
      alert(language === 'ar' ? 'الرجاء تحديد المواد المراد حذفها' : 'Please select materials to delete')
      return
    }

    if (!confirm(language === 'ar'
      ? `هل أنت متأكد من حذف ${selectedMaterials.length} مادة؟`
      : `Are you sure you want to delete ${selectedMaterials.length} materials?`)) {
      return
    }

    setLoading(true)
    try {
      // Delete materials one by one (or we can create a bulk delete endpoint)
      const deletePromises = selectedMaterials.map(id => api.delete(`/materials/${id}`))
      await Promise.all(deletePromises)

      alert(language === 'ar'
        ? `تم حذف ${selectedMaterials.length} مادة بنجاح`
        : `Deleted ${selectedMaterials.length} materials successfully`)
      setSelectedMaterials([])
      fetchMaterials()
      fetchFilters()
      fetchStatistics()
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const toggleMaterialSelection = (id) => {
    if (selectedMaterials.includes(id)) {
      setSelectedMaterials(selectedMaterials.filter(m => m !== id))
    } else {
      setSelectedMaterials([...selectedMaterials, id])
    }
  }

  const selectAllMaterials = () => {
    if (selectedMaterials.length === materials.length) {
      setSelectedMaterials([])
    } else {
      setSelectedMaterials(materials.map(m => m.id))
    }
  }

  const selectByFilter = async () => {
    // Fetch all materials matching the bulk edit filters
    setLoading(true)
    try {
      const response = await api.get('/materials', {
        params: {
          per_page: 10000, // Get all matching materials
          subject: bulkEditFilters.subject || undefined,
          stage: bulkEditFilters.stage !== '' && bulkEditFilters.stage !== 'null'
            ? bulkEditFilters.stage
            : (bulkEditFilters.stage === 'null' ? '__null__' : undefined),
          received: bulkEditFilters.received !== '' ? bulkEditFilters.received : undefined,
        },
      })
      if (response.data.success) {
        const allMatchingIds = response.data.data.data.map(m => m.id)
        setSelectedMaterials(allMatchingIds)
        alert(language === 'ar'
          ? `تم تحديد ${allMatchingIds.length} مادة`
          : `Selected ${allMatchingIds.length} materials`)
      }
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAll = async (e) => {
    e.preventDefault()
    if (deletePassword !== '123') {
      alert('Invalid password')
      return
    }

    if (!confirm('Are you sure you want to delete ALL materials? This cannot be undone!')) {
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/materials/delete-all', { password: deletePassword })
      if (response.data.success) {
        alert(`All materials deleted. Count: ${response.data.data.deleted_count}`)
        setShowDeleteAll(false)
        setDeletePassword('')
        fetchMaterials()
        fetchFilters()
      } else {
        alert('Error: ' + response.data.message)
      }
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handleMarkReceived = async (id) => {
    if (!confirm(language === 'ar'
      ? 'هل أنت متأكد من تحديد هذه المادة كمستلمة؟'
      : 'Are you sure you want to mark this material as received?')) {
      return
    }

    try {
      const response = await api.post(`/materials/${id}/received`)
      if (response.data.success) {
        fetchMaterials()
        fetchStatistics() // Update statistics after marking received
      }
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleCancelReceived = async (id) => {
    if (!confirm(language === 'ar'
      ? 'هل أنت متأكد من إلغاء حالة الاستلام لهذه المادة؟'
      : 'Are you sure you want to cancel the received status for this material?')) {
      return
    }

    try {
      const response = await api.post(`/materials/${id}/cancel-received`)
      if (response.data.success) {
        fetchMaterials()
        fetchStatistics() // Update statistics after canceling received
      }
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleUserAdd = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await api.post('/users', userFormData)
      if (response.data.success) {
        alert('User created successfully')
        setShowUserForm(false)
        resetUserForm()
        fetchUsers()
      } else {
        alert('Error: ' + response.data.message)
      }
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handleUserEdit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await api.put(`/users/${editingUser.id}`, userFormData)
      if (response.data.success) {
        alert('User updated successfully')
        setEditingUser(null)
        resetUserForm()
        fetchUsers()
      } else {
        alert('Error: ' + response.data.message)
      }
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handleUserDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return
    }

    setLoading(true)
    try {
      const response = await api.delete(`/users/${id}`)
      if (response.data.success) {
        alert('User deleted successfully')
        fetchUsers()
      }
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  // Helper function to close all panels
  const closeAllPanels = () => {
    setShowUpload(false)
    setShowAddForm(false)
    setShowUsers(false)
    setShowDeleteAll(false)
    setShowBulkEdit(false)
    setSelectedMaterials([])
    resetForm()
  }

  const startEdit = (material) => {
    setEditingMaterial(material)
    setFormData({
      seat_number: material.seat_number,
      subject_name: material.subject_name,
      material_name: material.material_name,
      hall: material.hall,
      seat: material.seat,
      stage: material.stage || '',
    })
    setShowAddForm(true)
  }

  const startEditUser = (user) => {
    setEditingUser(user)
    setUserFormData({
      name: user.name,
      email: user.email,
      password: '',
      is_admin: user.is_admin,
      is_assistant: user.is_assistant || false,
    })
    setShowUserForm(true)
  }

  const resetForm = () => {
    setFormData({
      seat_number: '',
      subject_name: '',
      material_name: '',
      hall: '',
      seat: '',
      stage: '',
    })
    setEditingMaterial(null)
  }

  const resetUserForm = () => {
    setUserFormData({
      name: '',
      email: '',
      password: '',
      is_admin: false,
      is_assistant: false,
    })
    setEditingUser(null)
  }

  return (
    <div className="app">
      <div className="container">
        <div
          className="dashboard-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '15px'
          }}
        >
          <h1 style={{
            color: '#007bff',
            fontSize: '36px',
            fontWeight: '700',
            margin: 0
          }}>
            {user?.is_admin
              ? (language === 'ar' ? 'لوحة التحكم' : 'Admin Dashboard')
              : (language === 'ar' ? 'لوحة المساعد' : 'Assistant Dashboard')}
          </h1>
          <div>
            <button
              onClick={toggleLanguage}
              className="btn btn-primary"
              style={{
                marginRight: '10px'
              }}
            >
              {language === 'ar' ? 'English' : 'العربية'}
            </button>
            <span style={{ marginRight: '15px' }}>
              {language === 'ar' ? `مرحباً، ${user?.name}` : `Welcome, ${user?.name}`}
            </span>
            <a href="/search" style={{ marginRight: '15px', color: '#007bff' }}>
              {t('Search', language)}
            </a>
            <button onClick={logout} className="btn btn-danger">
              {t('Logout', language)}
            </button>
          </div>
        </div>

        {/* Statistics Dashboard */}
        {statistics && (
          <div className="card" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
              <h2 style={{ margin: 0 }}>{language === 'ar' ? 'الإحصائيات' : 'Statistics'}</h2>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input
                  type="date"
                  className="input"
                  value={statisticsDateFrom}
                  onChange={(e) => setStatisticsDateFrom(e.target.value)}
                  placeholder={language === 'ar' ? 'من تاريخ' : 'From Date'}
                  style={{ width: '150px' }}
                />
                <input
                  type="date"
                  className="input"
                  value={statisticsDateTo}
                  onChange={(e) => setStatisticsDateTo(e.target.value)}
                  placeholder={language === 'ar' ? 'إلى تاريخ' : 'To Date'}
                  style={{ width: '150px' }}
                />
                {(statisticsDateFrom || statisticsDateTo) && (
                  <button
                    onClick={() => {
                      setStatisticsDateFrom('')
                      setStatisticsDateTo('')
                    }}
                    className="btn"
                    style={{ backgroundColor: '#6c757d', color: 'white' }}
                  >
                    {language === 'ar' ? 'إزالة الفلتر' : 'Clear Filter'}
                  </button>
                )}
              </div>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px'
            }}>
              <div className="card" style={{
                backgroundColor: '#007bff',
                color: 'white',
                textAlign: 'center',
                padding: '20px'
              }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>
                  {language === 'ar' ? 'إجمالي المذكرات' : 'Total Materials'}
                </h3>
                <div style={{ fontSize: '36px', fontWeight: 'bold' }}>
                  {statistics.total}
                </div>
              </div>
              <div className="card" style={{
                backgroundColor: '#28a745',
                color: 'white',
                textAlign: 'center',
                padding: '20px'
              }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>
                  {language === 'ar' ? 'تم الاستلام' : 'Received'}
                </h3>
                <div style={{ fontSize: '36px', fontWeight: 'bold' }}>
                  {statistics.received}
                </div>
                <div style={{ fontSize: '14px', marginTop: '5px', opacity: 0.9 }}>
                  {statistics.received_percentage}%
                </div>
              </div>
              <div className="card" style={{
                backgroundColor: '#dc3545',
                color: 'white',
                textAlign: 'center',
                padding: '20px'
              }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>
                  {language === 'ar' ? 'لم يتم الاستلام' : 'Not Received'}
                </h3>
                <div style={{ fontSize: '36px', fontWeight: 'bold' }}>
                  {statistics.not_received}
                </div>
                <div style={{ fontSize: '14px', marginTop: '5px', opacity: 0.9 }}>
                  {statistics.not_received_percentage}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Admin-only action buttons */}
        {user?.is_admin && (
          <div className="card" style={{ marginBottom: '20px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div className="action-buttons" style={{
              display: 'flex',
              gap: '10px',
              marginBottom: '20px',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => {
                  if (showUpload) {
                    closeAllPanels()
                  } else {
                    closeAllPanels()
                    setShowUpload(true)
                  }
                }}
                className="btn btn-primary"
                style={{
                  backgroundColor: showUpload ? '#0056b3' : '#007bff',
                  border: showUpload ? '2px solid #004085' : 'none'
                }}
              >
                {showUpload ? '✕ ' : '📤 '}{t('Upload', language) + ' Excel'}
              </button>
              <button
                onClick={() => {
                  if (showAddForm) {
                    closeAllPanels()
                  } else {
                    closeAllPanels()
                    setShowAddForm(true)
                  }
                }}
                className="btn btn-success"
                style={{
                  backgroundColor: showAddForm ? '#1e7e34' : '#28a745',
                  border: showAddForm ? '2px solid #155724' : 'none'
                }}
              >
                {showAddForm ? '✕ ' : '➕ '}{t('Add', language) + ' ' + (language === 'ar' ? 'مادة جديدة' : 'New Material')}
              </button>
              <button
                onClick={() => {
                  if (showUsers) {
                    closeAllPanels()
                  } else {
                    closeAllPanels()
                    setShowUsers(true)
                    fetchUsers()
                  }
                }}
                className="btn"
                style={{
                  backgroundColor: showUsers ? '#5a6268' : '#6c757d',
                  color: 'white',
                  border: showUsers ? '2px solid #383d41' : 'none'
                }}
              >
                {showUsers ? '✕ ' : '👥 '}{showUsers ? (language === 'ar' ? 'إغلاق' : 'Close') : t('Users', language)}
              </button>
              <button
                onClick={() => {
                  if (showDeleteAll) {
                    closeAllPanels()
                  } else {
                    closeAllPanels()
                    setShowDeleteAll(true)
                  }
                }}
                className="btn btn-danger"
                style={{
                  backgroundColor: showDeleteAll ? '#c82333' : '#dc3545',
                  border: showDeleteAll ? '2px solid #bd2130' : 'none'
                }}
              >
                {showDeleteAll ? '✕ ' : '🗑️ '}{t('Delete all materials', language)}
              </button>
              <button
                onClick={handleExportMaterials}
                className="btn"
                style={{ backgroundColor: '#17a2b8', color: 'white' }}
              >
                📥 {language === 'ar' ? 'تصدير المواد' : 'Export Materials'}
              </button>
              <button
                onClick={handleExportStatistics}
                className="btn"
                style={{ backgroundColor: '#6f42c1', color: 'white' }}
              >
                📊 {language === 'ar' ? 'تصدير الإحصائيات' : 'Export Statistics'}
              </button>
              <button
                onClick={() => {
                  if (showBulkEdit) {
                    closeAllPanels()
                  } else {
                    closeAllPanels()
                    setShowBulkEdit(true)
                  }
                }}
                className="btn"
                style={{
                  backgroundColor: showBulkEdit ? '#e0a800' : '#ffc107',
                  color: 'black',
                  border: showBulkEdit ? '2px solid #d39e00' : 'none'
                }}
              >
                {showBulkEdit ? '✕ ' : '✏️ '}{showBulkEdit ? (language === 'ar' ? 'إلغاء' : 'Cancel') : (language === 'ar' ? 'تعديل جماعي' : 'Bulk Edit')}
              </button>
            </div>
          </div>
        )}

        {showBulkEdit && user?.is_admin && (
          <div className="card" style={{
            marginTop: '20px',
            backgroundColor: '#fff3cd',
            border: '2px solid #ffc107',
            borderRadius: '10px',
            padding: '20px'
          }}>
            <h3 style={{ color: '#856404', marginBottom: '20px' }}>
              ✏️ {language === 'ar' ? 'التعديل الجماعي' : 'Bulk Edit'}
            </h3>

            {/* Selection Options */}
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #ddd' }}>
              <h4 style={{ marginBottom: '15px', color: '#856404' }}>
                {language === 'ar' ? 'خيارات التحديد' : 'Selection Options'}
              </h4>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
                <button
                  type="button"
                  onClick={selectAllMaterials}
                  className="btn"
                  style={{ backgroundColor: '#17a2b8', color: 'white' }}
                >
                  {selectedMaterials.length === materials.length
                    ? (language === 'ar' ? 'إلغاء تحديد الكل' : 'Deselect All')
                    : (language === 'ar' ? 'تحديد الكل في الصفحة' : 'Select All on Page')}
                </button>
                <button
                  type="button"
                  onClick={selectByFilter}
                  className="btn"
                  style={{ backgroundColor: '#6f42c1', color: 'white' }}
                  disabled={loading}
                >
                  {language === 'ar' ? 'تحديد بالفلتر' : 'Select by Filter'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMaterials([])}
                  className="btn"
                  style={{ backgroundColor: '#6c757d', color: 'white' }}
                >
                  {language === 'ar' ? 'إلغاء التحديد' : 'Clear Selection'}
                </button>
              </div>

              {/* Filters for selection */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px' }}>
                    {language === 'ar' ? 'المادة' : 'Subject'}
                  </label>
                  <select
                    className="input"
                    value={bulkEditFilters.subject}
                    onChange={(e) => setBulkEditFilters({ ...bulkEditFilters, subject: e.target.value })}
                    style={{ fontSize: '13px', padding: '6px' }}
                  >
                    <option value="">{language === 'ar' ? 'جميع المواد' : 'All Subjects'}</option>
                    {filters.subjects.map((subject) => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px' }}>
                    {language === 'ar' ? 'المرحلة' : 'Stage'}
                  </label>
                  <select
                    className="input"
                    value={bulkEditFilters.stage}
                    onChange={(e) => setBulkEditFilters({ ...bulkEditFilters, stage: e.target.value })}
                    style={{ fontSize: '13px', padding: '6px' }}
                  >
                    <option value="">{language === 'ar' ? 'جميع المراحل' : 'All Stages'}</option>
                    <option value="null">{language === 'ar' ? 'بدون مرحلة' : 'No Stage'}</option>
                    {filters.stages.map((stage) => (
                      <option key={stage} value={stage}>{stage}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px' }}>
                    {language === 'ar' ? 'حالة الاستلام' : 'Received Status'}
                  </label>
                  <select
                    className="input"
                    value={bulkEditFilters.received}
                    onChange={(e) => setBulkEditFilters({ ...bulkEditFilters, received: e.target.value })}
                    style={{ fontSize: '13px', padding: '6px' }}
                  >
                    <option value="">{language === 'ar' ? 'جميع الحالات' : 'All Status'}</option>
                    <option value="true">{t('Received', language)}</option>
                    <option value="false">{t('Not Received', language)}</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px' }}>
                    {language === 'ar' ? 'عدد العناصر في الصفحة' : 'Items per Page'}
                  </label>
                  <select
                    className="input"
                    value={bulkEditPerPage}
                    onChange={(e) => {
                      setBulkEditPerPage(Number(e.target.value))
                      setCurrentPage(1)
                    }}
                    style={{ fontSize: '13px', padding: '6px' }}
                  >
                    <option value="50">50</option>
                    <option value="100">100</option>
                    <option value="200">200</option>
                    <option value="500">500</option>
                    <option value="1000">1000</option>
                  </select>
                </div>
              </div>
              <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#e9ecef', borderRadius: '5px' }}>
                <strong style={{ color: '#856404' }}>
                  {language === 'ar'
                    ? `تم تحديد ${selectedMaterials.length} مادة`
                    : `${selectedMaterials.length} materials selected`}
                </strong>
              </div>
            </div>

            {/* Update Form */}
            <form onSubmit={handleBulkUpdate} style={{ marginBottom: '15px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px' }}>
                    {language === 'ar' ? 'الحقل المراد تعديله' : 'Field to Update'} *
                  </label>
                  <select
                    className="input"
                    value={bulkEditField}
                    onChange={(e) => setBulkEditField(e.target.value)}
                    required
                  >
                    <option value="material_name">{language === 'ar' ? 'اسم المادة' : 'Material Name'}</option>
                    <option value="subject_name">{language === 'ar' ? 'المادة' : 'Subject'}</option>
                    <option value="hall">{language === 'ar' ? 'القاعة' : 'Hall'}</option>
                    <option value="seat">{language === 'ar' ? 'المكان' : 'Seat'}</option>
                    <option value="stage">{language === 'ar' ? 'المرحلة' : 'Stage'}</option>
                    <option value="seat_number">{language === 'ar' ? 'كود الطالب' : 'Student ID'}</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px' }}>
                    {language === 'ar' ? 'القيمة الجديدة' : 'New Value'} *
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={bulkEditValue}
                    onChange={(e) => setBulkEditValue(e.target.value)}
                    placeholder={language === 'ar' ? 'أدخل القيمة الجديدة' : 'Enter new value'}
                    required
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button type="submit" className="btn btn-warning" disabled={loading || selectedMaterials.length === 0}>
                  {loading
                    ? (language === 'ar' ? 'جاري التحديث...' : 'Updating...')
                    : `✏️ ${language === 'ar' ? 'تحديث المحدد' : 'Update Selected'}`}
                </button>
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  className="btn btn-danger"
                  disabled={loading || selectedMaterials.length === 0}
                >
                  🗑️ {language === 'ar' ? 'حذف المحدد' : 'Delete Selected'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    closeAllPanels()
                  }}
                  className="btn"
                  style={{ marginLeft: 'auto' }}
                >
                  {t('Cancel', language)}
                </button>
              </div>
            </form>
          </div>
        )}

        {showDeleteAll && user?.is_admin && (
          <div className="card" style={{
            marginTop: '20px',
            backgroundColor: '#fff3cd',
            border: '2px solid #ffc107',
            borderRadius: '10px',
            padding: '20px'
          }}>
            <h3 style={{ color: '#856404', marginBottom: '15px' }}>⚠️ {language === 'ar' ? 'حذف جميع المواد' : 'Delete All Materials'}</h3>
            <form onSubmit={handleDeleteAll}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>
                  {t('Enter password', language)}: <strong>123</strong>
                </label>
                <input
                  type="password"
                  className="input"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder={language === 'ar' ? 'أدخل كلمة المرور' : 'Enter password'}
                  required
                />
              </div>
              <button type="submit" className="btn btn-danger" disabled={loading}>
                {loading ? (language === 'ar' ? 'جاري الحذف...' : 'Deleting...') : (language === 'ar' ? 'حذف الكل' : 'Delete All')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteAll(false)
                  setDeletePassword('')
                }}
                className="btn"
                style={{ marginLeft: '10px' }}
              >
                {t('Cancel', language)}
              </button>
            </form>
          </div>
        )}

        {showUpload && user?.is_admin && (
          <div className="card" style={{
            marginTop: '20px',
            border: '2px solid #007bff',
            borderRadius: '10px',
            padding: '20px',
            backgroundColor: '#f8f9fa'
          }}>
            <h3 style={{ marginBottom: '15px', color: '#007bff' }}>📤 {language === 'ar' ? 'رفع ملف Excel' : 'Upload Excel File'}</h3>
            <form onSubmit={handleUpload}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>
                  {language === 'ar' ? 'ملف Excel' : 'Excel File'}
                </label>
                <input
                  type="file"
                  id="excel-file"
                  accept=".xlsx,.xls,.csv"
                  required
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>
                  {t('Stage', language)} ({language === 'ar' ? 'اختياري' : 'Optional'})
                </label>
                <input
                  type="text"
                  id="stage-input"
                  className="input"
                  placeholder={language === 'ar' ? 'أدخل المرحلة أو اتركه فارغاً' : 'Enter stage or leave empty'}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label>
                  <input
                    type="checkbox"
                    id="replace-mode"
                    style={{ marginRight: '5px' }}
                  />
                  {language === 'ar' ? 'استبدال البيانات الموجودة لهذه المرحلة' : 'Replace existing data for this stage'}
                </label>
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (language === 'ar' ? 'جاري الرفع...' : 'Uploading...') : t('Upload', language)}
              </button>
            </form>
          </div>
        )}

        {showAddForm && user?.is_admin && (
          <div className="card" style={{
            marginTop: '20px',
            border: '2px solid #28a745',
            borderRadius: '10px',
            padding: '20px',
            backgroundColor: '#f8f9fa'
          }}>
            <h3>{editingMaterial ? (language === 'ar' ? 'تعديل المادة' : 'Edit Material') : (language === 'ar' ? 'إضافة مادة جديدة' : 'Add New Material')}</h3>
            <form onSubmit={editingMaterial ? handleEdit : handleAdd}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px' }}>
                    {t('ID', language)} *
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={formData.seat_number}
                    onChange={(e) =>
                      setFormData({ ...formData, seat_number: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px' }}>
                    {t('Subject', language)} *
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={formData.subject_name}
                    onChange={(e) =>
                      setFormData({ ...formData, subject_name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px' }}>
                    {t('Material Name', language)} *
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={formData.material_name}
                    onChange={(e) =>
                      setFormData({ ...formData, material_name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px' }}>
                    {t('Hall', language)} *
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={formData.hall}
                    onChange={(e) =>
                      setFormData({ ...formData, hall: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px' }}>
                    {t('Seat', language)} *
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={formData.seat}
                    onChange={(e) =>
                      setFormData({ ...formData, seat: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px' }}>
                    {t('Stage', language)} ({language === 'ar' ? 'اختياري' : 'Optional'})
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={formData.stage}
                    onChange={(e) =>
                      setFormData({ ...formData, stage: e.target.value })
                    }
                  />
                </div>
              </div>
              <div style={{ marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : editingMaterial ? (language === 'ar' ? 'تحديث' : 'Update') : t('Add', language)}
                </button>
                {editingMaterial && (
                  <button
                    type="button"
                    onClick={() => {
                      resetForm()
                      setShowAddForm(false)
                    }}
                    className="btn"
                    style={{ marginLeft: '10px' }}
                  >
                    {t('Cancel', language)}
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {showUsers && user?.is_admin && (
          <div className="card" style={{
            marginTop: '20px',
            border: '2px solid #6c757d',
            borderRadius: '10px',
            padding: '20px',
            backgroundColor: '#f8f9fa'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ color: '#6c757d' }}>👥 {t('Users', language)}</h3>
              <button
                onClick={() => {
                  setShowUserForm(!showUserForm)
                  resetUserForm()
                }}
                className="btn btn-success"
              >
                {showUserForm ? t('Cancel', language) : t('Add User', language)}
              </button>
            </div>

            {showUserForm && (
              <div className="card" style={{ marginBottom: '20px', backgroundColor: '#f8f9fa' }}>
                <h4>{editingUser ? t('Edit User', language) : t('Add User', language)}</h4>
                <form onSubmit={editingUser ? handleUserEdit : handleUserAdd}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px' }}>
                        {t('Name', language)} *
                      </label>
                      <input
                        type="text"
                        className="input"
                        value={userFormData.name}
                        onChange={(e) =>
                          setUserFormData({ ...userFormData, name: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px' }}>
                        {t('Email', language)} *
                      </label>
                      <input
                        type="email"
                        className="input"
                        value={userFormData.email}
                        onChange={(e) =>
                          setUserFormData({ ...userFormData, email: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px' }}>
                        {t('Password', language)} {editingUser ? (language === 'ar' ? '(اتركه فارغاً للاحتفاظ بالكلمة الحالية)' : '(leave empty to keep current)') : '*'}
                      </label>
                      <input
                        type="password"
                        className="input"
                        value={userFormData.password}
                        onChange={(e) =>
                          setUserFormData({ ...userFormData, password: e.target.value })
                        }
                        required={!editingUser}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px' }}>
                        {language === 'ar' ? 'الصلاحيات' : 'Permissions'}
                      </label>
                      <label style={{ display: 'block', marginBottom: '8px' }}>
                        <input
                          type="checkbox"
                          checked={userFormData.is_admin}
                          onChange={(e) =>
                            setUserFormData({ ...userFormData, is_admin: e.target.checked, is_assistant: e.target.checked ? false : userFormData.is_assistant })
                          }
                          style={{ marginRight: '5px' }}
                        />
                        {t('Admin', language)}
                      </label>
                      <label style={{ display: 'block' }}>
                        <input
                          type="checkbox"
                          checked={userFormData.is_assistant}
                          onChange={(e) =>
                            setUserFormData({ ...userFormData, is_assistant: e.target.checked, is_admin: e.target.checked ? false : userFormData.is_admin })
                          }
                          style={{ marginRight: '5px' }}
                        />
                        {language === 'ar' ? 'مساعد' : 'Assistant'}
                      </label>
                    </div>
                  </div>
                  <div style={{ marginTop: '20px' }}>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'جاري الحفظ...' : editingUser ? 'تحديث' : 'إضافة'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        resetUserForm()
                        setShowUserForm(false)
                      }}
                      className="btn"
                      style={{ marginLeft: '10px' }}
                    >
                      {t('Cancel', language)}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>{t('Name')}</th>
                  <th>{t('Email')}</th>
                  <th>{language === 'ar' ? 'الصلاحيات' : 'Permissions'}</th>
                  <th>{language === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td data-label="ID">{u.id}</td>
                    <td data-label={t('Name', language)}>{u.name}</td>
                    <td data-label={t('Email', language)}>{u.email}</td>
                    <td data-label={language === 'ar' ? 'الصلاحيات' : 'Permissions'}>
                      {u.is_admin
                        ? t('Admin', language)
                        : (u.is_assistant
                          ? (language === 'ar' ? 'مساعد' : 'Assistant')
                          : t('Regular User', language))}
                    </td>
                    <td data-label={language === 'ar' ? 'الإجراءات' : 'Actions'}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <button
                          onClick={() => startEditUser(u)}
                          className="btn btn-primary"
                          style={{ padding: '5px 10px', fontSize: '12px', width: '100%' }}
                        >
                          {t('Edit', language)}
                        </button>
                        {u.id !== user?.id && (
                          <button
                            onClick={() => handleUserDelete(u.id)}
                            className="btn btn-danger"
                            style={{ padding: '5px 10px', fontSize: '12px', width: '100%' }}
                          >
                            {t('Delete', language)}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ marginTop: '20px' }}>
          <div className="filters-row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
            <input
              type="text"
              className="input"
              placeholder={language === 'ar' ? 'بحث...' : 'Search...'}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
            />
            <select
              className="input"
              value={subjectFilter}
              onChange={(e) => {
                setSubjectFilter(e.target.value)
                setCurrentPage(1)
              }}
            >
              <option value="">{t('All Subjects', language)}</option>
              {filters.subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
            <select
              className="input"
              value={stageFilter === '__null__' ? 'null' : stageFilter}
              onChange={(e) => {
                const value = e.target.value
                setStageFilter(value === 'null' ? '__null__' : value)
                setCurrentPage(1)
              }}
            >
              <option value="">{t('All Stages', language)}</option>
              <option value="null">{t('No Stage', language)}</option>
              {filters.stages.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
            <select
              className="input"
              value={receivedFilter}
              onChange={(e) => {
                setReceivedFilter(e.target.value)
                setCurrentPage(1)
              }}
            >
              <option value="">{language === 'ar' ? 'جميع الحالات' : 'All Status'}</option>
              <option value="true">{t('Received', language)}</option>
              <option value="false">{t('Not Received', language)}</option>
            </select>
          </div>

          {loading ? (
            <div className="loading">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</div>
          ) : (
            <>
              <table className="table">
                <thead>
                  <tr>
                    {showBulkEdit && (
                      <th>
                        <input
                          type="checkbox"
                          checked={selectedMaterials.length === materials.length && materials.length > 0}
                          onChange={selectAllMaterials}
                          style={{ cursor: 'pointer' }}
                        />
                      </th>
                    )}
                    <th>ID</th>
                    <th>{t('ID', language)}</th>
                    <th>{t('Subject', language)}</th>
                    <th>{t('Material Name', language)}</th>
                    <th>{t('Hall', language)}</th>
                    <th>{t('Seat', language)}</th>
                    <th>{t('Stage', language)}</th>
                    <th>{t('Received Status', language)}</th>
                    <th>{language === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map((material) => (
                    <tr
                      key={material.id}
                      style={{
                        backgroundColor: material.received ? '#d4edda' : '#ffffff',
                        transition: 'background-color 0.3s',
                        borderLeft: material.received ? '4px solid #28a745' : '4px solid transparent'
                      }}
                    >
                      {showBulkEdit && (
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedMaterials.includes(material.id)}
                            onChange={() => toggleMaterialSelection(material.id)}
                            style={{ cursor: 'pointer' }}
                          />
                        </td>
                      )}
                      <td data-label="ID">{material.id}</td>
                      <td data-label={t('ID', language)}>{material.seat_number}</td>
                      <td data-label={t('Subject', language)}>{material.subject_name}</td>
                      <td data-label={t('Material Name', language)}>{material.material_name}</td>
                      <td data-label={t('Hall', language)}>{material.hall}</td>
                      <td data-label={t('Seat', language)}>{language === 'ar' ? `كرسي ${material.seat}` : material.seat}</td>
                      <td data-label={t('Stage', language)}>{material.stage || '-'}</td>
                      <td data-label={t('Received Status', language)}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          backgroundColor: material.received ? '#d4edda' : '#f8d7da',
                          color: material.received ? '#155724' : '#721c24',
                          fontWeight: 'bold',
                          fontSize: '13px'
                        }}>
                          {material.received ? '✓ ' : '✗ '}
                          {material.received ? t('Received', language) : t('Not Received', language)}
                        </div>
                      </td>
                      <td data-label={language === 'ar' ? 'الإجراءات' : 'Actions'}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', minWidth: '120px' }}>
                          {/* Mark as received / Cancel received button */}
                          {material.received ? (
                            <button
                              onClick={() => handleCancelReceived(material.id)}
                              className="btn btn-warning"
                              style={{
                                padding: '6px 12px',
                                fontSize: '12px',
                                width: '100%',
                                borderRadius: '5px',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              onMouseOver={(e) => e.target.style.opacity = '0.8'}
                              onMouseOut={(e) => e.target.style.opacity = '1'}
                            >
                              ↶ {t('Cancel Received', language)}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleMarkReceived(material.id)}
                              className="btn btn-success"
                              style={{
                                padding: '6px 12px',
                                fontSize: '12px',
                                width: '100%',
                                borderRadius: '5px',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              onMouseOver={(e) => e.target.style.opacity = '0.8'}
                              onMouseOut={(e) => e.target.style.opacity = '1'}
                            >
                              ✓ {t('Mark as received', language)}
                            </button>
                          )}
                          {/* Edit and Delete buttons */}
                          <button
                            onClick={() => startEdit(material)}
                            className="btn btn-primary"
                            style={{
                              padding: '6px 12px',
                              fontSize: '12px',
                              width: '100%',
                              borderRadius: '5px',
                              border: 'none',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.opacity = '0.8'}
                            onMouseOut={(e) => e.target.style.opacity = '1'}
                          >
                            ✏️ {t('Edit', language)}
                          </button>
                          <button
                            onClick={() => handleDelete(material.id)}
                            className="btn btn-danger"
                            style={{
                              padding: '6px 12px',
                              fontSize: '12px',
                              width: '100%',
                              borderRadius: '5px',
                              border: 'none',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.opacity = '0.8'}
                            onMouseOut={(e) => e.target.style.opacity = '1'}
                          >
                            🗑️ {t('Delete', language)}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div className="pagination" style={{ marginTop: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="btn"
                      style={{ minWidth: '100px' }}
                    >
                      {language === 'ar' ? 'السابق' : 'Previous'}
                    </button>
                    <span style={{ margin: '0 10px', fontWeight: '600' }}>
                      {language === 'ar' ? `صفحة ${currentPage} من ${totalPages}` : `Page ${currentPage} of ${totalPages}`}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="btn"
                      style={{ minWidth: '100px' }}
                    >
                      {language === 'ar' ? 'التالي' : 'Next'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Copyright Footer - Always visible */}
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

export default Dashboard
