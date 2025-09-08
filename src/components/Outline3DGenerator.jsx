import React, { useState, useEffect } from 'react'
import { svgToStlService } from '../services/svgToStlService'
import StlViewer from './StlViewer'

export default function Outline3DGenerator({ 
  svgContent, 
  onGenerationComplete, 
  onGoBack = () => {},
  onError = () => {},
  onContinue = () => {}
}) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState({ status: 'idle', message: '' })
  const [generatedStl, setGeneratedStl] = useState(null)
  const [conversionOptions, setConversionOptions] = useState({
    format: 'stl',
    depth: 2,
    size: 100
  })

  const handleGenerate = async () => {
    if (!svgContent) {
      onError('No SVG content available for conversion')
      return
    }

    setIsGenerating(true)
    setProgress({ status: 'starting', message: 'Starting 3D generation...' })

    try {
      const result = await svgToStlService.convertWithProgress(
        svgContent,
        conversionOptions,
        (progressUpdate) => {
          setProgress(progressUpdate)
        }
      )

      setGeneratedStl(result)
      setProgress({ status: 'completed', message: '3D model generated successfully!' })
      
      if (onGenerationComplete) {
        onGenerationComplete(result)
      }
    } catch (error) {
      console.error('3D generation error:', error)
      setProgress({ status: 'error', message: error.message })
      onError(error.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = async () => {
    if (!generatedStl?.downloadUrl) {
      onError('No STL file available for download')
      return
    }

    try {
      await svgToStlService.downloadStlFile(generatedStl.downloadUrl, 'outline-art-model.stl')
    } catch (error) {
      onError(`Download failed: ${error.message}`)
    }
  }

  const getProgressColor = () => {
    switch (progress.status) {
      case 'starting':
        return 'text-blue-600'
      case 'processing':
        return 'text-purple-600'
      case 'generating':
        return 'text-orange-600'
      case 'finalizing':
        return 'text-indigo-600'
      case 'completed':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getProgressIcon = () => {
    switch (progress.status) {
      case 'starting':
        return '🔄'
      case 'processing':
        return '⚙️'
      case 'generating':
        return '🏗️'
      case 'finalizing':
        return '✨'
      case 'completed':
        return '✅'
      case 'error':
        return '❌'
      default:
        return '📋'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          3D Generate
        </h2>
        <p className="text-gray-600">
          {svgContent 
            ? "Convert your uploaded SVG to a 3D STL model" 
            : "Convert your outline art SVG to a 3D STL model"
          }
        </p>
        {svgContent && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
            <p className="text-sm text-green-700">
              ✅ SVG file ready! You can now generate the 3D model directly.
            </p>
          </div>
        )}
      </div>

      {/* Conversion Options - Hidden when model is generated */}
      {!generatedStl && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Conversion Options</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Format
              </label>
              <select
                value={conversionOptions.format}
                onChange={(e) => setConversionOptions(prev => ({ ...prev, format: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isGenerating}
              >
                <option value="stl">STL</option>
                <option value="obj">OBJ</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Depth
              </label>
              <input
                type="number"
                min="0.5"
                max="10"
                step="0.5"
                value={conversionOptions.depth}
                onChange={(e) => setConversionOptions(prev => ({ ...prev, depth: parseFloat(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isGenerating}
              />
              <p className="text-xs text-gray-500 mt-1">Model thickness (mm)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Size
              </label>
              <input
                type="number"
                min="10"
                max="500"
                step="10"
                value={conversionOptions.size}
                onChange={(e) => setConversionOptions(prev => ({ ...prev, size: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isGenerating}
              />
              <p className="text-xs text-gray-500 mt-1">Model size (mm)</p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Display */}
      {progress.message && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getProgressIcon()}</span>
            <div>
              <p className={`font-medium ${getProgressColor()}`}>
                {progress.message}
              </p>
              {isGenerating && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        progress.status === 'starting' ? 'bg-blue-600 animate-pulse' :
                        progress.status === 'processing' ? 'bg-purple-600 animate-pulse' :
                        progress.status === 'generating' ? 'bg-orange-600 animate-pulse' :
                        progress.status === 'finalizing' ? 'bg-indigo-600 animate-pulse' :
                        'bg-blue-600 animate-pulse'
                      }`}
                      style={{ 
                        width: progress.status === 'starting' ? '25%' :
                               progress.status === 'processing' ? '50%' :
                               progress.status === 'generating' ? '75%' :
                               progress.status === 'finalizing' ? '90%' :
                               '60%'
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {progress.status === 'starting' ? 'Preparing conversion...' :
                     progress.status === 'processing' ? 'Analyzing SVG structure...' :
                     progress.status === 'generating' ? 'Building 3D geometry...' :
                     progress.status === 'finalizing' ? 'Optimizing model...' :
                     'Processing...'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Generated Model Display */}
      {generatedStl && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Generated 3D Model</h3>
          
          <div className="space-y-6">
            {/* Success message */}
            <div className="text-center">
              <div className="text-green-600">
                <span className="text-4xl">🎉</span>
                <p className="text-lg font-medium mt-2">3D Model Ready!</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <p className="text-sm text-gray-600">
                  Your outline art has been successfully converted to a 3D STL model.
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Format: {generatedStl.format || 'STL'} | 
                  Size: {conversionOptions.size}mm | 
                  Depth: {conversionOptions.depth}mm
                </p>
              </div>
            </div>

            {/* 3D Model Viewer */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">3D Preview</h4>
              <StlViewer 
                stlUrl={generatedStl.stlUrl || generatedStl.downloadUrl}
                className="w-full h-[600px]"
                onModelLoad={(geometry) => {
                  // STL model loaded successfully
                }}
                onModelError={(error) => {
                  console.error('STL model loading error:', error)
                }}
              />
            </div>

            {/* Download buttons are now in the StlViewer component */}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between">
        <button
          onClick={onGoBack}
          className="btn-secondary"
          disabled={isGenerating}
        >
          ← Back to Image
        </button>

        {!generatedStl && (
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !svgContent}
            className="btn-primary"
          >
            {isGenerating 
              ? '🔄 Generating...' 
              : svgContent 
                ? '🚀 Generate 3D Model from SVG' 
                : '🚀 Generate 3D Model'
            }
          </button>
        )}

        {generatedStl && (
          <button
            onClick={() => {
              if (onGenerationComplete) {
                onGenerationComplete(generatedStl)
              }
              if (onContinue) {
                onContinue()
              }
            }}
            className="btn-primary"
          >
            Complete →
          </button>
        )}
      </div>
    </div>
  )
}
