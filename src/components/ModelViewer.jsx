import React, { useState, Suspense, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, useGLTF } from '@react-three/drei'
import { Download, Share2, Home, RotateCcw, Maximize2, Minimize2, Copy } from 'lucide-react'

// GLB Model component that loads the actual generated model
const GLBModel = ({ modelUrl, onError, onLoad }) => {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [localModelUrl, setLocalModelUrl] = useState(null)
  
  // Use proxy server to avoid CORS issues with Tripo 3D CDN
  const proxyUrl = import.meta.env.DEV 
    ? `http://localhost:3001/api/download?url=${encodeURIComponent(modelUrl)}`
    : `${import.meta.env.VITE_RENDER_PROXY_URL || 'https://genplay-proxy.onrender.com'}/api/download?url=${encodeURIComponent(modelUrl)}`
  
  console.log('Original model URL:', modelUrl)
  console.log('Proxy URL:', proxyUrl)
  
  useEffect(() => {
    let isMounted = true
    
    const loadModel = async () => {
      try {
        setIsLoading(true)
        setHasError(false)
        
        // Download the model through our proxy
        console.log('Downloading model through proxy...')
        const response = await fetch(proxyUrl)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        // Create blob and local URL
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        console.log('Model downloaded, created local URL:', url)
        
        if (isMounted) {
          setLocalModelUrl(url)
          setIsLoading(false)
        }
        
      } catch (error) {
        console.error('Error downloading model:', error)
        if (isMounted) {
          setHasError(true)
          setIsLoading(false)
          if (onError) onError(error)
        }
      }
    }
    
    loadModel()
    
    return () => {
      isMounted = false
      // Clean up local URL when component unmounts
      if (localModelUrl) {
        URL.revokeObjectURL(localModelUrl)
      }
    }
  }, [proxyUrl, onError])
  
  // If loading or has error, return null (will be handled by parent)
  if (isLoading || hasError || !localModelUrl) {
    return null
  }
  
  // Try to load the model with useGLTF using the local URL
  try {
    console.log('Attempting to load GLTF from local URL:', localModelUrl)
    const gltf = useGLTF(localModelUrl)
    console.log('GLTF loaded:', gltf)
    console.log('GLTF scene:', gltf?.scene)
    console.log('GLTF animations:', gltf?.animations)
    
    if (!gltf) {
      throw new Error('GLTF loader returned null or undefined')
    }
    
    if (!gltf.scene) {
      throw new Error('No scene data received from GLTF loader')
    }
    
    // Call onLoad when model is successfully loaded
    if (onLoad) {
      onLoad()
    }
    
    return <primitive object={gltf.scene} />
    
  } catch (error) {
    console.error('Failed to load model with useGLTF:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      localModelUrl,
      proxyUrl,
      modelUrl
    })
    setHasError(true)
    if (onError) onError(error)
    return null
  }
}

// Fallback component while model is loading
const LoadingModel = () => {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#6b7280" wireframe />
    </mesh>
  )
}

