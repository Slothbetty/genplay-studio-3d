#!/bin/bash

# GenPlay Studio 3D - Render Deployment Script
echo "🚀 Preparing GenPlay Studio 3D for Render deployment..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    echo "   git remote add origin <your-github-repo-url>"
    exit 1
fi

# Check if all required files exist
echo "📋 Checking required files..."
required_files=("render.yaml" "proxy-server.js" "package.json" "src/services/api.js")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Missing required file: $file"
        exit 1
    fi
done
echo "✅ All required files found"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Please create one with your API key:"
    echo "   VITE_TRIPO_AI_API_KEY=your_api_key_here"
    echo ""
    read -p "Do you want to continue without .env? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Build the project
echo "🔨 Building project..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi
echo "✅ Build successful"

# Check git status
echo "📊 Checking git status..."
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Changes detected. Committing..."
    git add .
    git commit -m "Prepare for Render deployment"
fi

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main
if [ $? -ne 0 ]; then
    echo "❌ Push failed. Please check your git remote and try again."
    exit 1
fi
echo "✅ Code pushed to GitHub"

echo ""
echo "🎉 Deployment preparation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Go to https://dashboard.render.com"
echo "2. Sign up/login with your GitHub account"
echo "3. Click 'New +' → 'Static Site'"
echo "4. Select your GenPlay Studio 3D repository"
echo "5. Configure:"
echo "   - Name: genplay-studio-3d"
echo "   - Build Command: npm install && npm run build"
echo "   - Publish Directory: dist"
echo "6. Add environment variables:"
echo "   - VITE_TRIPO_AI_API_KEY=your_api_key_here"
echo "   - VITE_RENDER_PROXY_URL=https://genplay-proxy.onrender.com"
echo "7. Click 'Create Static Site'"
echo ""
echo "🔧 Then create the proxy service:"
echo "1. Click 'New +' → 'Web Service'"
echo "2. Select the same repository"
echo "3. Configure:"
echo "   - Name: genplay-proxy"
echo "   - Environment: Node"
echo "   - Build Command: npm install"
echo "   - Start Command: node proxy-server.js"
echo "4. Add environment variables:"
echo "   - VITE_TRIPO_AI_API_KEY=your_api_key_here"
echo "   - NODE_ENV=production"
echo "5. Click 'Create Web Service'"
echo ""
echo "🌐 Your app will be available at: https://genplay-studio-3d.onrender.com"
echo "🔗 Proxy service will be at: https://genplay-proxy.onrender.com"
echo ""
echo "💡 Total cost: $0-14/month (vs $20-70/month on AWS)!" 