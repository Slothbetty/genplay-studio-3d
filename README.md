# GenPlay Studio 3D - AI Model Generator

A modern web application for generating 3D models using AI, built with React, Three.js, and integrated with the Tripo 3D AI platform.

## ✨ Features

- **🎨 Image Upload**: Drag & drop interface for uploading reference images
- **📝 Text-to-3D**: Generate 3D models using AI with image and text prompts
- **🔄 Real-time Progress**: Live progress tracking during model generation
- **🎮 3D Viewer**: Interactive 360-degree model viewing with Three.js
- **📁 File Management**: Upload, organize, and manage files on Tripo 3D platform
- **⚙️ Advanced Options**: Quality, style, resolution, and generation parameters
- **📱 Responsive Design**: Works on desktop and mobile devices
- **🎯 Multiple Formats**: Support for GLB, glTF, OBJ, and FBX formats

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Tripo 3D API key (optional for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "GenPlay Studio 3D"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (optional)
   ```bash
   # Create .env file
   echo "VITE_TRIPO_AI_API_KEY=your_api_key_here" > .env
   echo "VITE_TRIPO_AI_API_URL=https://platform.tripo3d.ai/api/v1" >> .env
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 📋 Usage

### Step 1: Upload Image
- Drag and drop an image or click to browse
- Supported formats: JPEG, PNG, GIF, WebP
- Maximum file size: 10MB
- Optional: Configure upload metadata (name, description, tags, visibility)

### Step 2: Add Text Description
- Enter a detailed description of the 3D model you want to generate
- Be specific about style, details, and modifications

### Step 3: Configure Generation Options
- **Quality**: Low, Medium, High, Ultra
- **Style**: Realistic, Cartoon, Abstract, Stylized
- **Format**: GLB, glTF, OBJ, FBX
- **Resolution**: 512, 1024, 2048
- **Advanced**: Seed, Guidance Scale, Inference Steps

### Step 4: Generate & View
- Click "Generate Model" to start the AI process
- Monitor real-time progress
- View your 3D model in the interactive viewer
- Download or share your creation

## 🔧 API Integration

### Tripo 3D Platform

This app integrates with the [Tripo 3D AI platform](https://platform.tripo3d.ai) for:

- **File Upload**: Upload and manage images on the platform
- **Model Generation**: Generate 3D models using AI
- **Progress Tracking**: Real-time generation status
- **Model Download**: Download generated models

### API Features

- **Upload API**: Full integration with [Tripo 3D Upload API](https://platform.tripo3d.ai/docs/upload)
- **Generation API**: Complete [Tripo 3D Generation API](https://platform.tripo3d.ai/docs/generation) support
- **File Management**: Upload, organize, and manage files
- **Error Handling**: Comprehensive error handling and user feedback

### Environment Setup

For production use, set up your environment variables:

```env
# Tripo 3D API Configuration
VITE_TRIPO_AI_API_KEY=your_api_key_here
VITE_TRIPO_AI_API_URL=https://platform.tripo3d.ai/api/v1
```

**Note**: Without an API key, the app uses a mock service for development and testing.

## 🛠️ Development

### Project Structure

```
src/
├── components/          # React components
│   ├── Header.jsx      # Application header
│   ├── ImageUpload.jsx # Image upload with drag & drop
│   ├── TextInput.jsx   # Text prompt input
│   ├── ModelGenerator.jsx # Generation options and controls
│   └── ModelViewer.jsx # 3D model viewer
├── services/
│   └── api.js          # Tripo 3D API service
├── config/
│   └── api.js          # API configuration
└── App.jsx             # Main application component
```

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Linting
npm run lint         # Run ESLint
npm run lint:fix     # Fix linting issues
```

### Technologies Used

- **Frontend**: React 18, Vite
- **3D Graphics**: Three.js, React Three Fiber
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **API**: Axios for HTTP requests
- **Build Tool**: Vite

## 📚 Documentation

- **[Tripo 3D Upload API](https://platform.tripo3d.ai/docs/upload)** - File upload documentation
- **[Tripo 3D Generation API](https://platform.tripo3d.ai/docs/generation)** - Model generation documentation
- **[TRIPO_AI_SETUP.md](./TRIPO_AI_SETUP.md)** - Detailed setup guide
- **[Three.js Documentation](https://threejs.org/docs/)** - 3D graphics library
- **[React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)** - React renderer for Three.js

## 🎨 Customization

### Styling

The app uses Tailwind CSS for styling. Customize the design by modifying:

- `tailwind.config.js` - Tailwind configuration
- `src/index.css` - Global styles
- Component-specific classes in each component

### Components

Each component is modular and can be customized:

- **ImageUpload**: File upload interface and validation
- **TextInput**: Text prompt input with character limits
- **ModelGenerator**: Generation options and controls
- **ModelViewer**: 3D model display and interaction

### API Integration

The API service (`src/services/api.js`) can be extended to support:

- Additional Tripo 3D API endpoints
- Custom authentication methods
- Rate limiting and caching
- Error handling strategies

## 🐛 Troubleshooting

### Common Issues

1. **"API key is required" error**
   - Set `VITE_TRIPO_AI_API_KEY` in your `.env` file
   - Restart the development server

2. **File upload fails**
   - Check file size (max 10MB)
   - Verify file format (JPEG, PNG, GIF, WebP)
   - Ensure internet connection

3. **3D model doesn't load**
   - Check browser console for errors
   - Verify model format is supported
   - Try refreshing the page

4. **Generation times out**
   - Check API key validity
   - Verify Tripo 3D service status
   - Try with lower quality settings

### Debug Mode

Enable detailed logging by adding to `.env`:
```env
VITE_DEBUG_API=true
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Tripo 3D](https://platform.tripo3d.ai) for the AI model generation API
- [Three.js](https://threejs.org/) for 3D graphics capabilities
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/) for React integration
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Lucide](https://lucide.dev/) for beautiful icons

## 📞 Support

- **API Issues**: Contact [Tripo 3D Support](https://platform.tripo3d.ai/support)
- **App Issues**: Create an issue in this repository
- **Documentation**: Check the [TRIPO_AI_SETUP.md](./TRIPO_AI_SETUP.md) file

---

**Made with ❤️ for 3D creators everywhere** 