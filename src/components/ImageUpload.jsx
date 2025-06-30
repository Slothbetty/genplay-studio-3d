import React, { useState, useRef, useEffect } from 'react'
import { Upload, X, FileText, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react'
import { tripo3DService } from '../services/api'

const ImageUpload = ({ onImageSelect, onUploadComplete, shouldUpload = false, className = '' }) => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState(null)
  const [uploadError, setUploadError] = useState(null)
  const [uploadedFileId, setUploadedFileId] = useState(null)
  const [uploadOptions, setUploadOptions] = useState({
    name: '',
    description: '',
    tags: [],
    visibility: 'private'
  })
  const [showUploadOptions, setShowUploadOptions] = useState(false)
  const fileInputRef = useRef(null)

  // Auto-upload when shouldUpload becomes true
  useEffect(() => {
    if (shouldUpload && selectedFile && !isUploading && !uploadedFileId) {
      handleUpload()
    }
  }, [shouldUpload, selectedFile, isUploading, uploadedFileId])

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

      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setUploadError(null)
      setUploadStatus(null)
      setUploadedFileId(null)
      
      // Auto-generate name from filename
      const fileName = file.name.replace(/\.[^/.]+$/, '') // Remove extension
      setUploadOptions(prev => ({
        ...prev,
        name: fileName
      }))

      // Call parent callback
      if (onImageSelect) {
        onImageSelect(file)
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

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadProgress(0)
    setUploadError(null)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Upload file to Tripo 3D
      console.log('Starting upload with options:', uploadOptions)
      const uploadResult = await tripo3DService.uploadFile(selectedFile, uploadOptions)
      
      console.log('Upload response:', uploadResult)
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      setUploadStatus('completed')
      
      // Handle different possible response structures
      let uploadId = null
      if (uploadResult.id) {
        uploadId = uploadResult.id
      } else if (uploadResult.upload_id) {
        uploadId = uploadResult.upload_id
      } else if (uploadResult.file_id) {
        uploadId = uploadResult.file_id
      } else if (uploadResult.data && uploadResult.data.image_token) {
        uploadId = uploadResult.data.image_token
      } else {
        // If no ID found, create a mock ID for now
        uploadId = `upload_${Date.now()}`
        console.warn('No upload ID found in response, using mock ID:', uploadId)
      }
      
      setUploadedFileId(uploadId)
      
      // Create a standardized upload result object
      const standardizedResult = {
        id: uploadId,
        name: uploadOptions.name || selectedFile.name,
        description: uploadOptions.description || '',
        file_url: uploadResult.file_url || uploadResult.url || null,
        file_size: selectedFile.size,
        file_type: selectedFile.type,
        status: 'completed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tags: uploadOptions.tags || [],
        visibility: uploadOptions.visibility || 'private',
        image_token: uploadResult.data?.image_token, // Store the original image_token
        ...uploadResult // Include any additional fields from the API response
      }
      
      // Call parent callback with upload result
      if (onUploadComplete) {
        onUploadComplete(standardizedResult)
      }

      console.log('File uploaded successfully:', standardizedResult)
    } catch (error) {
      console.error('Upload error details:', error)
      setUploadError(error.message)
      setUploadStatus('error')
      console.error('Upload failed:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setUploadProgress(0)
    setUploadStatus(null)
    setUploadError(null)
    setUploadedFileId(null)
    setUploadOptions({
      name: '',
      description: '',
      tags: [],
      visibility: 'private'
    })
    setShowUploadOptions(false)
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleTagInput = (event) => {
    const tags = event.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
    setUploadOptions(prev => ({ ...prev, tags }))
  }

  const getStatusIcon = () => {
    if (uploadStatus === 'completed') {
      return <CheckCircle className="w-5 h-5 text-green-500" />
    } else if (uploadStatus === 'error') {
      return <AlertCircle className="w-5 h-5 text-red-500" />
    }
    return null
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* File Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          selectedFile
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {!selectedFile ? (
          <div className="space-y-4">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div>
              <p className="text-lg font-medium text-gray-900">
                Upload an image
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
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <ImageIcon className="h-8 w-8 text-blue-500" />
              <span className="text-lg font-medium text-gray-900">
                {selectedFile.name}
              </span>
              {getStatusIcon()}
            </div>
            
            {previewUrl && (
              <div className="flex justify-center">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-32 max-w-full rounded-lg shadow-sm"
                />
              </div>
            )}

            <div className="flex items-center justify-center space-x-2">
              <button
                type="button"
                onClick={() => setShowUploadOptions(!showUploadOptions)}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FileText className="w-4 h-4 mr-1" />
                Upload Options
              </button>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="inline-flex items-center px-3 py-1.5 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <X className="w-4 h-4 mr-1" />
                Remove
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Options */}
      {showUploadOptions && selectedFile && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <h3 className="text-sm font-medium text-gray-900">Upload Options</h3>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                value={uploadOptions.name}
                onChange={(e) => setUploadOptions(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter a name for your upload"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Visibility
              </label>
              <select
                value={uploadOptions.visibility}
                onChange={(e) => setUploadOptions(prev => ({ ...prev, visibility: e.target.value }))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="private">Private</option>
                <option value="public">Public</option>
                <option value="unlisted">Unlisted</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={uploadOptions.description}
              onChange={(e) => setUploadOptions(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter a description for your upload"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={uploadOptions.tags.join(', ')}
              onChange={handleTagInput}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="tag1, tag2, tag3"
            />
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Uploading to Tripo 3D...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Upload Error */}
      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Upload failed
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {uploadError}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {uploadStatus === 'completed' && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Upload successful!
              </h3>
              <div className="mt-2 text-sm text-green-700">
                Your file has been uploaded to Tripo 3D platform.
                {uploadedFileId && (
                  <div className="mt-1 text-xs text-green-600">
                    File ID: {uploadedFileId}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageUpload 