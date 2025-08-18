import React, { useState, useEffect } from "react";
import { editImageWithAI } from "../services/api";

export default function ImageEdit({ prompt, onImageEdited, hidePrompt, onGoBack = () => {}, existingImageUrl = null }) {
  const [image, setImage] = useState(null);
  const [resultUrl, setResultUrl] = useState(existingImageUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fakeProgress, setFakeProgress] = useState(0);

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
            <div className="flex justify-end mb-2">
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
            </div>
            <img src={resultUrl} alt="Edited result" className="max-w-full border rounded" />
          </div>
        )}
    </form>
  );
} 