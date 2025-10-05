import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";

import InteractiveBackground from "../components/InteractiveBackground";
import ImpactHorizon from "../components/ImpactHorizon"; // ImpactHorizon is now forwardRef-enabled

export default function LandingPage() {
  const impactHorizonRef = useRef(null); // Ref for ImpactHorizon component
  const impactSectionRef = useRef(null); // Ref for the section containing ImpactHorizon

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && impactHorizonRef.current) {
          // If the ImpactHorizon section is visible, restart its animation
          impactHorizonRef.current.restartAnimation();
        }
      },
      {
        threshold: 0.5, // Trigger when 50% of the section is visible
      }
    );

    if (impactSectionRef.current) {
      observer.observe(impactSectionRef.current);
    }

    return () => {
      if (impactSectionRef.current) {
        observer.unobserve(impactSectionRef.current);
      }
    };
  }, []);

  return (
    <div className="relative h-screen w-full overflow-y-scroll snap-y snap-mandatory">
      {/* The background is placed here so it can be visible on any section with a transparent background */}
      <InteractiveBackground />

      {/* --- Section 1: Hero / Welcome Screen --- */}
      <section className="relative h-screen w-full snap-start flex flex-col items-center justify-center z-10 bg-transparent">
        <h1
          className="text-6xl md:text-9xl font-thin text-black uppercase"
          style={{ letterSpacing: "-0.05em" }}
        >
          Impact Horizon
        </h1>
        <p className="mt-4 text-lg text-gray-600">Analyze. Defend. Survive.</p>
        <div className="absolute bottom-10 animate-bounce text-gray-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14" />
            <path d="m19 12-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* --- Section 2: Interactive 3D Globe with Description --- */}
      {/* Added ref to this section for Intersection Observer */}
      <section
        ref={impactSectionRef}
        className="relative h-screen w-full snap-start z-10 bg-black flex items-center justify-center p-8"
      >
        {/* ImpactHorizon component takes up the whole background of this section */}
        <ImpactHorizon ref={impactHorizonRef} />

        {/* Project Description Overlays */}
        <div className="absolute top-1/2 left-0 w-1/3 p-4 -translate-y-1/2 text-white text-right z-20">
          <p className="text-lg font-thin leading-relaxed">
            Our simulation is fueled by real-world data and models developed by
            NASA's planetary defense teams.
          </p>
        </div>
        <div className="absolute top-1/2 right-0 w-1/3 p-4 -translate-y-1/2 text-white text-left z-20">
          <p className="text-lg font-thin leading-relaxed">
            We translate complex orbital mechanics and impact physics into
            actionable intelligence, empowering you to visualize threats that
            shape planetary defense strategies. This is meteor madness made
            manageable.
          </p>
        </div>

        {/* You can add an overlay title here if you want */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 text-white text-center z-20">
          <h2 className="text-4xl font-thin">Explore Past Impacts</h2>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-10  -translate-x-1/2 animate-bounce text-gray-400 z-20">
          <p className="mb-2  text-sm">Scroll to Continue</p>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto"
          >
            <path d="M12 5v14" />
            <path d="m19 12-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* --- Section 3: Simulator Preview Screen (Restored) --- */}
      <section className="relative h-screen w-full snap-start flex items-center justify-center z-10 bg-transparent">
        <div className="relative w-11/12 max-w-5xl">
          <img
            src="/simulator-preview.jpg"
            alt="Impact Horizon Simulator Preview"
            className="w-full h-auto rounded-xl shadow-2xl border border-gray-200"
          />

          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center rounded-xl">
            <Link
              to="/simulator"
              className="px-8 py-4 bg-white hover:bg-gray-200 rounded-full text-black font-semibold transition duration-300 shadow-lg text-sm flex items-center space-x-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <path d="m5 12 7-7 7 7" />
                <path d="M12 19V5" />
              </svg>
              <span>LAUNCH SIMULATOR</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
