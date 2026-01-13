import React from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { mockRiders } from '../data/mockData'

const RiderProfile = () => {
  const { t } = useTranslation()
  const { id } = useParams()
  const rider = mockRiders.find(r => r.id === parseInt(id)) || mockRiders[0]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('rider.title')}</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('rider.name')}
            </label>
            <div className="text-xl font-semibold">{rider.name}</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('rider.age')}
              </label>
              <div className="text-lg">{rider.age} {t('common.years') || 'years'}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('rider.weight')}
              </label>
              <div className="text-lg">{rider.weight} kg</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('rider.height')}
              </label>
              <div className="text-lg">{rider.height} cm</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('rider.experience')}
              </label>
              <div className="text-lg">{rider.experience}</div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('rider.teamName')}
              </label>
              <div className="text-lg">{rider.teamName}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RiderProfile
