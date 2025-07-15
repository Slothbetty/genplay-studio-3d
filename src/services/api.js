import axios from 'axios'

// Configuration for the Tripo 3D API
const isDevelopment = import.meta.env.DEV
const baseURL = isDevelopment 
  ? 'http://localhost:3001/api'  // Use local proxy in development
  : `${import.meta.env.VITE_RENDER_PROXY_URL || 'https://genplay-proxy.onrender.com'}/api`

// Debug logging
console.log('API Configuration:', {
  isDevelopment,
  baseURL,
  proxyURL: import.meta.env.VITE_RENDER_PROXY_URL,
  apiKey: import.meta.env.VITE_TRIPO_AI_API_KEY ? 'Set' : 'Not set'
})

const API_CONFIG = {
  baseURL: baseURL,
  timeout: 300000, // 5 minutes for model generation
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${import.meta.env.VITE_TRIPO_AI_API_KEY}`
  }
}

// Create axios instance
const apiClient = axios.create(API_CONFIG)

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url)
    return config
  },
  (error) => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url)
    return response
  },
  (error) => {
    // Don't log 404 errors for optional endpoints that we handle gracefully
    const isOptionalEndpoint = error.config?.url?.includes('/formats') || 
                              error.config?.url?.includes('/generation-options')
    
    if (!isOptionalEndpoint || error.response?.status !== 404) {
      console.error('API Response Error:', error.response?.status, error.response?.statusText)
    }
    return Promise.reject(error)
  }
)

// API Service Class for Tripo 3D
class Tripo3DService {
  constructor() {
    this.apiKey = import.meta.env.VITE_TRIPO_AI_API_KEY
    
    // Use the same proxy configuration as the main apiClient
    const isDevelopment = import.meta.env.DEV
    const proxyURL = isDevelopment 
      ? 'http://localhost:3001/api' 
      : `${import.meta.env.VITE_RENDER_PROXY_URL || 'https://genplay-proxy.onrender.com'}/api`
    
    console.log('Tripo3DService constructor:', {
      isDevelopment,
      proxyURL,
      apiKey: this.apiKey ? 'Set' : 'Not set'
    })
    
    this.apiClient = axios.create({
      baseURL: proxyURL,
      timeout: 30000,
      headers: {
        'Authorization': this.apiKey ? `Bearer ${this.apiKey}` : '',
        'Content-Type': 'application/json'
      }
    })

    // Add response interceptor for error handling
    this.apiClient.interceptors.response.use(
      response => response,
      error => {
        console.error('API Response Error:', error.response?.status, error.response?.statusText)
        return Promise.reject(error)
      }
    )
  }

  /**
   * Upload a file to Tripo 3D platform
   * @param {File} file - File to upload
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} Upload result
   */
  async uploadFile(file, options = {}) {
    try {
      if (!this.apiKey) {
        throw new Error('API key is required for file upload')
      }

      // Create form data for file upload
      const formData = new FormData()
      formData.append('file', file)
      
      // Add optional parameters
      if (options.name) formData.append('name', options.name)
      if (options.description) formData.append('description', options.description)
      if (options.tags) formData.append('tags', JSON.stringify(options.tags))
      if (options.visibility) formData.append('visibility', options.visibility)
      
      const response = await this.apiClient.post('/upload/sts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      return response.data
    } catch (error) {
      throw new Error(`File upload failed: ${error.response?.data?.message || error.message}`)
    }
  }

  /**
   * Get upload status
   * @param {string} uploadId - Upload ID
   * @returns {Promise<Object>} Upload status
   */
  async getUploadStatus(uploadId) {
    try {
      const response = await this.apiClient.get(`/upload/${uploadId}`)
      return response.data
    } catch (error) {
      throw new Error(`Failed to get upload status: ${error.response?.data?.message || error.message}`)
    }
  }

  /**
   * Get user's uploads
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Uploads list
   */
  async getUploads(params = {}) {
    try {
      const response = await this.apiClient.get('/upload', { params })
      return response.data
    } catch (error) {
      throw new Error(`Failed to get uploads: ${error.response?.data?.message || error.message}`)
    }
  }

  /**
   * Delete an upload
   * @param {string} uploadId - Upload ID to delete
   * @returns {Promise<Object>} Deletion result
   */
  async deleteUpload(uploadId) {
    try {
      const response = await this.apiClient.delete(`/upload/${uploadId}`)
      return response.data
    } catch (error) {
      throw new Error(`Failed to delete upload: ${error.response?.data?.message || error.message}`)
    }
  }

  /**
   * Generate a 3D model using Tripo 3D API
   * @param {Object} params - Generation parameters
   * @param {string} params.fileToken - File token from upload step
   * @param {string} params.prompt - Text description
   * @param {Object} params.options - Additional options
   * @returns {Promise<Object>} Generated model data
   */
  async generateModel({ fileToken, prompt, options = {} }) {
    let requestData // Declare outside try block for error logging
    
    console.log('=== generateModel called ===')
    console.log('fileToken:', fileToken)
    console.log('prompt:', prompt)
    console.log('options:', options)
    
    try {
      if (!this.apiKey) {
        throw new Error('API key is required for model generation')
      }

      if (!fileToken) {
        throw new Error('File token is required for model generation')
      }

      // Prepare the request data according to Tripo 3D API documentation
      requestData = {
        type: 'image_to_model',
        file: {
          file_token: fileToken
        },
        texture: false // Force texture to false for untextured base models
      }

      // Add only the most essential and definitely supported parameters
      if (options.model_version) {
        requestData.model_version = options.model_version
      }
      
      // Add prompt if provided
      if (prompt) {
        requestData.prompt = prompt
      }

      // Only add other parameters if they are explicitly set and valid
      const validOptions = [
        'model_seed', 'face_limit', 'pbr', 'texture_seed', 'texture_alignment',
        'texture_quality', 'auto_size', 'orientation', 'quad', 'smart_low_poly', 'generate_parts'
      ]

      validOptions.forEach(key => {
        if (options[key] !== undefined && options[key] !== null && options[key] !== '') {
          requestData[key] = options[key]
        }
      })

      console.log('Generation request data:', requestData)
      console.log('Generation request data (JSON):', JSON.stringify(requestData, null, 2))
      console.log('Options passed to generateModel:', options)

      const response = await this.apiClient.post('/task', requestData, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      console.log('Generation response:', response.data)
      return response.data
    } catch (error) {
      console.error('Generation error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        requestData: requestData
      })
      console.error('Full error response:', error.response)
      console.error('Error response data:', error.response?.data)
      console.error('Error message:', error.message)
      throw new Error(`Model generation failed: ${error.response?.data?.message || error.message}`)
    }
  }

  /**
   * Get task status using HTTP polling
   * @param {string} taskId - Task ID to check
   * @returns {Promise<Object>} Task status and result
   */
  async getTaskStatus(taskId) {
    try {
      const response = await this.apiClient.get(`/task/${taskId}`)
      return response.data
    } catch (error) {
      throw new Error(`Failed to get task status: ${error.response?.data?.message || error.message}`)
    }
  }

  /**
   * Monitor task status using HTTP polling
   * @param {string} taskId - Task ID to monitor
   * @param {Function} onProgress - Optional progress callback
   * @returns {Promise<Object>} Final task result
   */
  async monitorTaskStatus(taskId, onProgress = null) {
    const maxAttempts = 300 // 10 minutes with 2-second intervals
    let attempts = 0

    while (attempts < maxAttempts) {
      try {
        const result = await this.getTaskStatus(taskId)
        console.log(`Task status check ${attempts + 1}:`, result)

        // Call progress callback if provided
        if (onProgress && result.data) {
          onProgress(result.data)
        }

        const status = result.data?.status
        if (status === 'success' || status === 'completed') {
          return result
        } else if (status === 'failed') {
          throw new Error('Task failed')
        } else if (status === 'running' || status === 'queued') {
          // Continue polling
          await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2 seconds
          attempts++
        } else {
          // Unknown status, continue polling
          await new Promise(resolve => setTimeout(resolve, 2000))
          attempts++
        }
      } catch (error) {
        console.error(`Error checking task status (attempt ${attempts + 1}):`, error)
        if (attempts >= maxAttempts - 1) {
          throw error
        }
        await new Promise(resolve => setTimeout(resolve, 2000))
        attempts++
      }
    }

    throw new Error('Task monitoring timed out after 10 minutes')
  }

  /**
   * Get model generation status (legacy method - now uses HTTP polling)
   * @param {string} jobId - Generation job ID
   * @returns {Promise<Object>} Job status
   */
  async getGenerationStatus(jobId) {
    try {
      return await this.monitorTaskStatus(jobId)
    } catch (error) {
      throw new Error(`Failed to get generation status: ${error.message}`)
    }
  }

  /**
   * Download generated model
   * @param {string} modelIdOrUrl - Model ID or direct URL to the model file
   * @returns {Promise<Blob>} Model file blob
   */
  async downloadModel(modelIdOrUrl) {
    try {
      let response
      
      if (modelIdOrUrl.startsWith('http')) {
        // Direct URL provided - use proxy to avoid CORS
        console.log('Downloading model from direct URL via proxy:', modelIdOrUrl)
        const encodedUrl = encodeURIComponent(modelIdOrUrl)
        response = await this.apiClient.get(`/download?url=${encodedUrl}`, {
          responseType: 'blob'
        })
        return response.data
      } else {
        // Task ID provided, use proxy server
        console.log('Downloading model via proxy for task ID:', modelIdOrUrl)
        response = await this.apiClient.get(`/task/${modelIdOrUrl}/download`, {
          responseType: 'blob'
        })
        return response.data
      }
    } catch (error) {
      throw new Error(`Failed to download model: ${error.message}`)
    }
  }

  /**
   * Validate image file
   * @param {File} image - Image file to validate
   * @returns {Promise<Object>} Validation result
   */
  async validateImage(image) {
    try {
      const formData = new FormData()
      formData.append('image', image)
      
      const response = await this.apiClient.post('/validate-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      return response.data
    } catch (error) {
      throw new Error(`Image validation failed: ${error.response?.data?.message || error.message}`)
    }
  }

  /**
   * Get API health status
   * @returns {Promise<Object>} API health information
   */
  async getHealthStatus() {
    try {
      const response = await this.apiClient.get('/health')
      return response.data
    } catch (error) {
      throw new Error(`Failed to get API health: ${error.response?.data?.message || error.message}`)
    }
  }

  /**
   * Get user's generation history
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Generation history
   */
  async getGenerationHistory(params = {}) {
    try {
      const response = await this.apiClient.get('/generation', { params })
      return response.data
    } catch (error) {
      throw new Error(`Failed to get generation history: ${error.response?.data?.message || error.message}`)
    }
  }

  /**
   * Delete a generation
   * @param {string} generationId - Generation ID to delete
   * @returns {Promise<Object>} Deletion result
   */
  async deleteGeneration(generationId) {
    try {
      const response = await this.apiClient.delete(`/generation/${generationId}`)
      return response.data
    } catch (error) {
      throw new Error(`Failed to delete generation: ${error.response?.data?.message || error.message}`)
    }
  }

  /**
   * Convert a model to another format using Tripo 3D API
   * @param {Object} params - Conversion parameters
   * @param {string} params.original_model_task_id - The task_id of the original model
   * @param {string} params.format - Target format (GLTF, USDZ, FBX, OBJ, STL, 3MF)
   * @param {Object} params.options - Optional conversion options (quad, face_limit, etc.)
   * @returns {Promise<Object>} Conversion task result (task_id)
   */
  async convertModel({ original_model_task_id, format, options = {} }) {
    try {
      if (!this.apiKey) {
        throw new Error('API key is required for model conversion')
      }
      if (!original_model_task_id) {
        throw new Error('original_model_task_id is required for model conversion')
      }
      if (!format) {
        throw new Error('Target format is required for model conversion')
      }
      const requestData = {
        type: 'convert_model',
        format,
        original_model_task_id,
        ...options
      }
      const response = await this.apiClient.post('/task', requestData, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      return response.data
    } catch (error) {
      throw new Error(`Model conversion failed: ${error.response?.data?.message || error.message}`)
    }
  }
}

// Mock API service for development (when API key is not available)
class MockTripo3DService {
  async uploadFile(file, options = {}) {
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Return mock upload response
    return {
      id: `upload_${Date.now()}`,
      name: options.name || file.name,
      description: options.description || '',
      file_url: URL.createObjectURL(file),
      file_size: file.size,
      file_type: file.type,
      status: 'completed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: options.tags || [],
      visibility: options.visibility || 'private'
    }
  }

  async getUploadStatus(uploadId) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return {
      id: uploadId,
      status: 'completed',
      progress: 100,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }

  async getUploads(params = {}) {
    return {
      uploads: [],
      total: 0,
      page: 1,
      limit: 10
    }
  }

  async deleteUpload(uploadId) {
    return {
      success: true,
      message: 'Upload deleted successfully'
    }
  }

  async generateModel({ fileToken, prompt, options = {} }) {
    // Simulate generation delay
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Return mock generation response matching Tripo 3D API format
    return {
      data: {
        task_id: `task_${Date.now()}`,
        status: 'processing',
        type: 'image_to_model',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }
  }

  async getGenerationStatus(generationId) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return {
      id: generationId,
      status: 'completed',
      progress: 100,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      model_url: 'https://example.com/mock-model.glb',
      format: 'glb',
      prompt: 'Mock generated model',
      quality: 'high',
      style: 'realistic'
    }
  }

  async downloadModel(generationId) {
    // Return a mock blob
    return new Blob(['Mock 3D model data'], { type: 'model/gltf-binary' })
  }

  async validateImage(image) {
    return {
      valid: true,
      format: image.type,
      size: image.size,
      dimensions: { width: 512, height: 512 },
      message: 'Image is valid'
    }
  }

  async getHealthStatus() {
    return {
      status: 'healthy',
      version: '1.0.0',
      uptime: '99.9%'
    }
  }

  async getGenerationHistory(params = {}) {
    return {
      generations: [],
      total: 0,
      page: 1,
      limit: 10
    }
  }

  async deleteGeneration(generationId) {
    return {
      success: true,
      message: 'Generation deleted successfully'
    }
  }
}

// Export the appropriate service based on environment
const hasApiKey = import.meta.env.VITE_TRIPO_AI_API_KEY

// Use real API if key is available, otherwise use mock
export const tripo3DService = hasApiKey 
  ? new Tripo3DService() 
  : new MockTripo3DService()

export default tripo3DService 