import React from 'react';
import { ImageWithFallback } from '../ui/ImageWithFallback.jsx';

export function Gallery({ onNavigateToApp }) {
  const [hoveredImage, setHoveredImage] = React.useState(null);

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

  const showImage = (imageSrc, imageAlt) => {
    setHoveredImage({ src: imageSrc, alt: imageAlt });
  };

  const hideImage = () => {
    setHoveredImage(null);
  };
  const transformations = [
    {
      id: 1,
      title: "Photo to Keychain",
      description: "Transform Photo into a custom 3D-printed keepsake",
      beforeImage: "/images/keychain-before.jpg", // Original pet photo
      afterImage: "/images/keychain-after.jpg", // 3D printed keychain
      style: "Custom Keepsake"
    },
    {
      id: 2,
      title: "Photo to Magnet",
      description: "Turn memorable photo into 3D-printed fridge magnet",
      beforeImage: "/images/magnet-before.jpg", 
      afterImage: "/images/magnet-after.jpg", 
      style: "Family Figurine"
    },
    {
      id: 3,
      title: "Photo to Funko Pop",
      description: "Create your own Funko Pop-style collectible",
      beforeImage: "/images/collectible-before.JPG", // Original portrait
      afterImage: "/images/collectible-after.jpg", // Funko Pop style
      style: "Funko Pop"
    },
    {
      id: 4,
      title: "Photo to Relief Art",
      description: "Convert photos into relief art",
      beforeImage: "/images/relief-before.jpg", // Original photo
      afterImage: "/images/relief-after.jpg", // Vector art
      style: "Relief Art"
    }
  ];

  return (
    <section id="gallery" className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            From Photo to 3D Reality
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See how we transform your photos into stunning 3D-printed keepsakes
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <div className="flex gap-6 pb-4" style={{ width: 'max-content' }}>
            {transformations.map((transformation, index) => (
              <div 
                key={transformation.id} 
                className="bg-white rounded-xl shadow-lg overflow-hidden flex-shrink-0 group hover:shadow-2xl hover:scale-105 transition-all duration-500 ease-out transform hover:-translate-y-2" 
                style={{ 
                  width: '320px',
                  animationDelay: `${index * 200}ms`,
                  animation: 'fadeInUp 0.8s ease-out forwards'
                }}
              >
                <div className="p-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors duration-300">
                      {transformation.title}
                    </h3>
                    <p className="text-gray-600 text-xs mb-2 group-hover:text-gray-700 transition-colors duration-300">
                      {transformation.description}
                    </p>
                    <span className="inline-block text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full group-hover:bg-purple-200 group-hover:scale-110 transition-all duration-300">
                      {transformation.style}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-center gap-3">
                    {/* Before Image */}
                    <div className="text-center">
                      <div className="mb-2">
                        <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded group-hover:bg-gray-200 transition-colors duration-300">
                          Before
                        </span>
                      </div>
                       <div className="bg-gray-50 rounded-lg p-2 group-hover:bg-gray-100 transition-colors duration-300">
                         <div 
                           className="aspect-square overflow-hidden rounded-lg group-hover:scale-105 transition-transform duration-300" 
                           style={{ width: '100px', height: '100px' }}
                           onMouseEnter={() => showImage(transformation.beforeImage, `Before: ${transformation.title}`)}
                           onMouseLeave={hideImage}
                         >
                           <ImageWithFallback
                             src={transformation.beforeImage}
                             alt={`Before: ${transformation.title}`}
                             className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                           />
                         </div>
                       </div>
                    </div>
                    
                    {/* Arrow */}
                    <div className="flex justify-center">
                      <svg 
                        className="w-4 h-4 text-purple-600 group-hover:text-purple-700 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                    
                    {/* After Image */}
                    <div className="text-center">
                      <div className="mb-2">
                        <span className="text-xs font-semibold text-gray-700 bg-purple-100 px-2 py-1 rounded group-hover:bg-purple-200 transition-colors duration-300">
                          After
                        </span>
                      </div>
                       <div className="bg-purple-50 rounded-lg p-2 group-hover:bg-purple-100 transition-colors duration-300">
                         <div 
                           className="aspect-square overflow-hidden rounded-lg group-hover:scale-105 transition-transform duration-300" 
                           style={{ width: '100px', height: '100px' }}
                           onMouseEnter={() => showImage(transformation.afterImage, `After: ${transformation.title}`)}
                           onMouseLeave={hideImage}
                         >
                           <ImageWithFallback
                             src={transformation.afterImage}
                             alt={`After: ${transformation.title}`}
                             className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                           />
                         </div>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="text-center mt-8">
          <p className="text-gray-600 mb-4">
            Want to see your creation featured here?
          </p>
          <button 
            onClick={onNavigateToApp}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-all duration-200"
          >
            Create Your Own
          </button>
        </div>
      </div>

       {/* Hover Image Display */}
       {hoveredImage && (
         <div 
           className="fixed inset-0 bg-black bg-opacity-75 flex items-start justify-center z-50 p-4 pt-20 pointer-events-none"
           style={{
             animation: 'fadeIn 0.2s ease-out forwards'
           }}
         >
           <div 
             className="relative w-80 h-80"
             style={{
               animation: 'scaleIn 0.2s ease-out forwards'
             }}
           >
             <ImageWithFallback
               src={hoveredImage.src}
               alt={hoveredImage.alt}
               className="w-full h-full object-contain rounded-lg shadow-2xl border-4 border-white"
             />
           </div>
         </div>
       )}
    </section>
  );
}
