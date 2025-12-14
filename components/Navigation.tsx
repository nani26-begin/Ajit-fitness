import React, { useState, useEffect } from 'react';
import { Menu, X, Dumbbell } from 'lucide-react';
import { NavItem } from '../types';

const navItems: NavItem[] = [
  { label: 'Home', href: '#' },
  { label: 'Classes', href: '#classes' },
  { label: 'Membership', href: '#membership' },
  { label: 'Trainers', href: '#trainers' },
];

const Navigation: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-40 transition-all duration-300 ${scrolled ? 'bg-brand-950/90 backdrop-blur-md py-4 shadow-lg' : 'bg-transparent py-6'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-2 group cursor-pointer">
          <Dumbbell className="w-8 h-8 text-brand-500 group-hover:rotate-12 transition-transform" />
          <span className="font-display font-bold text-2xl tracking-wider text-white">AJIT<span className="text-brand-500">.</span></span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a 
              key={item.label} 
              href={item.href} 
              className="text-sm font-medium text-gray-300 hover:text-brand-400 tracking-wide transition-colors uppercase"
            >
              {item.label}
            </a>
          ))}
          <button className="px-6 py-2 border border-brand-500 text-brand-400 hover:bg-brand-500 hover:text-white rounded-sm font-bold transition-all text-sm tracking-wider">
            JOIN NOW
          </button>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-brand-950 border-t border-white/10 p-6 flex flex-col gap-4 shadow-2xl">
          {navItems.map((item) => (
            <a 
              key={item.label} 
              href={item.href} 
              className="text-lg font-medium text-gray-200 hover:text-brand-500 py-2 border-b border-white/5"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <button className="w-full mt-4 py-3 bg-brand-600 text-white font-bold rounded-sm">
            JOIN NOW
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navigation;