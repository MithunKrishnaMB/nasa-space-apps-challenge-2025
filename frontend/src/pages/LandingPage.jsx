// src/pages/LandingPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import InteractiveBackground from '../components/InteractiveBackground';

function LandingPage() {
  return (
    <div className="relative h-screen w-screen overflow-hidden font-sans">
      <InteractiveBackground />
      
      {/* We add a z-index to ensure the content stays on top of the background */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        <h1 
          className="text-6xl md:text-9xl font-thin text-black uppercase"
          style={{ letterSpacing: '-0.05em' }} // Fine-tune letter spacing for that premium look
        >
          Impact Horizon
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Analyze. Defend. Survive.
        </p>
        <Link 
          to="/simulator" 
          className="mt-12 px-8 py-4 bg-black hover:bg-gray-800 rounded-full text-white font-semibold transition duration-300 shadow-lg text-sm"
        >
          LAUNCH SIMULATOR
        </Link>
      </div>
    </div>
  );
}

export default LandingPage;