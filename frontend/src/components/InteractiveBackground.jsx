// src/components/InteractiveBackground.jsx
import React, { useEffect, useState, useMemo } from 'react';
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadFull } from "tsparticles"; 

// --- SVG Assets remain the same ---
const asteroidSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%23A0A0A0"><path d="M85.3,67.1C72.8,82.5,52.1,91,30.3,88.9c-21.8-2.1-39.1-18.4-44.1-39.1C-18.7,28.1,2.9,5.5,23.6,0.5S72.8-8.9,85.3,6.5s9.8,38.8,0,60.6Z"/></svg>`;
const planetSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="30" fill="%2367E8F9"/><ellipse cx="50" cy="50" rx="45" ry="15" fill="none" stroke="%23A5F3FC" stroke-width="4"/></svg>`;

const InteractiveBackground = () => {
    const [init, setInit] = useState(false);

    // This effect will run once when the component mounts
    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadFull(engine);
        }).then(() => {
            setInit(true); // Mark initialization as complete
        });
    }, []);

    const particlesOptions = useMemo(
        () => ({
            background: {
                color: { value: '#ffffff' }, // White background
            },
            fpsLimit: 120,
            interactivity: {
                events: {
                    onHover: { enable: true, mode: 'repulse' },
                    onClick: { enable: true, mode: 'push' },
                },
                modes: {
                    repulse: { distance: 150, duration: 0.4 },
                    push: { quantity: 2 },
                },
            },
            particles: {
                color: { value: '#aaaaaa' },
                links: { enable: false },
                move: {
                    direction: 'none',
                    enable: true,
                    outModes: { default: 'bounce' },
                    random: true,
                    speed: 0.8,
                    straight: false,
                },
                number: {
                    density: { enable: true, area: 800 },
                    value: 25,
                },
                opacity: { value: 0.9 },
                shape: {
                    type: 'image',
                    image: [
                        { src: asteroidSvg, width: 100, height: 100 },
                        { src: planetSvg, width: 100, height: 100 },
                    ],
                },
                size: { value: { min: 15, max: 45 } },
            },
            detectRetina: true,
        }),
        [],
    );

    // Only render the Particles component if the engine is initialized
    if (init) {
        return (
            <Particles
                id="tsparticles"
                options={particlesOptions}
            />
        );
    }

    return <></>; // Render nothing while waiting for init
};

export default InteractiveBackground;