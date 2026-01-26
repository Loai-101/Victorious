import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import ChatMessage from '../components/victoris-agent/ChatMessage'
import TypingIndicator from '../components/victoris-agent/TypingIndicator'
import { processMessage } from '../components/victoris-agent/ResponseGenerator'

const VictorisAgent = () => {
  const { t } = useTranslation()
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSend = () => {
    if (!inputValue.trim()) return

    const userMessage = inputValue.trim()
    setInputValue('')
    
    // Add user message
    const newUserMessage = {
      text: userMessage,
      isBot: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    setMessages(prev => [...prev, newUserMessage])

    // Show typing indicator
    setIsTyping(true)

    // Simulate typing delay
    setTimeout(() => {
      setIsTyping(false)
      const botResponse = processMessage(userMessage)
      const newBotMessage = {
        text: botResponse,
        isBot: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, newBotMessage])
    }, 1000 + Math.random() * 1000) // 1-2 second delay
  }

  const handleQuickButton = (text) => {
    setInputValue(text)
    inputRef.current?.focus()
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg rounded-xl overflow-hidden">
        <div className="px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/30 flex items-center justify-center">
              <img 
                src="https://res.cloudinary.com/dvybb2xnc/image/upload/v1768198383/121199422_209359507247292_874482859999089046_n_ajrbdv.jpg" 
                alt="Victoris Agent" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Victoris Agent</h1>
              <p className="text-red-100">Your intelligent assistant for horses, riders, and trainers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 280px)', minHeight: '600px' }}>
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-red-600 flex items-center justify-center mx-auto mb-4 shadow-md">
                  <img 
                    src="https://res.cloudinary.com/dvybb2xnc/image/upload/v1768198383/121199422_209359507247292_874482859999089046_n_ajrbdv.jpg" 
                    alt="Victoris Agent" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-lg font-medium mb-2">Welcome to Victoris Agent</p>
                <p className="text-sm">Ask me about horses, trainers, or riders to get started</p>
              </div>
            </div>
          )}
          
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              message={message.text}
              isBot={message.isBot}
              timestamp={message.timestamp}
            />
          ))}
          
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Buttons */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-3 font-medium">Quick Questions:</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleQuickButton('Tell me about Everest')}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:border-red-500 hover:text-red-600 transition-all"
            >
              Everest
            </button>
            <button
              onClick={() => handleQuickButton('Give me a report about the horses in training')}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:border-red-500 hover:text-red-600 transition-all"
            >
              Horses in Training
            </button>
            <button
              onClick={() => handleQuickButton('Tell me about the trainers')}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:border-red-500 hover:text-red-600 transition-all"
            >
              Trainers
            </button>
            <button
              onClick={() => handleQuickButton('Tell me about the riders')}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:border-red-500 hover:text-red-600 transition-all"
            >
              Riders
            </button>
          </div>
        </div>

        {/* Input Area */}
        <div className="px-6 py-4 bg-white border-t border-gray-200">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              disabled={isTyping}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-medium hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VictorisAgent
