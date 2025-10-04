from flask import Flask, request, jsonify
from flask_cors import CORS

# Import your custom modules
from asteroid_data import FAMOUS_ASTEROIDS
from physics_model import calculate_damage_radii
from geospatial_analysis import run_geospatial_analysis

# --- Flask App Initialization ---
app = Flask(__name__)
# Enable Cross-Origin Resource Sharing to allow the frontend to connect
CORS(app)

# --- API Endpoints ---

@app.route('/asteroids', methods=['GET'])
def get_asteroids():
    """Provides a list of famous asteroids for the frontend dropdown."""
    try:
        asteroid_list = [{"id": key, "name": value["name"]} for key, value in FAMOUS_ASTEROIDS.items()]
        return jsonify(asteroid_list)
    except Exception as e:
        print(f"Error in /asteroids endpoint: {e}")
        return jsonify({"error": "Could not load asteroid data"}), 500

@app.route('/analyse', methods=['POST'])
def analyse_impact():
    """
    The main analysis endpoint. Receives scenario from frontend, runs all models,
    and returns a comprehensive JSON response.
    """
    try:
        data = request.json
        print(f"Received analysis request: {data}")

        # --- 1. Determine Impactor Properties ---
        if data.get('asteroid_id'):
            asteroid = FAMOUS_ASTEROIDS.get(data['asteroid_id'])
            diameter = asteroid['diameter_m']
            density = asteroid['density_kg_m3']
        else:
            diameter = data['diameter']
            density = data.get('density', 3000) # Use a default density if not provided

        velocity = data['velocity']
        angle = data['angle']
        target_coords = data['target']

        # --- 2. Run the Physics Model ---
        damage_radii = calculate_damage_radii(
            diameter, density, velocity, angle, 'sedimentary rock'
        )

        # --- 3. Run the Geospatial Economic Analysis ---
        economic_results = run_geospatial_analysis(target_coords, damage_radii)

        # --- 4. Format and Return the Final Response ---
        response = {
            "impact_summary": {
                "total_economic_score": economic_results['total_score'],
                "estimated_monetary_damage_usd": "Calculation TBD"
            },
            "damage_radii_km": damage_radii,
            "critical_infrastructure_affected": economic_results['affected_infrastructure']
        }
        
        return jsonify(response)

    except Exception as e:
        print(f"An error occurred during analysis: {e}")
        return jsonify({"error": "An internal server error occurred during analysis."}), 500

# --- Main execution block ---
if __name__ == '__main__':
    # Runs the Flask development server
    app.run(debug=True, port=5000)

