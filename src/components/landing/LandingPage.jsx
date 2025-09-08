import React from 'react';
import { Header } from './Header';
import { Hero } from './Hero';
import { Services } from './Services';
import { Gallery } from './Gallery';
import { Footer } from './Footer';

export function LandingPage({ onNavigateToApp, onNavigateToAbout }) {
  return (
    <div className="min-h-screen bg-background">
      <Header onNavigateToApp={onNavigateToApp} onNavigateToAbout={onNavigateToAbout} />
      <main>
        <Hero onNavigateToApp={onNavigateToApp} />
        <Services onNavigateToApp={onNavigateToApp} />
        <Gallery onNavigateToApp={onNavigateToApp} />
      </main>
      <Footer />
    </div>
  );
}
