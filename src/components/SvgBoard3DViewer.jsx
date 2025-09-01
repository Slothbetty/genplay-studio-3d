import React, { useRef, useEffect, useState } from 'react'
import { Download, RotateCw, ZoomIn, ZoomOut, Eye, EyeOff } from 'lucide-react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js'

const SvgBoard3DViewer = ({ svgBoardImage, boardSize, svgSize, thickness, svgPosition, svgRotation, svgScale, className = '' }) => {
  const mountRef = useRef(null)
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)
  const cameraRef = useRef(null)
  const controlsRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showWireframe, setShowWireframe] = useState(false)

  useEffect(() => {
    if (!svgBoardImage || !mountRef.current) return

    // Initialize Three.js scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf8f9fa)
    sceneRef.current = scene

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(0, 2, 3)
    cameraRef.current = camera

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    mountRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Add OrbitControls for mouse interaction
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.screenSpacePanning = false
    controls.minDistance = 1
    controls.maxDistance = 10
    controls.maxPolarAngle = Math.PI
    controlsRef.current = controls

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(10, 10, 5)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    scene.add(directionalLight)

    // Add point light for better illumination
    const pointLight = new THREE.PointLight(0xffffff, 0.5, 100)
    pointLight.position.set(-5, 5, 5)
    scene.add(pointLight)

    // Create 3D board
    create3DBoard(scene)

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // Handle window resize
    const handleResize = () => {
      if (mountRef.current && camera && renderer) {
        camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight
        camera.updateProjectionMatrix()
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
      }
    }
    window.addEventListener('resize', handleResize)

    setIsLoading(false)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [svgBoardImage, boardSize, svgSize, thickness, svgPosition, svgRotation, svgScale])

  const create3DBoard = (scene) => {
    // Clear existing objects
    scene.children = scene.children.filter(child => 
      child.type === 'Light' || 
      child.type === 'AmbientLight' || 
      child.type === 'DirectionalLight' || 
      child.type === 'PointLight'
    )

    // Create board base (flat square with slight thickness)
    const boardGeometry = new THREE.BoxGeometry(boardSize / 100, 0.05, boardSize / 100)
    const boardMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xf8f9fa,
      transparent: true,
      opacity: 0.9
    })
    const board = new THREE.Mesh(boardGeometry, boardMaterial)
    board.receiveShadow = true
    board.position.y = -0.025
    scene.add(board)

    // Add board border
    const borderGeometry = new THREE.EdgesGeometry(boardGeometry)
    const borderMaterial = new THREE.LineBasicMaterial({ color: 0xe9ecef, linewidth: 2 })
    const border = new THREE.LineSegments(borderGeometry, borderMaterial)
    border.position.y = -0.025
    scene.add(border)

    // Create SVG representation as 3D geometry
    if (svgBoardImage) {
      createSVGGeometry(scene)
    }
  }

  const createSVGGeometry = (scene) => {
    // Create a more sophisticated 3D representation of the SVG
    // Create SVG base with proper thickness
    const svgWidth = (svgSize * svgScale) / 100
    const svgHeight = (svgSize * svgScale) / 100
    const svgThickness = Math.max(thickness / 100, 0.01) // Minimum thickness
    
    // Create SVG geometry as a box with the SVG as a texture
    const svgGeometry = new THREE.BoxGeometry(svgWidth, svgThickness, svgHeight)
    
    // Create material with SVG texture
    const textureLoader = new THREE.TextureLoader()
    const texture = textureLoader.load(svgBoardImage)
    texture.wrapS = THREE.ClampToEdgeWrapping
    texture.wrapT = THREE.ClampToEdgeWrapping
    
    const svgMaterial = new THREE.MeshLambertMaterial({ 
      map: texture,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide
    })
    
    const svgMesh = new THREE.Mesh(svgGeometry, svgMaterial)
    
    // Position the SVG on the board
    svgMesh.position.set(
      (svgPosition.x - boardSize / 2) / 100,
      svgThickness / 2, // Centered on the board surface
      (svgPosition.y - boardSize / 2) / 100
    )
    
    // Apply rotation
    svgMesh.rotation.y = (svgRotation * Math.PI) / 180
    
    svgMesh.castShadow = true
    svgMesh.receiveShadow = true
    scene.add(svgMesh)

    // Add SVG border/outline
    const svgBorderGeometry = new THREE.EdgesGeometry(svgGeometry)
    const svgBorderMaterial = new THREE.LineBasicMaterial({ 
      color: 0x000000, 
      linewidth: 1,
      transparent: true,
      opacity: 0.7
    })
    const svgBorder = new THREE.LineSegments(svgBorderGeometry, svgBorderMaterial)
    svgBorder.position.copy(svgMesh.position)
    svgBorder.rotation.copy(svgMesh.rotation)
    scene.add(svgBorder)
  }

  const downloadSTL = () => {
    if (!sceneRef.current) return

    const exporter = new STLExporter()
    const stlString = exporter.parse(sceneRef.current, { binary: false })
    
    // Create blob and download
    const blob = new Blob([stlString], { type: 'application/octet-stream' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = 'svg-board-3d-model.stl'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
  }

  const resetCamera = () => {
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 2, 3)
      cameraRef.current.rotation.set(0, 0, 0)
    }
    if (controlsRef.current) {
      controlsRef.current.reset()
    }
  }

  const zoomIn = () => {
    if (cameraRef.current) {
      cameraRef.current.position.multiplyScalar(0.9)
    }
  }

  const zoomOut = () => {
    if (cameraRef.current) {
      cameraRef.current.position.multiplyScalar(1.1)
    }
  }

  const toggleWireframe = () => {
    setShowWireframe(!showWireframe)
    if (sceneRef.current) {
      sceneRef.current.traverse((child) => {
        if (child.isMesh) {
          child.material.wireframe = !showWireframe
        }
      })
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">3D Model Viewer</h3>
        <div className="flex space-x-2">
          <button
            onClick={toggleWireframe}
            className={`p-2 rounded-md border ${
              showWireframe 
                ? 'bg-blue-100 border-blue-300 text-blue-700' 
                : 'bg-gray-100 border-gray-300 text-gray-700'
            } hover:bg-opacity-80`}
            title="Toggle Wireframe"
          >
            {showWireframe ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            onClick={resetCamera}
            className="p-2 rounded-md border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
            title="Reset Camera"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            onClick={zoomIn}
            className="p-2 rounded-md border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={zoomOut}
            className="p-2 rounded-md border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={downloadSTL}
            className="p-2 rounded-md border border-blue-300 bg-blue-100 text-blue-700 hover:bg-blue-200"
            title="Download STL"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div 
          ref={mountRef} 
          className="w-full h-96 bg-gray-50 rounded-lg relative"
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-gray-500">Loading 3D model...</div>
            </div>
          )}
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          <p>• Left-click and drag to rotate the view</p>
          <p>• Scroll to zoom in/out</p>
          <p>• Right-click and drag to pan</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">3D Model Information</h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• Board Size: {boardSize} × {boardSize} pixels</p>
          <p>• SVG Size: {svgSize} × {svgSize} pixels</p>
          <p>• Thickness: {thickness} layers</p>
          <p>• SVG Position: ({svgPosition.x}, {svgPosition.y})</p>
          <p>• SVG Rotation: {svgRotation}°</p>
          <p>• SVG Scale: {svgScale}x</p>
        </div>
      </div>
    </div>
  )
}

export default SvgBoard3DViewer
