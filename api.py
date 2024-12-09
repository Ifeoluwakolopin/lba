import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import time
import googlemaps
from dotenv import load_dotenv
import cvxpy as cp

# Load environment variables
load_dotenv()

# Initialize Google Maps API
API_KEY = os.getenv("API_KEY")
gmaps = googlemaps.Client(key=API_KEY)


def get_distance_matrix(gmaps, coordinates, mode="driving", buffer_minutes=5):

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

            # Try to fetch time for the given mode
            try:
                result = gmaps.distance_matrix(
                    origins=[coordinates[i]],
                    destinations=[coordinates[j]],
                    mode=mode,
                    departure_time=departure_time if mode == "transit" else None,
                )
                element = result["rows"][0]["elements"][0]

                if element["status"] == "OK":
                    matrix[i][j] = element["duration"][
                        "value"
                    ]  # Travel time in seconds
                else:
                    raise Exception(f"{mode.capitalize()} not available")
            except Exception as e:
                # Handle transit-specific fallback to walking
                if mode == "transit":
                    print(
                        f"Transit unavailable between location {i} and {j}. Falling back to walking."
                    )
                    try:
                        result = gmaps.distance_matrix(
                            origins=[coordinates[i]],
                            destinations=[coordinates[j]],
                            mode="walking",
                        )
                        element = result["rows"][0]["elements"][0]
                        if element["status"] == "OK":
                            matrix[i][j] = element["duration"][
                                "value"
                            ]  # Walking time in seconds
                        else:
                            matrix[i][j] = np.inf  # No valid route
                    except:
                        matrix[i][j] = np.inf  # No valid route
                else:
                    matrix[i][j] = np.inf  # Assign a large value if no route is found

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


def get_directions(gmaps, route, locations, mode="driving"):
    directions = []
    for i in range(len(route) - 1):
        # Get origin and destination for the segment
        origin = locations[route[i]]
        destination = locations[route[i + 1]]

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


# Predefined locations from the original script
PREDEFINED_DESTINATIONS = {
    "Minerva Residence": (37.792033, -122.408465),
    "Chinatown San Francisco": (37.792597, -122.406063),
    "California Academy of Sciences": (37.76986, -122.46609),
    "Pier 39": (37.80867, -122.40982),
    "Painted Ladies": (37.77625, -122.43275),
    "Exploratorium": (37.80166, -122.39734),
    "Lombard Street": (37.80201, -122.41955),
    "Palace of Fine Arts": (37.80293, -122.44842),
    "San Francisco City Hall": (37.77927, -122.41924),
}

# Allowed transport modes
ALLOWED_MODES = ["driving", "transit", "walking"]

app = Flask(__name__)
CORS(
    app,
    resources={
        r"/*": {
            "origins": ["http://localhost:3000"],
            "methods": ["OPTIONS", "GET", "POST"],
            "allow_headers": ["Content-Type"],
        }
    },
)


