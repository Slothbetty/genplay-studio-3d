import React from 'react';
import { Button } from '../ui/button.jsx';

export function Hero({ onNavigateToApp }) {
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
      @keyframes fadeInLeft {
        from {
          opacity: 0;
          transform: translateX(-30px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      @keyframes fadeInRight {
        from {
          opacity: 0;
          transform: translateX(30px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
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
      @keyframes gradientShift {
        0%, 100% {
          background-position: 0% 50%;
        }
        50% {
          background-position: 100% 50%;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  return (
    <section className="relative bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 
            className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight"
            style={{
              animation: 'fadeInUp 1s ease-out forwards',
              opacity: 0
            }}
          >
            <span
              style={{
                animation: 'fadeInLeft 0.8s ease-out 0.2s forwards',
                opacity: 0
              }}
            >
              Your Idea, Your Design,
            </span>
            <span 
              className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
              style={{
                opacity: 0,
                backgroundSize: '200% 200%',
                animation: 'fadeInUp 0.8s ease-out 0.4s forwards, gradientShift 3s ease-in-out infinite 1.2s'
              }}
            >
              {' '}Powered by AI,
            </span>
            <br />
            <span 
              className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
              style={{
                opacity: 0,
                backgroundSize: '200% 200%',
                animation: 'fadeInRight 0.8s ease-out 0.6s forwards, gradientShift 3s ease-in-out infinite 1.8s'
              }}
            >
              Printed by Us
            </span>
          </h1>
          
          <p 
            className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed"
            style={{
              animation: 'fadeInUp 0.8s ease-out 0.8s forwards',
              opacity: 0
            }}
          >
          Transform your vision into reality with our AI-assisted design platform and rapid 3D printing services.
          </p>
          
          <div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            style={{
              animation: 'fadeInUp 0.8s ease-out 1s forwards',
              opacity: 0
            }}
          >
            <Button 
              size="lg"
              onClick={onNavigateToApp}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg px-8 py-4 transform hover:scale-105 transition-all duration-300 hover:shadow-xl"
            >
              Start Creating Now
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
              className="text-lg px-8 py-4 transform hover:scale-105 transition-all duration-300 hover:shadow-lg"
            >
              Learn More
            </Button>
          </div>
          
          <div 
            className="max-w-6xl mx-auto"
            style={{
              animation: 'fadeInUp 0.8s ease-out 1.2s forwards',
              opacity: 0
            }}
          >
            {/* First row - 3 features */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            <div 
              className="group text-center bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              style={{
                animation: 'fadeInUp 0.8s ease-out 1.4s forwards',
                opacity: 0
              }}
            >
              <div 
                className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-purple-200 transition-shadow duration-300"
                style={{
                  animation: 'float 3s ease-in-out infinite 2s'
                }}
              >
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors duration-300">Customizable personal keepsakes</h3>
              <p className="text-gray-600 leading-relaxed">Create unique, personalized items tailored to your vision</p>
            </div>
            
            <div 
              className="group text-center bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              style={{
                animation: 'fadeInUp 0.8s ease-out 1.6s forwards',
                opacity: 0
              }}
            >
              <div 
                className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-blue-200 transition-shadow duration-300"
                style={{
                  animation: 'pulse 2s ease-in-out infinite 2.2s'
                }}
              >
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">AI-assisted design</h3>
              <p className="text-gray-600 leading-relaxed">Advanced AI technology helps bring your ideas to life</p>
            </div>
            
            <div 
              className="group text-center bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              style={{
                animation: 'fadeInUp 0.8s ease-out 1.8s forwards',
                opacity: 0
              }}
            >
              <div 
                className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-green-200 transition-shadow duration-300"
                style={{
                  animation: 'float 3s ease-in-out infinite 2.4s'
                }}
              >
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors duration-300">Lower cost solutions</h3>
              <p className="text-gray-600 leading-relaxed">Affordable pricing without compromising on quality</p>
            </div>
            
            </div>
            
            {/* Second row - 2 features centered */}
            <div className="flex justify-center gap-8">
              <div 
                className="group text-center bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                style={{
                  animation: 'fadeInLeft 0.8s ease-out 2s forwards',
                  opacity: 0
                }}
              >
                <div 
                  className="w-20 h-20 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-orange-200 transition-shadow duration-300"
                  style={{
                    animation: 'pulse 2s ease-in-out infinite 2.6s'
                  }}
                >
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors duration-300">3D preview in seconds</h3>
                <p className="text-gray-600 leading-relaxed">See your design come to life instantly</p>
              </div>
              
              <div 
                className="group text-center bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                style={{
                  animation: 'fadeInRight 0.8s ease-out 2.2s forwards',
                  opacity: 0
                }}
              >
                <div 
                  className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-red-200 transition-shadow duration-300"
                  style={{
                    animation: 'float 3s ease-in-out infinite 2.8s'
                  }}
                >
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors duration-300">Print and ship within 24 hours</h3>
                <p className="text-gray-600 leading-relaxed">Fast production and delivery to your doorstep</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
