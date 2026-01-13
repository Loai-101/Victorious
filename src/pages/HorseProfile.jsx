import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { mockHorses, feedTypes } from '../data/mockData'
import UpgradeModal from '../components/UpgradeModal'
import { useApp } from '../context/AppContext'

const HorseProfile = () => {
  const { t } = useTranslation()
  const { id } = useParams()
  const { user } = useApp()
  const horse = mockHorses.find(h => h.id === parseInt(id)) || mockHorses[0]
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [selectedFeed, setSelectedFeed] = useState(horse.feedType)

  const daysSinceChange = Math.floor(
    (Date.now() - new Date(horse.feedChangeDate).getTime()) / (1000 * 60 * 60 * 24)
  )
  const canChangeFeed = daysSinceChange >= 15

  const handleFeedChange = () => {
    if (user?.subscription === 'free') {
      setShowUpgradeModal(true)
      return
    }

    if (!canChangeFeed) {
      alert(t('horse.locked'))
      return
    }

    // Mock feed change
    alert(`Feed type changed to ${selectedFeed}`)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('horse.title')}</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-48">
            <img
              src={horse.profileImage}
              alt={horse.name}
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('horse.name')}
              </label>
              <div className="text-xl font-semibold">{horse.name}</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('horse.age')}
                </label>
                <div className="text-lg">{horse.age} {t('common.years') || 'years'}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('horse.breed')}
                </label>
                <div className="text-lg">{horse.breed}</div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('horse.feedType')}
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedFeed}
                  onChange={(e) => setSelectedFeed(e.target.value)}
                  disabled={!canChangeFeed || user?.subscription === 'free'}
                  className={`flex-1 px-3 py-2 border border-gray-300 rounded-md ${
                    !canChangeFeed || user?.subscription === 'free'
                      ? 'bg-gray-100 cursor-not-allowed'
                      : ''
                  }`}
                >
                  {feedTypes.map((feed) => (
                    <option key={feed} value={feed}>{feed}</option>
                  ))}
                </select>
                <button
                  onClick={handleFeedChange}
                  disabled={!canChangeFeed || user?.subscription === 'free'}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {t('horse.changeFeed')}
                </button>
              </div>
              {!canChangeFeed && (
                <p className="text-sm text-yellow-600 mt-1">
                  {t('horse.locked')} ({15 - daysSinceChange} days remaining)
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('horse.pastRaces')}
                </label>
                <div className="text-lg">{horse.pastRaces}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('horse.distanceCovered')}
                </label>
                <div className="text-lg">{horse.distanceCovered} km</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan={user?.subscription}
      />
    </div>
  )
}

export default HorseProfile
