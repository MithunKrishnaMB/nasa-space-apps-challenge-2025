# --- CLEANED CODE - PLEASE COPY/PASTE THIS ENTIRE BLOCK ---

from flask import Flask, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app) 

@app.route('/api/test', methods=['GET'])
def test_connection():
    return jsonify({"message": "Hello from the Flask backend!"})

@app.route('/api/defend_advice', methods=['GET'])
def get_defend_advice():
    # This line will try to open the JSON file. 
    # Make sure 'ai_knowledge_base.json' exists!
    with open('ai_knowledge_base.json', 'r') as f:
        simulations = json.load(f)

    # Find the best outcome from our pre-computed data
    best_simulation = max(simulations, key=lambda x: x['miss_distance'])
    
    advice = f"Optimal deflection window is around {best_simulation['deflection_time']} hours from now with {best_simulation['deflection_force']} force for maximum effect."

    return jsonify({"advice": advice})

# This block will now execute correctly
if __name__ == '__main__':
    app.run(debug=True, port=5000)