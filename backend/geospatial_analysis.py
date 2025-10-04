import geopandas as gpd
import rasterio
from rasterio.mask import mask
import osmnx as ox
from shapely.geometry import box, Point
import numpy as np
import pandas as pd

# --- CONFIGURATION ---
WORLDPOP_FILE_PATH = "data/ind_ppp_2020_UNadj_constrained.tif"
# Reverted to a single file path as requested.
# Ensure this filename is correct for your single downloaded tile.
LANDCOVER_FILE_PATH = "data/43P_20200101-20210101.tif"

INFRASTRUCTURE_SCORES = {
    'hospital': 5000,
    'airport': 20000,
    'port': 25000,
    'power': 15000,
    'station': 3000,
    'university': 2000,
    'school': 1000
}

LAND_USE_SCORES = {
    1: 0, 2: 5, 4: 2, 5: 10,
    7: 0, 8: 100, 9: 0, 10: 0, 11: 0
}


def run_geospatial_analysis(target_coords, damage_radii):
    """
    Performs a localized geospatial analysis to calculate an economic impact score.
    """
    lat, lon = target_coords['lat'], target_coords['lon']

    # --- PERFORMANCE OPTIMIZATION ---
    osm_query_radius_km = damage_radii['thermal']
    analysis_radius_deg = (damage_radii['air_blast'] * 1.1) / 111

    # Bounding box for analysis
    north_analysis, south_analysis, east_analysis, west_analysis = (
        lat + analysis_radius_deg,
        lat - analysis_radius_deg,
        lon + analysis_radius_deg,
        lon - analysis_radius_deg
    )
    analysis_bounding_box = box(west_analysis, south_analysis, east_analysis, north_analysis)

    # --- 1. Analyze Infrastructure from OpenStreetMap ---
    infrastructure_score = 0
    affected_infrastructure = []

    tags = {
        "amenity": ["hospital", "university", "school"],
        "power": ["plant", "substation"],
        "aeroway": "aerodrome",
        "harbour": "yes",
        "railway": "station"
    }

    try:
        print(f"Querying OpenStreetMap for infrastructure within thermal radius ({osm_query_radius_km:.2f} km)...")
        # Using teammate's successful method with features_from_polygon
        pois = ox.features_from_polygon(analysis_bounding_box, tags=tags)

        impact_point = Point(lon, lat)

        for index, row in pois.iterrows():
            poi_point = row.geometry.centroid
            if impact_point.distance(poi_point) < (damage_radii['thermal'] / 111):
                for key, score in INFRASTRUCTURE_SCORES.items():
                    if key in row and pd.notna(row[key]):
                        infrastructure_score += score
                        # BUG FIX: Explicitly check for pandas' 'nan' to handle missing names robustly.
                        asset_name = row['name'] if 'name' in row and pd.notna(row['name']) else f"Unnamed {key.title()}"
                        affected_infrastructure.append({
                            "name": asset_name,
                            "type": key.replace('_', ' ').title()
                        })
                        break
        print(f"Found {len(affected_infrastructure)} critical infrastructure assets within thermal radius.")
    except Exception as e:
        print(f"Could not fetch data from OpenStreetMap: {e}")

    # --- 2. Analyze Population Density from WorldPop ---
    population_score = 0
    try:
        with rasterio.open(WORLDPOP_FILE_PATH) as src:
            bounding_box_gdf = gpd.GeoDataFrame(
                [analysis_bounding_box], columns=['geometry'], crs='EPSG:4326'
            )
            bounding_box_proj = bounding_box_gdf.to_crs(src.crs)

            out_image, _ = mask(src, bounding_box_proj.geometry, crop=True)

            nodata_val = src.nodata
            if nodata_val is not None:
                population_data = out_image[0][out_image[0] != nodata_val]
            else:
                population_data = out_image[0]

            population_score = float(np.where(population_data > 0, population_data, 0).sum())
            print(f"Calculated affected population score: {int(population_score)}")
    except FileNotFoundError:
        print(f"ERROR: Population data file not found at '{WORLDPOP_FILE_PATH}'.")
    except Exception as e:
        print(f"Could not analyze population data: {e}")

    # --- 3. Analyze Economic Value from Land Use ---
    land_use_score = 0
    print("Analyzing land cover from single tile...")
    try:
        with rasterio.open(LANDCOVER_FILE_PATH) as src:
            bounding_box_gdf = gpd.GeoDataFrame(
                [analysis_bounding_box], columns=['geometry'], crs='EPSG:4326'
            )
            bounding_box_proj = bounding_box_gdf.to_crs(src.crs)

            if not rasterio.coords.disjoint_bounds(src.bounds, bounding_box_proj.total_bounds):
                print(f" - Clipping data from {LANDCOVER_FILE_PATH}")
                out_image, _ = mask(src, bounding_box_proj.geometry, crop=True)

                nodata_val = src.nodata
                if nodata_val is not None:
                    land_use_data = out_image[0][out_image[0] != nodata_val]
                else:
                    land_use_data = out_image[0]

                unique, counts = np.unique(land_use_data, return_counts=True)
                pixel_counts = dict(zip(unique, counts))

                for land_type, count in pixel_counts.items():
                    if land_type in LAND_USE_SCORES:
                        land_use_score += LAND_USE_SCORES[land_type] * count
            else:
                print(f" - Skipping {LANDCOVER_FILE_PATH} (out of bounds).")
    except FileNotFoundError:
        print(f"ERROR: Land cover data file not found at '{LANDCOVER_FILE_PATH}'. Skipping.")
    except Exception as e:
        print(f"Could not analyze land cover file {LANDCOVER_FILE_PATH}: {e}")

    print(f"Calculated total land use score: {land_use_score}")

    # --- 4. Calculate Total Score ---
    total_score = (infrastructure_score * 10) + (population_score * 0.1) + (land_use_score * 0.5)

    # --- MODIFICATION: Return component scores for detailed economic modeling ---
    return {
        "total_score": round(total_score, 2),
        "component_scores": {
            "infrastructure": infrastructure_score,
            "population": population_score,
            "land_use": land_use_score
        },
        "affected_infrastructure": affected_infrastructure
    }


# --- Testing Block ---
if __name__ == '__main__':
    # We need to import physics_model to use its function
    from physics_model import calculate_damage_radii # Assumes physics_model returns the structure {"radii": {...}, ...}

    print("--- Running Geospatial Analysis Model Test ---")
    print("\n--- Using a smaller 50m impactor for a fast validation run ---")

    test_target = {"lat": 9.9312, "lon": 76.2673} # Kochi, India

    # Fetch the results from the physics model
    physics_output = calculate_damage_radii(
        diameter_m=50,
        density_kg_m3=3000,
        velocity_kms=20,
        angle_deg=45,
        target_type='sedimentary rock'
    )
    test_radii_small = physics_output['radii'] # Extract the radii dictionary

    print(f"\nAnalyzing impact for target: Kochi with thermal radius {test_radii_small['thermal']:.2f} km")

    results = run_geospatial_analysis(test_target, test_radii_small)

    print("\n--- TEST RESULTS ---")
    print(f"Total Economic Score: {results['total_score']}")
    print(f"Component Scores: {results['component_scores']}") # Print new component scores
    print("Affected Infrastructure:")
    if results['affected_infrastructure']:
        for item in results['affected_infrastructure']:
            print(f"- {item['name']} ({item['type']})")
    else:
        print("None found in the immediate vicinity.")

