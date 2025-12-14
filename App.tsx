import React from 'react';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import Features from './components/Features';
import VoiceAssistant from './components/VoiceAssistant';

const App: React.FC = () => {
  return (
    <div className="min-h-screen font-sans bg-brand-950 text-white selection:bg-brand-500 selection:text-white">
      <Navigation />
      <Hero />
      <Features />
      
      {/* Content Spacer for Demo */}
      <section className="py-24 bg-brand-900 border-t border-brand-800">
         <div className="container mx-auto px-6 text-center">
            <h3 className="font-display text-3xl font-bold mb-4">READY TO TRANSFORM?</h3>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Join thousands of members who have already taken the first step towards their peak potential.
            </p>
            <div className="inline-flex items-center gap-2 text-brand-400 border-b border-brand-400 pb-1 hover:text-brand-300 hover:border-brand-300 cursor-pointer transition-colors">
              <span className="font-bold tracking-widest text-sm">LOCATE A GYM NEAR YOU</span>
            </div>
         </div>
      </section>

      <footer className="bg-black py-12 border-t border-white/10">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col gap-1 text-center md:text-left">
            <p className="text-gray-500 text-sm">© 2025 Ajit Fitness. All rights reserved to Ajit babu kakumanu.</p>
            <p className="text-gray-500 text-sm">Created by Ajit babu kakumanu</p>
            <a href="mailto:kakumanuajitbabu@gmail.com" className="text-brand-500 text-sm hover:text-brand-400 transition-colors mt-1 inline-block">
              kakumanuajitbabu@gmail.com
            </a>
          </div>
          <div className="flex gap-6 text-gray-500">
            <a href="#" className="hover:text-brand-500 transition-colors">Privacy</a>
            <a href="#" className="hover:text-brand-500 transition-colors">Terms</a>
            <a href="#" className="hover:text-brand-500 transition-colors">Instagram</a>
          </div>
        </div>
      </footer>

      {/* The AI Assistant lives here */}
      <VoiceAssistant />
    </div>
  );
};

export default App;