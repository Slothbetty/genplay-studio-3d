import React, { useState, useRef, useEffect } from 'react'
import { Download, Settings, RotateCw, Move, ZoomIn, ZoomOut } from 'lucide-react'

const SvgBoardEditor = ({ svgContent, onBoardGenerated, className = '' }) => {
  const [boardSize, setBoardSize] = useState(200)
  const [svgSize, setSvgSize] = useState(100)
  const [thickness, setThickness] = useState(2)
  const [svgPosition, setSvgPosition] = useState({ x: 100, y: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [svgRotation, setSvgRotation] = useState(0)
  const [svgScale, setSvgScale] = useState(1)
  const [showControls, setShowControls] = useState(true)
  const canvasRef = useRef(null)
  const svgRef = useRef(null)

  // Generate the board with SVG when parameters change
  useEffect(() => {
    if (svgContent && canvasRef.current) {
      generateBoard()
    }
  }, [boardSize, svgSize, thickness, svgPosition, svgRotation, svgScale, svgContent])

  const generateBoard = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    // Set canvas size
    canvas.width = boardSize
    canvas.height = boardSize
    
    // Clear canvas
    ctx.clearRect(0, 0, boardSize, boardSize)
    
    // Draw board background (optional - you can remove this if you want transparent)
    ctx.fillStyle = '#f8f9fa'
    ctx.fillRect(0, 0, boardSize, boardSize)
    
    // Draw board border
    ctx.strokeStyle = '#e9ecef'
    ctx.lineWidth = 1
    ctx.strokeRect(0, 0, boardSize, boardSize)
    
    if (svgContent) {
      // Create an image from SVG content
      const img = new Image()
      img.onload = () => {
        // Calculate scaled dimensions
        const scaledWidth = svgSize * svgScale
        const scaledHeight = svgSize * svgScale
        
        // Save context for transformations
        ctx.save()
        
        // Move to SVG position
        ctx.translate(svgPosition.x, svgPosition.y)
        
        // Apply rotation
        ctx.rotate((svgRotation * Math.PI) / 180)
        
        // Apply scaling
        ctx.scale(svgScale, svgScale)
        
        // Draw SVG with thickness effect
        if (thickness > 1) {
          // Create multiple layers for thickness effect
          for (let i = 0; i < thickness; i++) {
            ctx.globalAlpha = 0.3 - (i * 0.1)
            ctx.drawImage(
              img, 
              -svgSize / 2, 
              -svgSize / 2, 
              svgSize, 
              svgSize
            )
          }
        }
        
        // Draw main SVG
        ctx.globalAlpha = 1
        ctx.drawImage(
          img, 
          -svgSize / 2, 
          -svgSize / 2, 
          svgSize, 
          svgSize
        )
        
        ctx.restore()
        
        // Call onBoardGenerated with both the image and the board parameters
        if (onBoardGenerated) {
          const boardData = {
            image: canvas.toDataURL('image/png'),
            boardSize,
            svgSize,
            thickness,
            svgPosition,
            svgRotation,
            svgScale
          }
          onBoardGenerated(boardData)
        }
      }
      
      // Convert SVG to data URL if it's not already
      if (svgContent.startsWith('<svg')) {
        const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' })
        const url = URL.createObjectURL(svgBlob)
        img.src = url
      } else {
        img.src = svgContent
      }
    }
  }

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Check if click is within SVG bounds
    const svgLeft = svgPosition.x - (svgSize * svgScale) / 2
    const svgRight = svgPosition.x + (svgSize * svgScale) / 2
    const svgTop = svgPosition.y - (svgSize * svgScale) / 2
    const svgBottom = svgPosition.y + (svgSize * svgScale) / 2
    
    if (x >= svgLeft && x <= svgRight && y >= svgTop && y <= svgBottom) {
      setIsDragging(true)
      setDragOffset({
        x: x - svgPosition.x,
        y: y - svgPosition.y
      })
    }
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    setSvgPosition({
      x: x - dragOffset.x,
      y: y - dragOffset.y
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleDownload = () => {
    if (canvasRef.current) {
      const link = document.createElement('a')
      link.download = 'svg-board.png'
      link.href = canvasRef.current.toDataURL()
      link.click()
    }
  }

  const resetPosition = () => {
    setSvgPosition({ x: boardSize / 2, y: boardSize / 2 })
    setSvgRotation(0)
    setSvgScale(1)
  }

  const zoomIn = () => {
    setSvgScale(prev => Math.min(prev * 1.2, 3))
  }

  const zoomOut = () => {
    setSvgScale(prev => Math.max(prev / 1.2, 0.3))
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header and Description */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Customize Your SVG Board
        </h3>
        <p className="text-gray-600">
          Adjust the size, thickness, and positioning of your SVG on the board
        </p>
      </div>

      {/* Board Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-gray-900">Board Settings</h4>
          <button
            onClick={() => setShowControls(!showControls)}
            className="p-2 rounded-md border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {showControls && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Board Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Board Size: {boardSize}px
              </label>
              <input
                type="range"
                min="100"
                max="400"
                step="10"
                value={boardSize}
                onChange={(e) => setBoardSize(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* SVG Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SVG Size: {svgSize}px
              </label>
              <input
                type="range"
                min="20"
                max="200"
                step="5"
                value={svgSize}
                onChange={(e) => setSvgSize(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Thickness */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thickness: {thickness} layers
              </label>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={thickness}
                onChange={(e) => setThickness(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* SVG Scale */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SVG Scale: {svgScale.toFixed(1)}x
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={zoomOut}
                  className="p-2 rounded-md border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={zoomIn}
                  className="p-2 rounded-md border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SVG Position and Rotation */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">SVG Position & Rotation</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* X Position */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              X Position: {svgPosition.x.toFixed(0)}
            </label>
            <input
              type="range"
              min="0"
              max={boardSize}
              step="1"
              value={svgPosition.x}
              onChange={(e) => setSvgPosition(prev => ({ ...prev, x: Number(e.target.value) }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Y Position */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Y Position: {svgPosition.y.toFixed(0)}
            </label>
            <input
              type="range"
              min="0"
              max={boardSize}
              step="1"
              value={svgPosition.y}
              onChange={(e) => setSvgPosition(prev => ({ ...prev, y: Number(e.target.value) }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Rotation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rotation: {svgRotation}°
            </label>
            <input
              type="range"
              min="0"
              max="360"
              step="1"
              value={svgRotation}
              onChange={(e) => setSvgRotation(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-center">
          <button
            onClick={resetPosition}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RotateCw className="w-4 h-4 mr-2" />
            Reset Position
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            className="border border-gray-300 rounded-lg cursor-move"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          />
        </div>
        
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>• Drag the SVG to reposition it on the board</p>
          <p>• Use the controls above to adjust size, thickness, and rotation</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={handleDownload}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Board
        </button>
      </div>
    </div>
  )
}

export default SvgBoardEditor
