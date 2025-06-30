import React, { useState } from 'react'
import { FileText, ArrowLeft, ArrowRight, Lightbulb, Sparkles } from 'lucide-react'

const TextInput = ({ value = '', onChange, className = '' }) => {
  const [charCount, setCharCount] = useState(value.length || 0)

  const handleTextChange = (e) => {
    const text = e.target.value
    onChange(text)
    setCharCount(text.length)
  }

  const suggestions = [
    "A futuristic robot with sleek metallic design",
    "A magical crystal with glowing energy",
    "A vintage car with chrome details",
    "A fantasy creature with wings and scales",
    "A modern smartphone with holographic display",
    "A steampunk gadget with brass and copper",
    "A space station with solar panels",
    "A medieval sword with ornate engravings"
  ]

  const insertSuggestion = (suggestion) => {
    onChange(suggestion)
    setCharCount(suggestion.length)
  }

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      <div className="card">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Describe Your Model</h2>
          <p className="text-gray-600">
            Provide a detailed description to help the AI generate exactly what you envision
          </p>
        </div>

        <div className="space-y-6">
          {/* Text Input */}
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
              Model Description
            </label>
            <textarea
              id="prompt"
              value={value}
              onChange={handleTextChange}
              placeholder="Describe the 3D model you want to generate... (e.g., 'A futuristic robot with sleek metallic design, glowing blue eyes, and articulated joints')"
              className="input-field h-32 resize-none"
              maxLength={500}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm text-gray-500">
                Be specific about materials, colors, style, and details
              </p>
              <p className="text-sm text-gray-500">
                {charCount}/500
              </p>
            </div>
          </div>

          {/* Suggestions */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              <h3 className="text-sm font-medium text-gray-700">Quick Suggestions</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => insertSuggestion(suggestion)}
                  className="text-left p-3 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors duration-200"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Tips for Better Results</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Include specific materials (metal, wood, glass, etc.)</li>
                  <li>• Mention colors and lighting effects</li>
                  <li>• Describe the style (realistic, cartoon, abstract)</li>
                  <li>• Add details about textures and finishes</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TextInput 