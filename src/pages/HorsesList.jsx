import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLiveData } from '../context/LiveDataContext'
import HorseProfileModal from '../components/HorseProfileModal'

const HorsesList = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { horsesData } = useLiveData()
  const [selectedHorses, setSelectedHorses] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedHorse, setSelectedHorse] = useState(null)
  const [filters, setFilters] = useState({
    country: '',
    status: '',
    breed: '',
    age: '',
    starLevel: '' // Add star level filter
  })
  const horsesPerPage = 20

  // Get unique values for filters
  const uniqueCountries = [...new Set(horsesData.map(h => h.country).filter(Boolean))].sort()
  const uniqueStatuses = [...new Set(horsesData.map(h => h.status).filter(Boolean))].sort()
  const uniqueBreeds = [...new Set(horsesData.map(h => h.breed).filter(Boolean))].sort()
  const uniqueAges = [...new Set(horsesData.map(h => h.age))].sort((a, b) => a - b)
  const uniqueStarLevels = [...new Set(horsesData.map(h => h.stars))].sort((a, b) => a - b)

  // Get HR color based on status
  const getHRColor = (horse) => {
    if (horse.status === 'No connection' || horse.currentHr === null) {
      return 'text-gray-400' // Gray for No connection
    }
    
    switch (horse.status) {
      case 'resting':
        return 'text-green-600' // Green for resting (30-43 HR)
      case 'active':
        return 'text-red-600' // Red for active (45-55 HR)
      case 'training':
        return 'text-orange-600' // Orange for training (60-95 HR)
      case 'racing':
        return 'text-red-600' // Red for racing (95-120 HR)
      default:
        return 'text-gray-600'
    }
  }

  // Determine gait based on speed for racing horses
  const getGait = (horse) => {
    if (horse.status !== 'racing' || !horse.speed || horse.speed === null) {
      return null
    }
    
    const speed = horse.speed
    if (speed >= 4 && speed <= 7) {
      return 'Walk'
    } else if (speed >= 8 && speed <= 15) {
      return 'Trot'
    } else if (speed >= 16 && speed <= 27) {
      return 'Canter'
    }
    return null
  }

  // Check if horse is in specific gait
  const isInGait = (horse, gait) => {
    if (horse.status !== 'racing' || !horse.speed || horse.speed === null) {
      return false
    }
    
    const speed = horse.speed
    switch (gait) {
      case 'Walk':
        return speed >= 4 && speed <= 7
      case 'Trot':
        return speed >= 8 && speed <= 15
      case 'Canter':
        return speed >= 16 && speed <= 27
      default:
        return false
    }
  }

  // Filter horses based on search and filters
  const filteredHorses = horsesData.filter(horse => {
    // Search filter
    const matchesSearch = !searchTerm || 
      horse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      horse.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (horse.country && horse.country.toLowerCase().includes(searchTerm.toLowerCase()))
    
    // Country filter
    const matchesCountry = !filters.country || horse.country === filters.country
    
    // Status filter
    const matchesStatus = !filters.status || horse.status === filters.status
    
    // Breed filter
    const matchesBreed = !filters.breed || horse.breed === filters.breed
    
    // Age filter
    const matchesAge = !filters.age || horse.age === parseInt(filters.age)
    
    // Star level filter - show only 2-3 stars (high level) if filter is set
    const matchesStarLevel = !filters.starLevel || 
      (filters.starLevel === 'high' && horse.stars >= 2) ||
      (filters.starLevel !== 'high' && horse.stars === parseInt(filters.starLevel))
    
    return matchesSearch && matchesCountry && matchesStatus && matchesBreed && matchesAge && matchesStarLevel
  })

  // Pagination
  const totalPages = Math.ceil(filteredHorses.length / horsesPerPage)
  const startIndex = (currentPage - 1) * horsesPerPage
  const paginatedHorses = filteredHorses.slice(startIndex, startIndex + horsesPerPage)

  const handleSelectHorse = (horseId) => {
    setSelectedHorses(prev =>
      prev.includes(horseId)
        ? prev.filter(id => id !== horseId)
        : [...prev, horseId]
    )
  }

  const handleSelectAll = () => {
    if (selectedHorses.length === paginatedHorses.length) {
      setSelectedHorses([])
    } else {
      setSelectedHorses(paginatedHorses.map(h => h.id))
    }
  }

  const handleViewDashboard = (horseId) => {
    navigate(`/dashboard/live?horses=${horseId}`)
  }

  const handleViewMultiple = () => {
    if (selectedHorses.length > 0) {
      navigate(`/dashboard/live?horses=${selectedHorses.join(',')}`)
    }
  }

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
    setCurrentPage(1) // Reset to first page when filter changes
  }

  const clearFilters = () => {
    setFilters({
      country: '',
      status: '',
      breed: '',
      age: '',
      starLevel: ''
    })
    setSearchTerm('')
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Horses List ({filteredHorses.length})</h1>
        {selectedHorses.length > 0 && (
          <button
            onClick={handleViewMultiple}
            className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            View {selectedHorses.length} Selected
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div>
          <input
            type="text"
            placeholder="Search by name, breed, or country..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {/* Quick Filter Buttons */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => handleFilterChange('starLevel', 'high')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filters.starLevel === 'high'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            High Level (2-3 Stars)
          </button>
          <button
            onClick={() => handleFilterChange('starLevel', '')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300"
          >
            Show All
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Country Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <select
              value={filters.country}
              onChange={(e) => handleFilterChange('country', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Countries</option>
              {uniqueCountries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Statuses</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Breed Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Breed
            </label>
            <select
              value={filters.breed}
              onChange={(e) => handleFilterChange('breed', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Breeds</option>
              {uniqueBreeds.map(breed => (
                <option key={breed} value={breed}>{breed}</option>
              ))}
            </select>
          </div>

          {/* Age Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Age
            </label>
            <select
              value={filters.age}
              onChange={(e) => handleFilterChange('age', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Ages</option>
              {uniqueAges.map(age => (
                <option key={age} value={age}>{age} years</option>
              ))}
            </select>
          </div>

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
              <option value="">All Levels</option>
              <option value="high">High (2-3 Stars)</option>
              {uniqueStarLevels.map(level => (
                <option key={level} value={level}>{level} Star{level > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters Button */}
        {(filters.country || filters.status || filters.breed || filters.age || filters.starLevel || searchTerm) && (
          <div>
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedHorses.length === paginatedHorses.length && paginatedHorses.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Age
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Breed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Country
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current HR
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Speed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gait
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Battery
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedHorses.map((horse) => (
                <tr key={horse.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedHorses.includes(horse.id)}
                      onChange={() => handleSelectHorse(horse.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{horse.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedHorse(horse)}
                        className="text-sm font-medium text-red-600 hover:text-red-800 hover:underline cursor-pointer"
                      >
                        {horse.name}
                      </button>
                      <div className="flex items-center">
                        {Array.from({ length: horse.stars || 0 }).map((_, idx) => (
                          <span key={idx} className="text-yellow-400 text-sm">★</span>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {horse.age} years
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {horse.breed}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="font-medium">{horse.country || 'N/A'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {horse.currentHr === null || horse.currentHr === undefined ? (
                      <span className="text-gray-400">N/A</span>
                    ) : (
                      <span className={`font-semibold ${getHRColor(horse)}`}>
                        {horse.currentHr} bpm
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {horse.speed === null || horse.speed === undefined ? (
                      <span className="text-gray-400">N/A</span>
                    ) : (
                      <span>{horse.speed.toFixed(1)} km/h</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    {horse.speed !== null && horse.speed !== undefined ? (
                      (() => {
                        const speed = horse.speed
                        // Walk: 4–7 km/h (extended to include speeds < 4 as slow walk)
                        if (speed >= 0 && speed <= 7) {
                          return (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              Walk
                            </span>
                          )
                        } 
                        // Trot: 8–15 km/h
                        else if (speed >= 8 && speed <= 15) {
                          return (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              Trot
                            </span>
                          )
                        } 
                        // Canter: 16–27 km/h (extended to include speeds > 27 as fast canter)
                        else if (speed >= 16) {
                          return (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                              Canter
                            </span>
                          )
                        } 
                        // Fallback (should not happen, but just in case)
                        else {
                          return (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                              Walk
                            </span>
                          )
                        }
                      })()
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <span className="font-semibold text-red-600">
                        {horse.battery}%
                      </span>
                      <div className="ml-2 w-16 bg-white border border-gray-300 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-red-600"
                          style={{ width: `${horse.battery}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      horse.status === 'active' ? 'bg-red-100 text-red-800' :
                      horse.status === 'resting' ? 'bg-green-100 text-green-800' :
                      horse.status === 'training' ? 'bg-orange-100 text-orange-800' :
                      horse.status === 'racing' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {horse.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewDashboard(horse.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(startIndex + horsesPerPage, filteredHorses.length)} of {filteredHorses.length} horses
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

      {/* Horse Profile Modal */}
      <HorseProfileModal
        isOpen={selectedHorse !== null}
        onClose={() => setSelectedHorse(null)}
        horse={selectedHorse}
      />
    </div>
  )
}

export default HorsesList
