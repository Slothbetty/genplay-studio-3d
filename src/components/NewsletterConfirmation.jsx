import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

// API configuration following the same pattern as services/api.js
const isDevelopment = import.meta.env.DEV
const getApiBaseUrl = () => {
  if (isDevelopment) {
    return 'http://localhost:3001'
  } else {
    return import.meta.env.VITE_RENDER_PROXY_URL || 'https://genplay-proxy.onrender.com'
  }
}

export function NewsletterConfirmation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = React.useState(true);
  const [verificationStatus, setVerificationStatus] = React.useState(null);
  const [message, setMessage] = React.useState('');

  React.useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setVerificationStatus('error');
        setMessage('Invalid verification link. Please try subscribing again.');
        setIsVerifying(false);
        return;
      }

      try {
        const response = await fetch(`${getApiBaseUrl()}/api/newsletter/verify?token=${token}`);
        const result = await response.json();

        if (response.ok) {
          setVerificationStatus('success');
          setMessage(result.message || 'Email successfully verified! Welcome to GenPlay AI newsletter!');
        } else {
          setVerificationStatus('error');
          setMessage(result.error || 'Verification failed. Please try again.');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setVerificationStatus('error');
        setMessage('Network error. Please check your connection and try again.');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [searchParams]);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleResubscribe = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              {isVerifying ? (
                <svg 
                  className="w-8 h-8 text-white animate-spin" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                  />
                </svg>
              ) : verificationStatus === 'success' ? (
                <svg 
                  className="w-8 h-8 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5 13l4 4L19 7" 
                  />
                </svg>
              ) : (
                <svg 
                  className="w-8 h-8 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                </svg>
              )}
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-2">
              {isVerifying 
                ? 'Verifying Email...' 
                : verificationStatus === 'success' 
                  ? 'Welcome to GenPlay AI!' 
                  : 'Verification Failed'
              }
            </h1>
            
            <p className="text-purple-100 text-sm">
              {isVerifying 
                ? 'Please wait while we confirm your subscription' 
                : verificationStatus === 'success' 
                  ? 'Your email has been verified successfully' 
                  : 'There was an issue with your verification'
              }
            </p>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            {isVerifying ? (
              <div className="text-center">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                </div>
              </div>
            ) : (
              <>
                <div className={`p-4 rounded-lg mb-6 ${
                  verificationStatus === 'success' 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <p className={`text-sm ${
                    verificationStatus === 'success' 
                      ? 'text-green-800' 
                      : 'text-red-800'
                  }`}>
                    {message}
                  </p>
                </div>

                {verificationStatus === 'success' ? (
                  <div className="space-y-4">
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-purple-900 mb-2">What's next?</h3>
                      <ul className="text-sm text-purple-800 space-y-1">
                        <li>• You'll receive our latest AI and 3D updates</li>
                        <li>• Exclusive product announcements</li>
                        <li>• Tips and tutorials for 3D creation</li>
                        <li>• Special offers and discounts</li>
                      </ul>
                    </div>
                    
                    <button
                      onClick={handleGoHome}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      Explore GenPlay AI
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-yellow-900 mb-2">Need help?</h3>
                      <p className="text-sm text-yellow-800">
                        If you're having trouble verifying your email, you can try subscribing again or contact our support team.
                      </p>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={handleResubscribe}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
                      >
                        Try Again
                      </button>
                      
                      <button
                        onClick={handleGoHome}
                        className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-all duration-300"
                      >
                        Go Home
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-gray-50 border-t">
            <p className="text-xs text-gray-500 text-center">
              GenPlay AI Newsletter • We respect your privacy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
