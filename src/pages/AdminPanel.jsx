import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { mockDeviceApprovals, mockUsers, mockBatteryMonitoring } from '../data/mockData'
import { useApp } from '../context/AppContext'

const AdminPanel = () => {
  const { t } = useTranslation()
  const { user } = useApp()
  const [deviceApprovals, setDeviceApprovals] = useState(mockDeviceApprovals)
  const [users] = useState(mockUsers)
  const [batteryMonitoring] = useState(mockBatteryMonitoring)

  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Access denied. Admin only.</p>
      </div>
    )
  }

  const handleApprove = (id) => {
    setDeviceApprovals(deviceApprovals.map(item =>
      item.id === id ? { ...item, status: 'approved' } : item
    ))
  }

  const handleReject = (id) => {
    setDeviceApprovals(deviceApprovals.map(item =>
      item.id === id ? { ...item, status: 'rejected' } : item
    ))
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('admin.title')}</h1>

      {/* Battery Monitoring */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">{t('admin.batteryMonitoring')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {batteryMonitoring.map((device) => (
            <div key={device.deviceId} className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-600 mb-1">Device {device.deviceId}</div>
              <div className="text-2xl font-bold text-red-600 mb-1">{device.battery}%</div>
              <div className="text-xs text-gray-500">{device.lastUpdate}</div>
              <div className="mt-2 w-full bg-white border border-gray-300 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-red-600"
                  style={{ width: `${device.battery}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Device Approval */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">{t('admin.deviceApproval')}</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Country</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.status')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {deviceApprovals.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.userName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.country}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      item.status === 'approved' ? 'bg-green-100 text-green-800' :
                      item.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {item.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(item.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          {t('admin.approve')}
                        </button>
                        <button
                          onClick={() => handleReject(item.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          {t('admin.reject')}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Users Table */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">{t('admin.users')}</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subscription</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {user.role.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {user.subscription}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminPanel
