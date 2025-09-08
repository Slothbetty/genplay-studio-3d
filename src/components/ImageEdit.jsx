import React, { useState, useEffect } from "react";
import { editImageWithAI } from "../services/api";
import { API_CONFIG, isConvertioAvailable } from "../config/api";

export default function ImageEdit({ prompt, onImageEdited, hidePrompt, onGoBack = () => {}, existingImageUrl = null, onSvgConverted = () => {}, styleId = null }) {
  const [image, setImage] = useState(null);
  const [resultUrl, setResultUrl] = useState(existingImageUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fakeProgress, setFakeProgress] = useState(0);
  const [svgContent, setSvgContent] = useState(null);
  const [isConvertingToSvg, setIsConvertingToSvg] = useState(false);
  const [svgConverted, setSvgConverted] = useState(false);
  const [directUploadImage, setDirectUploadImage] = useState(null);
  const [showDirectUpload, setShowDirectUpload] = useState(false);

  // Update resultUrl when existingImageUrl changes
  useEffect(() => {
    if (existingImageUrl) {
      setResultUrl(existingImageUrl);
    }
  }, [existingImageUrl]);

  const handleImageChange = (e) => setImage(e.target.files[0]);
  const handlePromptChange = (e) => setPrompt(e.target.value);
  
  const handleDirectUploadChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDirectUploadImage(file);
      
      // Check if the uploaded file is an SVG
      const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
      
      if (isSvg) {
        // For SVG files, read the content and set it as SVG content
        const reader = new FileReader();
        reader.onload = (event) => {
          const svgContent = event.target.result;
          setSvgContent(svgContent);
          setSvgConverted(true);
          
          // Create a preview URL for the SVG
          const imageUrl = URL.createObjectURL(file);
          setResultUrl(imageUrl);
          
          // Notify parent components
          if (onImageEdited) onImageEdited(imageUrl);
          if (onSvgConverted) onSvgConverted(svgContent);
        };
        reader.readAsText(file);
      } else {
        // For non-SVG files, create a preview URL
        const imageUrl = URL.createObjectURL(file);
        setResultUrl(imageUrl);
        if (onImageEdited) onImageEdited(imageUrl);
      }
    }
  };
  
  const handleDirectUploadSubmit = () => {
    if (directUploadImage) {
      // For direct upload, we don't need to generate anything
      // The image is already uploaded and ready
      setResultUrl(URL.createObjectURL(directUploadImage));
      if (onImageEdited) onImageEdited(URL.createObjectURL(directUploadImage));
    }
  };

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

  // Function to convert image to SVG using Convertio API
  const handleConvertToSvg = async () => {
    if (!resultUrl) return;
    
    // Check if Convertio API is available
    if (!isConvertioAvailable()) {
      setError("Convertio API key not configured. Please add VITE_CONVERTIO_API_KEY to your environment variables.");
      return;
    }
    
    setIsConvertingToSvg(true);
    setError(null);
    
    try {
      // Extract base64 data from resultUrl
      let base64Data;
      let filename = 'image.png';
      
      if (resultUrl.startsWith('data:')) {
        // It's a data URL, extract the base64 part
        const arr = resultUrl.split(',');
        if (arr.length >= 2) {
          base64Data = arr[1];
          
          // Try to extract filename and mime type from the data URL
          const mimeMatch = arr[0].match(/:(.*?);/);
          if (mimeMatch && mimeMatch[1]) {
            const mimeType = mimeMatch[1];
            if (mimeType.includes('jpeg') || mimeType.includes('jpg')) {
              filename = 'image.jpg';
            } else if (mimeType.includes('png')) {
              filename = 'image.png';
            } else if (mimeType.includes('webp')) {
              filename = 'image.webp';
            }
          }
        } else {
          throw new Error('Invalid data URL format');
        }
      } else {
        // It's a regular URL, we need to fetch and convert to base64
        const response = await fetch(resultUrl);
        const blob = await response.blob();
        const reader = new FileReader();
        
        return new Promise((resolve, reject) => {
          reader.onload = async () => {
            try {
              const result = reader.result;
              if (result && typeof result === 'string' && result.startsWith('data:')) {
                const parts = result.split(',');
                if (parts.length >= 2) {
                  const base64 = parts[1];
                  await performConvertioConversion(base64, filename);
                  resolve();
                } else {
                  reject(new Error('Invalid data URL format'));
                }
              } else {
                reject(new Error('Invalid reader result format'));
              }
            } catch (error) {
              reject(error);
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }
      
      // Perform the conversion with the extracted base64 data
      await performConvertioConversion(base64Data, filename);
      
    } catch (err) {
      setError("Failed to convert to SVG: " + err.message);
      setIsConvertingToSvg(false);
    }
  };
  
  // Helper function to perform the actual Convertio API call
  const performConvertioConversion = async (base64Data, filename) => {
    // Step 1: Start conversion
    const convertResponse = await fetch(`${API_CONFIG.convertio.baseURL}${API_CONFIG.convertio.endpoints.convert}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apikey: API_CONFIG.convertio.apiKey,
        input: 'base64',
        file: base64Data,
        filename: filename,
        outputformat: 'svg'
      })
    });
    
    if (!convertResponse.ok) {
      throw new Error(`Convertio API error: ${convertResponse.status}`);
    }
    
    const convertData = await convertResponse.json();
    
    if (convertData.status === 'error') {
      throw new Error(`Convertio error: ${convertData.error}`);
    }
    
    const convertId = convertData.data.id;
    
    // Step 2: Poll for completion
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max
    
    const pollStatus = async () => {
      attempts++;
      
      const statusUrl = API_CONFIG.convertio.endpoints.status.replace(':id', convertId);
      const statusResponse = await fetch(`${API_CONFIG.convertio.baseURL}${statusUrl}`, {
        method: 'GET'
      });
      
      if (!statusResponse.ok) {
        throw new Error(`Status check failed: ${statusResponse.status}`);
      }
      
      const statusData = await statusResponse.json();
      
      if (statusData.status === 'error') {
        throw new Error(`Status error: ${statusData.error}`);
      }
      
      if (statusData.data.step === 'finish') {
        // Step 3: Download the converted SVG using the /dl endpoint
        const downloadUrl = API_CONFIG.convertio.endpoints.download.replace(':id', convertId);
        
        const downloadResponse = await fetch(`${API_CONFIG.convertio.baseURL}${downloadUrl}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (!downloadResponse.ok) {
          throw new Error(`Download failed: ${downloadResponse.status}`);
        }
        
        const responseData = await downloadResponse.json();
        
        if (responseData.status === 'error') {
          throw new Error(`Download error: ${responseData.error}`);
        }
        
        // Extract and decode the base64 SVG content
        const base64Content = responseData.data.content;
        const svgContent = atob(base64Content);
        
        // SVG content decoded successfully
        
        setSvgContent(svgContent);
        setSvgConverted(true);
        if (onSvgConverted) onSvgConverted(svgContent);
        setIsConvertingToSvg(false);
        setError(null);
        
      } else if (statusData.data.step === 'error') {
        throw new Error(`Conversion failed: ${statusData.data.error || 'Unknown error'}`);
      } else if (attempts >= maxAttempts) {
        throw new Error('Conversion timeout - took too long');
      } else {
        // Wait 5 seconds before next poll
        setTimeout(pollStatus, 5000);
      }
    };
    
    // Start polling
    pollStatus();
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
    <div className="space-y-4">
      {/* Direct Upload Option for Outline Art Style */}
      {styleId === 'outline' && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 className="font-medium text-purple-900">Direct Upload Option</h4>
            </div>
            <button
              type="button"
              onClick={() => setShowDirectUpload(!showDirectUpload)}
              className="text-purple-600 hover:text-purple-800 text-sm font-medium"
            >
              {showDirectUpload ? 'Hide' : 'Show'}
            </button>
          </div>
          <p className="text-sm text-purple-700 mb-3">
            Already have an Outline Art Style image file? Upload it directly to skip generation.
          </p>
          
          {showDirectUpload && (
            <div className="space-y-3">
              <div>
                <label className="block mb-1 font-medium text-purple-900">Upload Outline Art Image</label>
                <input 
                  type="file" 
                  accept="image/png,image/jpeg,image/webp,image/svg+xml" 
                  onChange={handleDirectUploadChange}
                  className="w-full"
                />
                <p className="text-xs text-purple-600 mt-1">
                  Supports PNG, JPEG, WebP, and SVG files. SVG files will skip conversion and go directly to 3D generation.
                </p>
              </div>
              {directUploadImage && (
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={handleDirectUploadSubmit}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm"
                    >
                      {directUploadImage.type === 'image/svg+xml' || directUploadImage.name.toLowerCase().endsWith('.svg') 
                        ? 'Use This SVG' 
                        : 'Use This Image'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDirectUploadImage(null);
                        setResultUrl(null);
                        setSvgContent(null);
                        setSvgConverted(false);
                      }}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm"
                    >
                      Clear
                    </button>
                  </div>
                  {(directUploadImage.type === 'image/svg+xml' || directUploadImage.name.toLowerCase().endsWith('.svg')) && (
                    <div className="bg-green-50 border border-green-200 rounded p-2">
                      <p className="text-xs text-green-700">
                        ✅ SVG file detected! This will skip image-to-SVG conversion and go directly to 3D generation.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Direct SVG Upload Result */}
      {svgConverted && svgContent && directUploadImage && (directUploadImage.type === 'image/svg+xml' || directUploadImage.name.toLowerCase().endsWith('.svg')) && styleId === 'outline' && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-3">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <h4 className="font-medium text-green-900">SVG File Uploaded Successfully!</h4>
          </div>
          
          <div className="bg-white rounded p-3 border border-green-200">
            <p className="text-sm text-green-700 mb-2">
              ✅ Your SVG file is ready for 3D generation! You can now proceed to the 3D Generate step.
            </p>
            <p className="text-xs text-green-600">
              File: {directUploadImage.name} | Size: {(directUploadImage.size / 1024).toFixed(1)} KB
            </p>
          </div>
        </div>
      )}

      {/* AI Generation Option */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h4 className="font-medium text-blue-900">AI Image Generation</h4>
        </div>
        <p className="text-sm text-blue-700 mb-3">
          Generate a new Outline Art Style image using AI from your reference image.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block mb-1 font-medium text-blue-900">Upload Reference Image</label>
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
        </form>
              </div>
        
        {/* Loading State */}
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
        
        {/* Error Display */}
        {error && <div className="text-red-600">{error}</div>}
        
        {/* Result Display */}
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
                <style>
                  {`
                    .svg-preview svg {
                      max-width: 100% !important;
                      max-height: 200px !important;
                      width: auto !important;
                      height: auto !important;
                      display: block;
                    }
                  `}
                </style>
                <div className="bg-white p-3 rounded border">
                  <div 
                    className="flex justify-center items-center w-full overflow-hidden"
                    style={{ minHeight: '200px' }}
                  >
                    {svgContent && (
                      <div 
                        dangerouslySetInnerHTML={{ __html: svgContent }}
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '200px',
                          width: 'auto',
                          height: 'auto'
                        }}
                        className="svg-preview"
                      />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    SVG dimensions: {svgContent ? (() => {
                      const match = svgContent.match(/width="([^"]+)" height="([^"]+)"/);
                      return match ? `${match[1]} × ${match[2]}` : 'Unknown';
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
    </div>
  );
} 