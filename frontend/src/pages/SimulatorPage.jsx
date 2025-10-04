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
    alert("Frontend is ready! Connecting to the backend is the next step.");
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-900 text-white font-sans">

      {/* --- Control Panel --- */}
      <div className="w-full md:w-1/3 p-6 bg-gray-800 shadow-2xl overflow-y-auto">
        <h1 className="text-3xl font-bold mb-2 text-cyan-400">Impact Horizon</h1>
        <p className="text-gray-400 mb-8">Asteroid Impact Simulator</p>

        <div className="space-y-8">
          <div>
            <label htmlFor="size" className="block mb-2 text-sm font-medium text-gray-300">Asteroid Size (meters)</label>
            <div className='flex items-center space-x-4'>
              <input id="size" type="range" min="10" max="1000" step="10" value={asteroidSize} onChange={(e) => setAsteroidSize(e.target.value)} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"/>
              <span className="text-cyan-400 font-mono w-16 text-center bg-gray-900 py-1 rounded-md">{asteroidSize} m</span>
            </div>
          </div>

          <div>
            <label htmlFor="velocity" className="block mb-2 text-sm font-medium text-gray-300">Velocity (km/s)</label>
             <div className='flex items-center space-x-4'>
              <input id="velocity" type="range" min="10" max="70" step="1" value={asteroidVelocity} onChange={(e) => setAsteroidVelocity(e.target.value)} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"/>
              <span className="text-cyan-400 font-mono w-16 text-center bg-gray-900 py-1 rounded-md">{asteroidVelocity} km/s</span>
            </div>
          </div>

          <div>
            <label htmlFor="angle" className="block mb-2 text-sm font-medium text-gray-300">Impact Angle (°)</label>
             <div className='flex items-center space-x-4'>
                <input id="angle" type="range" min="15" max="90" step="1" value={impactAngle} onChange={(e) => setImpactAngle(e.target.value)} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"/>
                <span className="text-cyan-400 font-mono w-16 text-center bg-gray-900 py-1 rounded-md">{impactAngle}°</span>
            </div>
          </div>
        </div>

        <button onClick={handleSimulate} className="w-full mt-10 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white font-bold transition duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-400">
          ANALYZE IMPACT
        </button>
      </div>

      {/* --- Map Display --- */}
      <div className="w-full md:w-2/3 h-full">
        <MapContainer center={kochiPosition} zoom={7} scrollWheelZoom={true} style={{ height: "100%", width: "100%", backgroundColor: '#111827' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
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