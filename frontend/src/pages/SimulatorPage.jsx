import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { LoaderCircle, ServerCrash, BarChart, CircleDot, Flame, Wind, Waves } from 'lucide-react';

// Fix for default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// A new component to display the results from the backend
const ResultsDisplay = ({ results }) => {
    if (!results) return null;

    return (
        <div className="mt-8 p-4 bg-white rounded-lg border border-gray-200 animate-fade-in">
            <h3 className="font-bold text-lg mb-4 flex items-center"><BarChart className="w-5 h-5 mr-2 text-blue-500"/>Impact Summary</h3>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-600">Total Economic Score:</span>
                    <span className="font-bold text-red-500">{results.impact_summary.total_economic_score.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Estimated Damage (USD):</span>
                    <span className="font-bold text-red-500">{results.impact_summary.estimated_monetary_damage_usd}</span>
                </div>
            </div>

            <h3 className="font-bold text-lg mt-6 mb-4">Damage Radii</h3>
            <div className="space-y-2 text-sm">
                {Object.entries(results.damage_radii_km).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                        <span className="text-gray-600 capitalize flex items-center">
                            {key === 'crater' && <CircleDot className="w-4 h-4 mr-2 text-gray-500"/>}
                            {key === 'thermal' && <Flame className="w-4 h-4 mr-2 text-orange-500"/>}
                            {key === 'air_blast' && <Wind className="w-4 h-4 mr-2 text-cyan-500"/>}
                            {key === 'seismic' && <Waves className="w-4 h-4 mr-2 text-green-500"/>}
                            {key.replace('_', ' ')}:
                        </span>
                        <span className="font-mono">{value} km</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


export default function SimulatorPage() {
  // --- State for Controls ---
  const [asteroidSize, setAsteroidSize] = useState(100);
  const [asteroidVelocity, setAsteroidVelocity] = useState(20);
  const [impactAngle, setImpactAngle] = useState(45);
  
  // --- State for API Interaction ---
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  const kochiPosition = [9.9312, 76.2673];

  const handleSimulate = async () => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch('http://127.0.0.1:5000/analyse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          diameter: asteroidSize,
          density: 3000, // Example value from blueprint
          velocity: asteroidVelocity,
          angle: impactAngle,
          target: {
            name: "Kochi",
            lat: kochiPosition[0],
            lon: kochiPosition[1],
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResults(data);

    } catch (e) {
      console.error("Failed to fetch simulation results:", e);
      setError("Failed to connect to the simulation server. Is it running?");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 text-gray-800 font-sans">

      {/* --- Control Panel --- */}
      <div className="w-full md:w-1/3 p-6 bg-white border-r border-gray-200 shadow-xl z-10 overflow-y-auto">
        <h1 className="text-2xl font-bold">IMPACT HORIZON</h1>
        <p className="text-gray-500 mb-8 text-sm">Asteroid Impact Simulator</p>

        <div className="space-y-6">
          <div>
            <label htmlFor="size" className="flex justify-between text-sm font-medium text-gray-600 mb-1">
              <span>Asteroid Size</span>
              <span className="font-mono text-blue-600">{asteroidSize} m</span>
            </label>
            <input id="size" type="range" min="10" max="1000" step="10" value={asteroidSize} onChange={(e) => setAsteroidSize(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"/>
          </div>

          <div>
            <label htmlFor="velocity" className="flex justify-between text-sm font-medium text-gray-600 mb-1">
                <span>Velocity</span>
                <span className="font-mono text-blue-600">{asteroidVelocity} km/s</span>
            </label>
            <input id="velocity" type="range" min="10" max="70" step="1" value={asteroidVelocity} onChange={(e) => setAsteroidVelocity(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"/>
          </div>

          <div>
            <label htmlFor="angle" className="flex justify-between text-sm font-medium text-gray-600 mb-1">
                <span>Impact Angle</span>
                <span className="font-mono text-blue-600">{impactAngle}°</span>
            </label>
            <input id="angle" type="range" min="15" max="90" step="1" value={impactAngle} onChange={(e) => setImpactAngle(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"/>
          </div>
        </div>

        <button 
            onClick={handleSimulate} 
            className="w-full mt-10 py-3 bg-gray-800 hover:bg-black rounded-lg text-white font-bold transition duration-300 shadow-md flex items-center justify-center disabled:bg-gray-400"
            disabled={isLoading}
        >
          {isLoading ? <LoaderCircle className="animate-spin" /> : 'ANALYZE IMPACT'}
        </button>

        {error && <div className="mt-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg flex items-center"><ServerCrash className="w-5 h-5 mr-2"/> {error}</div>}
        
        <ResultsDisplay results={results} />
      </div>

      {/* --- Map Display --- */}
      <div className="w-full md:w-2/3 h-full">
        <MapContainer center={kochiPosition} zoom={7} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          <Marker position={kochiPosition}>
            <Popup>Target Region: Kochi, Kerala</Popup>
          </Marker>

          {/* This will draw the damage radii on the map when results are available */}
          {results && (
              <>
                <Circle center={kochiPosition} radius={results.damage_radii_km.air_blast * 1000} pathOptions={{ color: 'cyan', fillColor: 'cyan', fillOpacity: 0.2 }} />
                <Circle center={kochiPosition} radius={results.damage_radii_km.thermal * 1000} pathOptions={{ color: 'orange', fillColor: 'orange', fillOpacity: 0.2 }} />
                <Circle center={kochiPosition} radius={results.damage_radii_km.crater * 1000} pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.3 }} />
              </>
          )}
        </MapContainer>
      </div>
    </div>
  );
}

