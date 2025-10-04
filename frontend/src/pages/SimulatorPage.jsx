import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  LoaderCircle,
  ServerCrash,
  BarChart,
  CircleDot,
  Flame,
  Wind,
  Waves,
  ChevronsRight,
  RefreshCcw,
} from "lucide-react";

// --- Leaflet Icon Fix ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// --- Default and Impact Marker Icons ---
const defaultTargetIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNjYzAwMDYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjYiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIyIi8+PC9zdmc+",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const impactTargetIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZjAwMDAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxOCI+PC9jaXJjbGU+PC9zdmc+",
  iconSize: [64, 64],
  iconAnchor: [32, 32],
});

// --- Map Click Handler ---
function MapClickHandler({ setTargetPosition, resetMarkerIcon }) {
  useMapEvents({
    click(e) {
      setTargetPosition(e.latlng);
      resetMarkerIcon(); // reset only marker icon
    },
  });
  return null;
}

// --- Results Display Component ---
const ResultsDisplay = ({ results }) => {
  if (!results) return null;
  return (
    <div className="mt-8 p-4 bg-white rounded-lg border border-gray-200 animate-fade-in">
      <h3 className="font-bold text-lg mb-4 flex items-center">
        <BarChart className="w-5 h-5 mr-2 text-blue-500" />
        Impact Summary
      </h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Total Economic Score:</span>
          <span className="font-bold text-red-500">
            {results.impact_summary.total_economic_score.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Estimated Damage (USD):</span>
          <span className="font-bold text-red-500">
            {results.impact_summary.estimated_monetary_damage_usd}
          </span>
        </div>
      </div>

      <h3 className="font-bold text-lg mt-6 mb-4">Damage Radii</h3>
      <div className="space-y-2 text-sm">
        {Object.entries(results.damage_radii_km).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-gray-600 capitalize flex items-center">
              {key === "crater" && (
                <CircleDot className="w-4 h-4 mr-2 text-gray-500" />
              )}
              {key === "thermal" && (
                <Flame className="w-4 h-4 mr-2 text-orange-500" />
              )}
              {key === "air_blast" && (
                <Wind className="w-4 h-4 mr-2 text-cyan-500" />
              )}
              {key === "seismic" && (
                <Waves className="w-4 h-4 mr-2 text-green-500" />
              )}
              {key.replace("_", " ")}:
            </span>
            <span className="font-mono">{value.toFixed(2)} km</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main Component ---
export default function SimulatorPage() {
  const [asteroids, setAsteroids] = useState([]);
  const [selectedAsteroid, setSelectedAsteroid] = useState("custom");
  const [asteroidSize, setAsteroidSize] = useState(50);
  const [asteroidVelocity, setAsteroidVelocity] = useState(20);
  const [impactAngle, setImpactAngle] = useState(45);
  const [targetPosition, setTargetPosition] = useState({
    lat: 9.9312,
    lng: 76.2673,
  });
  const [currentMarkerIcon, setCurrentMarkerIcon] = useState(defaultTargetIcon);
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [showRefresh, setShowRefresh] = useState(false);
  const controllerRef = useRef(null);

  const isCustomScenario = selectedAsteroid === "custom";

  // Fetch asteroid list
  useEffect(() => {
    async function fetchAsteroids() {
      try {
        const response = await fetch("http://127.0.0.1:5000/asteroids");
        if (!response.ok) throw new Error("Failed to fetch asteroids");
        const data = await response.json();
        setAsteroids(data);
      } catch (e) {
        console.error(e);
      }
    }
    fetchAsteroids();
  }, []);

  const resetMarkerIcon = () => setCurrentMarkerIcon(defaultTargetIcon);

  // Handle Simulation
  const handleSimulate = async () => {
    setIsLoading(true);
    setError(null);
    setIsCancelled(false);
    setShowRefresh(true);

    controllerRef.current = new AbortController();
    const signal = controllerRef.current.signal;

    const payload = {
      target: { lat: targetPosition.lat, lon: targetPosition.lng },
      angle: impactAngle,
      velocity: asteroidVelocity,
    };
    if (isCustomScenario) payload.diameter = asteroidSize;
    else payload.asteroid_id = selectedAsteroid;

    try {
      const response = await fetch("http://127.0.0.1:5000/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal,
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (!isCancelled) {
        setResults(data);
        setCurrentMarkerIcon(impactTargetIcon); // enlarge marker after analysis
      }
    } catch (e) {
      if (e.name === "AbortError") console.log("Simulation cancelled.");
      else
        setError("Failed to connect to the simulation server. Is it running?");
    } finally {
      setIsLoading(false);
      setIsCancelled(false);
      controllerRef.current = null;
    }
  };

  const handleCancel = () => {
    if (controllerRef.current) {
      controllerRef.current.abort();
      setIsCancelled(true);
      setIsLoading(false);
      controllerRef.current = null;
    }
  };

  const handleRefresh = () => {
    setSelectedAsteroid("custom");
    setAsteroidSize(50);
    setAsteroidVelocity(20);
    setImpactAngle(45);
    setResults(null);
    setError(null);
    setIsLoading(false);
    setIsCancelled(false);
    setShowRefresh(false);
    setTargetPosition({ lat: 9.9312, lng: 76.2673 });
    setCurrentMarkerIcon(defaultTargetIcon); // reset marker
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 text-gray-800 font-sans">
      <div className="w-full md:w-1/3 p-6 bg-white border-r border-gray-200 shadow-xl z-10 overflow-y-auto">
        <h1 className="text-2xl font-bold">IMPACT HORIZON</h1>
        <p className="text-gray-500 mb-8 text-sm">Asteroid Impact Simulator</p>

        {/* Scenario Selection */}
        <div className="space-y-6">
          <div>
            <label
              htmlFor="scenario"
              className="text-sm font-medium text-gray-600 mb-1"
            >
              Select Scenario
            </label>
            <select
              id="scenario"
              value={selectedAsteroid}
              onChange={(e) => setSelectedAsteroid(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="custom">Custom Impactor</option>
              {asteroids.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Controls */}
          <div
            className={`space-y-6 transition-opacity duration-300 ${
              isCustomScenario ? "opacity-100" : "opacity-40"
            }`}
          >
            <h2
              className={`flex items-center text-sm font-medium text-gray-400 ${
                isCustomScenario ? "" : "line-through"
              }`}
            >
              <ChevronsRight className="w-4 h-4 mr-1" /> Custom Parameters
            </h2>

            <div>
              <label
                htmlFor="size"
                className="flex justify-between text-sm font-medium text-gray-600 mb-1"
              >
                <span>Asteroid Size</span>
                <span className="font-mono text-blue-600">
                  {asteroidSize} m
                </span>
              </label>
              <input
                id="size"
                type="range"
                min="10"
                max="1000"
                step="10"
                value={asteroidSize}
                onChange={(e) => setAsteroidSize(parseInt(e.target.value))}
                disabled={!isCustomScenario}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:accent-gray-300"
              />
            </div>
          </div>

          {/* Shared Controls */}
          <div>
            <label
              htmlFor="velocity"
              className="flex justify-between text-sm font-medium text-gray-600 mb-1"
            >
              <span>Impact Velocity</span>
              <span className="font-mono text-blue-600">
                {asteroidVelocity} km/s
              </span>
            </label>
            <input
              id="velocity"
              type="range"
              min="10"
              max="70"
              step="1"
              value={asteroidVelocity}
              onChange={(e) => setAsteroidVelocity(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <div>
            <label
              htmlFor="angle"
              className="flex justify-between text-sm font-medium text-gray-600 mb-1"
            >
              <span>Impact Angle</span>
              <span className="font-mono text-blue-600">{impactAngle}°</span>
            </label>
            <input
              id="angle"
              type="range"
              min="15"
              max="90"
              step="1"
              value={impactAngle}
              onChange={(e) => setImpactAngle(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col gap-3">
          {!isLoading && (
            <button
              onClick={handleSimulate}
              className="w-full py-3 bg-gray-800 hover:bg-black rounded-lg text-white font-bold transition duration-300 shadow-md flex items-center justify-center"
            >
              ANALYZE IMPACT
            </button>
          )}

          {isLoading && (
            <button
              onClick={handleCancel}
              className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white font-bold transition duration-300 shadow-md flex items-center justify-center"
            >
              <LoaderCircle className="w-5 h-5 mr-2 animate-spin" />
              CANCEL ASSESSMENT
            </button>
          )}

          {showRefresh && !isLoading && (
            <button
              onClick={handleRefresh}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-bold transition duration-300 shadow-md flex items-center justify-center"
            >
              <RefreshCcw className="w-5 h-5 mr-2" /> REFRESH
            </button>
          )}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg flex items-center">
            <ServerCrash className="w-5 h-5 mr-2" /> {error}
          </div>
        )}

        <ResultsDisplay results={results} />
      </div>

      {/* Map Section */}
      <div className="w-full md:w-2/3 h-full">
        <MapContainer
          center={[targetPosition.lat, targetPosition.lng]}
          zoom={7}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler
            setTargetPosition={setTargetPosition}
            resetMarkerIcon={resetMarkerIcon}
          />

          {/* Marker with dynamic icon */}
          <Marker
            key={`${targetPosition.lat}-${targetPosition.lng}-${currentMarkerIcon.options.iconUrl}`}
            position={[targetPosition.lat, targetPosition.lng]}
            icon={currentMarkerIcon}
          >
            <Popup>Impact Target</Popup>
          </Marker>

          {/* Damage circles */}
          {results && (
            <>
              <Circle
                center={[targetPosition.lat, targetPosition.lng]}
                radius={results.damage_radii_km.air_blast * 1000}
                pathOptions={{
                  color: "cyan",
                  fillColor: "cyan",
                  fillOpacity: 0.2,
                }}
              />
              <Circle
                center={[targetPosition.lat, targetPosition.lng]}
                radius={results.damage_radii_km.thermal * 1000}
                pathOptions={{
                  color: "orange",
                  fillColor: "orange",
                  fillOpacity: 0.2,
                }}
              />
              <Circle
                center={[targetPosition.lat, targetPosition.lng]}
                radius={results.damage_radii_km.crater * 1000}
                pathOptions={{
                  color: "red",
                  fillColor: "red",
                  fillOpacity: 0.3,
                }}
              />
            </>
          )}
        </MapContainer>
      </div>
    </div>
  );
}
