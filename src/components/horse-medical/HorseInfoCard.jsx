import React from 'react'

const HorseInfoCard = ({ horse }) => {
  if (!horse) return null

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">ID</label>
          <div className="text-lg font-semibold text-gray-900">#{horse.id}</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
          <div className="text-lg font-semibold text-gray-900">{horse.name}</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Passport Number</label>
          <div className="text-sm text-gray-700">{horse.profile?.feiPassportNumber || 'N/A'}</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Microchip</label>
          <div className="text-sm text-gray-700">{horse.profile?.uelnNumber || 'N/A'}</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Gender</label>
          <div className="text-sm text-gray-700">{horse.profile?.gender || 'N/A'}</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Age</label>
          <div className="text-sm text-gray-700">{horse.age} years</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Breed</label>
          <div className="text-sm text-gray-700">{horse.breed}</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Color</label>
          <div className="text-sm text-gray-700">{horse.profile?.color || 'N/A'}</div>
        </div>
      </div>
    </div>
  )
}

export default HorseInfoCard
