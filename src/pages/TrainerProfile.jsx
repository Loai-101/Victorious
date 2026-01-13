import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { mockTrainers } from '../data/mockData'
import TrainerProfileModal from '../components/TrainerProfileModal'

const TrainerProfile = () => {
  const { t } = useTranslation()
  const [selectedTrainer, setSelectedTrainer] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openProfileModal = (trainer) => {
    setSelectedTrainer(trainer)
    setIsModalOpen(true)
  }

  const closeProfileModal = () => {
    setIsModalOpen(false)
    setSelectedTrainer(null)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Trainers</h1>

      {/* Trainer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockTrainers.map((trainer) => (
          <div
            key={trainer.id}
            onClick={() => openProfileModal(trainer)}
            className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <div className="relative h-48 bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
              <img
                src={trainer.profileImage || 'https://res.cloudinary.com/dvybb2xnc/image/upload/v1768198383/121199422_209359507247292_874482859999089046_n_ajrbdv.jpg'}
                alt={trainer.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{trainer.name}</h3>
              <p className="text-gray-600 mb-1">
                <span className="font-semibold">Specialization:</span> {trainer.specialization}
              </p>
              <p className="text-gray-600 mb-1">
                <span className="font-semibold">Experience:</span> {trainer.yearsOfExperience} years
              </p>
              <p className="text-gray-600 mb-1">
                <span className="font-semibold">Stable:</span> {trainer.stableName}
              </p>
              <p className="text-gray-600 mb-4">
                <span className="font-semibold">Horses:</span> {trainer.totalActiveHorses} active
              </p>
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  trainer.status === 'Active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {trainer.status}
                </span>
                <span className="text-sm text-red-600 font-medium hover:text-red-800">
                  View Profile →
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Trainer Profile Modal */}
      <TrainerProfileModal
        isOpen={isModalOpen}
        onClose={closeProfileModal}
        trainer={selectedTrainer}
      />
    </div>
  )
}

export default TrainerProfile
