import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import ImageUpload from './components/ImageUpload'
import ModelGenerator from './components/ModelGenerator'
import ModelViewer from './components/ModelViewer'
import { tripo3DService } from './services/api'

function App() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedImage, setSelectedImage] = useState(null)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [uploadedFileId, setUploadedFileId] = useState(null)
  const [shouldUploadImage, setShouldUploadImage] = useState(false)
  const [textPrompt, setTextPrompt] = useState('Generate a 3D model from this image') // Default prompt
  const [generationOptions, setGenerationOptions] = useState({
    quality: 'high',
    style: 'realistic',
    format: 'glb',
    resolution: '1024',
    seed: null,
    guidance_scale: 7.5,
    num_inference_steps: 50,
    // Tripo 3D specific options
    texture: false, // Set to false to get base model without textures
    pbr: true, // Enable PBR for better rendering
    model_version: 'v2.5-20250123', // Use latest stable version
    face_limit: null, // Let AI determine adaptively
    texture_quality: 'standard', // standard or detailed
    auto_size: false, // Don't auto-scale to real-world dimensions
    orientation: 'default', // default or align_image
    compress: '', // No compression by default
    smart_low_poly: false, // Don't generate low-poly meshes
    generate_parts: false // Don't generate segmented models
  })
  const [generatedModel, setGeneratedModel] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [error, setError] = useState(null)
  const [availableFormats, setAvailableFormats] = useState([])
  const [generationOptionsConfig, setGenerationOptionsConfig] = useState({})

  // Load available formats and generation options on component mount
  useEffect(() => {
    const loadApiConfig = async () => {
      // Set default values since these endpoints don't exist in Tripo 3D API
      setAvailableFormats([
        { id: 'glb', name: 'GLB', description: 'Binary glTF format' },
        { id: 'gltf', name: 'glTF', description: 'Text-based glTF format' },
        { id: 'obj', name: 'OBJ', description: 'Wavefront OBJ format' },
        { id: 'fbx', name: 'FBX', description: 'Autodesk FBX format' }
      ])
      
      setGenerationOptionsConfig({
        maxImageSize: 10485760, // 10MB
        supportedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        qualityOptions: [
          { value: 'low', label: 'Low', description: 'Fast generation, basic quality' },
          { value: 'medium', label: 'Medium', description: 'Balanced speed and quality' },
          { value: 'high', label: 'High', description: 'High quality, moderate speed' },
          { value: 'ultra', label: 'Ultra', description: 'Maximum quality, slower generation' }
        ],
        styleOptions: [
          { value: 'realistic', label: 'Realistic', description: 'Photorealistic rendering' },
          { value: 'cartoon', label: 'Cartoon', description: 'Stylized cartoon appearance' },
          { value: 'abstract', label: 'Abstract', description: 'Artistic abstract interpretation' },
          { value: 'stylized', label: 'Stylized', description: 'Custom artistic style' }
        ],
        resolutionOptions: [
          { value: '512', label: '512x512', description: 'Low resolution' },
          { value: '1024', label: '1024x1024', description: 'Medium resolution' },
          { value: '2048', label: '2048x2048', description: 'High resolution' }
        ],
        // Tripo 3D specific options
        modelVersionOptions: [
          { value: 'v2.5-20250123', label: 'v2.5 (Latest)', description: 'Latest stable version' },
          { value: 'v2.0-20240919', label: 'v2.0', description: 'Previous stable version' },
          { value: 'v1.4-20240625', label: 'v1.4', description: 'Legacy version' }
        ],
        textureQualityOptions: [
          { value: 'standard', label: 'Standard', description: 'Balanced texture quality' },
          { value: 'detailed', label: 'Detailed', description: 'High-resolution textures' }
        ],
        orientationOptions: [
          { value: 'default', label: 'Default', description: 'Standard orientation' },
          { value: 'align_image', label: 'Align to Image', description: 'Auto-align to original image' }
        ],
        compressionOptions: [
          { value: '', label: 'None', description: 'No compression' },
          { value: 'geometry', label: 'Geometry', description: 'Geometry-based compression' }
        ]
      })
    }

    loadApiConfig()
  }, [])

  const handleImageSelect = (file) => {
    setSelectedImage(file)
    setError(null)
    // Reset upload state when new image is selected
    setUploadedFile(null)
    setUploadedFileId(null)
    setShouldUploadImage(false)
  }

  const handleUploadComplete = (uploadResult) => {
    console.log('handleUploadComplete called with:', uploadResult)
    setUploadedFile(uploadResult)
    setUploadedFileId(uploadResult.id)
    console.log('File uploaded successfully:', uploadResult)
    console.log('uploadedFileId set to:', uploadResult.id)
    
    // Move to next step after successful upload
    setCurrentStep(2)
  }

  const handleOptionsChange = (newOptions) => {
    setGenerationOptions(newOptions)
  }

  const handleGenerateModel = async () => {
    console.log('handleGenerateModel called')
    console.log('selectedImage:', selectedImage)
    console.log('textPrompt:', textPrompt)
    console.log('uploadedFileId:', uploadedFileId)
    console.log('uploadedFile:', uploadedFile)
    console.log('generationOptions:', generationOptions)
    
    if (!selectedImage) {
      setError('Please select an image')
      return
    }

    if (!uploadedFileId) {
      console.error('uploadedFileId is null or undefined')
      console.error('uploadedFile:', uploadedFile)
      setError('Image must be uploaded to Tripo 3D before generation')
      return
    }

    setIsGenerating(true)
    setGenerationProgress(0)
    setError(null)
    setGeneratedModel(null)

    try {
      console.log('Calling tripo3DService.generateModel...')
      // Start generation
      const generationResult = await tripo3DService.generateModel({
        fileToken: uploadedFile.image_token,
        prompt: textPrompt,
        options: generationOptions
      })

      console.log('Generation started:', generationResult)
      console.log('Generation result keys:', Object.keys(generationResult))
      console.log('Generation result data:', generationResult.data)
      console.log('Generation result data keys:', Object.keys(generationResult.data))

      // Check if we have a valid generation ID
      const generationId = generationResult.data?.id || generationResult.data?.task_id || generationResult.id || generationResult.task_id
      if (!generationId) {
        throw new Error('No generation ID received from API')
      }

      console.log('Using generation ID:', generationId)

      // Monitor task status using HTTP polling with progress updates
      const finalResult = await tripo3DService.monitorTaskStatus(generationId, (progressData) => {
        console.log('Progress update:', progressData)
        if (progressData.progress !== undefined) {
          setGenerationProgress(progressData.progress)
        }
      })
      
      console.log('Generation completed:', finalResult)

      // Check if generation was successful
      const taskData = finalResult.data
      if (taskData.status === 'success' && taskData.result?.pbr_model?.url) {
        console.log('Generation completed successfully, moving to step 3')
        setIsGenerating(false)
        setGenerationProgress(100)
        
        // Use the PBR model URL directly - no need to download
        const modelUrl = taskData.result.pbr_model.url
        
        setGeneratedModel({
          id: taskData.task_id,
          url: modelUrl,
          format: taskData.result.pbr_model.type || 'glb',
          prompt: textPrompt,
          image: selectedImage,
          createdAt: new Date().toISOString()
        })
        
        setCurrentStep(3) // Move to viewer
      } else if (taskData.status === 'failed') {
        setIsGenerating(false)
        setError('Model generation failed. Please try again.')
      } else {
        setIsGenerating(false)
        setError('Generation completed but no model was produced.')
      }

    } catch (error) {
      console.error('Generation error:', error)
      setIsGenerating(false)
      setError(`Generation failed: ${error.message}`)
    }
  }

  const handleReset = () => {
    setCurrentStep(1)
    setSelectedImage(null)
    setUploadedFile(null)
    setUploadedFileId(null)
    setShouldUploadImage(false)
    setTextPrompt('Generate a 3D model from this image')
    setGeneratedModel(null)
    setError(null)
    setGenerationProgress(0)
    setIsGenerating(false)
  }

  const handleNext = () => {
    if (currentStep === 1 && selectedImage) {
      // Trigger upload when continuing from step 1
      setShouldUploadImage(true)
    } else if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceedToStep2 = selectedImage !== null
  const canGenerate = selectedImage !== null && !isGenerating && uploadedFileId !== null

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-12 h-1 mx-2 ${
                      currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-2 space-x-8 text-sm text-gray-600">
            <span className={currentStep >= 1 ? 'text-blue-600 font-medium' : ''}>
              Upload Image
            </span>
            <span className={currentStep >= 2 ? 'text-blue-600 font-medium' : ''}>
              Generate
            </span>
            <span className={currentStep >= 3 ? 'text-blue-600 font-medium' : ''}>
              View Model
            </span>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Upload Reference Image
                </h2>
                <p className="text-gray-600">
                  Upload a high-quality image to help the AI understand what you want to generate
                </p>
              </div>
              
              <ImageUpload
                onImageSelect={handleImageSelect}
                onUploadComplete={handleUploadComplete}
                shouldUpload={shouldUploadImage}
                className="max-w-2xl mx-auto"
              />
              
              <div className="flex justify-center">
                <button
                  onClick={handleNext}
                  disabled={!canProceedToStep2}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Generate 3D Model
                </h2>
                <p className="text-gray-600">
                  Configure generation options and create your 3D model
                </p>
              </div>
              
              <ModelGenerator
                selectedImage={selectedImage}
                textPrompt={textPrompt}
                options={generationOptions}
                onOptionsChange={handleOptionsChange}
                onGenerate={handleGenerateModel}
                isGenerating={isGenerating}
                progress={generationProgress}
                availableFormats={availableFormats}
                generationOptionsConfig={generationOptionsConfig}
                canGenerate={canGenerate}
                className="max-w-2xl mx-auto"
              />
              
              <div className="flex justify-center space-x-4">
                <button onClick={handleBack} className="btn-secondary">
                  Back
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && generatedModel && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Your 3D Model
                </h2>
                <p className="text-gray-600">
                  View and interact with your generated 3D model
                </p>
              </div>
              
              <ModelViewer
                modelUrl={generatedModel.url}
                format={generatedModel.format}
                className="max-w-4xl mx-auto"
              />
              
              <div className="flex justify-center space-x-4">
                <button onClick={handleBack} className="btn-secondary">
                  Back
                </button>
                <button onClick={handleReset} className="btn-primary">
                  Start Over
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App 