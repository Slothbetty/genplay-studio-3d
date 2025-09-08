import React from 'react';
import { Button } from '../ui/button.jsx';

export function Header({ onNavigateToApp }) {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img 
              src="/images/logo.jpg" 
              alt="Genplay AI Logo" 
              className="w-8 h-8 rounded-lg object-cover"
            />
            <span className="text-xl font-bold text-gray-900">Genplay AI</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
              Features
            </a>
            <a href="#gallery" className="text-gray-600 hover:text-gray-900 transition-colors">
              Gallery
            </a>
            <a href="/app/about" className="text-gray-600 hover:text-gray-900 transition-colors">
              About
            </a>
          </nav>
          
          <div className="flex items-center">
            <Button 
              onClick={onNavigateToApp}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Start Creating
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
