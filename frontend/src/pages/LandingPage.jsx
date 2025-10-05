import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";

import InteractiveBackground from "../components/InteractiveBackground";
import ImpactHorizon from "../components/ImpactHorizon"; // Make sure this supports forwardRef

export default function LandingPage() {
  const impactHorizonRef = useRef(null); // Ref for 3D globe component
  const impactSectionRef = useRef(null); // Ref for Intersection Observer trigger

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && impactHorizonRef.current) {
          impactHorizonRef.current.restartAnimation();
        }
      },
      { threshold: 0.5 }
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
      <InteractiveBackground />

      {/* --- Section 1: Hero --- */}
      <section className="relative h-screen w-full snap-start flex flex-col items-center justify-center z-10 bg-transparent">
        <h1
          className="text-6xl md:text-9xl font-thin text-white uppercase"
          style={{ letterSpacing: "-0.05em" }}
        >
          Impact Horizon
        </h1>
        <p className="mt-4 text-lg text-gray-300">
          Analyze. Defend. Survive.
        </p>
        <div className="absolute bottom-10 animate-bounce text-gray-300">
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
      <section
        ref={impactSectionRef}
        className="relative h-screen w-full snap-start z-10 bg-black flex items-center justify-center p-8"
      >
        {/* 3D Globe Background */}
        <ImpactHorizon ref={impactHorizonRef} />

        {/* Left description */}
        <div className="absolute top-1/2 left-0 w-1/3 p-4 -translate-y-1/2 text-white text-right z-20">
          <p className="text-lg font-thin leading-relaxed">
            Our simulation is fueled by real-world data and models developed by
            NASA's planetary defense teams.
          </p>
        </div>

        {/* Right description */}
        <div className="absolute top-1/2 right-0 w-1/3 p-4 -translate-y-1/2 text-white text-left z-20">
          <p className="text-lg font-thin leading-relaxed">
            We translate complex orbital mechanics and impact physics into
            actionable intelligence, empowering you to visualize threats that
            shape planetary defense strategies. This is meteor madness made
            manageable.
          </p>
        </div>

        {/* Section Title */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 text-white text-center z-20">
          <h2 className="text-4xl font-thin">Explore Past Impacts</h2>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-gray-400 z-20">
          <p className="mb-2 text-sm">Scroll to Continue</p>
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

      {/* --- Section 3: Simulator Preview --- */}
      <section className="relative h-screen w-full snap-start flex items-center justify-center z-10 bg-transparent">
        <div className="relative w-11/12 max-w-5xl">
          <img
            src="/simulator-preview.png"
            alt="Impact Horizon Simulator Preview"
            className="w-full h-auto rounded-xl shadow-2xl border border-gray-700"
          />

          {/* Launch Button */}
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-xl">
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
