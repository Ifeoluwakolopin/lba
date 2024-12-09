import React, { useState } from "react";
import { Container, Row, Col, Alert } from "react-bootstrap";
import Input from "../components/Input";
import RouteMap from "../components/RouteMap";
import axios from "axios";

function HomePage() {
  const [route, setRoute] = useState(null);
  const [error, setError] = useState(null);

  const handleRouteSubmit = async ({
    startingLocation,
    endingLocation,
    transportMode,
    visitedLocations,
  }) => {
    setError(null);
    setRoute(null);

    const payload = {
      starting_location: startingLocation, // Already an object with { lat, lng }
      ending_location: endingLocation, // Already an object with { lat, lng }
      transport_mode: transportMode,
      visited_locations: visitedLocations,
    };

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/optimal_route",
        payload
      );
      setRoute(response.data.optimal_route);
    } catch (err) {
      setError("Failed to fetch the optimal route. Please try again.");
    }
  };

  return (
    <Container className="mt-5">
      <Row>
        <Col>
          <h1>Optimal Route Finder</h1>
          <Input onSubmit={handleRouteSubmit} />
          {error && (
            <Alert variant="danger" className="mt-3">
              {error}
            </Alert>
          )}
        </Col>
      </Row>
      <Row className="mt-5">
        <Col>{route && <RouteMap route={route} />}</Col>
      </Row>
    </Container>
  );
}

export default HomePage;
