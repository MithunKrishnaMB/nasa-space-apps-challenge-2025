import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon issue with webpack/vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});


function SimulatorPage() {
  // State to hold the values from the sliders
  const [asteroidSize, setAsteroidSize] = useState(100); // in meters
  const [asteroidVelocity, setAsteroidVelocity] = useState(20); // in km/s
  const [impactAngle, setImpactAngle] = useState(45); // in degrees

  // Map centered on Kochi, Kerala
  const kochiPosition = [9.9312, 76.2673];

  const handleSimulate = () => {
    console.log("Simulating with:", { size: asteroidSize, velocity: asteroidVelocity, angle: impactAngle });
    // Using a more modern notification method than alert() is recommended for a final product
    alert("Frontend is ready! Connecting to the backend is the next step.");
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100 text-black font-sans">

      {/* --- Control Panel --- */}
      <div className="w-full md:w-1/3 p-6 bg-white shadow-2xl overflow-y-auto border-r border-gray-200">
        <h1 
          className="text-3xl font-thin uppercase"
          style={{ letterSpacing: '-0.05em' }}
        >
          Impact Horizon
        </h1>
        <p className="text-gray-500 mb-8">Asteroid Impact Simulator</p>

        <div className="space-y-8">
          <div>
            <label htmlFor="size" className="block mb-2 text-sm font-medium text-gray-700">Asteroid Size (meters)</label>
            <div className='flex items-center space-x-4'>
              <input id="size" type="range" min="10" max="1000" step="10" value={asteroidSize} onChange={(e) => setAsteroidSize(e.target.value)} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"/>
              <span className="text-black font-mono w-20 text-center bg-gray-100 py-1 rounded-md">{asteroidSize} m</span>
            </div>
          </div>

          <div>
            <label htmlFor="velocity" className="block mb-2 text-sm font-medium text-gray-700">Velocity (km/s)</label>
             <div className='flex items-center space-x-4'>
              <input id="velocity" type="range" min="10" max="70" step="1" value={asteroidVelocity} onChange={(e) => setAsteroidVelocity(e.target.value)} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"/>
              <span className="text-black font-mono w-24 text-center bg-gray-100 py-1 rounded-md">{asteroidVelocity} km/s</span>
            </div>
          </div>

          <div>
            <label htmlFor="angle" className="block mb-2 text-sm font-medium text-gray-700">Impact Angle (°)</label>
             <div className='flex items-center space-x-4'>
                <input id="angle" type="range" min="15" max="90" step="1" value={impactAngle} onChange={(e) => setImpactAngle(e.target.value)} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"/>
                <span className="text-black font-mono w-20 text-center bg-gray-100 py-1 rounded-md">{impactAngle}°</span>
            </div>
          </div>
        </div>

        <button onClick={handleSimulate} className="w-full mt-10 py-3 bg-black hover:bg-gray-800 rounded-full text-white font-semibold transition duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black">
          ANALYZE IMPACT
        </button>
      </div>

      {/* --- Map Display --- */}
      <div className="w-full md:w-2/3 h-full">
        <MapContainer center={kochiPosition} zoom={7} scrollWheelZoom={true} style={{ height: "100%", width: "100%", backgroundColor: '#f3f4f6' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          <Marker position={kochiPosition}>
            <Popup>
              Target Region: Kochi, Kerala
            </Popup>
          </Marker>
        </MapContainer>
      </div>

    </div>
  );
}

export default SimulatorPage;
