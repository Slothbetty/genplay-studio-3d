# GenPlay Studio 3D - AI Model Generator

A modern web application for generating 3D models using AI, built with React, Three.js, and integrated with the Tripo 3D AI platform. Features a complete newsletter system with email confirmation, PostgreSQL database, and professional contact forms.

## ✨ Features

### Core Features
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

### Newsletter System
- **📧 Email Subscription**: Simple email subscription form on landing page
- **✅ Email Confirmation**: Double opt-in with email verification
- **📬 Welcome Emails**: Automatic welcome email after verification
- **👨‍💼 Admin Panel**: Newsletter management and subscriber tracking
- **📊 Subscriber Management**: View all subscribers with status tracking
- **📤 Newsletter Sending**: Send newsletters to all verified subscribers
- **📧 Gmail Group Integration**: Send subscriber lists to Gmail groups
- **🔒 Privacy Compliant**: GDPR and CAN-SPAM Act compliant

### Contact System
- **📧 Contact Form**: Professional contact form with direct email integration
- **⏳ Loading States**: Smooth loading spinners and user feedback
- **🎨 Modern UI**: Beautiful landing page with services showcase
- **📝 Form Validation**: Client-side validation for required fields
- **✅ Success Feedback**: User-friendly success and error messages

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn
- Tripo 3D API key (optional for development)
- PostgreSQL database (for production)

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
   echo "DATABASE_URL=postgresql://username:password@host:port/database" >> .env
   echo "FRONTEND_URL=http://localhost:3000" >> .env
   echo "NODE_ENV=development" >> .env
   echo "PORT=3001" >> .env
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
   This starts the local proxy server required for API requests, email functionality, and database operations.

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
│   ├── NewsletterAdmin.jsx # Newsletter management admin panel
│   ├── NewsletterConfirmation.jsx # Email verification confirmation page
│   └── landing/        # Landing page components
│       ├── Header.jsx  # Landing page header
│       ├── Hero.jsx    # Hero section
│       ├── Services.jsx # Services showcase with contact form
│       ├── Gallery.jsx # Image gallery
│       ├── Newsletter.jsx # Newsletter subscription
│       └── Footer.jsx  # Footer with contact info
├── services/
│   └── api.js          # Tripo 3D API service
├── database/
│   └── index.js        # Database connection and operations
├── App.jsx             # Main application component
└── main.jsx            # Application entry point
```

## 📜 Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run proxy     # Start proxy server for API, email, and database
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
- **Database**: PostgreSQL
- **Email**: Nodemailer for contact form and newsletter
- **UI Components**: Radix UI

## 🗄️ Database Setup

### PostgreSQL Database

The application uses PostgreSQL for data storage with the following tables:

#### Newsletter Subscribers Table
```sql
CREATE TABLE newsletter_subscribers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending',
  verification_token VARCHAR(255),
  verification_expiry TIMESTAMP,
  verified_at TIMESTAMP,
  unsubscribed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Users Table (for future features)
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Settings Table (for application configuration)
```sql
CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Database Operations

```javascript
import { newsletterDB } from './src/database/index.js';

// Add subscriber
await newsletterDB.addSubscriber({
  email: 'user@example.com',
  status: 'pending',
  verificationToken: 'token123',
  verificationExpiry: new Date()
});

// Get subscriber
const subscriber = await newsletterDB.getSubscriberByEmail('user@example.com');

// Verify subscriber
await newsletterDB.verifySubscriber('user@example.com');
```

## 📧 Email Configuration

### Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password (not your regular Gmail password) in `EMAIL_PASS`

### Environment Variables

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database

# Frontend Configuration
FRONTEND_URL=http://localhost:3000

# API Configuration
VITE_TRIPO_AI_API_KEY=your-api-key-here

# Server Configuration
PORT=3001
NODE_ENV=development
```

## 📰 Newsletter System

