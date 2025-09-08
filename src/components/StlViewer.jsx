import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls, Environment, Html } from '@react-three/drei'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import * as THREE from 'three'

// Board component
const Board = React.memo(function Board({ type, size = 2, position = [0, 0, 0] }) {
  const boardRef = useRef()
  
  const boardGeometry = useMemo(() => {
    if (type === 'square') {
      return new THREE.PlaneGeometry(size, size)
    } else if (type === 'circle') {
      return new THREE.CircleGeometry(size / 2, 32)
    }
    return null
  }, [type, size])

  if (!boardGeometry) return null

  return (
    <mesh ref={boardRef} position={position} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <primitive object={boardGeometry} attach="geometry" />
      <meshStandardMaterial 
        attach="material" 
        color="#8B5CF6" 
        metalness={0.1}
        roughness={0.7}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
})

// STL Model component
const StlModel = React.memo(function StlModel({ url, onLoad, onError, thickness = 1, scale = 1, position = [0, 0, 0], boardType = null, boardSize = 2 }) {
  // ALL HOOKS MUST BE AT THE TOP - NO CONDITIONAL HOOKS
  const meshRef = useRef()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [geometry, setGeometry] = useState(null)
  const [originalGeometry, setOriginalGeometry] = useState(null)
  const loaderRef = useRef(null)
  const abortControllerRef = useRef(null)

  // Function to process geometry with transformations
  const processGeometry = useCallback((baseGeometry, thicknessValue, scaleValue) => {
    if (!baseGeometry) return null

    // Clone the geometry to avoid modifying the original
    const processedGeometry = baseGeometry.clone()
    
    // Apply depth/height (scale in Y direction - height of the model)
    processedGeometry.scale(1, thicknessValue, 1)
    
    // Apply overall scale
    processedGeometry.scale(scaleValue, scaleValue, scaleValue)
    
    return processedGeometry
  }, [])

  // Calculate position on top of board - MUST BE BEFORE ANY CONDITIONAL RETURNS
  const modelPosition = useMemo(() => {
    if (boardType) {
      return [position[0], position[1] + 0.1, position[2]] // Place model slightly above board
    }
    return position
  }, [position, boardType])

  // Effect to update geometry when thickness or scale changes
  useEffect(() => {
    if (originalGeometry) {
      const newGeometry = processGeometry(originalGeometry, thickness, scale)
      setGeometry(newGeometry)
    }
  }, [originalGeometry, thickness, scale, processGeometry])

  useEffect(() => {
    if (!url) {
      setLoading(false)
      setError(null)
      setGeometry(null)
      return
    }

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController()

    setLoading(true)
    setError(null)
    setGeometry(null)

    // Try to load STL with fallback mechanism
    const loadStlWithFallback = async (attemptUrl, isFallback = false) => {
      try {
        console.log(`Loading STL ${isFallback ? '(fallback)' : '(proxy)'}:`, attemptUrl)
        
        // Create new loader instance
        loaderRef.current = new STLLoader()
        
        return new Promise((resolve, reject) => {
          loaderRef.current.load(
            attemptUrl,
            (geometry) => {
              // Check if request was aborted
              if (abortControllerRef.current?.signal.aborted) {
                reject(new Error('Request aborted'))
                return
              }

              console.log('STL geometry loaded:', geometry)
              
              // Position the geometry flat on the X-Y plane (horizontal)
              geometry.computeBoundingBox()
              const center = geometry.boundingBox.getCenter(new THREE.Vector3())
              const size = geometry.boundingBox.getSize(new THREE.Vector3())
              
              // Rotate the geometry to lay flat on the X-Y plane
              // Rotate 90 degrees around X-axis to make it horizontal
              geometry.rotateX(-Math.PI / 2)
              
              // Recompute bounding box after rotation
              geometry.computeBoundingBox()
              const newCenter = geometry.boundingBox.getCenter(new THREE.Vector3())
              const newSize = geometry.boundingBox.getSize(new THREE.Vector3())
              
              // Center horizontally (X and Y) and place the bottom on the ground (Z = 0)
              geometry.translate(-newCenter.x, -newCenter.y, -newCenter.z + newSize.z/2)

              // Scale the geometry to fit in the view (base scale)
              const maxDim = Math.max(size.x, size.y, size.z)
              const baseScale = 2 / maxDim
              geometry.scale(baseScale, baseScale, baseScale)

              console.log('STL geometry processed:', { center, size, baseScale, 'rotated to lay flat on XY plane': true })

              // Store the original processed geometry
              setOriginalGeometry(geometry)
              setLoading(false)
              if (onLoad) onLoad(geometry)
              resolve(geometry)
            },
            undefined,
            (err) => {
              // Check if request was aborted
              if (abortControllerRef.current?.signal.aborted) {
                reject(new Error('Request aborted'))
                return
              }
              reject(err)
            }
          )
        })
      } catch (error) {
        throw error
      }
    }

    // Try proxy first, then fallback to direct URL
    const isDevelopment = import.meta.env.DEV
    const proxyUrl = isDevelopment
      ? `http://localhost:3001/api/download?url=${encodeURIComponent(url)}`
      : `${import.meta.env.VITE_RENDER_PROXY_URL || 'https://genplay-proxy.onrender.com'}/api/download?url=${encodeURIComponent(url)}`

    loadStlWithFallback(proxyUrl, false)
      .catch(async (proxyError) => {
        console.warn('Proxy failed, trying direct URL:', proxyError.message)
        
        // Try direct URL as fallback
        try {
          await loadStlWithFallback(url, true)
        } catch (directError) {
          // Check if request was aborted
          if (abortControllerRef.current?.signal.aborted) {
            return
          }

          console.error('Both proxy and direct URL failed:', directError)
          let errorMessage = directError.message
          
          // Provide more user-friendly error messages
          if (directError.message.includes('404')) {
            errorMessage = 'STL file not found. The file may have expired or been deleted. Please try generating a new 3D model.'
          } else if (directError.message.includes('500')) {
            if (proxyError.message.includes('500')) {
              errorMessage = 'Proxy server error. Please make sure the proxy server is running by executing "npm run proxy" in a separate terminal.'
            } else {
              errorMessage = 'Server error while loading STL file. Please try again.'
            }
          } else if (directError.message.includes('Failed to fetch') || directError.message.includes('CORS')) {
            errorMessage = 'Network error. Please check your connection and try again.'
          } else if (directError.message.includes('Request aborted')) {
            return // Don't show error for aborted requests
          }
          
          setError(errorMessage)
          setLoading(false)
          if (onError) onError(new Error(errorMessage))
        }
      })

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (loaderRef.current) {
        loaderRef.current = null
      }
    }
  }, [url]) // Removed onLoad and onError from dependencies to prevent unnecessary re-renders

  if (loading) {
    return (
      <Html center>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-600 mt-2">Loading 3D model...</p>
        </div>
      </Html>
    )
  }

  if (error) {
    return (
      <Html center>
        <div className="text-center text-red-600 max-w-xs">
          <div className="text-2xl mb-2">⚠️</div>
          <p className="text-sm font-medium">Failed to load 3D model</p>
          <p className="text-xs mt-2 leading-relaxed">{error}</p>
        </div>
      </Html>
    )
  }

  if (!geometry) {
    return null
  }

  return (
    <mesh ref={meshRef} castShadow receiveShadow position={modelPosition}>
      <primitive object={geometry} attach="geometry" />
      <meshStandardMaterial 
        attach="material" 
        color="#000000" 
        metalness={0.0}
        roughness={0.8}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
})

// Main STL Viewer component
export default function StlViewer({ 
  stlUrl, 
  className = "w-full h-[600px]",
  showControls = true,
  onModelLoad = () => {},
  onModelError = () => {},
  showModelControls = true,
  showBoardControls = true
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [modelThickness, setModelThickness] = useState(1)
  const [modelScale, setModelScale] = useState(1)
  const [modelPosition, setModelPosition] = useState([0, 0, 0])
  const [boardType, setBoardType] = useState(null)
  const [boardSize, setBoardSize] = useState(2)

  const handleModelLoad = useCallback((geometry) => {
    setIsLoading(false)
    setHasError(false)
    onModelLoad(geometry)
  }, [onModelLoad])

  const handleModelError = useCallback((error) => {
    setIsLoading(false)
    setHasError(true)
    onModelError(error)
  }, [onModelError])

  if (!stlUrl) {
    return (
      <div className={`${className} bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center`}>
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">📦</div>
          <p className="text-sm">No 3D model to display</p>
          <p className="text-xs mt-1">Generate a model to see it here</p>
        </div>
      </div>
    )
  }

  console.log('StlViewer rendering with URL:', stlUrl)

  return (
    <div className="space-y-4">
      {/* 3D Preview Container */}
      <div className={`${className} bg-gray-50 rounded-lg border border-gray-200 overflow-hidden relative`}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          shadows
          gl={{ antialias: true, alpha: true }}
          onCreated={({ camera }) => {
            console.log('Canvas created, camera position:', camera.position)
            // Look down at the model from above
            camera.lookAt(0, 0, 0)
          }}
        >
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={0.6}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[-10, -10, -5]} intensity={0.3} />

          {/* Environment */}
          <Environment preset="studio" />

          {/* Board */}
          {boardType && (
            <Board 
              type={boardType}
              size={boardSize}
              position={[0, 0, 0]}
            />
          )}

          {/* STL Model */}
          <StlModel 
            url={stlUrl} 
            onLoad={handleModelLoad}
            onError={handleModelError}
            thickness={modelThickness}
            scale={modelScale}
            position={modelPosition}
            boardType={boardType}
            boardSize={boardSize}
          />

          {/* Debug: Show axes helper */}
          <axesHelper args={[2]} />

          {/* Controls */}
          {showControls && (
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={2}
              maxDistance={10}
              autoRotate={false}
            />
          )}

          {/* Grid helper - positioned on the X-Y plane */}
          <gridHelper args={[10, 10, '#E5E7EB', '#E5E7EB']} position={[0, 0, 0]} />
          
          {/* Ground plane for visual reference */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
            <planeGeometry args={[10, 10]} />
            <meshBasicMaterial color="#F3F4F6" transparent opacity={0.3} />
          </mesh>
        </Canvas>

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Loading 3D model...</p>
            </div>
          </div>
        )}

        {/* Error overlay */}
        {hasError && (
          <div className="absolute inset-0 bg-red-50 bg-opacity-75 flex items-center justify-center">
            <div className="text-center text-red-600">
              <div className="text-4xl mb-2">⚠️</div>
              <p className="text-sm">Failed to load 3D model</p>
              <p className="text-xs mt-1">Please try generating again</p>
            </div>
          </div>
        )}

        {/* Controls info */}
        {showControls && (
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
            <div>🖱️ Left: Rotate | 🖱️ Right: Pan | 🖱️ Wheel: Zoom</div>
          </div>
        )}
      </div>

      {/* Model Controls - Below 3D Preview */}
      {showModelControls && stlUrl && !isLoading && !hasError && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Model Controls</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Height Control */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Height: {modelThickness.toFixed(1)}x
              </label>
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={modelThickness}
                onChange={(e) => setModelThickness(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${(modelThickness - 0.1) / 4.9 * 100}%, #E5E7EB ${(modelThickness - 0.1) / 4.9 * 100}%, #E5E7EB 100%)`
                }}
              />
            </div>

            {/* Scale Control */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scale: {modelScale.toFixed(1)}x
              </label>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={modelScale}
                onChange={(e) => setModelScale(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #10B981 0%, #10B981 ${(modelScale - 0.1) / 2.9 * 100}%, #E5E7EB ${(modelScale - 0.1) / 2.9 * 100}%, #E5E7EB 100%)`
                }}
              />
            </div>

            {/* Board Controls */}
            {showBoardControls && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Board</label>
                <div className="flex space-x-2 mb-2">
                  <button
                    onClick={() => setBoardType(boardType === 'square' ? null : 'square')}
                    className={`flex-1 px-3 py-2 text-sm rounded transition-colors ${
                      boardType === 'square' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    Square
                  </button>
                  <button
                    onClick={() => setBoardType(boardType === 'circle' ? null : 'circle')}
                    className={`flex-1 px-3 py-2 text-sm rounded transition-colors ${
                      boardType === 'circle' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    Circle
                  </button>
                </div>
                {boardType && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Board Size: {boardSize.toFixed(1)}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="4"
                      step="0.1"
                      value={boardSize}
                      onChange={(e) => setBoardSize(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #8B5CF6 0%, #8B5CF6 ${(boardSize - 1) / 3 * 100}%, #E5E7EB ${(boardSize - 1) / 3 * 100}%, #E5E7EB 100%)`
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Position Controls */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Position</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* X Position */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">X Position: {modelPosition[0].toFixed(1)}</label>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.1"
                  value={modelPosition[0]}
                  onChange={(e) => setModelPosition(prev => [parseFloat(e.target.value), prev[1], prev[2]])}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #EF4444 0%, #EF4444 ${(modelPosition[0] + 2) / 4 * 100}%, #E5E7EB ${(modelPosition[0] + 2) / 4 * 100}%, #E5E7EB 100%)`
                  }}
                />
              </div>

              {/* Y Position */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Y Position: {modelPosition[1].toFixed(1)}</label>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.1"
                  value={modelPosition[1]}
                  onChange={(e) => setModelPosition(prev => [prev[0], parseFloat(e.target.value), prev[2]])}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #8B5CF6 0%, #8B5CF6 ${(modelPosition[1] + 2) / 4 * 100}%, #E5E7EB ${(modelPosition[1] + 2) / 4 * 100}%, #E5E7EB 100%)`
                  }}
                />
              </div>

              {/* Z Position */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Z Position: {modelPosition[2].toFixed(1)}</label>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.1"
                  value={modelPosition[2]}
                  onChange={(e) => setModelPosition(prev => [prev[0], prev[1], parseFloat(e.target.value)])}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #F59E0B 0%, #F59E0B ${(modelPosition[2] + 2) / 4 * 100}%, #E5E7EB ${(modelPosition[2] + 2) / 4 * 100}%, #E5E7EB 100%)`
                  }}
                />
              </div>
            </div>
          </div>

          {/* Reset Button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => {
                setModelThickness(1)
                setModelScale(1)
                setModelPosition([0, 0, 0])
                setBoardType(null)
                setBoardSize(2)
              }}
              className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm rounded transition-colors"
            >
              Reset to Default
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
