import React from 'react';

// API configuration following the same pattern as services/api.js
const isDevelopment = import.meta.env.DEV
const getApiBaseUrl = () => {
  if (isDevelopment) {
    return 'http://localhost:3001'
  } else {
    return import.meta.env.VITE_RENDER_PROXY_URL || 'https://genplay-proxy.onrender.com'
  }
}

export function Newsletter() {
  const [email, setEmail] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [isSuccess, setIsSuccess] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const result = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setMessage('Thank you for subscribing! You\'ll receive our latest updates.');
        setEmail('');
      } else {
        setIsSuccess(false);
        setMessage(result.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setIsSuccess(false);
      setMessage('Error subscribing. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="newsletter" className="py-16 bg-gradient-to-r from-purple-600 to-blue-600">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Stay Updated with GenPlay AI
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Get the latest news, updates, and exclusive offers delivered to your inbox
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white focus:outline-none text-gray-900 placeholder-gray-500"
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center ${
                isSubmitting
                  ? 'bg-white bg-opacity-75 cursor-not-allowed'
                  : 'bg-white hover:bg-gray-100 text-purple-600 hover:shadow-lg'
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg 
                    className="w-4 h-4 mr-2 animate-spin" 
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
                  Subscribing...
                </>
              ) : (
                'Subscribe'
              )}
            </button>
          </form>

          {message && (
            <div className={`mt-4 p-3 rounded-lg ${
              isSuccess 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <p className="text-sm text-purple-200 mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  );
}
