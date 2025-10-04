import React from 'react';
import { Link } from 'react-router-dom';
import InteractiveBackground from '../components/InteractiveBackground'; // Corrected component import

export default function LandingPage() {
  return (
    // This parent container holds the background and enables scrolling
    <div className="relative h-screen w-full overflow-y-scroll snap-y snap-mandatory">
      {/* The background is now here, so it's visible across all sections */}
      <InteractiveBackground />

      {/* --- Section 1: Hero / Welcome Screen --- */}
      {/* The z-10 ensures the content is on top of the background */}
      <section className="relative h-screen w-full snap-start flex flex-col items-center justify-center z-10 bg-transparent">
        <h1 
          className="text-6xl md:text-9xl font-thin text-black uppercase"
          style={{ letterSpacing: '-0.05em' }}
        >
          Impact Horizon
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Analyze. Defend. Survive.
        </p>
        {/* Subtle hint to encourage scrolling */}
        <div className="absolute bottom-10 animate-bounce text-gray-500">
          <svg xmlns="http://www.w.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
        </div>
      </section>

      {/* --- Section 2: Simulator Preview Screen --- */}
      <section className="relative h-screen w-full snap-start flex items-center justify-center z-10 bg-transparent">
        {/* This container will hold the screenshot and the centered button */}
        <div className="relative w-11/12 max-w-5xl">
          {/* The actual screenshot of your simulator page */}
          <img 
            src="/simulator-preview.jpg" 
            alt="Impact Horizon Simulator Preview"
            className="w-full h-auto rounded-xl shadow-2xl border border-gray-200"
          />

          {/* Centered Launch Button Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center rounded-xl">
            <Link 
              to="/simulator" 
              className="px-8 py-4 bg-white hover:bg-gray-200 rounded-full text-black font-semibold transition duration-300 shadow-lg text-sm flex items-center space-x-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
              <span>LAUNCH SIMULATOR</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

