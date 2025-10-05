import math

# (keep your format_currency function as is)
def format_currency(value):
    #... your existing function
    if not isinstance(value, (int, float)) or value <= 0:
        return "$0"
    if value < 1_000_000:
        return f"${value:,.0f}"
    if value < 1_000_000_000:
        return f"${value / 1_000_000:.2f} Million"
    if value < 1_000_000_000_000:
        return f"${value / 1_000_000_000:.2f} Billion"
    return f"${value / 1_000_000_000_000:.2f} Trillion"


def calculate_monetary_damage(component_scores, kinetic_energy_joules):
    """
    Estimates monetary damage with TUNABLE parameters and better scaling.
    """
    if not component_scores or kinetic_energy_joules < 1e12:
        return "$0"

    # --- 1. TUNABLE PARAMETERS (ADJUSTED FOR MORE REALISTIC OUTPUT) ---
    # These values are now much more conservative.
    USD_PER_INFRASTRUCTURE_POINT = 45_000   # Reduced from 150,000
    USD_PER_PERSON_AFFECTED = 10_000        # Reduced from 40,000
    USD_PER_LAND_USE_POINT = 500            # Reduced from 1,200

    # --- 2. Calculate Base Damage ---
    infra_damage = component_scores.get("infrastructure", 0) * USD_PER_INFRASTRUCTURE_POINT
    pop_damage = component_scores.get("population", 0) * USD_PER_PERSON_AFFECTED
    land_damage = component_scores.get("land_use", 0) * USD_PER_LAND_USE_POINT
    total_base_damage = infra_damage + pop_damage + land_damage

    if total_base_damage == 0:
        return "$0"

    # --- 3. Calculate a SAFER Severity Multiplier ---
    log_energy = math.log10(kinetic_energy_joules)
    # This formula scales less aggressively and is capped to prevent absurd numbers.
    # A 1 Megaton impact (log_energy ~15.6) gives a multiplier around 0.9.
    # We will cap the multiplier at 5.0 to represent total devastation.
    severity_multiplier = min(5.0, max(0.1, (log_energy - 14) / 4))

    # --- 4. Final Calculation ---
    estimated_damage = total_base_damage * severity_multiplier
    
    # --- DEBUGGING PRINTS (Check your terminal for this output!) ---
    print("--- Economic Model Debug ---")
    print(f"Base Damage: Infra=${infra_damage:,.0f}, Pop=${pop_damage:,.0f}, Land=${land_damage:,.0f}")
    print(f"Total Base Damage: ${total_base_damage:,.0f}")
    print(f"Kinetic Energy (log10 Joules): {log_energy:.2f}")
    print(f"Severity Multiplier: {severity_multiplier:.2f}")
    print(f"Final Estimated Damage: ${estimated_damage:,.0f}")
    print("--------------------------")
    
    return format_currency(estimated_damage)