import React from 'react'

const TypingIndicator = () => {
  return (
    <div className="flex justify-start mb-4">
      <div className="flex flex-row items-start gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 shadow-md border-2 border-red-600">
          <img 
            src="https://res.cloudinary.com/dvybb2xnc/image/upload/v1768198383/121199422_209359507247292_874482859999089046_n_ajrbdv.jpg" 
            alt="Victoris Agent" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TypingIndicator
