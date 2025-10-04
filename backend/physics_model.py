import math

# --- Constants based on scientific literature (Collins, Melosh, Marcus) ---
# See "Earth Impact Effects Program" for detailed sources.
# 1 Megaton of TNT = 4.184e15 Joules
JOULES_PER_MEGATON = 4.184e15

# Earth's properties
SURFACE_GRAVITY = 9.8  # m/s^2

# Target properties (density in kg/m^3)
TARGET_DENSITY = {
    "sedimentary_rock": 2500,
    "crystalline_rock": 2750,
    "water": 1000
}

def calculate_damage_radii(diameter_m, density_kg_m3, velocity_kms, angle_deg, target_type):
    """
    Calculates the physical damage radii for an asteroid impact.

    This function implements simplified scaling laws based on the research by
    Collins, Melosh, and Marcus ("Earth Impact Effects Program"). It provides
    a scientifically plausible estimation suitable for a hackathon context.

    Args:
        diameter_m (float): Impactor diameter in meters.
        density_kg_m3 (float): Impactor density in kg/m^3.
        velocity_kms (float): Impactor velocity in kilometers per second.
        angle_deg (float): Impact angle from the horizontal in degrees.
        target_type (str): Type of target surface ('sedimentary_rock', 
                           'crystalline_rock', or 'water').

    Returns:
        dict: A dictionary containing the calculated damage radii in kilometers.
    """

    # --- 1. Calculate Impact Energy ---
    velocity_ms = velocity_kms * 1000  # Convert velocity to m/s
    radius_m = diameter_m / 2
    volume_m3 = (4/3) * math.pi * (radius_m ** 3)
    mass_kg = density_kg_m3 * volume_m3

    # Kinetic Energy in Joules (E = 1/2 * m * v^2)
    # The vertical component of velocity is used for cratering.
    kinetic_energy_joules = 0.5 * mass_kg * (velocity_ms * math.sin(math.radians(angle_deg)))**2

    # Convert energy to Megatons of TNT for use in scaling laws
    energy_megatons = kinetic_energy_joules / JOULES_PER_MEGATON

    # --- 2. Calculate Crater Diameter ---
    # Using Holsapple-Schmidt pi-scaling for cratering in rock.
    # This is a simplified form. Dc ~ E^(1/3.4)
    # Constants are derived for specific target types.
    if target_type == "sedimentary_rock":
        # Weaker rock, larger crater
        crater_constant = 0.08
    else: # crystalline_rock
        crater_constant = 0.07

    # Transient crater diameter in meters
    transient_crater_diameter_m = crater_constant * (kinetic_energy_joules ** (1/3.4))
    
    # Final crater is slightly larger
    final_crater_diameter_km = (transient_crater_diameter_m * 1.25) / 1000
    
    if target_type == "water":
        # No crater in water, but this energy calculation is still useful for other effects
        final_crater_diameter_km = 0


    # --- 3. Calculate Thermal Radiation Radius ---
    # Radius at which thermal radiation is enough to cause 3rd-degree burns or ignite wood.
    # Formula: R_thermal = C * E_MT^(0.41)
    # We use a constant that averages values for this threshold.
    thermal_radius_km = 0.8 * (energy_megatons ** 0.41)


    # --- 4. Calculate Air Blast Radius ---
    # Radius for a specific peak overpressure level (e.g., ~4 psi, moderate building damage).
    # Formula: R_blast = C * E_MT^(1/3)
    # This is a classic blast wave scaling law.
    blast_radius_km = 3.0 * (energy_megatons ** (1/3))


    # --- 5. Calculate Seismic Shaking Radius ---
    # First, estimate the Richter magnitude of the impact-generated earthquake.
    # Formula: M = 0.67 * log10(E_joules) - 5.87
    seismic_magnitude = (0.67 * math.log10(kinetic_energy_joules)) - 5.87
    
    # Estimate the distance at which significant shaking (e.g., Mercalli Intensity VI-VII) occurs.
    # This is a highly simplified heuristic.
    if seismic_magnitude > 5:
        # For a magnitude 5 quake, damage is felt ~10-20km away.
        # For a magnitude 7, it's over 100km. The relationship is logarithmic.
        seismic_radius_km = 1.5 * (10 ** (seismic_magnitude / 2))
    else:
        seismic_radius_km = 0
        

    return {
        "crater": round(final_crater_diameter_km, 2),
        "thermal": round(thermal_radius_km, 2),
        "air_blast": round(blast_radius_km, 2),
        "seismic": round(seismic_radius_km, 2)
    }

# --- Testing Block ---
# This code will only run if you execute this file directly (e.g., "python3 physics_model.py")
# It allows for standalone testing of the model's logic.
if __name__ == "__main__":
    print("--- Running Physics Model Test ---")
    
    # Scenario: Similar to the Chelyabinsk event (approx. 20m diameter)
    print("\nScenario 1: Chelyabinsk-like event (20m diameter)")
    chelyabinsk_radii = calculate_damage_radii(
        diameter_m=20,
        density_kg_m3=3300, # Stony asteroid
        velocity_kms=19,
        angle_deg=20,
        target_type="sedimentary_rock"
    )
    print(chelyabinsk_radii)
    # Expected output: No significant crater, but a large air blast radius relative to size.

    # Scenario: A more significant threat (150m diameter)
    print("\nScenario 2: Significant Threat (150m diameter)")
    significant_radii = calculate_damage_radii(
        diameter_m=150,
        density_kg_m3=3000,
        velocity_kms=25,
        angle_deg=45,
        target_type="sedimentary_rock"
    )
    print(significant_radii)
    # Expected output: A noticeable crater and large damage radii for thermal/blast.

    # Scenario: Ocean Impact (Tsunami generation is a different model, but let's see effects)
    print("\nScenario 3: Ocean Impact (150m diameter)")
    ocean_radii = calculate_damage_radii(
        diameter_m=150,
        density_kg_m3=3000,
        velocity_kms=25,
        angle_deg=45,
        target_type="water"
    )
    print(ocean_radii)
    # Expected output: Crater radius should be 0.
