import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls, Environment, Html } from '@react-three/drei'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js'
import * as THREE from 'three'

// Board component
const Board = React.memo(function Board({ type, size = [2, 2, 0.1], position = [0, 0, 0], color = "#FFFFFF", onBoardMesh = null }) {
  const boardRef = useRef()
  
  const boardGeometry = useMemo(() => {
    if (type === 'square') {
      return new THREE.BoxGeometry(size[0], size[2], size[1]) // width, height, depth
    } else if (type === 'circle') {
      return new THREE.CylinderGeometry(size[0] / 2, size[0] / 2, size[2], 32) // radius, radius, height, segments
    }
    return null
  }, [type, size])

  // Pass the board mesh reference to parent component when ready
  useEffect(() => {
    if (onBoardMesh && boardRef.current && boardGeometry) {
      onBoardMesh(boardRef.current)
    }
  }, [onBoardMesh, boardGeometry])

  if (!boardGeometry) return null

  return (
    <mesh ref={boardRef} position={position} receiveShadow castShadow>
      <primitive object={boardGeometry} attach="geometry" />
      <meshStandardMaterial 
        attach="material" 
        color={color} 
        metalness={0.1}
        roughness={0.7}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
})

// STL Model component
const StlModel = React.memo(function StlModel({ url, onLoad, onError, thickness = 1, scale = 1, position = [0, 0, 0], boardType = null, boardSize = 2, color = "#000000", onProcessedGeometry = null, onCurrentGeometry = null, onModelPosition = null, onCurrentMesh = null }) {
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
    if (boardType && originalGeometry) {
      // Position model so its bottom sits directly on the board surface
      // The user's Y position controls the model's height relative to the board surface
      const boardHeight = Array.isArray(boardSize) ? boardSize[2] : 0.1
      const boardTopY = boardHeight / 2 // Board top surface is at boardHeight/2
      
      // Use the processed geometry to get accurate dimensions
      const processedGeom = processGeometry(originalGeometry, thickness, scale)
      processedGeom.computeBoundingBox() // Ensure bounding box is computed
      const modelSize = processedGeom.boundingBox.getSize(new THREE.Vector3())
      const modelHeight = modelSize.y
      
      // Position model so its bottom sits on the board surface
      // Since the model is centered at origin, we need to move it up by half its height
      // Add a small offset to ensure the model sits clearly above the board
      const modelCenterY = boardTopY + (modelHeight / 2) + position[1] + 0.01 // 0.01 offset to ensure visibility
      
      
      return [position[0], modelCenterY, position[2]]
    }
    return position
  }, [position, boardType, boardSize, originalGeometry, thickness, scale, processGeometry])

  // Pass the calculated position to parent component for export
  useEffect(() => {
    if (onModelPosition) {
      onModelPosition(modelPosition)
    }
  }, [modelPosition, onModelPosition])

  // Pass the mesh reference to parent component when ready
  useEffect(() => {
    if (onCurrentMesh && meshRef.current && geometry) {
      onCurrentMesh(meshRef.current)
    }
  }, [onCurrentMesh, geometry])

  // Effect to update geometry when thickness or scale changes
  useEffect(() => {
    if (originalGeometry) {
      const newGeometry = processGeometry(originalGeometry, thickness, scale)
      setGeometry(newGeometry)
      
      // Save the processed geometry to memory for download
      if (onProcessedGeometry) {
        // Convert geometry to STL format and save
        const exporter = new STLExporter()
        // Create a temporary mesh with the geometry for export
        const tempMesh = new THREE.Mesh(newGeometry, new THREE.MeshStandardMaterial())
        const stlString = exporter.parse(tempMesh)
        const blob = new Blob([stlString], { type: 'application/octet-stream' })
        onProcessedGeometry(blob)
      }
      
      // Also pass the current geometry for combined export
      if (onCurrentGeometry) {
        onCurrentGeometry(newGeometry)
      }
    }
  }, [originalGeometry, thickness, scale, processGeometry, onProcessedGeometry, onCurrentGeometry])

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
              
              // Center the geometry at the origin (0, 0, 0)
              geometry.translate(-newCenter.x, -newCenter.y, -newCenter.z)

              // Scale the geometry to fit in the view (base scale)
              const maxDim = Math.max(size.x, size.y, size.z)
              const baseScale = 2 / maxDim
              geometry.scale(baseScale, baseScale, baseScale)


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
        color={color} 
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
  showBoardControls = true,
  onExportCombined = null,
  onCombinedStlGenerated = null,
  autoRotate = false
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [modelThickness, setModelThickness] = useState(1)
  const [modelScale, setModelScale] = useState(1)
  const [modelPosition, setModelPosition] = useState([0, 0, 0]) // User's position controls
  const [calculatedModelPosition, setCalculatedModelPosition] = useState([0, 0, 0]) // Calculated position for export
  const [boardType, setBoardType] = useState(null)
  const [boardSize, setBoardSize] = useState([2, 2, 0.1]) // [width, depth, thickness]
  const hasAutoAdjustedRef = useRef(false) // Track if we've auto-adjusted position
  
  // Auto-adjust Y position when board is first added
  useEffect(() => {
    if (boardType && !hasAutoAdjustedRef.current && modelPosition[1] === 0) {
      // Only auto-adjust once when board is first added and Y position is at default (0)
      // Set user Y position to 0 so the model sits directly on the board
      setModelPosition([modelPosition[0], 0, modelPosition[2]])
      hasAutoAdjustedRef.current = true
    } else if (!boardType) {
      // Reset the flag when board is removed
      hasAutoAdjustedRef.current = false
    }
  }, [boardType, boardSize, modelPosition])

  const [modelColor, setModelColor] = useState("#000000")
  const [boardColor, setBoardColor] = useState("#FFFFFF")
  const [processedStlData, setProcessedStlData] = useState(null) // Store the processed STL data in memory
  const [currentGeometry, setCurrentGeometry] = useState(null) // Store the current geometry for combined export
  const [currentMesh, setCurrentMesh] = useState(null) // Store the actual mesh from viewer
  const [boardMesh, setBoardMesh] = useState(null) // Store the actual board mesh from viewer
  const [hasGeneratedCombinedStl, setHasGeneratedCombinedStl] = useState(false) // Track if we've already generated the combined STL

  // Reset combined STL generation flag when model properties change
  useEffect(() => {
    setHasGeneratedCombinedStl(false)
  }, [modelThickness, modelScale, modelPosition, modelColor, boardType, boardSize, boardColor])

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

  // Callback to save processed STL data to memory
  const handleProcessedGeometry = useCallback((blob) => {
    setProcessedStlData(blob)
  }, [])

  // Callback to save current geometry for combined export
  const handleCurrentGeometry = useCallback((geometry) => {
    setCurrentGeometry(geometry)
  }, [])

  // Callback to receive calculated model position from StlModel
  const handleModelPosition = useCallback((position) => {
    setCalculatedModelPosition(position)
  }, [])

  // Callback to receive the actual mesh from StlModel
  const handleCurrentMesh = useCallback((mesh) => {
    setCurrentMesh(mesh)
    setHasGeneratedCombinedStl(false) // Reset flag when mesh changes
  }, [])

  // Callback to receive the actual board mesh from Board
  const handleBoardMesh = useCallback((mesh) => {
    setBoardMesh(mesh)
    setHasGeneratedCombinedStl(false) // Reset flag when board changes
  }, [])

  // Function to bake world transforms into geometry
  const bakeWorldToGeometry = useCallback((obj) => {
    const clone = obj.clone(true)
    clone.updateMatrixWorld(true)

    clone.traverse((n) => {
      if (n.isMesh && n.geometry) {
        // Clone to avoid mutating originals
        n.geometry = n.geometry.clone()
        // Apply world matrix to vertices
        n.geometry.applyMatrix4(n.matrixWorld)
        // Reset local transforms so exporter doesn't reapply them
        n.position.set(0, 0, 0)
        n.rotation.set(0, 0, 0)
        n.scale.set(1, 1, 1)
        n.updateMatrixWorld(true)
      }
    })

    return clone
  }, [])

  // Auto-generate combined STL when both model and board are ready (only once)
  useEffect(() => {
    if (currentMesh && boardMesh && onCombinedStlGenerated && !hasGeneratedCombinedStl) {
      setHasGeneratedCombinedStl(true) // Mark as generated to prevent re-generation
      
      // Generate the combined STL automatically
      try {
        const scene = new THREE.Scene()
        const bakedModel = bakeWorldToGeometry(currentMesh)
        const bakedBoard = bakeWorldToGeometry(boardMesh)
        
        scene.add(bakedBoard)
        scene.add(bakedModel)
        
        const exporter = new STLExporter()
        const stl = exporter.parse(scene, { binary: true })
        const blob = new Blob([stl], { type: 'application/octet-stream' })
        
        
        onCombinedStlGenerated(blob)
      } catch (error) {
        console.error('❌ Error auto-generating combined STL:', error)
        setHasGeneratedCombinedStl(false) // Reset on error so it can try again
      }
    }
  }, [currentMesh, boardMesh, onCombinedStlGenerated, hasGeneratedCombinedStl])

  // Function to export combined STL (model + board)
  const handleExportCombined = useCallback(() => {

    if (!currentMesh || !boardMesh) {
      console.warn('❌ Export failed: Missing mesh references')
      alert('Please ensure both STL model and board are loaded')
      return
    }

    try {
      const scene = new THREE.Scene()

      // 1) Use EXACT meshes from the viewer, with all parent transforms baked
      const bakedModel = bakeWorldToGeometry(currentMesh)
      const bakedBoard = bakeWorldToGeometry(boardMesh)


      scene.add(bakedBoard)
      scene.add(bakedModel)


      // 2) Export binary STL for better fidelity/size
      const exporter = new STLExporter()
      const stl = exporter.parse(scene, { binary: true })

      const blob = new Blob([stl], { type: 'application/octet-stream' })

      // Call the callback to pass the combined STL blob to parent
      if (onCombinedStlGenerated) {
        onCombinedStlGenerated(blob)
      }

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'combined-model-with-board.stl'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('❌ Error exporting combined STL:', error)
      console.error('🔍 Export Error Details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
      alert('Error exporting combined STL file')
    }
  }, [currentMesh, boardMesh, bakeWorldToGeometry])

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


  return (
    <div className="space-y-4">
      {/* 3D Preview Container */}
      <div className={`${className} bg-gray-50 rounded-lg border border-gray-200 overflow-hidden relative`}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          shadows
          gl={{ antialias: true, alpha: true }}
          onCreated={({ camera }) => {
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
              color={boardColor}
              onBoardMesh={handleBoardMesh}
            />
          )}

          {/* STL Model */}
          <StlModel 
            url={stlUrl} 
            onLoad={handleModelLoad}
            onError={handleModelError}
            thickness={modelThickness}
            scale={modelScale}
            position={modelPosition} // User's position controls
            boardType={boardType}
            boardSize={boardSize}
            color={modelColor}
            onProcessedGeometry={handleProcessedGeometry}
            onCurrentGeometry={handleCurrentGeometry}
            onModelPosition={handleModelPosition}
            onCurrentMesh={handleCurrentMesh}
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
              autoRotate={autoRotate}
              autoRotateSpeed={2}
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

      {/* STL Model Controls - Below 3D Preview */}
      {showModelControls && stlUrl && !isLoading && !hasError && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">STL Model Controls</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

            {/* Model Color Control */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model Color
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={modelColor}
                  onChange={(e) => setModelColor(e.target.value)}
                  className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
                />
                <span className="text-xs text-gray-600">{modelColor}</span>
              </div>
            </div>

            {/* Position Controls */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
              <div className="space-y-2">
                {/* X Position */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">X: {modelPosition[0].toFixed(1)}</label>
                  <input
                    type="range"
                    min="-2"
                    max="2"
                    step="0.1"
                    value={modelPosition[0]}
                    onChange={(e) => setModelPosition(prev => [parseFloat(e.target.value), prev[1], prev[2]])}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #EF4444 0%, #EF4444 ${(modelPosition[0] + 2) / 4 * 100}%, #E5E7EB ${(modelPosition[0] + 2) / 4 * 100}%, #E5E7EB 100%)`
                    }}
                  />
                </div>

                {/* Y Position */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Y: {modelPosition[1].toFixed(1)}</label>
                  <input
                    type="range"
                    min="-2"
                    max="2"
                    step="0.1"
                    value={modelPosition[1]}
                    onChange={(e) => setModelPosition(prev => [prev[0], parseFloat(e.target.value), prev[2]])}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #8B5CF6 0%, #8B5CF6 ${(modelPosition[1] + 2) / 4 * 100}%, #E5E7EB ${(modelPosition[1] + 2) / 4 * 100}%, #E5E7EB 100%)`
                    }}
                  />
                </div>

                {/* Z Position */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Z: {modelPosition[2].toFixed(1)}</label>
                  <input
                    type="range"
                    min="-2"
                    max="2"
                    step="0.1"
                    value={modelPosition[2]}
                    onChange={(e) => setModelPosition(prev => [prev[0], prev[1], parseFloat(e.target.value)])}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #F59E0B 0%, #F59E0B ${(modelPosition[2] + 2) / 4 * 100}%, #E5E7EB ${(modelPosition[2] + 2) / 4 * 100}%, #E5E7EB 100%)`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Board Controls - Separate Section */}
      {showBoardControls && stlUrl && !isLoading && !hasError && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Board Controls</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Board Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Board Type</label>
              <div className="flex space-x-2">
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
            </div>

            {/* Board Color Control */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Board Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={boardColor}
                  onChange={(e) => setBoardColor(e.target.value)}
                  className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
                />
                <span className="text-xs text-gray-600">{boardColor}</span>
              </div>
            </div>

            {/* Board Size Controls */}
            {boardType && (
              <>
                {/* Board Thickness */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thickness: {boardSize[2].toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="0.05"
                    max="1"
                    step="0.05"
                    value={boardSize[2]}
                    onChange={(e) => setBoardSize(prev => [prev[0], prev[1], parseFloat(e.target.value)])}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #8B5CF6 0%, #8B5CF6 ${(boardSize[2] - 0.05) / 0.95 * 100}%, #E5E7EB ${(boardSize[2] - 0.05) / 0.95 * 100}%, #E5E7EB 100%)`
                    }}
                  />
                </div>
                
                {/* Board Width */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Width: {boardSize[0].toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.1"
                    value={boardSize[0]}
                    onChange={(e) => setBoardSize(prev => [parseFloat(e.target.value), prev[1], prev[2]])}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #EF4444 0%, #EF4444 ${(boardSize[0] - 1) / 4 * 100}%, #E5E7EB ${(boardSize[0] - 1) / 4 * 100}%, #E5E7EB 100%)`
                    }}
                  />
                </div>
              </>
            )}
          </div>

          {/* Board Height Control - Full Width */}
          {boardType && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Height: {boardSize[1].toFixed(1)}
              </label>
              <input
                type="range"
                min="1"
                max="5"
                step="0.1"
                value={boardSize[1]}
                onChange={(e) => setBoardSize(prev => [prev[0], parseFloat(e.target.value), prev[2]])}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #10B981 0%, #10B981 ${(boardSize[1] - 1) / 4 * 100}%, #E5E7EB ${(boardSize[1] - 1) / 4 * 100}%, #E5E7EB 100%)`
                }}
              />
            </div>
          )}

          {/* Download Buttons */}
          <div className="mt-6 flex justify-center space-x-4">
            {/* Original STL Download Button */}
            <button
              onClick={() => {
                if (!processedStlData) {
                  alert('No processed STL data available for download. Please wait for the model to load.')
                  return
                }
                
                try {
                  // Download the processed STL data from memory
                  const url = URL.createObjectURL(processedStlData)
                  const link = document.createElement('a')
                  link.href = url
                  link.download = 'processed-model.stl'
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)
                  URL.revokeObjectURL(url)
                } catch (error) {
                  console.error('Download error:', error)
                  alert('Download failed. Please try again.')
                }
              }}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
            >
              📥 Download STL File
            </button>

            {/* Combined STL + Board Download Button */}
            {boardType && (
              <button
                onClick={handleExportCombined}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
              >
                📦 Download STL + Board
              </button>
            )}
          </div>

          {/* Reset Button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => {
                setModelThickness(1)
                setModelScale(1)
                setModelPosition([0, 0, 0])
                setBoardType(null)
                setBoardSize([2, 2, 0.1])
                setModelColor("#000000")
                setBoardColor("#FFFFFF")
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
