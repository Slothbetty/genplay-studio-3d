import React, { useState, useEffect } from "react";
import { editImageWithAI } from "../services/api";

export default function ImageEdit({ prompt, onImageEdited, hidePrompt, onGoBack = () => {}, existingImageUrl = null, onSvgConverted = () => {}, styleId = null }) {
  const [image, setImage] = useState(null);
  const [resultUrl, setResultUrl] = useState(existingImageUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fakeProgress, setFakeProgress] = useState(0);
  const [svgContent, setSvgContent] = useState(null);
  const [isConvertingToSvg, setIsConvertingToSvg] = useState(false);
  const [svgConverted, setSvgConverted] = useState(false);

  // Update resultUrl when existingImageUrl changes
  useEffect(() => {
    if (existingImageUrl) {
      setResultUrl(existingImageUrl);
    }
  }, [existingImageUrl]);

  const handleImageChange = (e) => setImage(e.target.files[0]);
  const handlePromptChange = (e) => setPrompt(e.target.value);

  // Function to download the generated image
  const handleDownload = () => {
    if (!resultUrl) return;
    
    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = resultUrl;
    link.download = `generated-image-${Date.now()}.png`;
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to download the SVG file
  const handleSvgDownload = () => {
    if (!svgContent) return;
    
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `converted-image-${Date.now()}.svg`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  };

  // Function to convert image to SVG
  const handleConvertToSvg = async () => {
    if (!resultUrl) return;
    
    setIsConvertingToSvg(true);
    setError(null);
    
    try {
      // Create a canvas to process the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw the image on canvas
        ctx.drawImage(img, 0, 0);
        
        // Get image data for processing
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Create an SVG representation suitable for outline art
        // This creates a clean SVG with the image embedded and outline effects
        
        // Calculate display dimensions to ensure the SVG fits well in the preview
        const maxDisplaySize = 400; // Maximum display size for preview
        let displayWidth = canvas.width;
        let displayHeight = canvas.height;
        
        // Scale down if the image is too large for comfortable viewing
        if (displayWidth > maxDisplaySize || displayHeight > maxDisplaySize) {
          const scale = Math.min(maxDisplaySize / displayWidth, maxDisplaySize / displayHeight);
          displayWidth = Math.round(displayWidth * scale);
          displayHeight = Math.round(displayHeight * scale);
        }
        
        const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${displayWidth}" height="${displayHeight}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvas.width} ${canvas.height}" preserveAspectRatio="xMidYMid meet" style="max-width: 100%; height: auto; display: block;">
  <defs>
    <!-- Filter for creating outline effect -->
    <filter id="outline" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
      <feOffset dx="0" dy="0"/>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    
    <!-- Filter for edge detection -->
    <filter id="edge-detect" x="-20%" y="-20%" width="140%" height="140%">
      <feConvolveMatrix order="3" kernelMatrix="0 -1 0 -1 4 -1 0 -1 0"/>
    </filter>
  </defs>
  
  <!-- Background with subtle outline -->
  <rect width="${canvas.width}" height="${canvas.height}" fill="white"/>
  
  <!-- Main image with outline filter -->
  <image href="${resultUrl}" width="${canvas.width}" height="${canvas.height}" filter="url(#outline)"/>
  
  <!-- Edge detection overlay for outline effect -->
  <image href="${resultUrl}" width="${canvas.width}" height="${canvas.height}" filter="url(#edge-detect)" opacity="0.3"/>
  
  <!-- Border frame -->
  <rect width="${canvas.width}" height="${canvas.height}" fill="none" stroke="black" stroke-width="2" opacity="0.8"/>
  
  <!-- Corner accents for outline art style -->
  <g stroke="black" stroke-width="1" fill="none" opacity="0.7">
    <!-- Top-left corner -->
    <path d="M 10,10 L 30,10 M 10,10 L 10,30"/>
    <!-- Top-right corner -->
    <path d="M ${canvas.width-30},10 L ${canvas.width-10},10 M ${canvas.width-10},10 L ${canvas.width-10},30"/>
    <!-- Bottom-left corner -->
    <path d="M 10,${canvas.height-30} L 10,${canvas.height-10} M 10,${canvas.height-10} L 30,${canvas.height-10}"/>
    <!-- Bottom-right corner -->
    <path d="M ${canvas.width-30},${canvas.height-10} L ${canvas.width-10},${canvas.height-10} M ${canvas.width-10},${canvas.height-30} L ${canvas.width-10},${canvas.height-10}"/>
  </g>
</svg>`;
        
        setSvgContent(svg);
        setSvgConverted(true);
        if (onSvgConverted) onSvgConverted(svg);
        
        setIsConvertingToSvg(false);
        
        // Clear any previous errors and show success state
        setError(null);
      };
      
      img.onerror = () => {
        setError("Failed to load image for SVG conversion");
        setIsConvertingToSvg(false);
      };
      
      // Set crossOrigin to handle data URLs properly
      img.crossOrigin = "anonymous";
      img.src = resultUrl;
      
    } catch (err) {
      setError("Failed to convert to SVG: " + err.message);
      setIsConvertingToSvg(false);
    }
  };

  // Fake progress effect
  useEffect(() => {
    let interval;
    if (loading) {
      setFakeProgress(0);
      interval = setInterval(() => {
        setFakeProgress((prev) => {
          if (prev < 99) {
            return prev + 1;
          } else {
            return 99;
          }
        });
      }, 1000); // 0 to 99% in ~25 seconds
    } else if (!loading && fakeProgress > 0) {
      setFakeProgress(100);
      setTimeout(() => setFakeProgress(0), 500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResultUrl(null);
    setSvgContent(null);
    setSvgConverted(false);
    try {
      const data = await editImageWithAI(image, prompt);
      if (data && data.data && data.data[0] && data.data[0].b64_json) {
        const b64 = data.data[0].b64_json;
        const imgUrl = `data:image/png;base64,${b64}`;
        setResultUrl(imgUrl);
        if (onImageEdited) onImageEdited(imgUrl);
      } else {
        setError("No image returned.");
      }
    } catch (err) {
      setError("Failed to edit image: " + err.message);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-1 font-medium">Upload Image</label>
        <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImageChange} required />
      </div>
      <div className="flex space-x-2">
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
          {loading ? "Generating..." : "Generate Image"}
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={onGoBack}
        >
          Go Back
        </button>
      </div>
      {loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <div>
              <p className="font-medium text-blue-900">Generating your image...</p>
              <p className="text-sm text-blue-700">{fakeProgress}% complete</p>
            </div>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${fakeProgress}%` }}
            ></div>
          </div>
        </div>
      )}
      {error && <div className="text-red-600">{error}</div>}
      {resultUrl && (
        <div className="mt-4">
          <div className="flex justify-end mb-2 space-x-2">
            <button
              type="button"
              onClick={handleDownload}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Download</span>
            </button>
            {!svgConverted && styleId === 'outline' && (
              <button
                type="button"
                onClick={handleConvertToSvg}
                disabled={isConvertingToSvg}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
              >
                {isConvertingToSvg ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                  </svg>
                )}
                <span>{isConvertingToSvg ? "Converting..." : "Convert to SVG"}</span>
              </button>
            )}
          </div>
          <img src={resultUrl} alt="Edited result" className="max-w-full border rounded" />
          
          {/* SVG Conversion Result */}
          {svgConverted && svgContent && styleId === 'outline' && (
            <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <h4 className="font-medium text-purple-900">SVG File Generated Successfully!</h4>
                </div>
                <button
                  type="button"
                  onClick={handleSvgDownload}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Download SVG</span>
                </button>
              </div>
              
              {/* SVG Preview */}
              <div className="mb-3">
                <h5 className="text-sm font-medium text-purple-800 mb-2">SVG Preview:</h5>
                <div className="bg-white p-3 rounded border">
                  <div 
                    className="flex justify-center items-center w-full"
                    style={{ minHeight: '200px' }}
                    dangerouslySetInnerHTML={{ __html: svgContent }} 
                  />
                  <p className="text-xs text-gray-500 text-center mt-2">
                    SVG dimensions: {svgContent ? (() => {
                      const match = svgContent.match(/width="(\d+)" height="(\d+)"/);
                      return match ? `${match[1]} × ${match[2]}px` : 'Unknown';
                    })() : 'Unknown'}
                  </p>
                </div>
              </div>
              
              {/* SVG Code */}
              <div>
                <h5 className="text-sm font-medium text-purple-800 mb-2">SVG Code:</h5>
                <div className="bg-white p-3 rounded border max-h-40 overflow-y-auto">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap">{svgContent}</pre>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </form>
  );
} 