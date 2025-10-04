# backend/app.py

from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
# This is crucial to allow your React app (on a different port) to talk to the backend
CORS(app) 

@app.route('/analyse', methods=['POST'])
def analyse_impact():
    # Print the data received from the frontend to confirm it's working
    print("Received data:", request.json)

    # For now, ignore the input and just return the pre-defined mock data
    mock_response = {
      "impact_summary": {
        "total_economic_score": 8540.7,
        "estimated_monetary_damage_usd": "1.2B"
      },
      "damage_radii_km": {
        "crater": 0.9,
        "thermal": 5.2,
        "air_blast": 12.5,
        "seismic": 8.0
      },
      "critical_infrastructure_affected": [
          {"name": "Kochi International Airport", "type": "Airport", "damage": "Severe"},
          {"name": "Vallarpadam Terminal", "type": "Port", "damage": "Moderate"}
      ]
    }
    
    return jsonify(mock_response)

if __name__ == '__main__':
    app.run(debug=True)