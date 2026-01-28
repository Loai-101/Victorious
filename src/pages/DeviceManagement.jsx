import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLiveData } from '../context/LiveDataContext'
import { mockHorses } from '../data/mockData'

const DeviceManagement = () => {
  const { t } = useTranslation()
  const { horsesData } = useLiveData()
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedDevice, setSelectedDevice] = useState(null)
  const [showRemoveModal, setShowRemoveModal] = useState(false)
  const [showReplaceModal, setShowReplaceModal] = useState(false)
  const [showMicrochipModal, setShowMicrochipModal] = useState(false)
  const devicesPerPage = 20

  // Create device data from horses
  const deviceData = horsesData.map(horse => ({
    id: horse.id,
    horseName: horse.name,
    microchipNumber: horse.profile?.uelnNumber || 'N/A',
    deviceId: horse.profile?.heartRateDeviceId || `DEV-${String(horse.id).padStart(4, '0')}`,
    horseId: horse.id,
    status: horse.status || 'active',
    battery: horse.battery || 0
  }))

  // Filter devices based on search
  const filteredDevices = deviceData.filter(device => {
    const matchesSearch = !searchTerm || 
      device.horseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.microchipNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.deviceId.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  // Pagination
  const totalPages = Math.ceil(filteredDevices.length / devicesPerPage)
  const startIndex = (currentPage - 1) * devicesPerPage
  const paginatedDevices = filteredDevices.slice(startIndex, startIndex + devicesPerPage)

  const handleRemoveDevice = (device) => {
    setSelectedDevice(device)
    setShowRemoveModal(true)
  }

  const handleReplaceDevice = (device) => {
    setSelectedDevice(device)
    setShowReplaceModal(true)
  }

  const handleMicrochipReader = (device) => {
    setSelectedDevice(device)
    setShowMicrochipModal(true)
  }

  const confirmRemoveDevice = () => {
    // In a real app, this would make an API call
    console.log('Removing device:', selectedDevice)
    alert(`Device ${selectedDevice.deviceId} removed from ${selectedDevice.horseName}`)
    setShowRemoveModal(false)
    setSelectedDevice(null)
  }

  const confirmReplaceDevice = () => {
    // In a real app, this would make an API call
    console.log('Replacing device:', selectedDevice)
    alert(`Device ${selectedDevice.deviceId} will be replaced for ${selectedDevice.horseName}`)
    setShowReplaceModal(false)
    setSelectedDevice(null)
  }

  const handleMicrochipRead = () => {
    // In a real app, this would trigger microchip reading
    console.log('Reading microchip for:', selectedDevice)
    alert(`Reading microchip ${selectedDevice.microchipNumber} for ${selectedDevice.horseName}`)
    setShowMicrochipModal(false)
    setSelectedDevice(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Device Management</h1>
          <p className="text-gray-600 mt-1">Manage devices connected to horses</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by horse name, microchip number, or device ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-red-50 via-pink-50 to-purple-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                  Horse ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                  Horse Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                  Microchip Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                  Device ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                  Battery
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedDevices.map((device, idx) => (
                <tr key={device.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-red-50 transition-colors`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-100">
                    #{device.horseId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 border-r border-gray-100">
                    {device.horseName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-100 font-mono">
                    {device.microchipNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-100 font-mono font-semibold">
                    {device.deviceId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap border-r border-gray-100">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      device.status === 'active' ? 'bg-green-100 text-green-800' :
                      device.status === 'resting' ? 'bg-blue-100 text-blue-800' :
                      device.status === 'training' ? 'bg-orange-100 text-orange-800' :
                      device.status === 'racing' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {device.status || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            device.battery >= 50 ? 'bg-green-500' :
                            device.battery >= 20 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${device.battery}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium">{device.battery}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRemoveDevice(device)}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                      >
                        Remove Device
                      </button>
                      <button
                        onClick={() => handleReplaceDevice(device)}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                      >
                        Replace Device
                      </button>
                      <button
                        onClick={() => handleMicrochipReader(device)}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
                      >
                        Microchip Reader
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(startIndex + devicesPerPage, filteredDevices.length)} of {filteredDevices.length} devices
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

      {/* Remove Device Modal */}
      {showRemoveModal && selectedDevice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Remove Device</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to remove device <strong>{selectedDevice.deviceId}</strong> from <strong>{selectedDevice.horseName}</strong>?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowRemoveModal(false)
                  setSelectedDevice(null)
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoveDevice}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Remove Device
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Replace Device Modal */}
      {showReplaceModal && selectedDevice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Replace Device</h3>
            <p className="text-gray-600 mb-4">
              Replace device <strong>{selectedDevice.deviceId}</strong> for <strong>{selectedDevice.horseName}</strong>?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Device ID
              </label>
              <input
                type="text"
                placeholder="Enter new device ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowReplaceModal(false)
                  setSelectedDevice(null)
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmReplaceDevice}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Replace Device
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Microchip Reader Modal */}
      {showMicrochipModal && selectedDevice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Microchip Reader</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Horse: <strong>{selectedDevice.horseName}</strong></p>
              <p className="text-sm text-gray-600 mb-2">Current Microchip: <strong className="font-mono">{selectedDevice.microchipNumber}</strong></p>
            </div>
            <div className="mb-4 p-4 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600 mb-2">Place the microchip reader near the horse to scan the microchip.</p>
              <div className="flex items-center justify-center py-4">
                <div className="w-16 h-16 border-4 border-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowMicrochipModal(false)
                  setSelectedDevice(null)
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleMicrochipRead}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Read Microchip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DeviceManagement
