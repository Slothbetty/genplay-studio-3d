# GenPlay Studio 3D - AI Model Generator

A modern web application for generating 3D models using AI, built with React, Three.js, and integrated with the Tripo 3D AI platform.

## ✨ Features

- **🎨 Style Selection**: Choose from Funko Pop Style, Outline Art, and other styles
- **🖼️ Image Upload**: Drag & drop interface for uploading reference images
- **🔄 Dynamic Image Management**: Upload, change, or remove reference images directly in the Model Generator
- **📝 Text-to-3D**: Generate 3D models using AI with image and text prompts (Funko Pop style)
- **✏️ Editable Prompts**: Modify text descriptions for 3D model generation on the fly
- **🎨 SVG Board Editor**: Customize SVG placement on boards with adjustable thickness and size (Outline Art style)
- **🔄 Real-time Progress**: Live progress tracking during model generation
- **🎮 3D Viewer**: Interactive 360-degree model viewing with Three.js
- **📁 File Management**: Upload, organize, and manage files on Tripo 3D platform
- **⚙️ Advanced Options**: Quality, style, resolution, and generation parameters
- **📱 Responsive Design**: Works on desktop and mobile devices
- **🎯 Multiple Formats**: Support for GLB, glTF, OBJ, and FBX formats
- **📧 Contact Form**: Professional contact form with direct email integration
- **⏳ Loading States**: Smooth loading spinners and user feedback
- **🎨 Modern UI**: Beautiful landing page with services showcase

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- npm or yarn
- Tripo 3D API key (optional for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd genplay-studio-3d
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Set up environment variables**
   ```bash
   # Create .env file
   echo "VITE_TRIPO_AI_API_KEY=your_api_key_here" > .env
   echo "EMAIL_USER=your-email@gmail.com" >> .env
   echo "EMAIL_PASS=your-app-password" >> .env
   echo "PORT=3001" >> .env
   echo "NODE_ENV=development" >> .env
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
   npm run proxy
   ```
   This starts the local proxy server required for API requests and email functionality.

Open your browser and navigate to [http://localhost:5173](http://localhost:5173).

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Header.jsx      # Application header
│   ├── ImageUpload.jsx # Image upload with drag & drop
│   ├── TextInput.jsx   # Text prompt input
│   ├── ModelGenerator.jsx # Generation options, image upload, and prompt editing
│   ├── ModelViewer.jsx # 3D model viewer
│   ├── ImageEdit.jsx   # AI image editing and SVG conversion
│   ├── SvgBoardEditor.jsx # SVG board customization with thickness and positioning
│   └── landing/        # Landing page components
│       ├── Header.jsx  # Landing page header
│       ├── Hero.jsx    # Hero section
│       ├── Services.jsx # Services showcase with contact form
│       ├── Gallery.jsx # Image gallery
│       └── Footer.jsx  # Footer with contact info
├── services/
│   └── api.js          # Tripo 3D API service
├── config/
│   └── api.js          # API configuration
├── App.jsx             # Main application component
└── main.jsx            # Application entry point
```

## 📜 Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run proxy     # Start proxy server for API and email
npm run lint      # Run ESLint
npm run lint:fix  # Fix linting issues
```

## ⚙️ Technologies Used

- **Frontend**: React 18, Vite
- **3D Graphics**: Three.js, React Three Fiber
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **API**: Axios for HTTP requests
- **Backend**: Express.js, Node.js
- **Email**: Nodemailer for contact form
- **UI Components**: Radix UI

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **API Issues**: Contact [Tripo 3D Support](https://platform.tripo3d.ai/support)
- **App Issues**: Create an issue in this repository
- **Email Setup**: See [EMAIL_SETUP.md](./EMAIL_SETUP.md)
- **API Documentation**: See [TRIPO_AI_SETUP.md](./TRIPO_AI_SETUP.md)
- **Deployment**: See [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) or [DEPLOYMENT.md](./DEPLOYMENT.md)

---

**Made with ❤️ for 3D creators everywhere** 