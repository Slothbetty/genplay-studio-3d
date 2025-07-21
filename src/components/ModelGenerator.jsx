import React, { useState, useEffect } from 'react'
import { Play, Zap, Clock } from 'lucide-react'

const ModelGenerator = ({ selectedImage, textPrompt, options, onOptionsChange, onGenerate, isGenerating, progress, availableFormats, generationOptionsConfig, canGenerate, className = '' }) => {
  const [imagePreview, setImagePreview] = useState(null)

  // Create preview URL when selectedImage changes
  useEffect(() => {
    if (selectedImage) {
      let previewUrl;

      if (typeof selectedImage === 'string') {
        // It's a data URL string
        previewUrl = selectedImage;
        setImagePreview(previewUrl);
      } else if (selectedImage instanceof File) {
        // It's a File object
        previewUrl = URL.createObjectURL(selectedImage);
        setImagePreview(previewUrl);

        // Cleanup function to revoke the URL when component unmounts
        return () => {
          URL.revokeObjectURL(previewUrl);
        };
      } else if (selectedImage.url) {
        // It's an object with a url property
        previewUrl = selectedImage.url;
        setImagePreview(previewUrl);
      }
    }
  }, [selectedImage]);

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      <div className="card">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Generate Your AI Model</h2>
          <p className="text-gray-600">
            Review your inputs and generate the 3D model using our advanced AI
          </p>
        </div>

        <div className="space-y-6">
          {/* Input Summary */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Input Summary</h3>
            
            {/* Image Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-700 mb-2">Reference Image</h4>
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Reference"
                  className="w-full h-48 object-contain rounded-lg"
                />
              )}
              {selectedImage && (
                <p className="text-sm text-gray-500 mt-2">
                  {selectedImage.name} ({(selectedImage.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            {/* Text Prompt */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-700 mb-2">Description</h4>
              <p className="text-gray-600 text-sm">{textPrompt}</p>
            </div>

            {/* AI Info */}
            {/* Removed Tripo AI Processing branding */}

            {/* Progress Bar */}
            {isGenerating && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <div>
                    <p className="font-medium text-blue-900">Generating your model...</p>
                    <p className="text-sm text-blue-700">{progress}% complete</p>
                  </div>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center pt-4">
              <button
                onClick={() => {
                  if (canGenerate && !isGenerating) {
                    onGenerate()
                  } else {
                  }
                }}
                className="btn-primary flex items-center space-x-2"
                disabled={!canGenerate || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    <span>Generate Model</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Estimated Time */}
        {!isGenerating && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-900">Estimated Generation Time</p>
                <p className="text-sm text-yellow-700">2-3 minutes depending on model complexity</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ModelGenerator 