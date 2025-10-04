import math

def format_currency(value):
    """Formats a large number into a readable currency string (e.g., $1.2 Trillion)."""
    if value < 1_000_000:
        return f"${value:,.0f}"
    if value < 1_000_000_000:
        return f"${value / 1_000_000:.2f} Million"
    if value < 1_000_000_000_000:
        return f"${value / 1_000_000_000:.2f} Billion"
    return f"${value / 1_000_000_000_000:.2f} Trillion"

def calculate_monetary_damage(economic_results, kinetic_energy_joules):
    """
    Estimates monetary damage using a detailed, component-based heuristic model.

    This upgraded model breaks down the calculation based on the specific source
    of the economic score, providing a more nuanced estimate.

    The logic is as follows:
    1.  Infrastructure Damage: Each point from the 'infrastructure' score, which
        represents a physical building, is assigned a high monetary value for
        reconstruction.
    2.  Population Disruption Cost: The 'population' score (raw population count)
        is used to estimate economic disruption, emergency aid, and relocation costs.
        This is a per-capita cost, NOT an attempt to value human life.
    3.  Land Value Damage: The 'land_use' score, derived from land type (urban,
        cropland, etc.), is assigned a value representing property and agricultural loss.
    4.  Severity Multiplier: The total base damage from the above components is
        multiplied by a factor based on the impact's kinetic energy. A more
        energetic impact will cause more complete destruction over the affected area.

    Args:
        economic_results (dict): The output from geospatial analysis, now containing
                                 the nested 'component_scores' dictionary.
        kinetic_energy_joules (float): The kinetic energy of the impactor.

    Returns:
        str: A formatted string representing the estimated monetary damage.
    """
    component_scores = economic_results.get("component_scores", {})
    if not component_scores or kinetic_energy_joules < 1e12: # Min threshold
        return "$0"

    # --- 1. Define Per-Point Monetary Values (These can be tweaked) ---
    # Value for reconstruction per infrastructure score point
    USD_PER_INFRASTRUCTURE_POINT = 750_000
    # Cost per person for displacement, aid, and economic disruption
    USD_PER_PERSON_AFFECTED = 120_000
    # Value of land/assets per land use score point
    USD_PER_LAND_USE_POINT = 2_500

    # --- 2. Calculate Base Damage from Each Component ---
    infra_damage = component_scores.get("infrastructure", 0) * USD_PER_INFRASTRUCTURE_POINT
    pop_damage = component_scores.get("population", 0) * USD_PER_PERSON_AFFECTED
    land_damage = component_scores.get("land_use", 0) * USD_PER_LAND_USE_POINT
    
    total_base_damage = infra_damage + pop_damage + land_damage

    if total_base_damage == 0:
        return "$0"

    # --- 3. Calculate Severity Multiplier based on Energy ---
    # This remains the same as it's a good way to model destruction intensity.
    # An impact of ~1 Megaton (10^15 J) will have a multiplier around 1.0.
    log_energy = math.log10(kinetic_energy_joules)
    severity_multiplier = max(0.1, (log_energy - 14) / 5)

    # --- 4. Final Calculation ---
    estimated_damage = total_base_damage * severity_multiplier
    
    return format_currency(estimated_damage)