### Features
- **Email Confirmation**: Double opt-in with email verification
- **Welcome Emails**: Automatic welcome email after verification
- **Admin Panel**: Newsletter management and subscriber tracking
- **Gmail Group Integration**: Send subscriber lists to Gmail groups
- **Privacy Compliant**: GDPR and CAN-SPAM Act compliant

### API Endpoints

#### Subscribe to Newsletter
```http
POST /api/newsletter/subscribe
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Verify Email Subscription
```http
GET /api/newsletter/verify?token=verification_token
```

#### Get Subscribers (Admin)
```http
GET /api/newsletter/subscribers
```

#### Send Newsletter (Admin)
```http
POST /api/newsletter/send
Content-Type: application/json

{
  "subject": "Monthly Update - January 2024",
  "content": "Plain text content here...",
  "htmlContent": "<h1>HTML content here...</h1>"
}
```

### Email Confirmation Workflow
1. **User Subscribes**: User enters email on website
2. **Confirmation Email Sent**: System sends verification email with secure token
3. **User Clicks Link**: User clicks confirmation link in email
4. **Email Verified**: System activates subscription and sends welcome email
5. **Newsletter Ready**: User now receives newsletters

## 🚀 Deployment

### Render Deployment (Recommended)

Render is the perfect platform for your GenPlay Studio 3D app:

#### Cost Comparison:
- **AWS**: $20-50+/month (EC2 + CloudFront + API Gateway + Lambda)
- **Render**: $7/month for static site + $7/month for web service = **$14/month total**

#### Advantages:
- ✅ **Much simpler setup** - No complex AWS services
- ✅ **Automatic HTTPS** - Free SSL certificates
- ✅ **Global CDN** - Built-in for static sites
- ✅ **Auto-deployments** - Connect GitHub for automatic updates
- ✅ **Better developer experience** - Clean dashboard
- ✅ **No CORS issues** - Render handles this automatically

#### Deployment Steps:

1. **Deploy Static Site (React App)**
   - Go to [dashboard.render.com](https://dashboard.render.com)
   - Click "New +" → "Static Site"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `genplay-studio-3d`
     - **Build Command**: `npm install && npm run build`
     - **Publish Directory**: `dist`
     - **Environment Variables**:
       ```
       VITE_TRIPO_AI_API_KEY=your_api_key_here
       VITE_RENDER_PROXY_URL=https://your-proxy-service.onrender.com
       ```

2. **Deploy Proxy Service**
   - Click "New +" → "Web Service"
   - Select the same repository
   - Configure:
     - **Name**: `genplay-proxy`
     - **Environment**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `node proxy-server.js`
     - **Plan**: Free (or $7/month for better performance)
   - **Environment Variables**:
     ```
     VITE_TRIPO_AI_API_KEY=your_api_key_here
     EMAIL_USER=your-email@gmail.com
     EMAIL_PASS=your-app-password
     DATABASE_URL=postgresql://username:password@host:port/database
     NODE_ENV=production
     ```

3. **Create PostgreSQL Database**
   - Click "New +" → "PostgreSQL"
   - Configure:
     - **Name**: `genplay-db`
     - **Plan**: Free (or $7/month for better performance)
   - Copy the **External Database URL** and add it to your proxy service environment variables

### Environment Variables for Production

#### Static Site Environment Variables:
```
VITE_TRIPO_AI_API_KEY=your_api_key_here
VITE_RENDER_PROXY_URL=https://your-proxy-service.onrender.com
```

#### Proxy Service Environment Variables:
```
VITE_TRIPO_AI_API_KEY=your_api_key_here
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
DATABASE_URL=postgresql://username:password@host:port/database
FRONTEND_URL=https://your-frontend-url.onrender.com
NODE_ENV=production
```

## 🔒 Security

### Environment Variables
- ✅ Never commit credentials to git
- ✅ Use environment variables for all sensitive data
- ✅ Use Gmail App Passwords instead of regular passwords
- ✅ Database connections use SSL encryption

### Database Security
- ✅ SSL encryption for all connections
- ✅ Prepared statements prevent SQL injection
- ✅ Environment isolation (dev/prod separation)
- ✅ Regular backups (automatic on Render)

### Email Security
- ✅ Use App Passwords instead of regular passwords
- ✅ Store email credentials in environment variables
- ✅ SPF and DKIM configuration for custom domains

## 🧪 Testing

### Test Newsletter System
1. Start your servers: `npm run dev` and `npm run proxy`
2. Go to the landing page
3. Scroll to the newsletter section
4. Enter an email and click "Subscribe"
5. Check for "check your email" message
6. Check your email for confirmation message
7. Click the confirmation link
8. Verify you see the success page
9. Check that you receive a welcome email

### Test Contact Form
1. Navigate to the Services section on the landing page
2. Click "Get Quote" or "Learn More" on any service
3. Fill out the contact form and click "Submit Request"
4. Watch the loading spinner and success message
5. Check that the email is received at `info@genplayai.io`

### Test API Endpoints
```bash
# Test health endpoint
curl http://localhost:3001/health

