import React, { useState, Suspense, useEffect } from 'react'
import { Canvas, useLoader, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, useGLTF } from '@react-three/drei'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Download, Share2, Home, RotateCcw, Maximize2, Minimize2, Copy } from 'lucide-react'
import { tripo3DService } from '../services/api'

// GLB Model component that loads the actual generated model
const GLBModel = ({ modelUrl, onError, onLoad }) => {
  const [gltf, setGltf] = useState(null)
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { scene } = useThree()

  useEffect(() => {
    let isMounted = true
    setIsLoading(true)
    setHasError(false)
    setGltf(null)
    const proxyUrl = import.meta.env.DEV 
      ? `http://localhost:3001/api/download?url=${encodeURIComponent(modelUrl)}`
      : `${import.meta.env.VITE_RENDER_PROXY_URL || 'https://genplay-proxy.onrender.com'}/api/download?url=${encodeURIComponent(modelUrl)}`
    const loader = new GLTFLoader()
    fetch(proxyUrl)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        return res.arrayBuffer()
      })
      .then(arrayBuffer => {
        loader.parse(arrayBuffer, '',
          (gltf) => {
            if (isMounted) {
              setGltf(gltf)
              setIsLoading(false)
              if (onLoad) onLoad()
            }
          },
          (error) => {
            if (isMounted) {
              setHasError(true)
              setIsLoading(false)
              if (onError) onError(error)
            }
          }
        )
      })
      .catch(error => {
        if (isMounted) {
          setHasError(true)
          setIsLoading(false)
          if (onError) onError(error)
        }
      })
    return () => { isMounted = false }
  }, [modelUrl, onError, onLoad])

  if (isLoading) return null
  if (hasError || !gltf) return null
  return <primitive object={gltf.scene} />
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

// Add ErrorBoundary to catch Suspense errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    if (this.props.onError) this.props.onError(error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return <div style={{ color: 'red' }}>Model failed to load: {this.state.error?.message || 'Unknown error'}</div>;
    }
    return this.props.children;
  }
}

const ModelViewer = ({ modelUrl, format, className = '', onReset, modelTaskId }) => {
  const [autoRotate, setAutoRotate] = useState(true)
  const [viewMode, setViewMode] = useState('perspective')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [modelError, setModelError] = useState(null)
  const [isModelLoading, setIsModelLoading] = useState(true)
  const [downloadFormat, setDownloadFormat] = useState(format || 'glb')
  const [isDownloading, setIsDownloading] = useState(false)

  const formatOptions = [
    { value: 'glb', label: 'GLB' },
    { value: 'gltf', label: 'GLTF' },
    { value: 'usdz', label: 'USDZ' },
    { value: 'fbx', label: 'FBX' },
    { value: 'obj', label: 'OBJ' },
    { value: 'stl', label: 'STL' },
    { value: '3mf', label: '3MF' },
  ]

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
    setIsDownloading(true)
    try {
      let downloadTaskId = modelTaskId
      let downloadUrl = modelUrl
      let downloadExt = downloadFormat
      // If user selects a different format, convert first
      if (downloadFormat && downloadFormat.toLowerCase() !== (format || 'glb').toLowerCase()) {
        // Call convertModel and wait for completion
        showToast('Converting model to ' + downloadFormat.toUpperCase() + '...', 'info')
        const conversion = await tripo3DService.convertModel({
          original_model_task_id: modelTaskId,
          format: downloadFormat.toUpperCase(),
        })
        const conversionTaskId = conversion.data?.task_id || conversion.task_id
        if (!conversionTaskId) throw new Error('Conversion failed: No task_id returned')
        // Wait for conversion to complete
        const result = await tripo3DService.monitorTaskStatus(conversionTaskId)
        if (result.data?.status !== 'success') {
          throw new Error('Conversion failed or no model URL returned')
        }
        let convertedUrl =
          result.data?.result?.model?.url ||
          result.data?.output?.model ||
          result.data?.result?.pbr_model?.url;
        if (!convertedUrl) {
          throw new Error('Conversion succeeded but no model URL found in response');
        }
        // If the type is zip, set extension to zip
        let ext = downloadFormat;
        if (
          (result.data?.result?.model?.type === 'zip') ||
          (result.data?.result?.type === 'zip')
        ) {
          ext = 'zip';
        }
        downloadTaskId = conversionTaskId;
        downloadUrl = convertedUrl;
        downloadExt = ext;
      }
      // Download the model
      const proxyUrl = import.meta.env.DEV
        ? `http://localhost:3001/api/download?url=${encodeURIComponent(downloadUrl)}`
        : `${import.meta.env.VITE_RENDER_PROXY_URL || 'https://genplay-proxy.onrender.com'}/api/download?url=${encodeURIComponent(downloadUrl)}`
      const response = await fetch(proxyUrl)
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`)
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `genplay-model-${Date.now()}.${downloadExt}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      showToast('Model downloaded successfully!', 'success')
    } catch (error) {
      console.error('Download failed:', error)
      showToast('Failed to download model: ' + error.message, 'error')
    } finally {
      setIsDownloading(false)
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
                
                <ErrorBoundary onError={handleModelError}>
                  <Suspense fallback={<LoadingModel />}>
                    {modelUrl && (
                      <GLBModel 
                        modelUrl={modelUrl} 
                        onError={handleModelError}
                        onLoad={handleModelLoad}
                      />
                    )}
                  </Suspense>
                </ErrorBoundary>
                
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
                <div className="flex items-center space-x-2">
                  <label htmlFor="downloadFormat" className="text-sm font-medium text-gray-700">Format:</label>
                  <select
                    id="downloadFormat"
                    value={downloadFormat}
                    onChange={e => setDownloadFormat(e.target.value)}
                    className="input-field"
                    disabled={isDownloading}
                  >
                    {formatOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleDownload}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                  disabled={isDownloading}
                >
                  <Download size={16} />
                  <span>{isDownloading ? 'Processing...' : 'Download Model'}</span>
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