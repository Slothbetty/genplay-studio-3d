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
  const [subscriberCounts, setSubscriberCounts] = React.useState({
    total: 0,
    active: 0,
    pending: 0,
    unsubscribed: 0
  });
  const [newsletterForm, setNewsletterForm] = React.useState({
    subject: '',
    content: '',
    htmlContent: ''
  });
  const [gmailGroupForm, setGmailGroupForm] = React.useState({
    groupEmail: '',
    action: 'add'
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [isGmailGroupLoading, setIsGmailGroupLoading] = React.useState(false);
  const [message, setMessage] = React.useState('');

  // Fetch subscribers
  const fetchSubscribers = async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/newsletter/subscribers`);
      const data = await response.json();
      if (data.success) {
        setSubscribers(data.subscribers);
        setSubscriberCounts(data.counts);
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

  // Manage Gmail group
  const manageGmailGroup = async (e) => {
    e.preventDefault();
    setIsGmailGroupLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/newsletter/gmail-group`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gmailGroupForm)
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(`✅ ${result.message}`);
        setGmailGroupForm({ groupEmail: '', action: 'add' });
      } else {
        setMessage(`❌ ${result.message || 'Failed to manage Gmail group'}`);
      }
    } catch (error) {
      console.error('Gmail group management error:', error);
      setMessage('❌ Error managing Gmail group. Please try again.');
    } finally {
      setIsGmailGroupLoading(false);
    }
  };

  React.useEffect(() => {
    fetchSubscribers();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Newsletter Management</h1>
      
      {/* Subscribers Count */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-1">Total</h3>
          <p className="text-2xl font-bold text-blue-700">{subscriberCounts.total}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-900 mb-1">Active</h3>
          <p className="text-2xl font-bold text-green-700">{subscriberCounts.active}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-yellow-900 mb-1">Pending</h3>
          <p className="text-2xl font-bold text-yellow-700">{subscriberCounts.pending}</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-1">Unsubscribed</h3>
          <p className="text-2xl font-bold text-gray-700">{subscriberCounts.unsubscribed}</p>
        </div>
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

      {/* Gmail Group Management */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Gmail Group Management</h2>
        <p className="text-gray-600 mb-4">
          Send subscriber lists to your Gmail group for easy management and bulk email sending.
        </p>
        
        <form onSubmit={manageGmailGroup} className="space-y-4">
          <div>
            <label htmlFor="groupEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Gmail Group Email Address *
            </label>
            <input
              type="email"
              id="groupEmail"
              value={gmailGroupForm.groupEmail}
              onChange={(e) => setGmailGroupForm(prev => ({ ...prev, groupEmail: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="your-group@googlegroups.com"
            />
          </div>

          <div>
            <label htmlFor="action" className="block text-sm font-medium text-gray-700 mb-1">
              Action *
            </label>
            <select
              id="action"
              value={gmailGroupForm.action}
              onChange={(e) => setGmailGroupForm(prev => ({ ...prev, action: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="add">Send Subscriber List (Add to Group)</option>
              <option value="sync">Send Sync Request</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isGmailGroupLoading}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
              isGmailGroupLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isGmailGroupLoading ? 'Sending...' : `Send to Gmail Group`}
          </button>
        </form>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-1">How it works:</h3>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• <strong>Add to Group:</strong> Sends all active subscriber emails to your Gmail group</li>
            <li>• <strong>Sync Request:</strong> Sends a request to update your group with latest subscribers</li>
            <li>• You can then use Gmail's group features to send newsletters to all subscribers</li>
          </ul>
        </div>
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
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subscribed Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verified Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subscribers.map((subscriber, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {subscriber.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        subscriber.status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : subscriber.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {subscriber.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(subscriber.subscribedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {subscriber.verifiedAt ? new Date(subscriber.verifiedAt).toLocaleDateString() : '-'}
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
