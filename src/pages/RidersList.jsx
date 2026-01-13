import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { mockRiders } from '../data/mockData'
import RiderProfileModal from '../components/RiderProfileModal'

const RidersList = () => {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({
    starLevel: '',
    qualificationStatus: '',
    discipline: '',
    highLevel: false // Add high level filter
  })
  const ridersPerPage = 20
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRider, setSelectedRider] = useState(null)

  // Get unique values for filters
  const uniqueStarLevels = [...new Set(mockRiders.map(r => r.star_level))].sort()
  const uniqueQualificationStatuses = [...new Set(mockRiders.map(r => r.qualification_status))].sort()
  const uniqueDisciplines = [...new Set(mockRiders.map(r => r.discipline))].sort()

  // Filter riders based on search and filters
  const filteredRiders = mockRiders.filter(rider => {
    const matchesSearch =
      rider.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rider.fei_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rider.fei_reference_code?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilters =
      (filters.starLevel === '' || rider.star_level === parseInt(filters.starLevel)) &&
      (filters.qualificationStatus === '' || rider.qualification_status === filters.qualificationStatus) &&
      (filters.discipline === '' || rider.discipline === filters.discipline) &&
      (!filters.highLevel || rider.star_level >= 2) // High level filter (2-3 stars)

    return matchesSearch && matchesFilters
  })

  // Pagination
  const totalPages = Math.ceil(filteredRiders.length / ridersPerPage)
  const startIndex = (currentPage - 1) * ridersPerPage
  const paginatedRiders = filteredRiders.slice(startIndex, startIndex + ridersPerPage)

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }))
    setCurrentPage(1) // Reset pagination on filter change
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setFilters({
      starLevel: '',
      qualificationStatus: '',
      discipline: '',
      highLevel: false
    })
    setCurrentPage(1)
  }

  const isAnyFilterActive = searchTerm !== '' || Object.entries(filters).some(([key, value]) => {
    if (key === 'highLevel') return value === true
    return value !== ''
  })

  const getStatusBadge = (status) => {
    const statusLower = String(status)?.toLowerCase() || ''
    // Check for "Not Qualified" first (before "Qualified")
    if (statusLower.includes('not qualified')) {
      return 'bg-orange-100 text-orange-800' // Orange for Not Qualified
    }
    if (statusLower.includes('qualified')) {
      return 'bg-green-100 text-green-800' // Green for Qualified
    }
    if (statusLower.includes('suspended')) {
      return 'bg-red-100 text-red-800' // Red for Suspended
    }
    return 'bg-yellow-100 text-yellow-800' // Default yellow
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString()
  }

  const openProfileModal = (rider) => {
    setSelectedRider(rider)
    setIsModalOpen(true)
  }

  const closeProfileModal = () => {
    setIsModalOpen(false)
    setSelectedRider(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Riders List ({filteredRiders.length})</h1>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <input
          type="text"
          placeholder="Search by name, FEI ID, or reference code..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
        />

        {/* Quick Filter Buttons */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => handleFilterChange('highLevel', !filters.highLevel)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filters.highLevel
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            High Level (2-3 Stars)
          </button>
          <button
            onClick={() => {
              setFilters({
                starLevel: '',
                qualificationStatus: '',
                discipline: '',
                highLevel: false
              })
              setSearchTerm('')
              setCurrentPage(1)
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300"
          >
            Show All
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Star Level Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Star Level
            </label>
            <select
              value={filters.starLevel}
              onChange={(e) => handleFilterChange('starLevel', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Star Levels</option>
              {uniqueStarLevels.map(level => (
                <option key={level} value={level}>{level}★</option>
              ))}
            </select>
          </div>

          {/* Qualification Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Qualification Status
            </label>
            <select
              value={filters.qualificationStatus}
              onChange={(e) => handleFilterChange('qualificationStatus', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Statuses</option>
              {uniqueQualificationStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Discipline Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discipline
            </label>
            <select
              value={filters.discipline}
              onChange={(e) => handleFilterChange('discipline', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Disciplines</option>
              {uniqueDisciplines.map(discipline => (
                <option key={discipline} value={discipline}>{discipline}</option>
              ))}
            </select>
          </div>
        </div>

        {(isAnyFilterActive || filters.highLevel) && (
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Clear All Filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  FEI ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Discipline
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Star Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qualification Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  FEI Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedRiders.map((rider) => (
                <tr key={rider.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{rider.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {rider.fei_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => openProfileModal(rider)}
                      className="text-sm font-medium text-red-600 hover:text-red-800 hover:underline focus:outline-none"
                    >
                      {rider.name}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {rider.discipline}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {rider.star_level}★
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(rider.qualification_status)}`}>
                      {rider.qualification_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {rider.fei_reference_code}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={rider.notes}>
                    {rider.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(startIndex + ridersPerPage, filteredRiders.length)} of {filteredRiders.length} riders
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Rider Profile Modal */}
      <RiderProfileModal
        isOpen={isModalOpen}
        onClose={closeProfileModal}
        rider={selectedRider}
      />
    </div>
  )
}

export default RidersList
