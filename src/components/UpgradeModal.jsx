import React from 'react'
import { useTranslation } from 'react-i18next'

const UpgradeModal = ({ isOpen, onClose, currentPlan }) => {
  const { t } = useTranslation()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">{t('pricing.upgrade')}</h2>
        <p className="text-gray-600 mb-6">
          This feature is only available in Pro or Enterprise plans. Upgrade now to unlock all features.
        </p>
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={() => {
              // Mock upgrade action
              onClose()
            }}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            {t('pricing.upgrade')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default UpgradeModal
