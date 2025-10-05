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

export function NewsletterAdmin() {
  const [subscribers, setSubscribers] = React.useState([]);
  const [newsletterForm, setNewsletterForm] = React.useState({
    subject: '',
    content: '',
    htmlContent: ''
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [message, setMessage] = React.useState('');

  // Fetch subscribers
  const fetchSubscribers = async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/newsletter/subscribers`);
      const data = await response.json();
      if (data.success) {
        setSubscribers(data.subscribers);
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error);
    }
  };

  // Send newsletter
  const sendNewsletter = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/newsletter/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newsletterForm)
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(`✅ ${result.message}`);
        setNewsletterForm({ subject: '', content: '', htmlContent: '' });
      } else {
        setMessage(`❌ ${result.message || 'Failed to send newsletter'}`);
      }
    } catch (error) {
      console.error('Newsletter sending error:', error);
      setMessage('❌ Error sending newsletter. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchSubscribers();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Newsletter Management</h1>
      
      {/* Subscribers Count */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold text-blue-900 mb-2">Subscribers</h2>
        <p className="text-blue-700">Total active subscribers: <span className="font-bold">{subscribers.length}</span></p>
      </div>

      {/* Send Newsletter Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Send Newsletter</h2>
        
        <form onSubmit={sendNewsletter} className="space-y-4">
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
              Subject *
            </label>
            <input
              type="text"
              id="subject"
              value={newsletterForm.subject}
              onChange={(e) => setNewsletterForm(prev => ({ ...prev, subject: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Newsletter subject"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Content (Plain Text) *
            </label>
            <textarea
              id="content"
              value={newsletterForm.content}
              onChange={(e) => setNewsletterForm(prev => ({ ...prev, content: e.target.value }))}
              required
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Newsletter content in plain text..."
            />
          </div>

          <div>
            <label htmlFor="htmlContent" className="block text-sm font-medium text-gray-700 mb-1">
              HTML Content (Optional)
            </label>
            <textarea
              id="htmlContent"
              value={newsletterForm.htmlContent}
              onChange={(e) => setNewsletterForm(prev => ({ ...prev, htmlContent: e.target.value }))}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Newsletter content in HTML format (optional)..."
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {isLoading ? 'Sending...' : `Send to ${subscribers.length} Subscribers`}
          </button>
        </form>

        {message && (
          <div className={`mt-4 p-3 rounded-lg ${
            message.includes('✅') 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {message}
          </div>
        )}
      </div>

      {/* Subscribers List */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Subscribers List</h2>
        
        {subscribers.length === 0 ? (
          <p className="text-gray-500">No subscribers yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subscribed Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subscribers.map((subscriber, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {subscriber.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(subscriber.subscribedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
