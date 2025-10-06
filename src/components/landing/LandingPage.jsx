import React from 'react';
import { Header } from './Header';
import { Hero } from './Hero';
import { Services } from './Services';
import { Gallery } from './Gallery';
import { Newsletter } from './Newsletter';
import { Footer } from './Footer';

export function LandingPage({ onNavigateToApp, onNavigateToAbout }) {
  const handleNewsletterClick = () => {
    const newsletterSection = document.getElementById('newsletter');
    if (newsletterSection) {
      newsletterSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onNavigateToApp={onNavigateToApp} 
        onNavigateToAbout={onNavigateToAbout}
        onNewsletterClick={handleNewsletterClick}
      />
      <main>
        <Hero onNavigateToApp={onNavigateToApp} />
        <Gallery onNavigateToApp={onNavigateToApp} />
        <Services onNavigateToApp={onNavigateToApp} />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
