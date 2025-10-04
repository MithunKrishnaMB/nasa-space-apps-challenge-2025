import math

# Constants
ASTEROID_DENSITY = 3000  # kg/m^3 (average for stony asteroids)
TNT_JOULES_PER_MEGATON = 4.184e15

def calculate_impact_energy(diameter_m, velocity_kms):
    """Calculates kinetic energy in megatons of TNT."""
    radius = diameter_m / 2
    volume = (4/3) * math.pi * (radius ** 3)
    mass_kg = volume * ASTEROID_DENSITY
    velocity_ms = velocity_kms * 1000

    # Kinetic Energy formula: KE = 1/2 * m * v^2
    kinetic_energy_joules = 0.5 * mass_kg * (velocity_ms ** 2)

    energy_megatons = kinetic_energy_joules / TNT_JOULES_PER_MEGATON
    return round(energy_megatons, 2)

def calculate_shockwave_radius(energy_megatons):
    """A simplified model for shockwave radius."""
    # This is a highly simplified placeholder formula.
    # A real model is complex, but this gives a plausible result for a game.
    # Let's say a 1 megaton blast affects 5km. The effect scales with the cube root of energy.
    base_radius = 5 # km
    radius_km = base_radius * (energy_megatons ** (1/3))
    return round(radius_km, 2)

def calculate_tsunami_inundation(energy_megatons, target_city):
    """
    Placeholder for the tsunami model.
    For the hackathon, you could have a pre-defined GeoJSON file for
    different levels of threat (small, medium, large) and just return
    the appropriate one based on the energy.
    """
    if energy_megatons < 50:
        return {"level": "low", "message": "Minor coastal flooding."}
    elif energy_megatons < 500:
        return {"level": "medium", "message": "Significant inundation, evacuation recommended."}
    else:
        return {"level": "high", "message": "Catastrophic tsunami event."}
    # In a more advanced version, you'd process USGS elevation data here.