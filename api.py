import os
import time
from datetime import datetime

import cvxpy as cp
import googlemaps
import numpy as np
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS

# Load environment variables
load_dotenv()

# Initialize Google Maps API
API_KEY = os.getenv("API_KEY")
gmaps = googlemaps.Client(key=API_KEY)

app = Flask(__name__)
CORS(app)


def get_distance_matrix(gmaps, coordinates, mode="driving", buffer_minutes=5):
    """
    Build the distance matrix between locations using Google Maps API.
    Includes robust handling for missing data and fallback strategies.
    """
    departure_time = (
        int(time.time()) + buffer_minutes * 60 if mode == "transit" else "now"
    )

    n = len(coordinates)
    matrix = np.zeros((n, n))

    for i in range(n):
        for j in range(n):
            if i == j:
                matrix[i][j] = 0  # Zero time for same location
                continue

            try:
                # Fetch travel time for the specified mode
                result = gmaps.distance_matrix(
                    origins=[coordinates[i]],
                    destinations=[coordinates[j]],
                    mode=mode,
                    departure_time=departure_time,
                )
                element = result["rows"][0]["elements"][0]

                if element["status"] == "OK":
                    matrix[i][j] = element["duration"][
                        "value"
                    ]  # Travel time in seconds
                else:
                    raise ValueError(f"Route not available: {element['status']}")
            except Exception:
                # Fallback to walking mode if transit or driving fails
                try:
                    result = gmaps.distance_matrix(
                        origins=[coordinates[i]],
                        destinations=[coordinates[j]],
                        mode="walking",
                    )
                    element = result["rows"][0]["elements"][0]
                    if element["status"] == "OK":
                        matrix[i][j] = element["duration"]["value"]
                    else:
                        matrix[i][j] = np.inf  # Mark as unreachable
                except:
                    matrix[i][j] = np.inf  # Mark as unreachable if walking also fails

    # Replace np.inf with a large penalty value to allow the solver to work
    penalty = 1e6  # High penalty for unreachable routes
    matrix[np.isinf(matrix)] = penalty

    return matrix


def solve_tsp(distance_matrix):
    n = distance_matrix.shape[0]
    x = cp.Variable((n, n), boolean=True)
    u = cp.Variable(n)

    # Objective: Minimize total travel time
    objective = cp.Minimize(cp.sum(cp.multiply(distance_matrix, x)))

    # Constraints
    constraints = []

    # Each location must be visited exactly once
    constraints += [cp.sum(x, axis=0) == 1]
    constraints += [cp.sum(x, axis=1) == 1]

    # Avoid self-loops
    for i in range(n):
        constraints.append(x[i, i] == 0)

    # Subtour elimination (MTZ constraints)
    for i in range(1, n):
        for j in range(1, n):
            if i != j:
                constraints.append(u[i] - u[j] + n * x[i, j] <= n - 1)

    for i in range(1, n):
        constraints.append(u[i] >= 2)
        constraints.append(u[i] <= n)

    # Solve the problem
    problem = cp.Problem(objective, constraints)
    problem.solve(solver=cp.GLPK_MI)

    # Extract the solution
    tour_matrix = np.round(x.value)
    return tour_matrix, problem.value


def extract_tour(tour_matrix):
    n = len(tour_matrix)
    route = []
    current = 0
    while len(route) < n:
        route.append(current)
        next_step = np.argmax(tour_matrix[current])
        tour_matrix[current] = 0  # Mark as visited
        current = next_step
    route.append(route[0])  # Return to start
    return route


def get_directions(gmaps, route_indices, locations, mode="driving"):
    """
    Get directions for the route using Google Maps API

    Args:
        gmaps: Google Maps client
        route_indices: List of indices representing the order of locations
        locations: Dictionary of location names to coordinates
        mode: Travel mode (driving, transit, walking)

    Returns:
        List of directions for each segment of the route
    """
    directions = []
    route_names = list(locations.keys())  # Convert locations dict keys to list

    for i in range(len(route_indices) - 1):
        # Get origin and destination names
        origin_name = route_names[route_indices[i]]
        dest_name = route_names[route_indices[i + 1]]

        # Get coordinates for origin and destination
        origin = locations[origin_name]
        destination = locations[dest_name]

        # Format as strings for API
        origin_str = f"{origin[0]},{origin[1]}"
        destination_str = f"{destination[0]},{destination[1]}"

        # Fetch directions for the segment
        response = gmaps.directions(
            origin=origin_str, destination=destination_str, mode=mode
        )
        directions.append(response)

    return directions


