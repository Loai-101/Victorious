import React from 'react'

const ChatMessage = ({ message, isBot, timestamp }) => {
  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-4`}>
      <div className={`flex ${isBot ? 'flex-row' : 'flex-row-reverse'} items-start gap-3 max-w-3xl`}>
        {isBot && (
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 shadow-md border-2 border-red-600">
            <img 
              src="https://res.cloudinary.com/dvybb2xnc/image/upload/v1768198383/121199422_209359507247292_874482859999089046_n_ajrbdv.jpg" 
              alt="Victoris Agent" 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className={`rounded-2xl px-4 py-3 shadow-sm ${
          isBot 
            ? 'bg-white border border-gray-200 text-gray-900' 
            : 'bg-gradient-to-r from-red-600 to-red-700 text-white'
        }`}>
          <div className="whitespace-pre-wrap break-words">{message}</div>
          {timestamp && (
            <div className={`text-xs mt-2 ${isBot ? 'text-gray-500' : 'text-red-100'}`}>
              {timestamp}
            </div>
          )}
        </div>
        {!isBot && (
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
            <span className="text-gray-600 font-bold text-sm">You</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatMessage
