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

  // Get alert type icon
  const getAlertIcon = (type) => {
    if (type.includes('Heart Rate')) return '❤️'
    if (type.includes('Battery')) return '🔋'
    if (type.includes('Connection')) return '📡'
    if (type.includes('Speed')) return '⚡'
    if (type.includes('Recovery')) return '⏱️'
    if (type.includes('Health')) return '🏥'
    if (type.includes('Device')) return '🔧'
    if (type.includes('Temperature')) return '🌡️'
    return '⚠️'
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t('alerts.title', 'Alerts')}</h1>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">{t('alerts.total', 'Total Alerts')}</div>
          <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">{t('alerts.active', 'Active')}</div>
          <div className="text-3xl font-bold text-red-600">{stats.active}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">{t('alerts.resolved', 'Resolved')}</div>
          <div className="text-3xl font-bold text-green-600">{stats.resolved}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">{t('alerts.critical', 'Critical')}</div>
          <div className="text-3xl font-bold text-red-800">{stats.critical}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('alerts.search', 'Search')}
            </label>
            <input
              type="text"
              placeholder={t('alerts.searchPlaceholder', 'Search by horse, message, or type...')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('alerts.type', 'Alert Type')}
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
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

      {/* Alerts Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('alerts.time', 'Time')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('alerts.type', 'Type')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('alerts.horse', 'Horse')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('alerts.message', 'Message')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('alerts.severity', 'Severity')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('alerts.status', 'Status')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedAlerts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    {t('alerts.noAlerts', 'No alerts found')}
                  </td>
                </tr>
              ) : (
                paginatedAlerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(alert.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getAlertIcon(alert.alertType)}</span>
                        <span className="text-sm font-medium text-gray-900">{alert.alertType}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/dashboard/horses/${alert.horseId}`}
                        className="text-sm font-medium text-red-600 hover:text-red-800"
                      >
                        {alert.horseName}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {alert.message}
                      {alert.value !== null && (
                        <span className="ml-2 text-gray-500">({alert.value})</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(alert.status)}`}>
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
          <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              {t('alerts.showing', 'Showing')} {startIndex + 1} {t('alerts.to', 'to')} {Math.min(startIndex + alertsPerPage, filteredAlerts.length)} {t('alerts.of', 'of')} {filteredAlerts.length} {t('alerts.results', 'results')}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('alerts.previous', 'Previous')}
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('alerts.next', 'Next')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AlertsPage