@app.route("/optimize-route", methods=["POST"])
def optimize_route():
    """
    Endpoint to optimize route based on start location and destinations
    """
    data = request.json

    print(data)
    # Validate input
    start_location_name = data.get("start_location_name", "Custom Start")
    start_location_coords = data.get("start_location_coords")

    # Validate start location coordinates
    if not start_location_coords or len(start_location_coords) != 2:
        return (
            jsonify(
                {
                    "error": "Invalid start location coordinates. Must be a tuple/list of (latitude, longitude)"
                }
            ),
            400,
        )

    # Optional end location
    end_location_name = data.get("end_location_name")
    end_location_coords = data.get("end_location_coords", start_location_coords)

    # Selected destinations
    selected_destinations = data.get(
        "destinations", list(PREDEFINED_DESTINATIONS.keys())
    )
    transport_mode = data.get("transport_mode", "driving").lower()

    # Validate transport mode
    if transport_mode not in ALLOWED_MODES:
        return (
            jsonify(
                {
                    "error": f"Invalid transport mode. Allowed modes are: {', '.join(ALLOWED_MODES)}"
                }
            ),
            400,
        )

    # Validate destinations exist
    destination_locations = {}
    for dest in selected_destinations:
        if dest in PREDEFINED_DESTINATIONS:
            destination_locations[dest] = PREDEFINED_DESTINATIONS[dest]
        else:
            return jsonify({"error": f"Destination {dest} not found"}), 400

    # Prepare locations for routing
    all_locations = {
        start_location_name: start_location_coords,
        **destination_locations,
    }

    # Add end location if different from start
    if end_location_name and end_location_coords:
        all_locations[end_location_name] = end_location_coords

    # Routing locations order
    routing_locations = (
        [start_location_name]
        + list(set(destination_locations.keys()) - {start_location_name})
        + (
            [end_location_name]
            if end_location_name and end_location_name != start_location_name
            else []
        )
    )

    # Get coordinates in the same order as routing locations
    coordinates = [all_locations[loc] for loc in routing_locations]

    # Calculate distance matrix with specified transport mode
    distance_matrix = get_distance_matrix(gmaps, coordinates, mode=transport_mode)

    # Solve TSP
    tour_matrix, total_time = solve_tsp(distance_matrix)

    # Extract optimal route
    route_indices = extract_tour(tour_matrix)

    # Get the actual route with location names
    optimal_route = [routing_locations[i] for i in route_indices]

    # Get directions
    directions = get_directions(
        gmaps, route_indices, all_locations, mode=transport_mode
    )
    parsed_directions = parse_directions(directions, optimal_route)

    return jsonify(
        {
            "route": optimal_route,
            "total_time": total_time,
            "directions": parsed_directions,
            "transport_mode": transport_mode,
            "start_location": {
                "name": start_location_name,
                "coordinates": start_location_coords,
            },
        }
    )


@app.route("/visited-locations", methods=["POST"])
def update_route_after_visits():
    """
    Endpoint to recalculate route after some locations have been visited
    """
    data = request.json

    # Validate current location
    current_location_name = data.get("current_location_name", "Current Location")
    current_location_coords = data.get("current_location_coords")

    # Validate current location coordinates
    if not current_location_coords or len(current_location_coords) != 2:
        return (
            jsonify(
                {
                    "error": "Invalid current location coordinates. Must be a tuple/list of (latitude, longitude)"
                }
            ),
            400,
        )

    visited_locations = data.get("visited_locations", [])
    remaining_destinations = data.get(
        "remaining_destinations", list(PREDEFINED_DESTINATIONS.keys())
    )
    transport_mode = data.get("transport_mode", "driving").lower()

    # Validate transport mode
    if transport_mode not in ALLOWED_MODES:
        return (
            jsonify(
                {
                    "error": f"Invalid transport mode. Allowed modes are: {', '.join(ALLOWED_MODES)}"
                }
            ),
            400,
        )

    # Validate destinations exist
    destination_locations = {}
    for dest in remaining_destinations:
        if dest in PREDEFINED_DESTINATIONS and dest not in visited_locations:
            destination_locations[dest] = PREDEFINED_DESTINATIONS[dest]
        elif dest not in PREDEFINED_DESTINATIONS:
            return jsonify({"error": f"Destination {dest} not found"}), 400

    # Prepare locations for routing
    all_locations = {
        current_location_name: current_location_coords,
        **destination_locations,
    }

    # Routing locations order
    routing_locations = [current_location_name] + list(destination_locations.keys())

    # Get coordinates in the same order as routing locations
    coordinates = [all_locations[loc] for loc in routing_locations]

    # Calculate distance matrix with specified transport mode
    distance_matrix = get_distance_matrix(gmaps, coordinates, mode=transport_mode)

    # Solve TSP
    tour_matrix, total_time = solve_tsp(distance_matrix)

    # Extract optimal route
    route_indices = extract_tour(tour_matrix)

    # Get the actual route with location names
    optimal_route = [routing_locations[i] for i in route_indices]

    # Get directions
    directions = get_directions(
        gmaps, route_indices, all_locations, mode=transport_mode
    )
    parsed_directions = parse_directions(directions, optimal_route)

    return jsonify(
        {
            "route": optimal_route,
            "total_time": total_time,
            "directions": parsed_directions,
            "transport_mode": transport_mode,
            "current_location": {
                "name": current_location_name,
                "coordinates": current_location_coords,
            },
        }
    )


if __name__ == "__main__":
    app.run(debug=True)
