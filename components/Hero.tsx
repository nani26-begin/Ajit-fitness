import React from 'react';
import { ArrowRight } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative h-screen min-h-[600px] flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop" 
          alt="Gym interior dark" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-950 via-brand-950/90 to-transparent"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 pt-20">
        <div className="max-w-2xl animate-fade-in-up">
          <div className="inline-block px-3 py-1 mb-6 border border-brand-500/50 rounded-full bg-brand-900/30 backdrop-blur-sm text-brand-300 text-sm font-medium tracking-wide">
            REDEFINING FITNESS IN 2025
          </div>
          <h1 className="font-display text-6xl md:text-8xl font-bold text-white leading-tight mb-6">
            SCULPT YOUR <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-200">
              LEGACY
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 font-light max-w-lg">
            Experience the next evolution of training with AI-driven analytics, elite equipment, and a community dedicated to excellence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-sm transition-all flex items-center justify-center gap-2 group">
              START FREE TRIAL
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 border border-white/20 hover:border-brand-400 hover:bg-brand-900/20 text-white font-bold rounded-sm transition-all">
              VIEW SCHEDULE
            </button>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-brand-950 to-transparent z-10"></div>
    </section>
  );
};

export default Hero;