# Test newsletter subscription
curl -X POST http://localhost:3001/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Test database connection
curl http://localhost:3001/api/db/info
```

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```
   Error: Database connection failed
   Solution: Check DATABASE_URL in .env file
   ```

2. **Email Sending Failed**
   ```
   Error: Email service not configured
   Solution: Check EMAIL_USER and EMAIL_PASS
   ```

3. **Port Already in Use**
   ```
   Error: Port 3001 is already in use
   Solution: Change PORT in .env file or kill existing process
   ```

4. **CORS Errors**
   ```
   Error: CORS policy blocks request
   Solution: Ensure proxy server is running
   ```

### Debug Commands

```bash
# Check environment variables
node -e "console.log(process.env.DATABASE_URL)"

# Test database connection
node -e "
import { testConnection } from './src/database/index.js';
testConnection().then(console.log);
"

# View database info
curl http://localhost:3001/api/db/info
```

## 📊 Monitoring

### Health Checks
- **Database Connection**: `/api/db/info`
- **Service Health**: `/health`
- **Email Configuration**: `/api/test/email`

### Performance Monitoring
- Render dashboard provides database metrics
- Connection count monitoring
- Query performance tracking
- Storage usage monitoring

## 💰 Cost Breakdown

### Render Pricing:
- **Static Site**: Free (or $7/month for custom domain)
- **Web Service**: Free (or $7/month for better performance)
- **PostgreSQL Database**: Free (or $7/month for better performance)
- **Total**: $0-21/month

### AWS Equivalent:
- **S3 + CloudFront**: $5-15/month
- **API Gateway**: $3.50/month per million requests
- **Lambda**: $0.20 per million requests
- **EC2 (if needed)**: $10-50/month
- **RDS PostgreSQL**: $15-50/month
- **Total**: $35-120/month

## 🚨 Security Incident Response

### If Credentials Are Exposed:
1. **IMMEDIATELY** regenerate all compromised credentials
2. **IMMEDIATELY** clean git history to remove exposed credentials
3. Update all environment variables with new credentials
4. Test the application with new credentials
5. Monitor for any unauthorized access

### Prevention Measures:
- ✅ Never commit credentials to git
- ✅ Use environment variables for all sensitive data
- ✅ Add sensitive files to `.gitignore`
- ✅ Use Gmail App Passwords instead of regular passwords
- ✅ Regular security audits

## 📞 Support

- **API Issues**: Contact [Tripo 3D Support](https://platform.tripo3d.ai/support)
- **App Issues**: Create an issue in this repository
- **Email Setup**: See email configuration section above
- **Newsletter System**: See newsletter system section above
- **Deployment**: See deployment section above

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Made with ❤️ for 3D creators everywhere**