def parse_directions(directions, route):
    parsed_directions = []

    for i, segment in enumerate(directions):
        if not segment:
            parsed_directions.append(
                f"No directions available for segment {i + 1}: {route[i]} -> {route[i + 1]}"
            )
            continue

        leg = segment[0]["legs"][0]
        start = route[i]
        end = route[i + 1]
        distance = leg["distance"]["text"]
        duration = leg["duration"]["text"]

        # Add header for the segment
        parsed_directions.append(f"\n--- From: {start} To: {end} ---\n")
        parsed_directions.append(f"Distance: {distance}, Duration: {duration}\n")

        # Add step-by-step instructions
        for step in leg["steps"]:
            instruction = step["html_instructions"]
            step_distance = step["distance"]["text"]
            step_duration = step["duration"]["text"]

            # Clean HTML tags from instructions
            clean_instruction = (
                instruction.replace("<b>", "")
                .replace("</b>", "")
                .replace('<div style="font-size:0.9em">', " ")
                .replace("</div>", "")
            )

            # Include transit-specific details if applicable
            if "transit_details" in step:
                transit = step["transit_details"]
                line_name = transit["line"]["name"]
                vehicle_type = transit["line"]["vehicle"]["type"]
                departure_stop = transit["departure_stop"]["name"]
                arrival_stop = transit["arrival_stop"]["name"]

                parsed_directions.append(
                    f"- Take {vehicle_type} ({line_name}) from {departure_stop} to {arrival_stop} ({step_distance}, {step_duration})"
                )
            else:
                parsed_directions.append(
                    f"- {clean_instruction} ({step_distance}, {step_duration})"
                )

    return "\n".join(parsed_directions)


PREDEFINED_DESTINATIONS = {
    "san_francisco": {
        "Chinatown San Francisco": (37.792597, -122.406063),
        "California Academy of Sciences": (37.76986, -122.46609),
        "Pier 39": (37.80867, -122.40982),
        "Painted Ladies": (37.77625, -122.43275),
        "Exploratorium": (37.80166, -122.39734),
        "Lombard Street": (37.80201, -122.41955),
        "Palace of Fine Arts": (37.80293, -122.44842),
        "San Francisco City Hall": (37.77927, -122.41924),
    },
    "seoul": {
        "ICN": (37.458896, 126.441946),
        "DDP": (37.567123, 127.010004),
        "COEX": (37.511768, 127.059156),
        "Namsan Mountain Tower": (37.551225, 126.988188),
        "Seoul Station": (37.554859, 126.970783),
        "Jamsil Lotte Tower": (37.512538, 127.102310),
    },
}

ALLOWED_CITIES = list(PREDEFINED_DESTINATIONS.keys())

ALLOWED_MODES = ["driving", "transit", "walking"]


