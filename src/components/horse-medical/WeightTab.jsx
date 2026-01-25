import React, { useState, useEffect } from 'react'
import { localStorageService } from '../../utils/localStorageService'

const WeightTab = ({ horseId, onToast }) => {
  const [showModal, setShowModal] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [weights, setWeights] = useState([])
  const [formData, setFormData] = useState({
    weightKg: '',
    dateTime: new Date().toISOString().slice(0, 16),
    method: 'Scale',
    recordedBy: 'Doctor',
    notes: ''
  })

  useEffect(() => {
    // Load weights when horseId changes
    const loadedWeights = localStorageService.getWeights(horseId)
    // Sort by date (newest first)
    loadedWeights.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))
    setWeights(loadedWeights)
  }, [horseId, refreshKey])

  const lastWeight = weights[0]
  const previousWeight = weights[1]
  const weightDifference = lastWeight && previousWeight 
    ? (lastWeight.weightKg - previousWeight.weightKg).toFixed(1)
    : null

  const handleSubmit = (e) => {
    e.preventDefault()
    localStorageService.saveWeight(horseId, {
      weightKg: parseFloat(formData.weightKg),
      dateTime: formData.dateTime,
      method: formData.method,
      recordedBy: formData.recordedBy,
      notes: formData.notes
    })
    setRefreshKey(prev => prev + 1)
    onToast('Weight record saved successfully', 'success')
    setShowModal(false)
    setFormData({
      weightKg: '',
      dateTime: new Date().toISOString().slice(0, 16),
      method: 'Scale',
      recordedBy: 'Doctor',
      notes: ''
    })
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <label className="block text-sm font-medium text-gray-500 mb-1">Last Weight</label>
          <div className="text-2xl font-bold text-gray-900">
            {lastWeight ? `${lastWeight.weightKg} kg` : 'N/A'}
          </div>
          {lastWeight && (
            <div className="text-xs text-gray-500 mt-1">
              {new Date(lastWeight.dateTime).toLocaleString()}
            </div>
          )}
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <label className="block text-sm font-medium text-gray-500 mb-1">Previous Weight</label>
          <div className="text-2xl font-bold text-gray-900">
            {previousWeight ? `${previousWeight.weightKg} kg` : 'N/A'}
          </div>
          {previousWeight && (
            <div className="text-xs text-gray-500 mt-1">
              {new Date(previousWeight.dateTime).toLocaleString()}
            </div>
          )}
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <label className="block text-sm font-medium text-gray-500 mb-1">Weight Difference</label>
          <div className={`text-2xl font-bold ${
            weightDifference > 0 ? 'text-red-600' : weightDifference < 0 ? 'text-green-600' : 'text-gray-900'
          }`}>
            {weightDifference ? `${weightDifference > 0 ? '+' : ''}${weightDifference} kg` : 'N/A'}
          </div>
        </div>
      </div>

      {/* Add Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Add Weight Record
        </button>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Weight History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weight (kg)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recorded By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {weights.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No weight records found
                  </td>
                </tr>
              ) : (
                weights.map((weight) => (
                  <tr key={weight.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(weight.dateTime).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {weight.weightKg} kg
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {weight.method}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {weight.recordedBy}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {weight.notes || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Weight Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Add Weight Record</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (kg) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.weightKg}
                  onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.dateTime}
                  onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Method *
                </label>
                <select
                  required
                  value={formData.method}
                  onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="Scale">Scale</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recorded By *
                </label>
                <select
                  required
                  value={formData.recordedBy}
                  onChange={(e) => setFormData({ ...formData, recordedBy: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="Doctor">Doctor</option>
                  <option value="Staff">Staff</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default WeightTab
