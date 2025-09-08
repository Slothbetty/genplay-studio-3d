import { API_CONFIG } from '../config/api'

/**
 * Service for converting SVG files to STL 3D models
 */
class SvgToStlService {
  constructor() {
    this.baseURL = API_CONFIG.svgToStl.baseURL
    this.endpoint = API_CONFIG.svgToStl.endpoints.convert
  }

  /**
   * Convert SVG content to STL format
   * @param {string} svgContent - SVG content as string
   * @param {Object} options - Conversion options
   * @param {string} options.format - Output format (default: 'stl')
   * @param {number} options.depth - Model depth (default: 2)
   * @param {number} options.size - Model size (default: 100)
   * @returns {Promise<Object>} Conversion result with download URL
   */
  async convertSvgToStl(svgContent, options = {}) {
    try {
      const {
        format = 'stl',
        depth = 2,
        size = 100
      } = options

      // Create FormData for the request
      const formData = new FormData()
      
      // Create a blob from SVG content
      const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' })
      formData.append('file', svgBlob, 'converted-image.svg')
      formData.append('format', format)
      formData.append('depth', depth.toString())
      formData.append('size', size.toString())

      console.log('Converting SVG to STL with options:', { format, depth, size })

      const response = await fetch(`${this.baseURL}${this.endpoint}`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`SVG to STL conversion failed: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const result = await response.json()
      console.log('SVG to STL conversion result:', result)

      // Ensure the result has the expected structure
      if (result && result.downloadUrl) {
        return {
          ...result,
          stlUrl: result.downloadUrl, // Add stlUrl for the viewer
          format: result.format || format,
          size: result.size || size,
          depth: result.depth || depth
        }
      }

      return result
    } catch (error) {
      console.error('SVG to STL conversion error:', error)
      throw new Error(`Failed to convert SVG to STL: ${error.message}`)
    }
  }

  /**
   * Download STL file from URL using proxy to avoid CORS issues
   * @param {string} downloadUrl - URL to download the STL file
   * @param {string} filename - Optional filename for the download
   * @returns {Promise<Blob>} STL file blob
   */
  async downloadStlFile(downloadUrl, filename = 'model.stl') {
    try {
      // Use proxy server to avoid CORS issues
      const isDevelopment = import.meta.env.DEV
      const proxyUrl = isDevelopment
        ? `http://localhost:3001/api/download?url=${encodeURIComponent(downloadUrl)}`
        : `${import.meta.env.VITE_RENDER_PROXY_URL || 'https://genplay-proxy.onrender.com'}/api/download?url=${encodeURIComponent(downloadUrl)}`
      
      console.log('Downloading STL via proxy:', proxyUrl)
      
      const response = await fetch(proxyUrl)
      
      if (!response.ok) {
        throw new Error(`Failed to download STL file: ${response.status} ${response.statusText}`)
      }

      const blob = await response.blob()
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      return blob
    } catch (error) {
      console.error('STL download error:', error)
      throw new Error(`Failed to download STL file: ${error.message}`)
    }
  }

  /**
   * Convert SVG file to STL with progress tracking
   * @param {string} svgContent - SVG content as string
   * @param {Object} options - Conversion options
   * @param {Function} onProgress - Progress callback function
   * @returns {Promise<Object>} Conversion result
   */
  async convertWithProgress(svgContent, options = {}, onProgress = null) {
    try {
      if (onProgress) {
        onProgress({ status: 'starting', message: '🔄 Preparing SVG file for conversion...' })
      }

      // Simulate preparation step
      await new Promise(resolve => setTimeout(resolve, 500))

      if (onProgress) {
        onProgress({ status: 'processing', message: '⚙️ Processing SVG geometry and paths...' })
      }

      // Simulate processing step
      await new Promise(resolve => setTimeout(resolve, 800))

      if (onProgress) {
        onProgress({ status: 'generating', message: '🏗️ Generating 3D STL model...' })
      }

      const result = await this.convertSvgToStl(svgContent, options)

      if (onProgress) {
        onProgress({ status: 'finalizing', message: '✨ Finalizing STL model...' })
      }

      // Simulate finalization step
      await new Promise(resolve => setTimeout(resolve, 300))

      if (onProgress) {
        onProgress({ status: 'completed', message: '✅ STL model generated successfully!' })
      }

      return result
    } catch (error) {
      if (onProgress) {
        onProgress({ status: 'error', message: `❌ Conversion failed: ${error.message}` })
      }
      throw error
    }
  }
}

// Create and export a singleton instance
export const svgToStlService = new SvgToStlService()
export default svgToStlService
