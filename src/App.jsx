import React, { useState, useEffect } from 'react'
import { STYLE_OPTIONS } from './styleOptions'
import Header from './components/Header'
import ImageUpload from './components/ImageUpload'
import ModelGenerator from './components/ModelGenerator'
import ModelViewer from './components/ModelViewer'
import ImageEdit from './components/ImageEdit'
import Outline3DGenerator from './components/Outline3DGenerator'
import StlViewer from './components/StlViewer'
import { tripo3DService } from './services/api'
import { LandingPage } from './components/landing/LandingPage'
import { AboutPage } from './components/AboutPage'

function App() {
  const [currentView, setCurrentView] = useState('landing') // 'landing', 'app', or 'about'
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedStyle, setSelectedStyle] = useState(null)
  const [selectedStylePrompt, setSelectedStylePrompt] = useState("")
  const [selectedImage, setSelectedImage] = useState(null)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [uploadedFileId, setUploadedFileId] = useState(null)
  const [shouldUploadImage, setShouldUploadImage] = useState(false)
  const [textPrompt, setTextPrompt] = useState('Generate a 3D model from this image') // Default prompt
  const [svgContent, setSvgContent] = useState(null) // For outline art SVG content
  const [generatedStl, setGeneratedStl] = useState(null) // For generated STL model
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
  const [editedImageUrl, setEditedImageUrl] = useState(null)


  // Handle URL routing
  useEffect(() => {
    const handleRouteChange = () => {
      const path = window.location.pathname
      if (path === '/app' || path === '/app/') {
        setCurrentView('app')
      } else if (path === '/app/about') {
        setCurrentView('about')
      } else {
        setCurrentView('landing')
      }
    }

    // Handle initial route
    handleRouteChange()

    // Listen for browser navigation (back/forward buttons)
    window.addEventListener('popstate', handleRouteChange)

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('popstate', handleRouteChange)
    }
  }, [])

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
    setUploadedFile(uploadResult)
    setUploadedFileId(uploadResult.id)
    
    // Move to next step after successful upload
    setCurrentStep(2)
  }

  const handleOptionsChange = (newOptions) => {
    setGenerationOptions(newOptions)
  }

  const handleSvgConverted = (svgData) => {
    setSvgContent(svgData)
  }

  const handleStlGenerated = (stlData) => {
    setGeneratedStl(stlData)
  }

  const handleGenerateModel = async () => {
    // For Outline Art, we don't need to generate a 3D model - the SVG board is the result
    if (selectedStyle === 'outline') {
      setError('Outline Art Style uses SVG Board Editor instead of 3D generation')
      return;
    }
    
    if (!selectedImage) {
      setError('Please select an image')
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    setError(null);
    setGeneratedModel(null);

    try {
      // Upload the file first
      const uploadResult = await tripo3DService.uploadFile(selectedImage);
      const uploadedFileId = uploadResult.data?.image_token;

      if (!uploadedFileId) {
        throw new Error('Failed to upload image for 3D generation');
      }

      // Start generation
      const fileToken = uploadResult.data?.image_token;
      const generationResult = await tripo3DService.generateModel({
        fileToken,
        prompt: textPrompt,
        options: generationOptions
      });

      // Check if we have a valid generation ID
      const generationId = generationResult.data?.id || generationResult.data?.task_id || generationResult.id || generationResult.task_id;
      if (!generationId) {
        throw new Error('No generation ID received from API');
      }

      // Monitor task status using HTTP polling with progress updates
      const finalResult = await tripo3DService.monitorTaskStatus(generationId, (progressData) => {
        if (progressData.progress !== undefined) {
          setGenerationProgress(progressData.progress);
        }
      });

      // Check if generation was successful
      const taskData = finalResult.data;
      if (taskData.status === 'success' && taskData.result?.pbr_model?.url) {
        setIsGenerating(false);
        setGenerationProgress(100);

        // Use the PBR model URL directly - no need to download
        const modelUrl = taskData.result.pbr_model.url;

        setGeneratedModel({
          id: taskData.task_id,
          url: modelUrl,
          format: taskData.result.pbr_model.type || 'glb',
          prompt: textPrompt,
          image: selectedImage,
          createdAt: new Date().toISOString()
        });

        setCurrentStep(3); // Move to viewer
      } else if (taskData.status === 'failed') {
        setIsGenerating(false);
        setError('Model generation failed. Please try again.');
      } else {
        setIsGenerating(false);
        setError('Generation completed but no model was produced.');
      }

    } catch (error) {
      setIsGenerating(false);
      setError(`Generation failed: ${error.message}`);
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
  const canGenerate = (selectedImage !== null && !isGenerating) || 
                     (editedImageUrl !== null && !isGenerating)

  const navigateToApp = () => {
    setCurrentView('app')
    window.history.pushState({}, '', '/app')
  }

  const navigateToLanding = () => {
    setCurrentView('landing')
    window.history.pushState({}, '', '/')
  }

  const navigateToAbout = () => {
    setCurrentView('about')
    window.history.pushState({}, '', '/app/about')
  }

  // Show landing page, about page, or app based on current view
  if (currentView === 'landing') {
    return <LandingPage onNavigateToApp={navigateToApp} />
  }

  if (currentView === 'about') {
    return <AboutPage onNavigateToLanding={navigateToLanding} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onNavigateToLanding={navigateToLanding} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
                     <div className="flex items-center justify-center space-x-4">
             {/* All styles now have 4 steps */}
             {[0, 1, 2, 3].map((step) => (
               <div key={step} className="flex items-center">
                 <div
                   className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                     currentStep >= step
                       ? 'bg-blue-600 text-white'
                       : 'bg-gray-200 text-gray-600'
                   }`}
                 >
                   {step + 1}
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
             <span className={currentStep >= 0 ? 'text-blue-600 font-medium' : ''}>
               Select Style
             </span>
             <span className={currentStep >= 1 ? 'text-blue-600 font-medium' : ''}>
               Image Generate
             </span>
             <span className={currentStep >= 2 ? 'text-blue-600 font-medium' : ''}>
               3D Generate
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
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Select Style
                </h2>
                <p className="text-gray-600">
                  Choose a style for your image. Each style has a unique, fixed prompt.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {STYLE_OPTIONS.map((style) => {
                  const isOther = style.id === 'other';
                  return (
                    <button
                      key={style.id}
                      className={
                        isOther
                          ? 'border-2 border-dashed border-gray-400 bg-gray-100 text-center flex flex-col items-center justify-center opacity-70 cursor-not-allowed p-6'
                          : `border rounded-lg p-4 text-left transition-all duration-200 ${selectedStyle === style.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'}`
                      }
                      onClick={() => {
                        if (!isOther) {
                          setSelectedStyle(style.id);
                          setSelectedStylePrompt(style.prompt);
                          setCurrentStep(1);
                        }
                      }}
                      disabled={isOther}
                      style={isOther ? { pointerEvents: 'none' } : {}}
                    >
                      {isOther ? (
                        <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M8 12h8M12 8v8" /></svg>
                      ) : (
                        style.image && (
                          <img src={style.image} alt={style.name} className="w-20 h-20 object-contain mb-2 mx-auto" />
                        )
                      )}
                      <div className="font-bold text-lg mb-1">{style.name}</div>
                      {style.description && (
                        <div className="text-sm text-gray-500">{style.description}</div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Style-specific header for Funko Pop and Outline Art */}
              {(selectedStyle === 'funko' || selectedStyle === 'outline') && (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 text-center">
                  <h3 className="text-lg font-semibold text-purple-900 mb-1">
                    {selectedStyle === 'funko' ? '🎯 Funko Pop Style' : '✏️ Outline Art Style'}
                  </h3>
                  <p className="text-sm text-purple-700">
                    {selectedStyle === 'funko' 
                      ? 'Creating a Funko Pop-inspired character from your image'
                      : 'Generating outline art and converting to SVG format'
                    }
                  </p>
                </div>
              )}
              
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Image Generate
                </h2>
                <p className="text-gray-600">
                  {selectedStyle === 'outline' 
                    ? 'Upload an image. The selected style will be used to generate your image, then convert it to SVG format.'
                    : 'Upload an image. The selected style will be used to generate your image.'
                  }
                </p>
              </div>
                             <ImageEdit 
                 prompt={selectedStylePrompt} 
                 existingImageUrl={editedImageUrl}
                 styleId={selectedStyle}
                 onImageEdited={(url) => { 
                   setEditedImageUrl(url);
                   // Convert data URL to File and store in selectedImage
                   if (url && url.startsWith('data:')) {
                     try {
                       const arr = url.split(',');
                       if (arr.length >= 2) {
                         const mimeMatch = arr[0].match(/:(.*?);/);
                         if (mimeMatch && mimeMatch[1]) {
                           const mime = mimeMatch[1];
                           const bstr = atob(arr[1]);
                           let n = bstr.length;
                           const u8arr = new Uint8Array(n);
                           while (n--) {
                             u8arr[n] = bstr.charCodeAt(n);
                           }
                           const file = new File([u8arr], 'generated-image.png', { type: mime });
                           setSelectedImage(file);
                         }
                       }
                     } catch (error) {
                       console.error('Error processing image URL:', error);
                       // Fallback: try to create a file from the URL directly
                       if (url.startsWith('blob:')) {
                         // Handle blob URLs
                         fetch(url)
                           .then(res => res.blob())
                           .then(blob => {
                             const file = new File([blob], 'generated-image.png', { type: 'image/png' });
                             setSelectedImage(file);
                           })
                           .catch(err => console.error('Error creating file from blob:', err));
                       }
                     }
                   } else if (url && url.startsWith('blob:')) {
                     // Handle blob URLs
                     fetch(url)
                       .then(res => res.blob())
                       .then(blob => {
                         const file = new File([blob], 'generated-image.png', { type: 'image/png' });
                         setSelectedImage(file);
                       })
                       .catch(err => console.error('Error creating file from blob:', err));
                   }
                 }}
                 onSvgConverted={handleSvgConverted}
                 hidePrompt 
                 onGoBack={() => {
                   setEditedImageUrl(null);
                   setSelectedImage(null);
                   
                   setCurrentStep(0);
                 }}
               />
                             
                             
                                                           {/* Show continue button for all styles when image is ready */}
                              {editedImageUrl && (
                                <div className="flex justify-center mt-4">
                                  <button
                                    className="btn-primary"
                                    onClick={() => {
                                      if (selectedStyle === 'outline') {
                                        // For Outline Art, go to 3D Generate step
                                        setCurrentStep(2)
                                      } else {
                                        // For other styles, go to 3D Generate step
                                        setCurrentStep(2)
                                      }
                                    }}
                                  >
                                    Continue to 3D Generate
                                  </button>
                                </div>
                              )}
            </div>
          )}

          {/* 3D Generate Step for Non-Outline Styles */}
          {currentStep === 2 && selectedStyle !== 'outline' && (
            <div className="space-y-6">
              {/* Style-specific header for Funko Pop */}
              {selectedStyle === 'funko' && (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 text-center">
                  <h3 className="text-lg font-semibold text-purple-900 mb-1">
                    🎯 Funko Pop Style
                  </h3>
                  <p className="text-sm text-purple-700">
                    Generating a 3D Funko Pop-style model from your image
                  </p>
                </div>
              )}
              
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  3D Generate
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
                onImageChange={handleImageSelect}
                onTextPromptChange={setTextPrompt}
              />
              
              <div className="flex justify-center space-x-4">
                <button onClick={handleBack} className="btn-secondary">
                  Back
                </button>
              </div>
            </div>
          )}

          

          {/* View Model Step for Non-Outline Styles */}
          {currentStep === 3 && generatedModel && selectedStyle !== 'outline' && (
            <div className="space-y-6">
              {/* Style-specific header for Funko Pop */}
              {selectedStyle === 'funko' && (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 text-center">
                  <h3 className="text-lg font-semibold text-purple-900 mb-1">
                    🎯 Funko Pop Style
                  </h3>
                  <p className="text-sm text-purple-700">
                    Your Funko Pop-style 3D model is ready!
                  </p>
                </div>
              )}
              
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
                modelTaskId={generatedModel.id}
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

          {/* 3D Generate Step for Outline Art Style */}
          {currentStep === 2 && selectedStyle === 'outline' && (
            <div className="space-y-6">
              {/* Style-specific header for Outline Art */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 text-center">
                <h3 className="text-lg font-semibold text-purple-900 mb-1">
                  ✏️ Outline Art Style
                </h3>
                <p className="text-sm text-purple-700">
                  Convert your outline art SVG to a 3D STL model
                </p>
              </div>
              
              <Outline3DGenerator
                svgContent={svgContent}
                onGenerationComplete={handleStlGenerated}
                onGoBack={() => setCurrentStep(1)}
                onError={(error) => setError(error)}
                onContinue={() => setCurrentStep(3)}
              />
            </div>
          )}

                     {/* View Model Step for Outline Art */}
           {currentStep === 3 && selectedStyle === 'outline' && (
            <div className="space-y-6">
              {/* Style-specific header for Outline Art */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 text-center">
                <h3 className="text-lg font-semibold text-purple-900 mb-1">
                  ✏️ Outline Art Style
                </h3>
                <p className="text-sm text-purple-700">
                  Your outline art 3D model is ready!
                </p>
              </div>
              
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Your 3D Model
                </h2>
                <p className="text-gray-600">
                  Your outline art has been converted to a 3D STL model
                </p>
              </div>
              
              {/* Generated Image Display */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4 text-center">Original Outline Art</h4>
                {editedImageUrl && (
                  <div className="text-center">
                    <img 
                      src={editedImageUrl} 
                      alt="Generated Outline Art" 
                      className="mx-auto border border-gray-300 rounded-lg"
                      style={{ maxWidth: '100%', height: 'auto' }}
                    />
                    <p className="text-sm text-gray-600 mt-2">
                      Your outline art image
                    </p>
                  </div>
                )}
              </div>

              {/* Generated STL Model Display */}
              {generatedStl && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 text-center">Generated 3D STL Model</h4>
                  
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
                          Size: {generatedStl.size || '100'}mm | 
                          Depth: {generatedStl.depth || '2'}mm
                        </p>
                      </div>
                    </div>

                    {/* 3D Model Viewer */}
                    <div>
                      <h5 className="text-md font-medium text-gray-900 mb-3 text-center">3D Model Preview</h5>
                      <StlViewer 
                        stlUrl={generatedStl.stlUrl || generatedStl.downloadUrl}
                        className="w-full h-[600px]"
                        onModelLoad={(geometry) => {
                          console.log('STL model loaded in view step:', geometry)
                        }}
                        onModelError={(error) => {
                          console.error('STL model loading error in view step:', error)
                        }}
                      />
                    </div>

                    {/* Download button */}
                    <div className="text-center">
                      <button
                        onClick={async () => {
                          try {
                            const { svgToStlService } = await import('./services/svgToStlService')
                            await svgToStlService.downloadStlFile(generatedStl.downloadUrl, 'outline-art-model.stl')
                          } catch (error) {
                            setError(`Download failed: ${error.message}`)
                          }
                        }}
                        className="btn-primary"
                      >
                        📥 Download STL File
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-center space-x-4">
                <button onClick={() => setCurrentStep(2)} className="btn-secondary">
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