const ModelViewer = ({ modelUrl, format, className = '', onReset }) => {
  const [autoRotate, setAutoRotate] = useState(true)
  const [viewMode, setViewMode] = useState('perspective')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [modelError, setModelError] = useState(null)
  const [isModelLoading, setIsModelLoading] = useState(true)

  console.log('ModelViewer received modelUrl:', modelUrl)
  console.log('ModelViewer received format:', format)

  const handleModelError = (error) => {
    console.error('Model error:', error)
    setModelError(error.message)
    setIsModelLoading(false)
  }

  const handleModelLoad = () => {
    setIsModelLoading(false)
    setModelError(null)
  }

  const handleDownload = async () => {
    try {
      // Use the proxy server to download the model
      const proxyUrl = import.meta.env.DEV 
        ? `http://localhost:3001/api/download?url=${encodeURIComponent(modelUrl)}`
        : `${import.meta.env.VITE_RENDER_PROXY_URL || 'https://genplay-proxy.onrender.com'}/api/download?url=${encodeURIComponent(modelUrl)}`
      
      // Show loading state
      const button = document.querySelector('button[onclick*="handleDownload"]')
      const originalText = 'Download Model'
      if (button) {
        const span = button.querySelector('span')
        if (span) {
          span.textContent = 'Downloading...'
        }
      }
      
      // Fetch the model through our proxy
      const response = await fetch(proxyUrl)
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`)
      }
      
      // Create blob and download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `genplay-model-${Date.now()}.${format || 'glb'}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      // Reset button text
      if (button) {
        const span = button.querySelector('span')
        if (span) {
          span.textContent = 'Downloaded!'
          setTimeout(() => {
            span.textContent = originalText
          }, 2000)
        }
      }
      
      showToast('Model downloaded successfully!', 'success')
      
    } catch (error) {
      console.error('Download failed:', error)
      showToast('Failed to download model', 'error')
      
      // Reset button text on error
      const button = document.querySelector('button[onclick*="handleDownload"]')
      if (button) {
        const span = button.querySelector('span')
        if (span) {
          span.textContent = 'Download Model'
        }
      }
    }
  }

  const handleCopyModelUrl = async () => {
    try {
      await navigator.clipboard.writeText(modelUrl)
      
      // Show success message
      const button = document.querySelector('button[onclick*="handleCopyModelUrl"]')
      if (button) {
        const span = button.querySelector('span')
        if (span) {
          const originalText = 'Copy Model URL'
          span.textContent = 'Copied!'
          setTimeout(() => {
            span.textContent = originalText
          }, 2000)
        }
      }
      
      showToast('Model URL copied to clipboard!', 'success')
      
    } catch (error) {
      console.error('Failed to copy URL:', error)
      showToast('Failed to copy model URL', 'error')
    }
  }

  const handleShare = async () => {
    try {
      // Create a shareable link with model details
      const shareData = {
        title: 'AI Generated 3D Model - GenPlay Studio',
        text: 'Check out this amazing AI-generated 3D model created with GenPlay Studio!',
        url: window.location.href
      }

      // Try native sharing first (mobile devices)
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData)
        return
      }

      // Fallback to clipboard copy
      const shareText = `${shareData.title}\n\n${shareData.text}\n\nView the model: ${shareData.url}\n\nModel URL: ${modelUrl}`
      
      await navigator.clipboard.writeText(shareText)
      
      // Show success message
      const originalText = 'Share Model'
      const button = document.querySelector('button[onclick*="handleShare"]')
      if (button) {
        const span = button.querySelector('span')
        if (span) {
          span.textContent = 'Copied!'
          setTimeout(() => {
            span.textContent = originalText
          }, 2000)
        }
      }
      
      // Also show a toast notification
      showToast('Model link copied to clipboard!', 'success')
      
    } catch (error) {
      console.error('Share failed:', error)
      showToast('Failed to share model', 'error')
    }
  }

  const showToast = (message, type = 'info') => {
    // Create a simple toast notification
    const toast = document.createElement('div')
    toast.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-white text-sm font-medium ${
      type === 'success' ? 'bg-green-500' : 
      type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    }`
    toast.textContent = message
    
    document.body.appendChild(toast)
    
    // Remove after 3 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast)
      }
    }, 3000)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const resetView = () => {
    // This would reset the camera position in a real implementation
    setAutoRotate(true)
  }

  return (
    <div className={`max-w-6xl mx-auto ${className}`}>
      <div className="card">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your AI Generated Model</h2>
          <p className="text-gray-600">
            Explore your 3D model in 360 degrees. Use your mouse to rotate, scroll to zoom, and right-click to pan.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 3D Viewer */}
          <div className="lg:col-span-2">
            <div className={`
              relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg overflow-hidden
              ${isFullscreen ? 'fixed inset-0 z-50' : 'h-96 lg:h-[500px]'}
            `}>
              <Canvas
                camera={{ position: [5, 5, 5], fov: 50 }}
                style={{ background: 'transparent' }}
              >
                <ambientLight intensity={0.4} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <pointLight position={[-10, -10, -5]} intensity={0.5} />
                
                <Suspense fallback={<LoadingModel />}>
                  {modelUrl && (
                    <GLBModel 
                      modelUrl={modelUrl} 
                      onError={handleModelError}
                      onLoad={handleModelLoad}
                    />
                  )}
                </Suspense>
                
                <OrbitControls
                  enablePan={true}
                  enableZoom={true}
                  enableRotate={true}
                  autoRotate={autoRotate}
                  autoRotateSpeed={2}
                  maxDistance={20}
                  minDistance={2}
                />
                
                <Environment preset="studio" />
              </Canvas>

              {/* Loading State */}
              {!modelUrl && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="text-white text-center">
                    <p>No model URL provided</p>
                  </div>
                </div>
              )}

              {/* Model Loading Overlay */}
              {modelUrl && isModelLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                    <p>Loading 3D model...</p>
                  </div>
                </div>
              )}

              {/* Model Loading Error */}
              {modelError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="bg-white rounded-lg p-4 max-w-sm text-center">
                    <h3 className="text-lg font-semibold text-red-600 mb-2">Model Loading Error</h3>
                    <p className="text-sm text-gray-600 mb-3">{modelError}</p>
                    <p className="text-xs text-gray-500">The model URL may be invalid or inaccessible.</p>
                  </div>
                </div>
              )}

              {/* Viewer Controls */}
              <div className="absolute top-4 left-4 flex space-x-2">
                <button
                  onClick={resetView}
                  className="p-2 bg-white/10 backdrop-blur-sm rounded-lg text-white hover:bg-white/20 transition-colors"
                  title="Reset View"
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  onClick={() => setAutoRotate(!autoRotate)}
                  className={`p-2 rounded-lg transition-colors ${
                    autoRotate 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20'
                  }`}
                  title="Auto Rotate"
                >
                  <RotateCcw size={16} className={autoRotate ? 'animate-spin' : ''} />
                </button>
              </div>

              {/* Fullscreen Toggle */}
              <button
                onClick={toggleFullscreen}
                className="absolute top-4 right-4 p-2 bg-white/10 backdrop-blur-sm rounded-lg text-white hover:bg-white/20 transition-colors"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>

              {/* Exit Fullscreen Button */}
              {isFullscreen && (
                <button
                  onClick={toggleFullscreen}
                  className="absolute top-4 right-16 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Exit
                </button>
              )}
            </div>
          </div>

          {/* Model Info & Controls */}
          <div className="space-y-4">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Model Information</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Model Format</label>
                  <p className="text-sm text-gray-600 mt-1">{format?.toUpperCase() || 'GLB'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Generated</label>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date().toLocaleString()}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <p className="text-sm text-green-600 mt-1">✓ Ready for viewing</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              
              <div className="space-y-3">
                <button
                  onClick={handleDownload}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <Download size={16} />
                  <span>Download Model</span>
                </button>
                
                {onReset && (
                  <button
                    onClick={onReset}
                    className="w-full btn-secondary flex items-center justify-center space-x-2"
                  >
                    <Home size={16} />
                    <span>Create New Model</span>
                  </button>
                )}
              </div>
            </div>

            {/* View Controls */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">View Controls</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">View Mode</label>
                  <select
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value)}
                    className="input-field"
                  >
                    <option value="perspective">Perspective</option>
                    <option value="orthographic">Orthographic</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="autoRotate"
                    checked={autoRotate}
                    onChange={(e) => setAutoRotate(e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="autoRotate" className="text-sm text-gray-700">
                    Auto Rotate
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModelViewer 