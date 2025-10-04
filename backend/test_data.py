# backend/test_data.py
from asteroid_data import FAMOUS_ASTEROIDS

print("--- Running Asteroid Data Test ---")

if "99942_apophis" in FAMOUS_ASTEROIDS:
    print("Successfully imported Apophis data:")
    print(FAMOUS_ASTEROIDS["99942_apophis"])
else:
    print("ERROR: Could not find Apophis data.")

print("\nTest complete.")