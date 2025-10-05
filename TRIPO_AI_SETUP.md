# Tripo 3D AI Integration Setup

This project integrates with the [Tripo 3D AI platform](https://platform.tripo3d.ai) to generate 3D models from images and text prompts.

## Features

- **Image Upload**: Upload reference images to Tripo 3D platform
- **Text-to-3D Generation**: Generate 3D models using AI with image and text prompts
- **Real-time Progress**: Monitor generation progress with live updates
- **3D Model Viewer**: Interactive 360-degree model viewing
- **Multiple Formats**: Support for GLB, glTF, OBJ, and FBX formats
- **Advanced Options**: Quality, style, resolution, and generation parameters

## API Integration

### Upload API

The app includes full integration with the [Tripo 3D Upload API](https://platform.tripo3d.ai/docs/upload):

#### Upload File
```javascript
// Upload a file with options
const uploadResult = await tripo3DService.uploadFile(file, {
  name: 'My Model',
  description: 'A 3D model generated from my image',
  tags: ['3d', 'ai-generated'],
  visibility: 'private' // 'private', 'public', 'unlisted'
})
```

#### Get Upload Status
```javascript
// Check upload status
const status = await tripo3DService.getUploadStatus(uploadId)
```

#### Get User Uploads
```javascript
// Get all user uploads
const uploads = await tripo3DService.getUploads({
  page: 1,
  limit: 10,
  visibility: 'private'
})
```

#### Delete Upload
```javascript
// Delete an upload
await tripo3DService.deleteUpload(uploadId)
```

### Generation API

#### Generate 3D Model
```javascript
// Generate model with image and text
const generationResult = await tripo3DService.generateModel({
  image: imageFile,
  prompt: 'A detailed 3D model of a futuristic car',
  options: {
    quality: 'high', // 'low', 'medium', 'high', 'ultra'
    style: 'realistic', // 'realistic', 'cartoon', 'abstract', 'stylized'
    format: 'glb', // 'glb', 'gltf', 'obj', 'fbx'
    resolution: '1024', // '512', '1024', '2048'
    seed: 12345, // Optional: specific seed for reproducible results
    guidance_scale: 7.5, // 1-20: controls how closely to follow the prompt
    num_inference_steps: 50 // 10-100: more steps = higher quality but slower
  }
})
```

#### Get Generation Status
```javascript
// Poll for generation status
const status = await tripo3DService.getGenerationStatus(generationId)
// Returns: { status, progress, model_url, format, created_at, updated_at }
```

#### Download Model
```javascript
// Download the generated model
const modelBlob = await tripo3DService.downloadModel(generationId)
const modelUrl = URL.createObjectURL(modelBlob)
```

### Additional API Endpoints

#### Get Available Formats
```javascript
const formats = await tripo3DService.getAvailableFormats()
// Returns: [{ id, name, description }, ...]
```

#### Get Generation Options
```javascript
const options = await tripo3DService.getGenerationOptions()
// Returns: { maxImageSize, supportedFormats, qualityOptions, styleOptions, ... }
```

#### Validate Image
```javascript
const validation = await tripo3DService.validateImage(imageFile)
// Returns: { valid, format, size, dimensions, message }
```

#### Get API Health
```javascript
const health = await tripo3DService.getHealthStatus()
// Returns: { status, version, uptime }
```

#### Get Generation History
```javascript
const history = await tripo3DService.getGenerationHistory({
  page: 1,
  limit: 10
})
```

#### Delete Generation
```javascript
await tripo3DService.deleteGeneration(generationId)
```

## Environment Setup

### 1. Get API Key

1. Visit [Tripo 3D Platform](https://platform.tripo3d.ai)
2. Sign up for an account
3. Navigate to API settings
4. Generate your API key

### 2. Environment Variables

Create a `.env` file in the project root:

```env
# Tripo 3D API Configuration
VITE_TRIPO_AI_API_KEY=your_api_key_here
VITE_TRIPO_AI_API_URL=https://platform.tripo3d.ai/api/v1

# Email Configuration (for contact form)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Server Configuration
PORT=3001
NODE_ENV=development
```

### 3. API Configuration

The app automatically detects your environment:
- **Production with API key**: Uses real Tripo 3D API
- **Development without API key**: Uses mock service for testing

## File Upload Features

### Supported Formats
- **Images**: JPEG, JPG, PNG, GIF, WebP
- **Maximum Size**: 10MB per file
- **3D Models**: GLB, glTF, OBJ, FBX

### Upload Options
- **Name**: Custom name for the upload
- **Description**: Detailed description
- **Tags**: Comma-separated tags for organization
- **Visibility**: Private, Public, or Unlisted

### Upload Process
1. **File Selection**: Drag & drop or click to browse
2. **Validation**: Automatic format and size validation
3. **Options**: Configure upload metadata
4. **Upload**: Progress tracking with real-time updates
5. **Completion**: Success confirmation and file management

## Generation Features

### Quality Options
- **Low**: Fast generation, basic quality
- **Medium**: Balanced speed and quality
- **High**: High quality, moderate speed
- **Ultra**: Maximum quality, slower generation

### Style Options
- **Realistic**: Photorealistic rendering
- **Cartoon**: Stylized cartoon appearance
- **Abstract**: Artistic abstract interpretation
- **Stylized**: Custom artistic style

### Advanced Parameters
- **Seed**: Reproducible results with same seed
- **Guidance Scale**: How closely to follow the prompt (1-20)
- **Inference Steps**: Quality vs. speed trade-off (10-100)

## Error Handling

The app includes comprehensive error handling:

- **Network Errors**: Automatic retry with exponential backoff
- **API Errors**: User-friendly error messages
- **Validation Errors**: Real-time input validation
- **Timeout Handling**: Graceful timeout for long operations

## Development

### Mock Service

When no API key is provided, the app uses a mock service that:
- Simulates API responses
- Provides realistic delays
- Allows testing without API calls
- Generates sample 3D models

### Testing

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start proxy server (required for API and email)
npm run proxy

# Build for production
npm run build
```

## Contact Form Integration

The app includes a professional contact form that integrates with the Tripo 3D services:

### Features:
- **Service-specific inquiries**: Users can request quotes for specific services
- **Direct email delivery**: Form submissions are sent directly to `info@genplayai.io`
- **Loading states**: Professional loading spinners during form submission
- **Form validation**: Client-side validation for required fields
- **Success feedback**: User-friendly success and error messages

### Usage:
1. Users navigate to the Services section on the landing page
2. Click "Get Quote" or "Learn More" on any service
3. Fill out the contact form with their details
4. Click "Submit Request" to send the inquiry
5. Form shows loading state and success message
6. Email is automatically sent to `info@genplayai.io`

For detailed email setup instructions, see [EMAIL_SETUP.md](./EMAIL_SETUP.md).

## API Documentation

For complete API documentation, visit:
- [Tripo 3D Upload API](https://platform.tripo3d.ai/docs/upload)
- [Tripo 3D Generation API](https://platform.tripo3d.ai/docs/generation)
- [Tripo 3D Platform](https://platform.tripo3d.ai)

## Support

- **API Issues**: Contact Tripo 3D support
- **App Issues**: Check the project repository
- **Documentation**: Refer to official Tripo 3D docs

## License

This project is licensed under the MIT License. See LICENSE file for details. 