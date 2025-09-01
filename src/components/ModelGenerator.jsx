import React, { useState, useEffect, useRef } from 'react'
import { Play, Zap, Clock, Upload, X, Image as ImageIcon } from 'lucide-react'

const ModelGenerator = ({ selectedImage, textPrompt, options, onOptionsChange, onGenerate, isGenerating, progress, availableFormats, generationOptionsConfig, canGenerate, className = '', onImageChange, onTextPromptChange }) => {
  const [imagePreview, setImagePreview] = useState(null)
  const [localSelectedImage, setLocalSelectedImage] = useState(selectedImage)
  const [localTextPrompt, setLocalTextPrompt] = useState(textPrompt)
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [showPromptEdit, setShowPromptEdit] = useState(false)
  const fileInputRef = useRef(null)

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

  // Update local state when props change
  useEffect(() => {
    setLocalSelectedImage(selectedImage)
    setLocalTextPrompt(textPrompt)
  }, [selectedImage, textPrompt])

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)')
        return
      }

      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        alert('File size must be less than 10MB')
        return
      }

      setLocalSelectedImage(file)
      setShowImageUpload(false)
      
      // Call parent callback to update the image
      if (onImageChange) {
        onImageChange(file)
      }
    }
  }

  const handleDragOver = (event) => {
    event.preventDefault()
  }

  const handleDrop = (event) => {
    event.preventDefault()
    const files = event.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      // Simulate file input change
      const fakeEvent = { target: { files: [file] } }
      handleFileSelect(fakeEvent)
    }
  }

  const handleRemoveImage = () => {
    setLocalSelectedImage(null)
    setImagePreview(null)
    setShowImageUpload(false)
    
    // Call parent callback to clear the image
    if (onImageChange) {
      onImageChange(null)
    }
  }

  const handlePromptSave = () => {
    if (onTextPromptChange) {
      onTextPromptChange(localTextPrompt)
    }
    setShowPromptEdit(false)
  }

  const handlePromptCancel = () => {
    setLocalTextPrompt(textPrompt)
    setShowPromptEdit(false)
  }

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
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-blue-900">How to use</h4>
                <ul className="mt-2 text-sm text-blue-700 space-y-1">
                  <li>• Upload or change your reference image using the buttons above</li>
                  <li>• Edit the description to customize your 3D model generation</li>
                  <li>• Click "Generate Model" when you're ready to create your 3D model</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Input Summary */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Input Summary</h3>
            
            {/* Image Upload Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-700">Reference Image</h4>
                <div className="flex space-x-2">
                  {!showImageUpload && (
                    <button
                      onClick={() => setShowImageUpload(true)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Upload className="w-4 h-4 mr-1" />
                      {localSelectedImage ? 'Change Image' : 'Upload Image'}
                    </button>
                  )}
                  {localSelectedImage && (
                    <button
                      onClick={handleRemoveImage}
                      className="inline-flex items-center px-3 py-1.5 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Image Upload Area */}
              {showImageUpload && (
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors mb-4 ${
                    'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <div className="space-y-4">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div>
                      <p className="text-lg font-medium text-gray-900">
                        Upload a reference image
                      </p>
                      <p className="text-sm text-gray-500">
                        Drag and drop an image here, or click to browse
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Choose File
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowImageUpload(false)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Image Preview */}
              {localSelectedImage && (
                <div className="space-y-3">
                  <img
                    src={imagePreview}
                    alt="Reference"
                    className="w-full h-48 object-contain rounded-lg"
                  />
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>
                      {localSelectedImage.name || 'Reference Image'} 
                      {localSelectedImage.size && (
                        <span> ({(localSelectedImage.size / 1024 / 1024).toFixed(2)} MB)</span>
                      )}
                    </span>
                  </div>
                </div>
              )}

              {!localSelectedImage && !showImageUpload && (
                <div className="text-center py-8 text-gray-500">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                  <p>No reference image selected</p>
                  <p className="text-sm">Upload an image to get started</p>
                </div>
              )}
            </div>

            {/* Text Prompt */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-700">Description</h4>
                <button
                  onClick={() => setShowPromptEdit(true)}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
              </div>
              
              {showPromptEdit ? (
                <div className="space-y-3">
                  <textarea
                    value={localTextPrompt}
                    onChange={(e) => setLocalTextPrompt(e.target.value)}
                    rows={3}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Enter a description for your 3D model..."
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handlePromptSave}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Save
                    </button>
                    <button
                      onClick={handlePromptCancel}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 text-sm">{localTextPrompt}</p>
              )}
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
                disabled={!canGenerate || isGenerating || !localSelectedImage}
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