@app.route("/calculate-route", methods=["POST"])
def calculate_route():
    """
    Calculate the optimal route through predefined destinations for a given city.
    """
    try:
        data = request.json

        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Validate city input
        city = data.get("city", "").lower()
        if city not in PREDEFINED_DESTINATIONS:
            return (
                jsonify(
                    {
                        "error": f"Invalid city. Allowed cities: {', '.join(ALLOWED_CITIES)}"
                    }
                ),
                400,
            )

        # Validate start location
        start_location_name = data.get("start_location_name")
        start_location_coords = data.get("start_location_coords")

        if not start_location_coords or len(start_location_coords) != 2:
            return jsonify({"error": "Valid start location coordinates required"}), 400

        # Validate transport mode
        transport_mode = data.get("transport_mode", "transit")
        if transport_mode not in ALLOWED_MODES:
            return (
                jsonify(
                    {
                        "error": f"Invalid transport mode. Allowed modes: {', '.join(ALLOWED_MODES)}"
                    }
                ),
                400,
            )

        # Fetch city-specific destinations
        city_destinations = PREDEFINED_DESTINATIONS[city]
        locations = {start_location_name: start_location_coords}
        locations.update(city_destinations)

        # Create ordered list
        location_names = [start_location_name] + list(city_destinations.keys())
        coordinates = [locations[name] for name in location_names]

        # Calculate distance matrix
        distance_matrix = get_distance_matrix(gmaps, coordinates, mode=transport_mode)

        # Solve TSP
        tour_matrix, total_time = solve_tsp(distance_matrix)
        if tour_matrix is None:
            return jsonify({"error": "Could not find a valid route"}), 400

        # Extract optimal route
        route_indices = extract_tour(tour_matrix)
        optimal_route = [location_names[i] for i in route_indices]

        # Create route with coordinates and fetch directions
        route_with_coords = [
            {"name": loc, "coordinates": locations[loc]} for loc in optimal_route
        ]
        directions_raw = get_directions(
            gmaps, route_indices, locations, mode=transport_mode
        )
        parsed_directions = parse_directions(directions_raw, optimal_route)

        return jsonify(
            {
                "route": route_with_coords,
                "total_time": total_time,
                "directions": parsed_directions,
                "directions_raw": directions_raw,
                "transport_mode": transport_mode,
                "city": city,
                "current_time": datetime.now().isoformat(),
            }
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/recalculate-route", methods=["POST"])
def recalculate_route():
    """
    Recalculate the optimal route from the current location, excluding already visited destinations.
    """
    try:
        data = request.json

        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Validate city input
        city = data.get("city", "").lower()
        if city not in PREDEFINED_DESTINATIONS:
            return (
                jsonify(
                    {
                        "error": f"Invalid city. Allowed cities: {', '.join(ALLOWED_CITIES)}"
                    }
                ),
                400,
            )

        # Validate current location
        current_location_name = data.get("current_location_name")
        if not current_location_name:
            return jsonify({"error": "Valid current location name required"}), 400

        # Validate visited locations
        visited_locations = set(data.get("visited_locations", []))
        transport_mode = data.get("transport_mode", "transit")
        if transport_mode not in ALLOWED_MODES:
            return (
                jsonify(
                    {
                        "error": f"Invalid transport mode. Allowed modes: {', '.join(ALLOWED_MODES)}"
                    }
                ),
                400,
            )

        # Fetch city-specific destinations and exclude visited ones
        city_destinations = PREDEFINED_DESTINATIONS[city]
        remaining_destinations = {
            name: coords
            for name, coords in city_destinations.items()
            if name not in visited_locations
        }

        # Handle case when all locations are visited
        if not remaining_destinations:
            return jsonify(
                {
                    "message": "All locations have been visited!",
                    "route": [
                        {
                            "name": current_location_name,
                            "coordinates": city_destinations[current_location_name],
                        }
                    ],
                    "total_time": 0,
                    "directions": "Tour completed!",
                    "current_time": datetime.now().isoformat(),
                }
            )

        # Create locations map
        locations = {current_location_name: city_destinations[current_location_name]}
        locations.update(remaining_destinations)
        location_names = [current_location_name] + list(remaining_destinations.keys())
        coordinates = [locations[name] for name in location_names]

        # Calculate distance matrix
        distance_matrix = get_distance_matrix(gmaps, coordinates, mode=transport_mode)

        # Solve TSP
        tour_matrix, total_time = solve_tsp(distance_matrix)
        if tour_matrix is None:
            return jsonify({"error": "Could not find a valid route"}), 400

        # Extract optimal route
        route_indices = extract_tour(tour_matrix)
        optimal_route = [location_names[i] for i in route_indices]

        # Create route with coordinates and fetch directions
        route_with_coords = [
            {"name": loc, "coordinates": locations[loc]} for loc in optimal_route
        ]
        directions_raw = get_directions(
            gmaps, route_indices, locations, mode=transport_mode
        )
        parsed_directions = parse_directions(directions_raw, optimal_route)

        return jsonify(
            {
                "route": route_with_coords,
                "total_time": total_time,
                "directions": parsed_directions,
                "directions_raw": directions_raw,
                "transport_mode": transport_mode,
                "city": city,
                "current_time": datetime.now().isoformat(),
                "remaining_locations": [
                    {"name": name, "coordinates": coords}
                    for name, coords in remaining_destinations.items()
                ],
            }
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(port=8000)
