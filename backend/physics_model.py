import math

# --- Constants ---
JOULES_PER_MEGATON = 4.184e15
SURFACE_GRAVITY = 9.8

TARGET_DENSITY = {
    "sedimentary_rock": 2500,
    "crystalline_rock": 2750,
    "water": 1000
}


def calculate_damage_radii(diameter_m, density_kg_m3, velocity_kms, angle_deg, target_type):
    """
    Calculates the physical damage radii and impact energy.

    This function implements simplified scaling laws based on the research by
    Collins, Melosh, and Marcus ("Earth Impact Effects Program").

    Returns:
        dict: A dictionary containing the calculated damage radii in kilometers
        AND the total kinetic energy in Joules.
    """

    # --- 1. Calculate Impact Energy ---
    velocity_ms = velocity_kms * 1000
    radius_m = diameter_m / 2
    volume_m3 = (4 / 3) * math.pi * (radius_m ** 3)
    mass_kg = density_kg_m3 * volume_m3

    kinetic_energy_joules = 0.5 * mass_kg * (velocity_ms * math.sin(math.radians(angle_deg))) ** 2
    energy_megatons = kinetic_energy_joules / JOULES_PER_MEGATON

    # --- 2. Calculate Crater Diameter ---
    if target_type == "sedimentary_rock":
        crater_constant = 0.08
    else:  # crystalline_rock or other
        crater_constant = 0.07

    transient_crater_diameter_m = crater_constant * (kinetic_energy_joules ** (1 / 3.4))
    final_crater_diameter_km = (transient_crater_diameter_m * 1.25) / 1000

    if target_type == "water":
        final_crater_diameter_km = 0

    # --- 3. Calculate Thermal Radiation Radius ---
    thermal_radius_km = 0.8 * (energy_megatons ** 0.41)

    # --- 4. Calculate Air Blast Radius ---
    blast_radius_km = 3.0 * (energy_megatons ** (1 / 3))

    # --- 5. Calculate Seismic Shaking Radius ---
    seismic_magnitude = (0.67 * math.log10(kinetic_energy_joules)) - 5.87
    if seismic_magnitude > 5:
        seismic_radius_km = 1.5 * (10 ** (seismic_magnitude / 2))
    else:
        seismic_radius_km = 0

    # --- Return both radii and energy ---
    return {
        "radii": {
            "crater": round(final_crater_diameter_km, 2),
            "thermal": round(thermal_radius_km, 2),
            "air_blast": round(blast_radius_km, 2),
            "seismic": round(seismic_radius_km, 2)
        },
        "energy_joules": kinetic_energy_joules
    }


# --- Testing Block ---
if __name__ == "__main__":
    print("--- Running Physics Model Test ---")

    print("\nScenario 1: Chelyabinsk-like event (20m diameter)")
    chelyabinsk_results = calculate_damage_radii(
        diameter_m=20,
        density_kg_m3=3300,
        velocity_kms=19,
        angle_deg=20,
        target_type="sedimentary_rock"
    )
    print(chelyabinsk_results)

    print("\nScenario 2: Significant Threat (150m diameter)")
    significant_results = calculate_damage_radii(
        diameter_m=150,
        density_kg_m3=3000,
        velocity_kms=25,
        angle_deg=45,
        target_type="sedimentary_rock"
    )
    print(significant_results)
