import React, { useState } from 'react'

const TagMultiSelect = ({ options, selected = [], onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleOption = (option) => {
    if (selected.includes(option)) {
      onChange(selected.filter(item => item !== option))
    } else {
      onChange([...selected, option])
    }
  }

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      )}
      <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border border-gray-300 rounded-md bg-white">
        {selected.length === 0 ? (
          <span className="text-gray-400 text-sm">No tags selected</span>
        ) : (
          selected.map((option) => (
            <span
              key={option}
              className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium"
            >
              {option}
              <button
                onClick={() => toggleOption(option)}
                className="hover:text-red-900"
              >
                ×
              </button>
            </span>
          ))
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="ml-auto px-2 py-1 text-sm text-gray-600 hover:text-gray-900"
        >
          {isOpen ? '−' : '+'}
        </button>
      </div>
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => toggleOption(option)}
              className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                selected.includes(option) ? 'bg-red-50' : ''
              }`}
            >
              <span className={selected.includes(option) ? 'font-medium' : ''}>
                {option}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default TagMultiSelect
