import React from 'react';
import { Button } from './ui/button.jsx';
import Header from './Header';

export function AboutPage({ onNavigateToLanding }) {
  // Debug logging for production
  console.log('AboutPage component rendered', { 
    onNavigateToLanding: typeof onNavigateToLanding,
    currentPath: window.location.pathname,
    environment: import.meta.env.MODE
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onNavigateToLanding={onNavigateToLanding} />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              About <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Genplay AI</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We're passionate about democratizing 3D design and making professional-grade AI tools accessible to creators everywhere.
            </p>
          </div>

          {/* Team Section */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Meet the Team</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
              {/* Luke Sun */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="text-center">
                  <div className="w-40 h-40 mx-auto mb-6 rounded-full overflow-hidden border-4 border-purple-200 shadow-lg">
                     <img 
                       src="/images/luke.jpg" 
                       alt="Luke Sun" 
                       className="w-full h-full object-cover"
                     />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Luke Sun</h3>
                  
                  <div className="space-y-2 text-gray-600">
                    <p>Co-Founder</p>
                    <p>5+ Years Software Engineer</p>
                    <p>Ex-Google</p>
                    <p>AI + 3D Design Expert</p>
                    <p></p>
                  </div>
                </div>
              </div>

              {/* Bei Zhao */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="text-center">
                  <div className="w-40 h-40 mx-auto mb-6 rounded-full overflow-hidden border-4 border-blue-200 shadow-lg">
                     <img 
                       src="/images/bei.JPG" 
                       alt="Bei Zhao" 
                       className="w-full h-full object-cover"
                     />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Bei Zhao</h3>                  
                  <div className="space-y-2 text-gray-600">
                    <p>Co-Founder</p>
                    <p>5+ Years Software Engineer</p>
                    <p>Senior Software Engineer @ Pearson</p>
                    <p>UIUC CS Alumni</p>
                    <p>AI Expert</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Our Story Section */}
          <section className="mb-20">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-12">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Our Story</h2>
              
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">The Vision</h3>
                    <p className="text-gray-600 leading-relaxed mb-6">
                      Founded by two passionate software engineers with extensive experience in AI and 3D design, 
                      Genplay AI was born from a simple yet powerful vision: to make professional-grade design 
                      tools accessible to everyone, regardless of their technical background.
                    </p>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">The Mission</h3>
                    <p className="text-gray-600 leading-relaxed">
                      We combine cutting-edge AI technology with creative vision to transform how people 
                      approach 3D design. From individual creators to large enterprises, we're committed 
                      to democratizing the creative process and empowering innovation.
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Our Expertise</h4>
                    <ul className="space-y-3">
                      <li className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>AI & Machine Learning</span>
                      </li>
                      <li className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>3D Design & Modeling</span>
                      </li>
                      <li className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Software Engineering</span>
                      </li>
                      <li className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>User Experience Design</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="text-center">
            <div className="bg-white rounded-2xl p-12 shadow-lg">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Create with Us?</h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Join thousands of creators who are already using Genplay AI to bring their ideas to life
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => {
                    // Use proper navigation instead of window.location
                    window.history.pushState({}, '', '/app')
                    window.dispatchEvent(new PopStateEvent('popstate'))
                  }}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  Start Creating Now
                </Button>
                <Button 
                  variant="outline"
                  onClick={onNavigateToLanding}
                  className="font-medium py-3 px-8 rounded-lg"
                >
                  Back to Home
                </Button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
