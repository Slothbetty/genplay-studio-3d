// Tripo 3D API Configuration
export const API_CONFIG = {
  // Base URL for the Tripo 3D API
  baseURL: import.meta.env.VITE_TRIPO_AI_API_URL || 'https://platform.tripo3d.ai/api/v1',
  
  // API Key (set in environment variables)
  apiKey: import.meta.env.VITE_TRIPO_AI_API_KEY,
  
  // Convertio API Configuration
  convertio: {
    baseURL: 'https://api.convertio.co',
    apiKey: import.meta.env.VITE_CONVERTIO_API_KEY,
    endpoints: {
      convert: '/convert',
      status: '/convert/:id/status',
      download: '/convert/:id/dl'
    }
  },
  
  // Request timeout (5 minutes for model generation)
  timeout: 300000,
  
  // API Endpoints based on Tripo 3D API documentation
  endpoints: {
    // Model generation
    generateModel: '/generation',
    generationStatus: '/generation',
    downloadModel: '/generation',
    
    // API information
    formats: '/formats',
    generationOptions: '/generation-options',
    validateImage: '/validate-image',
    health: '/health',
    
    // Additional endpoints
    generationHistory: '/generation',
    deleteGeneration: '/generation',
    
    // Alternative endpoint names (if your API uses different names)
    alternativeEndpoints: {
      generateModel: ['/generate', '/create', '/model/generate'],
      generationStatus: ['/status', '/job-status', '/model/status'],
      downloadModel: ['/model/download', '/download', '/model/file']
    }
  },
  
  // Default generation options based on Tripo 3D API
  defaultOptions: {
    quality: 'high',
    format: 'glb',
    style: 'realistic',
    resolution: '1024x1024',
    seed: null, // Random seed for reproducibility
    guidance_scale: 7.5, // Controls how closely the model follows the prompt
    num_inference_steps: 50 // Number of denoising steps
  },
  
  // Supported file formats
  supportedImageFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  supportedModelFormats: ['glb', 'gltf', 'obj', 'fbx', 'stl'],
  
  // File size limits
  maxImageSize: 10 * 1024 * 1024, // 10MB
  maxModelSize: 100 * 1024 * 1024, // 100MB
  
  // Polling configuration
  polling: {
    interval: 5000, // 5 seconds
    maxAttempts: 60, // 5 minutes total
    timeout: 300000 // 5 minutes
  },
  
  // Generation parameters based on Tripo 3D API
  generationParams: {
    quality: {
      low: { num_inference_steps: 20, guidance_scale: 5.0 },
      medium: { num_inference_steps: 35, guidance_scale: 6.5 },
      high: { num_inference_steps: 50, guidance_scale: 7.5 },
      ultra: { num_inference_steps: 75, guidance_scale: 8.5 }
    },
    style: {
      realistic: { style_preset: 'realistic' },
      cartoon: { style_preset: 'cartoon' },
      abstract: { style_preset: 'abstract' },
      stylized: { style_preset: 'stylized' }
    }
  }
}

// Environment detection
export const isProduction = import.meta.env.PROD
export const isDevelopment = import.meta.env.DEV

// API availability check
export const isApiAvailable = () => {
  return !!(API_CONFIG.apiKey && API_CONFIG.baseURL)
}

// Convertio API availability check
export const isConvertioAvailable = () => {
  return !!(API_CONFIG.convertio.apiKey)
}

// Get the correct endpoint URL
export const getEndpointUrl = (endpointName) => {
  const baseUrl = API_CONFIG.baseURL.replace(/\/$/, '') // Remove trailing slash
  const endpoint = API_CONFIG.endpoints[endpointName]
  
  if (!endpoint) {
    throw new Error(`Unknown endpoint: ${endpointName}`)
  }
  
  return `${baseUrl}${endpoint}`
}

// Get alternative endpoints for fallback
export const getAlternativeEndpoints = (endpointName) => {
  const alternatives = API_CONFIG.endpoints.alternativeEndpoints[endpointName] || []
  return alternatives.map(alt => `${API_CONFIG.baseURL}${alt}`)
}

// Get generation parameters for a specific quality and style
export const getGenerationParams = (quality = 'high', style = 'realistic') => {
  const qualityParams = API_CONFIG.generationParams.quality[quality] || {}
  const styleParams = API_CONFIG.generationParams.style[style] || {}
  
  return {
    ...API_CONFIG.defaultOptions,
    ...qualityParams,
    ...styleParams,
    quality,
    style
  }
}

export default API_CONFIG 