import React from 'react';
import { Dumbbell, Clock, Users, Zap, Award, Smartphone } from 'lucide-react';
import { Feature } from '../types';

const features: Feature[] = [
  {
    title: "Elite Equipment",
    description: "State-of-the-art Hammer Strength & Technogym machines tailored for biomechanical perfection.",
    icon: <Dumbbell className="w-8 h-8" />
  },
  {
    title: "24/7 Access",
    description: "Train on your terms. Our biometric entry system keeps the facility secure and open around the clock.",
    icon: <Clock className="w-8 h-8" />
  },
  {
    title: "Expert Coaching",
    description: "Certified trainers who build data-driven programs specific to your physiology and goals.",
    icon: <Users className="w-8 h-8" />
  },
  {
    title: "Recovery Zone",
    description: "Infrared saunas, cryotherapy chambers, and percussion therapy to accelerate your recovery.",
    icon: <Zap className="w-8 h-8" />
  },
  {
    title: "Competitive Edge",
    description: "Monthly challenges and leaderboards to push your limits and measure progress against the best.",
    icon: <Award className="w-8 h-8" />
  },
  {
    title: "Smart Integration",
    description: "Sync your wearables with our equipment. Track every rep, set, and calorie seamlessly.",
    icon: <Smartphone className="w-8 h-8" />
  }
];

const Features: React.FC = () => {
  return (
    <section className="py-24 bg-brand-950 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">WHY CHOOSE AJIT FITNESS</h2>
          <div className="w-24 h-1 bg-brand-500 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-brand-900/30 border border-white/5 hover:border-brand-500/50 p-8 rounded-xl transition-all hover:shadow-[0_0_30px_-5px_rgba(20,184,166,0.15)] group">
              <div className="w-14 h-14 bg-brand-800/50 rounded-lg flex items-center justify-center text-brand-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3 font-display">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;