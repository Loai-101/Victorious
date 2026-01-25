import React, { useState, useRef, useEffect } from 'react'

const HorseSelector = ({ horses, selectedHorse, onSelectHorse }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredHorses = horses.filter(horse =>
    horse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    horse.profile?.feiPassportNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    horse.profile?.uelnNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center justify-between"
      >
        <span className="text-gray-700">
          {selectedHorse ? selectedHorse.name : 'Select a horse...'}
        </span>
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-96 overflow-hidden">
          <div className="p-2 border-b">
            <input
              type="text"
              placeholder="Search by name, passport, or microchip..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="overflow-y-auto max-h-80">
            {filteredHorses.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No horses found</div>
            ) : (
              filteredHorses.map((horse) => (
                <button
                  key={horse.id}
                  onClick={() => {
                    onSelectHorse(horse)
                    setIsOpen(false)
                    setSearchTerm('')
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-gray-900">{horse.name}</div>
                  <div className="text-sm text-gray-500">
                    Passport: {horse.profile?.feiPassportNumber || 'N/A'} | 
                    Microchip: {horse.profile?.uelnNumber || 'N/A'}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default HorseSelector
