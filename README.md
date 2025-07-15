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

## 🖥️ Local Development

To run the app locally, you need two terminals:

1. **Frontend (Vite dev server):**
   ```bash
   npm run dev
   ```
   This starts the React frontend at [http://localhost:5173](http://localhost:5173).

2. **Backend Proxy:**
   In a separate terminal, run:
   ```bash
   node proxy-server.js
   ```
   This starts the local proxy server required for API requests.

Open your browser and navigate to [http://localhost:5173](http://localhost:5173).

## 📁 Project Structure

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

## 📜 Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
npm run lint:fix  # Fix linting issues
```

## ⚙️ Technologies Used

- **Frontend**: React 18, Vite
- **3D Graphics**: Three.js, React Three Fiber
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **API**: Axios for HTTP requests

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **API Issues**: Contact [Tripo 3D Support](https://platform.tripo3d.ai/support)
- **App Issues**: Create an issue in this repository
- **Documentation**: See [TRIPO_AI_SETUP.md](./TRIPO_AI_SETUP.md)

---

**Made with ❤️ for 3D creators everywhere** 