import React, { useEffect, useState, useMemo } from 'react';
import Particles, { initParticlesEngine } from "@tsparticles/react";
// Reverting to the known-good 'loadFull' engine
import { loadFull } from "tsparticles"; 

// The component is still named ThreeScene to match the import in LandingPage.jsx
export default function ThreeScene() {
    const [init, setInit] = useState(false);

    // This effect runs once to initialize the engine
    useEffect(() => {
        initParticlesEngine(async (engine) => {
            // Using the full, reliable engine
            await loadFull(engine);
        }).then(() => {
            setInit(true);
        });
    }, []);

    const particlesOptions = useMemo(
        () => ({
            // This is the critical fix: force the canvas to be a full-screen background layer
            fullScreen: {
                enable: true,
                zIndex: -1 
            },
            background: {
                color: {
                    value: '#ffffff', // The final white background
                },
            },
            fpsLimit: 120,
            interactivity: {
                events: {
                    onHover: {
                        enable: true,
                        mode: 'repulse', // Particles move away from the cursor
                    },
                },
                modes: {
                    repulse: {
                        distance: 150,
                        duration: 0.4,
                    },
                },
            },
            particles: {
                // We use simple circles as requested
                shape: {
                    type: 'circle',
                },
                color: {
                    value: '#000000', // High-contrast black particles
                },
                links: {
                    enable: false,
                },
                move: {
                    direction: 'none',
                    enable: true,
                    outModes: {
                        default: 'bounce',
                    },
                    random: true,
                    speed: 1,
                    straight: false,
                },
                number: {
                    density: {
                        enable: true,
                        area: 800,
                    },
                    value: 80, // A good number of particles
                },
                opacity: {
                    value: 0.5, // A little softer than pure black
                },
                size: {
                    value: { min: 1, max: 5 }, // Small, subtle circles
                },
            },
            detectRetina: true,
        }),
        [],
    );

    if (init) {
        return <Particles id="tsparticles" options={particlesOptions} />;
    }

    return <></>; // Render nothing while initializing
};

