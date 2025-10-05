import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card.jsx';

export function Services({ onNavigateToApp }) {
  const [showContactForm, setShowContactForm] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: '',
    message: ''
  });

  // Add CSS keyframes for animations
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes float {
        0%, 100% {
          transform: translateY(0px);
        }
        50% {
          transform: translateY(-10px);
        }
      }
      @keyframes pulse {
        0%, 100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.05);
        }
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      @keyframes scaleIn {
        from {
          opacity: 0;
          transform: scale(0.8);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const openContactForm = (serviceName) => {
    setFormData(prev => ({ ...prev, service: serviceName }));
    setShowContactForm(true);
  };

  const closeContactForm = () => {
    setShowContactForm(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      service: '',
      message: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create mailto link with form data
    const subject = `Inquiry about ${formData.service}`;
    const body = `
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
Company: ${formData.company}
Service: ${formData.service}

Message:
${formData.message}
    `.trim();
    
    const mailtoLink = `mailto:info@genplayai.io?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
    
    closeContactForm();
  };

  // Close modal on escape key
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeContactForm();
      }
    };
    
    if (showContactForm) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showContactForm]);
  const services = [
    {
      title: "AI Design Subscription",
      description: "Access our powerful AI design tools with monthly credit packages for all your design needs.",
      icon: "🤖",
      features: [
        "Professional: $9.99/Month - 1000 credits",
        "Advanced: $14.99/Month - 2000 credits", 
        "Premium: $29.99/Month - 5000 credits",
        "Priority processing & premium styles"
      ],
      price: "Starting at $9.99/month",
      popular: true
    },
    {
      title: "Custom Design Service",
      description: "Get personalized design assistance from our expert team for complex projects.",
      icon: "🎨",
      features: ["Expert designer consultation", "Custom style development", "Unlimited revisions", "Dedicated support"],
      price: "Starting at $30/hour",
      popular: false
    },
    {
      title: "Print Service",
      description: "Professional 3D printing and shipping service for your custom designs.",
      icon: "🖨️",
      features: ["High-quality 3D printing", "Multiple material options", "Fast 24-hour shipping", "Quality guarantee"],
      price: "From $15/hour",
      popular: false
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            style={{
              animation: 'fadeInUp 0.8s ease-out forwards',
              opacity: 0
            }}
          >
            Our Services
          </h2>
          <p 
            className="text-xl text-gray-600 max-w-2xl mx-auto"
            style={{
              animation: 'fadeInUp 0.8s ease-out 0.2s forwards',
              opacity: 0
            }}
          >
            From AI-powered design to professional printing, we offer everything you need to bring your ideas to life
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {services.map((service, index) => (
            <Card 
              key={index} 
              className={`text-center group hover:shadow-2xl transition-all duration-500 ease-out transform hover:scale-105 hover:-translate-y-2 relative ${
                service.popular ? 'ring-2 ring-purple-500 shadow-lg' : 'hover:shadow-lg'
              }`}
              style={{
                animationDelay: `${0.4 + index * 0.2}s`,
                animation: 'fadeInUp 0.8s ease-out forwards',
                opacity: 0
              }}
            >
              {service.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full group-hover:scale-110 transition-transform duration-300">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader className="pb-4">
                <div 
                  className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300"
                  style={{
                    animation: `float 3s ease-in-out infinite ${index * 0.5}s`
                  }}
                >
                  {service.icon}
                </div>
                <CardTitle className="text-2xl mb-2 group-hover:text-purple-600 transition-colors duration-300">
                  {service.title}
                </CardTitle>
                <CardDescription className="text-gray-600 mb-4 group-hover:text-gray-700 transition-colors duration-300">
                  {service.description}
                </CardDescription>
                <div className="text-2xl font-bold text-purple-600 mb-4 group-hover:text-purple-700 transition-colors duration-300">
                  {service.price}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-gray-600">
                  {service.features.map((feature, featureIndex) => (
                    <li 
                      key={featureIndex} 
                      className="flex items-center justify-center group-hover:text-gray-700 transition-colors duration-300"
                      style={{
                        animationDelay: `${0.6 + index * 0.2 + featureIndex * 0.1}s`,
                        animation: 'fadeInUp 0.6s ease-out forwards',
                        opacity: 0
                      }}
                    >
                      <svg 
                        className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 group-hover:text-green-600 group-hover:scale-110 transition-all duration-300" 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => service.popular ? onNavigateToApp() : openContactForm(service.title)}
                  className={`w-full mt-6 py-3 px-6 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                    service.popular 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800 hover:shadow-md'
                  }`}
                >
                  {service.popular ? 'Get Started' : service.title === 'Custom Design Service' ? 'Get Quote' : 'Learn More'}
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Contact Form Modal */}
      {showContactForm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeContactForm}
          style={{
            animation: 'fadeIn 0.3s ease-out forwards'
          }}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: 'scaleIn 0.3s ease-out forwards'
            }}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Contact Us</h2>
                <button
                  onClick={closeContactForm}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your email address"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                </div>
                
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                    Company/Organization
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your company name"
                  />
                </div>
                
                <div>
                  <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-1">
                    Service Interested In
                  </label>
                  <input
                    type="text"
                    id="service"
                    name="service"
                    value={formData.service}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Questions or Comments *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    placeholder="Tell us about your project or any questions you have..."
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeContactForm}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
