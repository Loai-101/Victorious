import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useApp } from '../context/AppContext'
import { mockUsers, mockTrainers, mockRiders, mockDoctors } from '../data/mockData'

const TABS = [
  { id: 'users', label: 'Users' },
  { id: 'admins', label: 'Admins' },
  { id: 'trainers', label: 'Trainers' },
  { id: 'riders', label: 'Riders' },
  { id: 'doctors', label: 'Doctors / Vets' }
]

const ROLES = ['trainer_manager', 'stable_manager', 'stable_owner', 'admin']

const SettingsPage = () => {
  const { t } = useTranslation()
  const { user } = useApp()
  const canAccess = user?.role === 'stable_owner' || user?.role === 'admin'
  const [activeTab, setActiveTab] = useState('users')
  const [searchTerm, setSearchTerm] = useState('')
  const [users, setUsers] = useState(mockUsers)
  const [trainers, setTrainers] = useState(mockTrainers.slice(0, 20))
  const [riders, setRiders] = useState(mockRiders.slice(0, 25))
  const [doctors, setDoctors] = useState(mockDoctors)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({})

  const admins = users.filter(u => u.role === 'admin')

  const getCurrentList = () => {
    switch (activeTab) {
      case 'users': return users
      case 'admins': return admins
      case 'trainers': return trainers
      case 'riders': return riders
      case 'doctors': return doctors
      default: return []
    }
  }

  const getFilteredList = () => {
    const list = getCurrentList()
    if (!searchTerm) return list
    const term = searchTerm.toLowerCase()
    return list.filter(item => {
      const name = (item.name || '').toLowerCase()
      const email = (item.email || item.emailAddress || '').toLowerCase()
      const extra = (item.specialization || item.discipline || item.qualification_status || item.licenseNumber || '').toLowerCase()
      return name.includes(term) || email.includes(term) || extra.includes(term)
    })
  }

  const filteredList = getFilteredList()

  const openAddModal = () => {
    setEditingItem(null)
    if (activeTab === 'users') setFormData({ name: '', email: '', role: 'trainer_manager' })
    else if (activeTab === 'trainers') setFormData({ name: '', emailAddress: '', specialization: '', yearsOfExperience: '', status: 'Active' })
    else if (activeTab === 'riders') setFormData({ name: '', fei_id: '', discipline: 'Endurance', star_level: 1, qualification_status: 'Qualified' })
    else if (activeTab === 'doctors') setFormData({ name: '', email: '', phone: '', specialization: '', licenseNumber: '', country: '' })
    else setFormData({ name: '', email: '', role: 'admin' })
    setModalOpen(true)
  }

  const openEditModal = (item) => {
    setEditingItem(item)
    setFormData({ ...item })
    setModalOpen(true)
  }

  const handleSave = () => {
    if (activeTab === 'users') {
      if (editingItem) {
        setUsers(users.map(u => u.id === editingItem.id ? { ...u, ...formData } : u))
      } else {
        setUsers([...users, { id: Math.max(...users.map(u => u.id), 0) + 1, ...formData }])
      }
    } else if (activeTab === 'admins') {
      if (editingItem) {
        setUsers(users.map(u => u.id === editingItem.id ? { ...u, ...formData, role: 'admin' } : u))
      } else {
        setUsers([...users, { id: Math.max(...users.map(u => u.id), 0) + 1, ...formData, role: 'admin', subscription: 'enterprise' }])
      }
    } else if (activeTab === 'trainers') {
      if (editingItem) {
        setTrainers(trainers.map(t => t.id === editingItem.id ? { ...t, ...formData } : t))
      } else {
        setTrainers([...trainers, { id: Math.max(...trainers.map(t => t.id), 0) + 1, ...formData }])
      }
    } else if (activeTab === 'riders') {
      if (editingItem) {
        setRiders(riders.map(r => r.id === editingItem.id ? { ...r, ...formData } : r))
      } else {
        setRiders([...riders, { id: Math.max(...riders.map(r => r.id), 0) + 1, ...formData }])
      }
    } else if (activeTab === 'doctors') {
      if (editingItem) {
        setDoctors(doctors.map(d => d.id === editingItem.id ? { ...d, ...formData } : d))
      } else {
        setDoctors([...doctors, { id: Math.max(...doctors.map(d => d.id), 0) + 1, ...formData, status: 'Active' }])
      }
    }
    setModalOpen(false)
    setEditingItem(null)
  }

  const handleDelete = (item) => {
    if (!window.confirm('Are you sure you want to remove this entry?')) return
    if (activeTab === 'users' || activeTab === 'admins') setUsers(users.filter(u => u.id !== item.id))
    else if (activeTab === 'trainers') setTrainers(trainers.filter(t => t.id !== item.id))
    else if (activeTab === 'riders') setRiders(riders.filter(r => r.id !== item.id))
    else if (activeTab === 'doctors') setDoctors(doctors.filter(d => d.id !== item.id))
  }

  if (!canAccess) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-gray-600 text-lg">Access denied. Settings is available for Stable Owner and Admin only.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-6 shadow-sm border border-red-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage users, admins, trainers, riders and doctors</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden">
        <div className="flex border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center gap-2 px-8 py-4 text-sm font-bold transition-all relative ${
                activeTab === tab.id
                  ? 'text-red-600 bg-white border-b-3 border-red-600 shadow-sm'
                  : 'text-gray-600 hover:text-red-600 hover:bg-white/50'
              }`}
            >
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"></div>
              )}
            </button>
          ))}
        </div>

        {/* Search & Add */}
        <div className="p-6 flex flex-wrap items-center gap-4 bg-white border-b border-gray-200">
          <div className="flex-1 min-w-[250px] relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
            />
          </div>
          <button
            onClick={openAddModal}
            className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-bold hover:from-red-700 hover:to-red-800 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add {activeTab === 'users' ? 'User' : activeTab.slice(0, -1)}
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-red-50 via-pink-50 to-purple-50">
              <tr>
                {activeTab === 'users' && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                  </>
                )}
                {activeTab === 'admins' && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                  </>
                )}
                {activeTab === 'trainers' && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">Specialization</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">Experience</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                  </>
                )}
                {activeTab === 'riders' && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">FEI ID</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">Discipline</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">Star</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">Qualification</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                  </>
                )}
                {activeTab === 'doctors' && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">Specialization</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">License</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">Country</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredList.map((item, idx) => (
                <tr key={item.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-red-50/50 transition-colors`}>
                  {activeTab === 'users' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-100">#{item.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 border-r border-gray-100">{item.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-100">{item.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap border-r border-gray-100">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">{item.role?.replace('_', ' ')}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => openEditModal(item)} 
                            className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md font-semibold hover:bg-blue-100 transition-colors flex items-center gap-1.5"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(item)} 
                            className="px-3 py-1.5 bg-red-50 text-red-700 rounded-md font-semibold hover:bg-red-100 transition-colors flex items-center gap-1.5"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                  {activeTab === 'admins' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-100">#{item.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 border-r border-gray-100">{item.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-100">{item.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => openEditModal(item)} 
                            className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md font-semibold hover:bg-blue-100 transition-colors flex items-center gap-1.5"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(item)} 
                            className="px-3 py-1.5 bg-red-50 text-red-700 rounded-md font-semibold hover:bg-red-100 transition-colors flex items-center gap-1.5"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                  {activeTab === 'trainers' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-100">#{item.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 border-r border-gray-100">{item.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-100">{item.emailAddress || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-100">{item.specialization || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-100">{item.yearsOfExperience || 0} yrs</td>
                      <td className="px-6 py-4 whitespace-nowrap border-r border-gray-100">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">{item.status || 'Active'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => openEditModal(item)} 
                            className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md font-semibold hover:bg-blue-100 transition-colors flex items-center gap-1.5"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(item)} 
                            className="px-3 py-1.5 bg-red-50 text-red-700 rounded-md font-semibold hover:bg-red-100 transition-colors flex items-center gap-1.5"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                  {activeTab === 'riders' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-100">#{item.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 border-r border-gray-100">{item.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-mono border-r border-gray-100">{item.fei_id || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-100">{item.discipline || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-100">{item.star_level || 0}★</td>
                      <td className="px-6 py-4 whitespace-nowrap border-r border-gray-100">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          item.qualification_status === 'Qualified' ? 'bg-green-100 text-green-800' :
                          item.qualification_status === 'Suspended' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>{item.qualification_status}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => openEditModal(item)} 
                            className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md font-semibold hover:bg-blue-100 transition-colors flex items-center gap-1.5"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(item)} 
                            className="px-3 py-1.5 bg-red-50 text-red-700 rounded-md font-semibold hover:bg-red-100 transition-colors flex items-center gap-1.5"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                  {activeTab === 'doctors' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-100">#{item.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 border-r border-gray-100">{item.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-100">{item.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-100">{item.phone || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-100">{item.specialization || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-mono border-r border-gray-100">{item.licenseNumber || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-100">{item.country || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => openEditModal(item)} 
                            className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md font-semibold hover:bg-blue-100 transition-colors flex items-center gap-1.5"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(item)} 
                            className="px-3 py-1.5 bg-red-50 text-red-700 rounded-md font-semibold hover:bg-red-100 transition-colors flex items-center gap-1.5"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredList.length === 0 && (
          <div className="p-16 text-center">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg font-semibold text-gray-700 mb-1">No {activeTab} found</p>
            <p className="text-gray-500 mb-4">Try a different search or add a new {activeTab === 'users' ? 'user' : activeTab.slice(0, -1)}</p>
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Add {activeTab === 'users' ? 'User' : activeTab.slice(0, -1)}
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border-2 border-gray-200">
            <div className="p-6 border-b-2 border-gray-200 bg-gradient-to-r from-red-50 to-pink-50">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                {editingItem ? (
                  <>
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit {activeTab.slice(0, -1)}
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add {activeTab === 'users' ? 'User' : activeTab.slice(0, -1)}
                  </>
                )}
              </h3>
            </div>
            <div className="p-6 space-y-5">
              {activeTab === 'users' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                    <input value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all" placeholder="Full name" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input type="email" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all" placeholder="email@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                    <select value={formData.role || 'trainer_manager'} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white">
                      {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                </>
              )}
              {activeTab === 'admins' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                    <input value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all" placeholder="Admin name" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input type="email" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all" placeholder="admin@example.com" />
                  </div>
                </>
              )}
              {activeTab === 'trainers' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                    <input value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all" placeholder="Trainer name" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input type="email" value={formData.emailAddress || ''} onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })} className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all" placeholder="trainer@stable.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Specialization</label>
                    <input value={formData.specialization || ''} onChange={(e) => setFormData({ ...formData, specialization: e.target.value })} className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all" placeholder="e.g. Endurance Conditioning" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Years of Experience</label>
                    <input type="number" value={formData.yearsOfExperience || ''} onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })} className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all" placeholder="10" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                    <select value={formData.status || 'Active'} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white">
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </>
              )}
              {activeTab === 'riders' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                    <input value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all" placeholder="Rider name" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">FEI ID</label>
                    <input value={formData.fei_id || ''} onChange={(e) => setFormData({ ...formData, fei_id: e.target.value })} className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all" placeholder="FEI12345678" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Discipline</label>
                    <input value={formData.discipline || 'Endurance'} onChange={(e) => setFormData({ ...formData, discipline: e.target.value })} className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Star Level</label>
                    <select value={formData.star_level ?? 1} onChange={(e) => setFormData({ ...formData, star_level: Number(e.target.value) })} className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white">
                      {[1, 2, 3].map(s => <option key={s} value={s}>{s}★</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Qualification Status</label>
                    <select value={formData.qualification_status || 'Qualified'} onChange={(e) => setFormData({ ...formData, qualification_status: e.target.value })} className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white">
                      <option value="Qualified">Qualified</option>
                      <option value="Not Qualified">Not Qualified</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                </>
              )}
              {activeTab === 'doctors' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                    <input value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all" placeholder="Dr. Name" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input type="email" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all" placeholder="doctor@clinic.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                    <input value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all" placeholder="+973 3333 0000" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Specialization</label>
                    <input value={formData.specialization || ''} onChange={(e) => setFormData({ ...formData, specialization: e.target.value })} className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all" placeholder="Equine Medicine" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">License Number</label>
                    <input value={formData.licenseNumber || ''} onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })} className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all" placeholder="VET-BRN-001" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
                    <input value={formData.country || ''} onChange={(e) => setFormData({ ...formData, country: e.target.value })} className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all" placeholder="Bahrain" />
                  </div>
                </>
              )}
            </div>
            <div className="p-6 border-t-2 border-gray-200 flex justify-end gap-3 bg-gray-50">
              <button onClick={() => setModalOpen(false)} className="px-6 py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-bold hover:from-red-700 hover:to-red-800 transition-all shadow-md hover:shadow-lg">
                {editingItem ? 'Save Changes' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SettingsPage
