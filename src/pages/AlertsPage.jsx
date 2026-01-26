import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { mockAlerts } from '../data/mockData'

const AlertsPage = () => {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterSeverity, setFilterSeverity] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const alertsPerPage = 20

  // Get unique values for filters
  const uniqueTypes = [...new Set(mockAlerts.map(a => a.alertType))].sort()
  const uniqueSeverities = [...new Set(mockAlerts.map(a => a.severity))].sort()
  const uniqueStatuses = [...new Set(mockAlerts.map(a => a.status))].sort()

  // Filter alerts
  const filteredAlerts = useMemo(() => {
    return mockAlerts.filter(alert => {
      const matchesSearch = 
        alert.horseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.alertType.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesType = !filterType || alert.alertType === filterType
      const matchesSeverity = !filterSeverity || alert.severity === filterSeverity
      const matchesStatus = !filterStatus || alert.status === filterStatus

      return matchesSearch && matchesType && matchesSeverity && matchesStatus
    })
  }, [searchTerm, filterType, filterSeverity, filterStatus])

  // Pagination
  const totalPages = Math.ceil(filteredAlerts.length / alertsPerPage)
  const startIndex = (currentPage - 1) * alertsPerPage
  const paginatedAlerts = filteredAlerts.slice(startIndex, startIndex + alertsPerPage)

  // Get severity color
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'Low':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-red-100 text-red-800'
      case 'Resolved':
        return 'bg-green-100 text-green-800'
      case 'Acknowledged':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Alert statistics
  const stats = useMemo(() => {
    return {
      total: filteredAlerts.length,
      active: filteredAlerts.filter(a => a.status === 'Active').length,
      resolved: filteredAlerts.filter(a => a.status === 'Resolved').length,
      critical: filteredAlerts.filter(a => a.severity === 'Critical').length
    }
  }, [filteredAlerts])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg rounded-xl overflow-hidden">
        <div className="px-6 py-6">
          <h1 className="text-3xl font-bold mb-2">{t('alerts.title', 'Alerts')}</h1>
          <p className="text-red-100">Monitor and manage system alerts</p>
        </div>
      </div>

      <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">{t('alerts.total', 'Total Alerts')}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
                  <p className="text-xs text-gray-400 mt-1">All alerts</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">{t('alerts.active', 'Active')}</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">{stats.active}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    <p className="text-xs text-gray-400">Requires attention</p>
                  </div>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">{t('alerts.resolved', 'Resolved')}</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{stats.resolved}</p>
                  <p className="text-xs text-gray-400 mt-1">Completed alerts</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">{t('alerts.critical', 'Critical')}</p>
                  <p className="text-3xl font-bold text-red-800 mt-2">{stats.critical}</p>
                  <p className="text-xs text-gray-400 mt-1">Urgent priority</p>
                </div>
                <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              <p className="text-sm text-gray-500 mt-1">Filter alerts by type, severity, or status</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('alerts.search', 'Search')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder={t('alerts.searchPlaceholder', 'Search by horse, message, or type...')}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value)
                        setCurrentPage(1)
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('alerts.type', 'Alert Type')}
                  </label>
                  <select
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all bg-white"
                    value={filterType}
                    onChange={(e) => {
                      setFilterType(e.target.value)
                      setCurrentPage(1)
                    }}
                  >
                    <option value="">{t('alerts.allTypes', 'All Types')}</option>
                    {uniqueTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('alerts.severity', 'Severity')}
                  </label>
                  <select
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all bg-white"
                    value={filterSeverity}
                    onChange={(e) => {
                      setFilterSeverity(e.target.value)
                      setCurrentPage(1)
                    }}
                  >
                    <option value="">{t('alerts.allSeverities', 'All Severities')}</option>
                    {uniqueSeverities.map(severity => (
                      <option key={severity} value={severity}>{severity}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('alerts.status', 'Status')}
                  </label>
                  <select
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all bg-white"
                    value={filterStatus}
                    onChange={(e) => {
                      setFilterStatus(e.target.value)
                      setCurrentPage(1)
                    }}
                  >
                    <option value="">{t('alerts.allStatuses', 'All Statuses')}</option>
                    {uniqueStatuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Alerts Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Alerts</h2>
              <p className="text-sm text-gray-500 mt-1">{filteredAlerts.length} alert{filteredAlerts.length !== 1 ? 's' : ''} found</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      {t('alerts.time', 'Time')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      {t('alerts.type', 'Type')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      {t('alerts.horse', 'Horse')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      {t('alerts.message', 'Message')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      {t('alerts.severity', 'Severity')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      {t('alerts.status', 'Status')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedAlerts.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-gray-500 font-medium">{t('alerts.noAlerts', 'No alerts found')}</p>
                          <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedAlerts.map((alert) => (
                      <tr key={alert.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{formatDate(alert.timestamp)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">{alert.alertType}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            to={`/dashboard/horses/${alert.horseId}`}
                            className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors inline-flex items-center gap-1"
                          >
                            {alert.horseName}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {alert.message}
                            {alert.value !== null && (
                              <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                                {alert.value}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${getSeverityColor(alert.severity)}`}>
                            {alert.severity}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(alert.status)}`}>
                            {alert.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  {t('alerts.showing', 'Showing')} <span className="font-semibold">{startIndex + 1}</span> {t('alerts.to', 'to')} <span className="font-semibold">{Math.min(startIndex + alertsPerPage, filteredAlerts.length)}</span> {t('alerts.of', 'of')} <span className="font-semibold">{filteredAlerts.length}</span> {t('alerts.results', 'results')}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-md"
                  >
                    {t('alerts.previous', 'Previous')}
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-md"
                  >
                    {t('alerts.next', 'Next')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
  )
}

export default AlertsPage
