import React, { useEffect, useState, useMemo } from 'react';
import Particles, { initParticlesEngine } from "@tsparticles/react";
// Reverting to the known-good 'loadFull' engine
import { loadFull } from "tsparticles"; 

// The component is named InteractiveBackground to match the file
export default function InteractiveBackground() {
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
                    value: '#000000', // Black background for space look
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
                    value: '#ffffff', // White particles (stars/asteroids)
                },
                // NEW: Add a soft white shadow for the "shady fill" effect
                shadow: {
                    enable: true,
                    blur: 10,
                    color: "#ffffff" // Soft white glow
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
                    value: 120, // Increased number for better star coverage
                },
                opacity: {
                    // Slight opacity change for the core circle
                    value: { min: 0.3, max: 0.8 }, 
                },
                size: {
                    // Use a range for varied sizes
                    value: { min: 1, max: 3 }, 
                    random: true,
                    animation: {
                        enable: true,
                        speed: 2,
                        minimumValue: 0.5,
                        sync: false,
                    }
                },
                // REMOVED: wobble and life properties for the smooth shadow effect
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
