from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

# Import your custom modules
from asteroid_data import FAMOUS_ASTEROIDS
from physics_model import calculate_damage_radii
from geospatial_analysis import run_geospatial_analysis
from economic_model import calculate_monetary_damage  # <-- NEW FUNCTION

# --- Flask App Initialization ---
app = Flask(__name__, static_folder='../frontend/dist', static_url_path='/')
CORS(app)

# --- API Endpoints ---

@app.route('/asteroids', methods=['GET'])
def get_asteroids():
    """
    Provides a list of famous asteroids for the frontend dropdown.
    """
    try:
        asteroid_list = [
            {"id": key, "name": value["name"]}
            for key, value in FAMOUS_ASTEROIDS.items()
        ]
        return jsonify(asteroid_list)
    except Exception as e:
        print(f"Error in /asteroids endpoint: {e}")
        return jsonify({"error": "Could not load asteroid data"}), 500


# In app.py

@app.route('/analyse', methods=['POST'])
def analyse_impact():
    """
    The main analysis endpoint. Integrates all backend modules.
    """
    try:
        data = request.json
        print(f"Received analysis request: {data}")

        # --- 1. Determine Impactor Properties ---
        if data.get('asteroid_id') and data['asteroid_id'] != 'custom':
            asteroid = FAMOUS_ASTEROIDS.get(data['asteroid_id'])
            diameter = asteroid['diameter_m']
            density = asteroid['density_kg_m3']
        else:
            diameter = data['diameter']
            density = data.get('density', 3000)

        velocity = data['velocity']
        angle = data['angle']
        target_coords = data['target']

        # --- 2. Run the Physics Model ---
        physics_results = calculate_damage_radii(diameter, density, velocity, angle, 'sedimentary rock')
        damage_radii = physics_results['radii']
        kinetic_energy = physics_results['energy_joules']

        # --- 3. Run the Geospatial Economic Analysis ---
        # This function should return the component_scores and infrastructure list
        economic_results = run_geospatial_analysis(target_coords, damage_radii)

        # --- 4. THIS IS THE CRUCIAL STEP THAT WAS BEING SKIPPED ---
        # It takes the scores from step 3 and energy from step 2 to calculate the damage.
        monetary_damage = calculate_monetary_damage(
            economic_results["component_scores"], 
            kinetic_energy
        )

        # --- 5. Format and Return the Final Response ---
        response = {
            "impact_summary": {
                "total_economic_score": economic_results['total_score'],
                "estimated_monetary_damage_usd": monetary_damage
            },
            "damage_radii_km": damage_radii,
            "critical_infrastructure_affected": economic_results['affected_infrastructure']
        }
        
        return jsonify(response)

    except Exception as e:
        print(f"An error occurred during analysis: {e}")
        return jsonify({"error": "An internal server error occurred during analysis."}), 500

# --- Frontend Route ---
@app.route('/')
def index():
    # This is a simple health check endpoint
    return {"status": "ok", "message": "NASA Space Apps API is running!"}
@app.route('/<path:path>')
def serve_frontend(path=None):
    """
    Serves the React frontend from the dist folder.
    """
    static_folder = app.static_folder
    if path and os.path.exists(os.path.join(static_folder, path)):
        return send_from_directory(static_folder, path)
    else:
        return send_from_directory(static_folder, 'index.html')

# --- Main execution block ---
if __name__ == '__main__':
    app.run(debug=True, port=5000)
