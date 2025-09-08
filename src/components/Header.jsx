import React from 'react'
import { Box, Sparkles, Home } from 'lucide-react'

const Header = ({ onNavigateToLanding }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={onNavigateToLanding}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <img 
                src="/images/logo.jpg?v=2" 
                alt="GenPlay AI Logo" 
                className="w-8 h-8 rounded-lg"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">GenPlay AI</h1>
              </div>
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={onNavigateToLanding}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span className="text-sm">Back to Home</span>
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 font-medium">Online</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header 